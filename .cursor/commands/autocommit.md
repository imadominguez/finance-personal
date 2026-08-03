---
description: Analiza los cambios del repositorio y genera commits separados por feature
---

Analiza todos los cambios actuales del repositorio y agrúpalos por feature, funcionalidad o contexto lógico.

## Objetivo

- Generar múltiples commits pequeños y coherentes.
- Cada commit debe representar UNA sola feature, fix o refactor relacionado.
- Evitar commits gigantes con cambios mezclados.

## Formato obligatorio de commits

```
(feat): Titulo del commit
```

Ejemplos válidos:

- `(feat): Agrega autenticación con Google`
- `(feat): Implementa dashboard de métricas`
- `(feat): Corrige validación de formulario`
- `(feat): Refactoriza hooks de usuarios`

## Proceso obligatorio

1. Ejecutar:

   ```bash
   git status
   git diff
   git log --oneline -5
   ```

2. Analizar TODOS los archivos modificados.

3. Detectar grupos lógicos de cambios:
   - UI
   - Backend
   - API
   - Prisma
   - Auth
   - Configuración
   - Refactors
   - Fixes
   - Tests
   - etc.

4. Crear commits separados por cada grupo lógico.

5. Antes de cada commit:

   ```bash
   git add <archivos relacionados>
   ```

6. Crear commits individuales (solo mensaje, sin trailers ni co-autoría):

   ```bash
   git commit -m "(feat): Titulo descriptivo"
   ```

   PROHIBIDO usar `--trailer`, `Co-authored-by`, ni cualquier referencia a Cursor/IA en el commit.

7. Repetir el proceso hasta commitear todos los cambios.

8. Verificar con `git status` que no queden cambios pendientes.

## Reglas

- NUNCA autoreferenciarte en los commits: no usar `--trailer`, `Co-authored-by`, ni mencionar que los commits los generó Cursor/IA.
- Los títulos deben estar en español.
- No usar emojis.
- No commitear archivos con secretos (`.env`, credenciales, etc.).
- No commitear artefactos de build (`.next/`, `node_modules/`, etc.) salvo que formen parte explícita del cambio.
- No usar commits genéricos como: update, changes, fix, misc, wip.
- El título debe describir claramente la feature implementada.
- Si detectas cambios no relacionados, separarlos en commits distintos.
- Si un archivo contiene cambios de múltiples features, intentar separar con `git add -p`.
- Priorizar commits limpios y mantenibles.
- No pedir confirmación antes de hacer los commits.
- Al finalizar, mostrar un resumen con la lista de commits creados.
