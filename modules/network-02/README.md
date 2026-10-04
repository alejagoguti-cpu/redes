# Network 02 · Interacciones bióticas

Este módulo prepara la base de datos para construir la primera red de interacciones entre especies del área de estudio.

## Estructura respetada

- `modules/network-01/`: se conserva sin cambios.
- `modules/network-02/`: contiene el procesamiento específico de interacciones bióticas.
- `assets/data/`: conserva la función prevista en el README raíz para datasets y salidas procesadas.

## Base

Fuente oficial: Red de Interacciones Bióticas de Bogotá D.C., Jardín Botánico de Bogotá José Celestino Mutis.

Archivo esperado:

```
assets/data/RIBB_v2024-12-30.xlsx
```

El archivo original no se modifica.

## Procesamiento

Ejecutar desde la raíz del repositorio:

```bash
python modules/network-02/process_ribb.py
```

Requiere Python 3 y `openpyxl`.

El script genera:

- `assets/data/ribb_registros_limpios.csv`
- `assets/data/ribb_fuentes_calidad.csv`
- `assets/data/ribb_interacciones.csv`
- `assets/data/ribb_resumen.json`

## Fuentes y calidad

Cada registro conserva la referencia original disponible en RIBB y añade:

- fecha del registro, cuando existe;
- localización, cuando existe;
- fuente base oficial;
- indicador de pertenencia textual al área de Kennedy;
- nivel de calidad documental.

La calidad se interpreta como **completitud de metadatos**, no como una validación de la veracidad ecológica del registro.

- **Alta**: referencia, ambos taxones e interacción presentes, y al menos 5 de 6 campos clave completos.
- **Media**: referencia presente y al menos 4 de 6 campos clave completos.
- **Baja**: referencia ausente o menos de 4 campos clave completos.

## Importante

El filtro `en_area_kennedy` es una primera aproximación textual. Antes de usarlo como evidencia espacial final debe revisarse contra localidades, coordenadas o capas GIS disponibles.
