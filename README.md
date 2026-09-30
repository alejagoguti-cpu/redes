# Redes · Arquitectura y Simulación de Redes

Este repositorio contiene la arquitectura base y componentes de interfaz para la simulación, visualización y animación de redes urbanas y complejas.

## 📁 Estructura del Repositorio

```text
redes/
├── index.html                  # Plantilla principal con la Sidebar aislada
├── css/
│   ├── sidebar.css             # Estilos de la barra lateral de navegación (autónoma)
│   └── main.css                # Variables de tema oscuro y layout principal
├── js/
│   └── sidebar.js              # Script ligero de estados de la barra lateral
├── assets/
│   ├── animations/             # Scripts de animaciones (Canvas, Three.js, Lottie, SVG)
│   ├── data/                   # Archivos de datos (JSON / GeoJSON / Datasets)
│   └── icons/                  # Recursos gráficos
├── modules/                    # Módulos interactivos del proyecto
│   ├── network-01/             # Escala metropolitana
│   ├── network-02/             # Medición de red
│   └── network-03/             # Discurso vs realidad
└── README.md
```

## 🚀 Uso de la Sidebar

Para usar la barra lateral en cualquier subpágina o módulo nuevo:

1. Incluye **Font Awesome** en el `<head>`:
   ```html
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
   ```
2. Importa `sidebar.css`:
   ```html
   <link rel="stylesheet" href="css/sidebar.css">
   ```
3. Copia el bloque `<aside class="sidebar">` que se encuentra en `index.html`.

## 📦 Instrucciones para subir a GitHub

Para subir esta estructura a tu repositorio [github.com/alejagoguti-cpu/redes](https://github.com/alejagoguti-cpu/redes):

```bash
git init
git add .
git commit -m "feat: agregar barra lateral autónoma y estructura de arquitectura de red"
git branch -M main
git remote add origin https://github.com/alejagoguti-cpu/redes.git
git push -u origin main
```
