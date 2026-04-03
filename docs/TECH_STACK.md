# 🛠️ Stack Tecnológico y Funcionamiento

Este proyecto utiliza herramientas de vanguardia para el desarrollo web moderno, centradas en el rendimiento, la estética premium y la facilidad de mantenimiento.

---

## 1. Tecnologías Principales

### [Vite](https://vitejs.dev/)
Vite es nuestro motor de desarrollo (build tool). Ofrece:
- Carga casi instantánea del servidor de desarrollo.
- Compilación extremadamente rápida y optimizada para producción.

### [Tailwind CSS v4](https://tailwindcss.com/)
Framework de CSS basado en utilidades. La versión 4 se integra directamente como un motor de alto rendimiento. Se utiliza para:
- Definir el sistema de diseño (colores, fuentes, sombras).
- Gestionar el layout responsivo.
- Crear animaciones fluidas (como el slider infinito).

---

## 2. Arquitectura de Diseño (Ancho Fluido)

El proyecto utiliza un enfoque modular para el manejo del ancho de pantalla (100% viewport):

1. **Contenedor Principal (`#app`)**: Configurado con ancho total (`w-full`).
2. **Secciones Centradas**: Envueltas en `max-w-6xl mx-auto px-4` para limitar el ancho en monitores grandes y centrar el contenido.
3. **Slider de Servicios**: Ubicado fuera de los contenedores limitantes para ocupar el 100% del ancho del viewport de forma natural.
4. **Prevención de Scroll Horizontal**: Uso de `overflow-x-hidden` en el nivel raíz.

---

## 3. Documentación de Referencia

- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Guía de Inicio de Vite](https://vitejs.dev/guide/)
- [Novedades en Tailwind v4](https://tailwindcss.com/docs/v4-beta)

---

## 5. Resumen General

El proyecto combina la legibilidad crítica (datos personales, skills, trayectoria) con elementos dinámicos modernos. El slider de servicios profesional rompe la estructura central tradicional para aportar profundidad y modernismo al diseño, aprovechando las capacidades nativas de Tailwind CSS v4 para el manejo de capas y animaciones.

---
**Jeefry Nicolas Archila Romero | 2026**
