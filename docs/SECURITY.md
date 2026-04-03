# 🛡️ Seguridad del Ecosistema NPM

Este documento detalla las medidas de seguridad implementadas en este proyecto para mitigar ataques en la cadena de suministro de NPM.

## 1. Pinning de Versiones Exactas

Se han eliminado los rangos de versiones (`^` y `~`) de todas las dependencias en el `package.json`.

- **Por qué**: Evita que el proyecto descargue automáticamente nuevas versiones (minor o patch) que podrían haber sido comprometidas antes de ser auditadas por la comunidad.
- **Acción**: Las versiones ahora están fijas, por ejemplo: `"vite": "6.4.1"` en lugar de `"vite": "^6.4.1"`.

## 2. Desactivación de Scripts de Ciclo de Vida

Se ha configurado el archivo `.npmrc` en la raíz del proyecto.

- **Por qué**: Muchos ataques dependen de scripts que se ejecutan automáticamente durante la instalación (`preinstall`, `postinstall`).
- **Configuración**: `ignore-scripts=true`. Esto detiene la ejecución automática de cualquier script dentro de los paquetes instalados.

## 3. Periodo de "Cuarentena" (Release Age)

Se ha configurado una regla global de antigüedad mínima para las versiones de los paquetes.

- **Por qué**: Esperar un par de días permite que la comunidad detecte y reporte versiones maliciosas antes de que lleguen a nuestro entorno de desarrollo.
- **Configuración**: `npm config set min-release-age 2 --location=global`.
- **Requisito**: Requiere **NPM v11.10+** (actualmente actualizado a v11.12.1).

---

## 🛠️ Cómo Actualizar Dependencias

Para actualizar una librería de forma segura:
1. Cambia manualmente la versión en el `package.json`.
2. Ejecuta `npm install`.
3. Verifica que la nueva versión sea funcional y estable.
