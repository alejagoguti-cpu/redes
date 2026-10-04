#!/usr/bin/env python3
"""Construye dataset web compacto desde RIBB oficial para el enjambre network-02."""
import json, sys
from pathlib import Path
from collections import Counter, defaultdict
from openpyxl import load_workbook

src=Path(sys.argv[1] if len(sys.argv)>1 else "assets/data/RIBB_v2024-12-30.xlsx")
out=Path(sys.argv[2] if len(sys.argv)>2 else "assets/data/ribb_web.json")
wb=load_workbook(src,read_only=True,data_only=True)
ws=wb[wb.sheetnames[0]]
it=ws.iter_rows(values_only=True)
headers=[str(v).strip() if v is not None else "" for v in next(it)]
idx={h:i for i,h in enumerate(headers)}
def val(row,key):
    i=idx.get(key)
    return "" if i is None or i>=len(row) or row[i] is None else str(row[i]).strip()
def first_reference(row):
    for n in range(1,10):
        r=val(row,f"Referencia {n}")
        if r:
            return {
                "tipo":val(row,f"Tipo de referencia {n}"),
                "ref":r,
                "media":val(row,f"Multimedia {n}"),
                "coord":val(row,f"Coodenadas {n}") or val(row,f"Coordenadas {n}"),
                "fecha":val(row,f"Fecha {n}")
            }
    return {"tipo":"","ref":"","media":"","coord":"","fecha":""}

records=[]; node_meta=defaultdict(lambda:{"n":0,"origins":Counter()})
for rn,row in enumerate(it,start=2):
    t1=val(row,"Taxón 1"); t2=val(row,"Taxón 2")
    if not t1 or not t2: continue
    ref=first_reference(row)
    district=val(row,"Reportada en el distrito").upper()
    rec={
        "id":f"R{rn-1}","s":t1,"t":t2,
        "i":val(row,"Tipo de interacción"),
        "title":val(row,"Título de interacción") or "OTRAS INTERACCIONES",
        "part":val(row,"parte de la planta afectada"),
        "os":val(row,"Origen taxón 1"),"ot":val(row,"Origen taxón 2"),
        "district":"SI" if district=="SI" else "NO",
        "freq":val(row,"Frecuencia"),"obs":val(row,"Observaciones"),
        "ref":ref["ref"],"refType":ref["tipo"],"media":ref["media"],
        "coord":ref["coord"],"date":ref["fecha"]
    }
    score=sum(bool(rec[k]) for k in ["s","t","i","ref","coord","date"])
    rec["q"]="Alta" if rec["ref"] and score>=5 else ("Media" if rec["ref"] and score>=4 else "Baja")
    records.append(rec)
    for taxon,origin in ((t1,rec["os"]),(t2,rec["ot"])):
        node_meta[taxon]["n"]+=1
        if origin: node_meta[taxon]["origins"][origin]+=1

nodes=[]
for name,m in node_meta.items():
    origin=m["origins"].most_common(1)[0][0] if m["origins"] else ""
    nodes.append({"id":name,"n":m["n"],"origin":origin})

payload={
    "meta":{
        "source":"https://redbiotica.jbb.gov.co/",
        "dataset":"RIBB_v2024-12-30.xlsx",
        "totalRecords":len(records),
        "districtRecords":sum(r["district"]=="SI" for r in records),
        "taxa":len(nodes),
        "interactionTypes":dict(Counter(r["title"] for r in records))
    },
    "nodes":nodes,
    "records":records
}
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print(json.dumps(payload["meta"],ensure_ascii=False,indent=2))
