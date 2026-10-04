# Network 02 · Interacciones bióticas

Este módulo prepara la base RIBB para construir la primera red de interacciones entre especies del área de estudio.

## Estructura respetada

- `modules/network-01/`: se conserva sin cambios.
- `modules/network-02/`: procesamiento y lógica de imágenes de interacciones bióticas.
- `assets/data/`: base original y salidas derivadas.

## Base

Fuente oficial: Red de Interacciones Bióticas de Bogotá D.C., Jardín Botánico de Bogotá José Celestino Mutis.

Archivo esperado:

```
assets/data/RIBB_v2024-12-30.xlsx
```

El original no se modifica.

## Procesamiento

```bash
python modules/network-02/process_ribb.py
```

Genera:

- `ribb_interacciones.csv`
- `ribb_fuentes_calidad.csv`
- `ribb_especies.csv`
- `ribb_especies.json`
- `ribb_resumen.json`

El procesador lee las referencias 1–9 de cada registro, incluidas fechas, coordenadas y campos multimedia.

## Especies e imágenes

RIBB mezcla especies con taxones superiores. El catálogo marca `especie_probable` para evitar presentar categorías como `Insecta`, `Fungi` o `Bryophyta` como si fueran especies.

Toda especie que se muestre como nodo o ficha debe tener una imagen específica. La resolución se hace al entrar en pantalla para no lanzar miles de solicitudes simultáneas:

1. imagen ya registrada en los datos del proyecto;
2. iNaturalist por nombre científico;
3. Wikimedia Commons como respaldo.

La fuente y atribución de la imagen deben conservarse en la ficha. Si no se puede resolver una imagen específica con confianza, la especie no entra a la visualización final hasta revisión; no se reemplaza por una foto genérica.

## Fuentes y calidad

La calidad es **completitud documental**, no veracidad ecológica:

- **Alta**: al menos 5 de 6 campos clave completos y referencia presente.
- **Media**: al menos 4 de 6 campos clave completos y referencia presente.
- **Baja**: menos de 4 campos o referencia ausente.

Campos: taxón 1, taxón 2, interacción, referencia, localización/coordenadas y fecha.
