#!/usr/bin/env python3
"""Procesa la base RIBB del Jardín Botánico de Bogotá para el módulo network-02.

Entrada esperada:
  assets/data/RIBB_v2024-12-30.xlsx

Salidas:
  assets/data/ribb_registros_limpios.csv
  assets/data/ribb_fuentes_calidad.csv
  assets/data/ribb_interacciones.csv
  assets/data/ribb_resumen.json

El script NO altera el archivo original. La calidad se evalúa como completitud
documental del registro, no como veracidad taxonómica de la fuente.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterable

from openpyxl import load_workbook

OFFICIAL_SOURCE = "https://redbiotica.jbb.gov.co/"
OFFICIAL_DATASET = "RIBB_v2024-12-30.xlsx"
DATASET_DATE = "2024-12-30"

ALIASES = {
    "taxon_a": [
        "taxon 1", "taxon1", "taxon a", "taxon_a", "organismo 1", "organismo1",
        "especie 1", "especie1", "species 1", "species1", "source taxon",
        "taxon source", "nombre cientifico 1", "scientific name 1",
    ],
    "taxon_b": [
        "taxon 2", "taxon2", "taxon b", "taxon_b", "organismo 2", "organismo2",
        "especie 2", "especie2", "species 2", "species2", "target taxon",
        "taxon target", "nombre cientifico 2", "scientific name 2",
    ],
    "interaction": [
        "interaccion", "interacción", "tipo de interaccion", "tipo de interacción",
        "interaction", "interaction type", "relacion", "relación",
    ],
    "reference": [
        "referencia", "referencias", "reference", "references", "fuente", "source",
        "bibliografia", "bibliografía", "citation", "cita",
    ],
    "date": [
        "fecha", "fecha registro", "fecha de registro", "date", "eventdate",
        "event date", "year", "ano", "año",
    ],
    "locality": [
        "localidad", "locality", "lugar", "ubicacion", "ubicación", "location",
        "sitio", "site", "barrio", "municipio", "municipality",
    ],
}

KENNEDY_TERMS = {
    "kennedy", "corabastos", "la vaca", "humedal la vaca", "el burro",
    "humedal el burro", "techo", "humedal de techo", "humedal techo",
    "maria paz", "maría paz", "patio bonito", "el amparo",
}

def norm(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip().lower()
    text = "".join(
        ch for ch in unicodedata.normalize("NFD", text)
        if unicodedata.category(ch) != "Mn"
    )
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()

def find_header_row(ws, max_scan: int = 30) -> int:
    best_row, best_score = 1, -1
    for row_idx in range(1, min(ws.max_row, max_scan) + 1):
        vals = [clean(ws.cell(row_idx, col).value) for col in range(1, ws.max_column + 1)]
        nonempty = [v for v in vals if v]
        textish = [v for v in nonempty if not re.fullmatch(r"[-+]?\d+(\.\d+)?", v)]
        score = len(nonempty) + 0.5 * len(textish)
        if score > best_score:
            best_row, best_score = row_idx, score
    return best_row

def dedupe_headers(values: Iterable[Any]) -> list[str]:
    headers: list[str] = []
    seen: Counter[str] = Counter()
    for idx, raw in enumerate(values, start=1):
        base = clean(raw) or f"col_{idx}"
        seen[base] += 1
        headers.append(base if seen[base] == 1 else f"{base}_{seen[base]}")
    return headers

def match_column(headers: list[str], aliases: list[str]) -> str | None:
    normalized = {h: norm(h) for h in headers}
    alias_norm = [norm(a) for a in aliases]
    for alias in alias_norm:
        for h, nh in normalized.items():
            if nh == alias:
                return h
    for alias in alias_norm:
        for h, nh in normalized.items():
            if alias and (alias in nh or nh in alias):
                return h
    return None

def extract_records(xlsx: Path) -> tuple[list[dict[str, str]], dict[str, Any]]:
    wb = load_workbook(xlsx, read_only=True, data_only=True)
    all_records: list[dict[str, str]] = []
    sheet_meta: list[dict[str, Any]] = []

    for ws in wb.worksheets:
        header_row = find_header_row(ws)
        header_values = next(ws.iter_rows(min_row=header_row, max_row=header_row, values_only=True))
        headers = dedupe_headers(header_values)
        matches = {key: match_column(headers, aliases) for key, aliases in ALIASES.items()}
        count = 0
        for values in ws.iter_rows(min_row=header_row + 1, values_only=True):
            row = {headers[i]: clean(values[i]) for i in range(min(len(headers), len(values)))}
            if not any(row.values()):
                continue
            count += 1
            rec = {
                "ribb_id": f"{ws.title}:{count}",
                "hoja": ws.title,
                "taxon_a": row.get(matches["taxon_a"], "") if matches["taxon_a"] else "",
                "taxon_b": row.get(matches["taxon_b"], "") if matches["taxon_b"] else "",
                "interaccion": row.get(matches["interaction"], "") if matches["interaction"] else "",
                "referencia_original": row.get(matches["reference"], "") if matches["reference"] else "",
                "fecha_registro": row.get(matches["date"], "") if matches["date"] else "",
                "localizacion": row.get(matches["locality"], "") if matches["locality"] else "",
                "fuente_base": "Jardín Botánico de Bogotá · Red de Interacciones Bióticas",
                "url_fuente_base": OFFICIAL_SOURCE,
                "fecha_base": DATASET_DATE,
            }
            for key, value in row.items():
                rec[f"orig__{key}"] = value
            all_records.append(rec)

        sheet_meta.append({
            "hoja": ws.title,
            "filas_utiles": count,
            "fila_encabezado": header_row,
            "columnas": headers,
            "columnas_detectadas": matches,
        })

    wb.close()
    return all_records, {"hojas": sheet_meta}

def documentation_quality(rec: dict[str, str]) -> tuple[str, int, str]:
    checks = {
        "referencia": bool(rec.get("referencia_original")),
        "fecha": bool(rec.get("fecha_registro")),
        "localizacion": bool(rec.get("localizacion")),
        "taxon_a": bool(rec.get("taxon_a")),
        "taxon_b": bool(rec.get("taxon_b")),
        "interaccion": bool(rec.get("interaccion")),
    }
    score = sum(checks.values())
    if checks["referencia"] and checks["taxon_a"] and checks["taxon_b"] and checks["interaccion"] and score >= 5:
        level = "Alta"
    elif checks["referencia"] and score >= 4:
        level = "Media"
    else:
        level = "Baja"
    missing = [k for k, ok in checks.items() if not ok]
    note = "Completo en campos clave" if not missing else "Faltan: " + ", ".join(missing)
    return level, score, note

def is_kennedy(rec: dict[str, str]) -> bool:
    haystack = norm(" | ".join([
        rec.get("localizacion", ""),
        rec.get("referencia_original", ""),
        *[v for k, v in rec.items() if k.startswith("orig__")],
    ]))
    return any(norm(term) in haystack for term in KENNEDY_TERMS)

def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str] | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    if fields is None:
        fields = list(rows[0].keys())
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", default="assets/data/RIBB_v2024-12-30.xlsx")
    parser.add_argument("--output-dir", default="assets/data")
    args = parser.parse_args()

    input_path = Path(args.input)
    out_dir = Path(args.output_dir)
    if not input_path.exists():
        raise SystemExit(f"No se encontró la base RIBB: {input_path}")

    records, meta = extract_records(input_path)
    quality_rows: list[dict[str, Any]] = []
    interaction_rows: list[dict[str, Any]] = []

    for rec in records:
        level, score, note = documentation_quality(rec)
        rec["calidad_documentacion"] = level
        rec["puntaje_completitud_6"] = str(score)
        rec["observacion_calidad"] = note
        rec["en_area_kennedy"] = "Sí" if is_kennedy(rec) else "No"

        quality_rows.append({
            "ribb_id": rec["ribb_id"],
            "fuente_base": rec["fuente_base"],
            "url_fuente_base": rec["url_fuente_base"],
            "referencia_original": rec["referencia_original"],
            "fecha_registro": rec["fecha_registro"],
            "localizacion": rec["localizacion"],
            "calidad_documentacion": level,
            "puntaje_completitud_6": score,
            "observacion_calidad": note,
            "en_area_kennedy": rec["en_area_kennedy"],
        })

        if rec["taxon_a"] or rec["taxon_b"] or rec["interaccion"]:
            interaction_rows.append({
                "ribb_id": rec["ribb_id"],
                "taxon_a": rec["taxon_a"],
                "taxon_b": rec["taxon_b"],
                "interaccion": rec["interaccion"],
                "localizacion": rec["localizacion"],
                "fecha_registro": rec["fecha_registro"],
                "referencia_original": rec["referencia_original"],
                "calidad_documentacion": level,
                "en_area_kennedy": rec["en_area_kennedy"],
            })

    out_dir.mkdir(parents=True, exist_ok=True)
    write_csv(out_dir / "ribb_registros_limpios.csv", records)
    write_csv(out_dir / "ribb_fuentes_calidad.csv", quality_rows)
    write_csv(out_dir / "ribb_interacciones.csv", interaction_rows)

    quality_counts = Counter(r["calidad_documentacion"] for r in quality_rows)
    interaction_counts = Counter(r["interaccion"] or "Sin clasificar" for r in interaction_rows)
    kennedy_count = sum(r["en_area_kennedy"] == "Sí" for r in records)

    summary = {
        "dataset": OFFICIAL_DATASET,
        "dataset_date": DATASET_DATE,
        "source": OFFICIAL_SOURCE,
        "total_registros": len(records),
        "total_interacciones_detectadas": len(interaction_rows),
        "registros_area_kennedy_por_texto": kennedy_count,
        "calidad_documentacion": dict(quality_counts),
        "tipos_interaccion": dict(interaction_counts),
        "metadatos_hojas": meta["hojas"],
        "criterio_calidad": {
            "Alta": "Referencia + taxones + interacción presentes y al menos 5 de 6 campos clave completos.",
            "Media": "Referencia presente y al menos 4 de 6 campos clave completos.",
            "Baja": "Referencia ausente o menos de 4 campos clave completos.",
            "nota": "Es una medida de completitud documental, no una validación de veracidad taxonómica o ecológica.",
        },
    }
    (out_dir / "ribb_resumen.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
