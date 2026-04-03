# 🚀 Guía para Subir tu Hoja de Vida a GitHub

Este documento describe los pasos detallados para publicar tu sitio web utilizando GitHub Pages y GitHub Actions.

## 1. Preparación Inicial
Abre la terminal en la carpeta `HojaDeVida` y asegúrate de que Git esté inicializado:
```powershell
git init
```

## 2. Registrar los Cambios
Añade todos los archivos nuevos (incluyendo la configuración de Vite y Tailwind):
```powershell
git add .
```

## 3. Crear el Commit
Guarda los cambios localmente con un mensaje descriptivo:
```powershell
git commit -m "Rediseño completo estilo Google con Vite y despliegue automático"
```

## 4. Conectar con tu Repositorio
Reemplaza `[LINK_REPOSITORIO]` con el enlace de tu repositorio en GitHub (ej: `https://github.com/nicolas/HojaDeVida.git`):
```powershell
git remote add origin [LINK_REPOSITORIO]
```
*(Si ya tenías un origin configurado, usa: `git remote set-url origin [LINK_REPOSITORIO]`)*

## 5. Renombrar y Subir
Git por defecto usa `master`, pero GitHub prefiere `main`. Cambia el nombre de la rama y sube los archivos:
```powershell
git branch -M main
git push -u origin main --force
```
*(Usa `--force` si recibes un error de tipo 'non-fast-forward')*

## 6. Activar la Automatización (Paso Crítico)
Para que el despliegue automático con Vite funcione:
1. Entra a tu repositorio en la web de GitHub.
2. Ve a **Settings** (Ajustes).
3. En el menú de la izquierda, selecciona **Pages**.
4. En la sección **Build and deployment**, dentro de **Source**, cambia de `Deploy from a branch` a **GitHub Actions**.

---

¡Listo! Una vez completado el paso 6, GitHub Actions tomará el control y construirá tu sitio. En 1-2 minutos podrás verlo en: `https://[tu-usuario].github.io/HojaDeVida/`
