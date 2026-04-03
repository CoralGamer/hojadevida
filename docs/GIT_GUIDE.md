# 🛠️ Guía de Despliegue y Buenas Prácticas de Git

Este documento explica los estándares profesionales para gestionar los cambios en tu proyecto y subirlos a GitHub de forma segura y organizada.

---

## 1. Paso a Paso del Despliegue

Sigue estos comandos en tu terminal desde la carpeta raíz del proyecto:

1. **Verificar el estado actual:**
   ```powershell
   git status
   ```
   *Muestra los archivos modificados que aún no se han registrado.*

2. **Preparar los archivos (Staging):**
   ```powershell
   git add .
   ```
   *El punto (.) añade todos los cambios. Usa `git add [archivo]` para ser específico.*

3. **Crear el Commit (Empaquetar cambios):**
   ```powershell
   git commit -m "feat: optimización de sección IA y mejoras de seguridad"
   ```

4. **Subir los cambios a GitHub:**
   ```powershell
   git push origin main
   ```

---

## 2. El Arte de un Buen Commit (Conventional Commits)

Un commit profesional debe ser descriptivo. Utilizamos el estándar **Conventional Commits**:
`tipo: descripción breve en minúsculas`

### Tipos Comunes:
- `feat`: Nueva funcionalidad (ej: sección de IA).
- `fix`: Corrección de errores.
- `docs`: Cambios solo en documentación (como este archivo).
- `style`: Formato, espacios, CSS (sin cambios en la lógica).
- `refactor`: Mejora del código existente que no añade funciones ni corrige errores.

### Ejemplo Ideal:
```text
feat: reordenar tarjetas de IA y ocultar datos sensibles de contacto
```
*Describe exactamente el valor aportado: orden jerárquico y seguridad.*

---

## 3. Variantes de Commit

| Variante | Comando | Recomendación |
| :--- | :--- | :--- |
| **Simple** | `git commit -m "update index"` | **NO RECOMENDADA.** Demasiado vaga. |
| **Detallada** | `git commit -m "fix(ia): corregir porcentajes y orden"` | **IDEAL.** Especifica el área afectada. |
| **Multilínea** | `git commit -m "feat: seguridad" -m "- Añadido reveal email"` | **EXCELENTE.** Para cambios complejos. |

---

## 4. Consejos de Seguridad

1. **Nunca subas archivos `.env`**: Las llaves de API deben estar en `.gitignore`.
2. **Revisión Previa**: Usa `git diff --cached` antes de confirmar para ver qué estás enviando.
3. **Firmas GPG**: Investiga `git commit -S` si deseas autenticar digitalmente tus cambios.
