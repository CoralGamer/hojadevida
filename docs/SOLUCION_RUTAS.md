# Solución de Errores 404 y Rutas en GitHub Pages

Esta guía explica detalladamente el problema que ocurría con los enlaces de servicios en tu portafolio y los pasos que se tomaron para solucionarlo de manera definitiva.

## 1. El Problema Original

### ¿Por qué salía Error 404 en GitHub Pages?
GitHub Pages sirve tu portafolio desde una subruta: `https://coralgamer.github.io/hojadevida/`.
Cuando hacías clic en una tarjeta de servicio, el navegador intentaba buscar, por ejemplo, `pages/servicios/vr-experiences.html`.

Sin embargo, en el despliegue original:
-   Los archivos HTML estaban dentro de `src/pages/...`.
-   Vite no estaba configurado para "entender" que esos archivos debían terminar en una carpeta llamada `pages/servicios/` en el build final.
-   La mayoría de los archivos se estaban generando en la raíz de la carpeta `dist`, pero sin la estructura de carpetas esperada.

### ¿Por qué en `npm run dev` se quedaba en el Index?
Vite es un servidor de desarrollo muy inteligente. Si intentas acceder a una ruta que no existe físicamente en el disco (como `/pages/servicios/...`), Vite asume que podrías estar usando un router de JavaScript (como React Router) y te devuelve el `index.html` principal como "fallback". Por eso la URL cambiaba, pero el contenido seguía siendo el mismo.

---

## 2. La Solución Aplicada

He realizado tres cambios fundamentales para arreglar esto tanto en desarrollo como en la nube:

### A. Movimiento de Carpetas
He movido la carpeta `pages` fuera de `src` hacia la raíz del proyecto.
-   **Antes**: `src/pages/servicios/...`
-   **Ahora**: `pages/servicios/...`

Esto permite que Vite encuentre los archivos directamente en la ruta que coincida con la URL, eliminando la necesidad de configuraciones complejas de mapeo en desarrollo.

### B. Configuración de Entradas en Vite (`vite.config.mjs`)
He actualizado `rollupOptions.input` para que use nombres de entrada que incluyan la estructura de carpetas.
```javascript
input: {
  main: resolve(__dirname, 'index.html'),
  'pages/servicios/index': resolve(__dirname, 'pages/servicios/index.html'),
  'pages/servicios/web-fullstack': resolve(__dirname, 'pages/servicios/web-fullstack.html'),
  // ... todos los demás servicios
}
```
Esto le dice a Vite: *"Toma este archivo HTML y, al construir el proyecto final (dist), ponlo exactamente en la carpeta `pages/servicios/` con su nombre original"*.

### C. Enlaces Base-Aware
He actualizado todos los enlaces en `index.html` y en las páginas de servicios para que apunten a rutas absolutas que incluyan `/hojadevida/`.
-   **Antes**: `href="pages/servicios/index.html"`
-   **Ahora**: `href="/hojadevida/pages/servicios/index.html"`

Esto garantiza que, sin importar en qué nivel de profundidad estés, el enlace siempre sepa exactamente dónde está el archivo respecto a la raíz de tu sitio en GitHub.

---

## 3. Paso a Paso: Cómo agregar un nuevo servicio en el futuro

Si decides crear un nuevo servicio (ej. `nuevo-servicio.html`), sigue estos pasos:

1.  **Crea el archivo**: Ponlo en `pages/servicios/nuevo-servicio.html`.
2.  **Copia la estructura**: Usa un servicio existente como plantilla. Asegúrate de que los enlaces a recursos usen la ruta correcta:
    -   CSS: `/hojadevida/src/style.css`
    -   JS: `/hojadevida/src/js/blog-renderer.js`
    -   Volver: `/hojadevida/pages/servicios/index.html`
3.  **Actualiza `vite.config.mjs`**: Agrega la nueva entrada al objeto `input`:
    ```javascript
    'pages/servicios/nuevo-servicio': resolve(__dirname, 'pages/servicios/nuevo-servicio.html'),
    ```
4.  **Actualiza el portafolio**: En `index.html`, asegúrate de que el enlace en la tarjeta sea:
    `onclick="window.open('/hojadevida/pages/servicios/nuevo-servicio.html', '_blank')"`

¡Con esto, tu sistema de navegación será robusto y profesional tanto en local como en GitHub!
