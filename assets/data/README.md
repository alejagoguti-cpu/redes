# Datos

Esta carpeta está reservada para datasets crudos y derivados del proyecto.

## RIBB

Colocar aquí la base oficial sin modificar:

`RIBB_v2024-12-30.xlsx`

Fuente: https://redbiotica.jbb.gov.co/

El procesamiento se ejecuta con:

`python modules/network-02/process_ribb.py`

Los CSV y JSON derivados se generan en esta misma carpeta para que los módulos web puedan consumirlos sin alterar la base original.
