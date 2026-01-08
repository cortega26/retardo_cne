
# Retardo CNE — Irregularidades Elecciones 2024

Este repositorio contiene un sitio web estático que documenta, de manera técnica y verificable, **violaciones e irregularidades** del Consejo Nacional Electoral (CNE) de Venezuela durante la elección presidencial de 2024.

> Enfoque: hechos → norma aplicable → evidencia → impacto → réplica (si procede).

## Sitio web (estático)
- Entrada principal: `index.html`.
- Estilos, scripts e imágenes: `assets/`.
- Ver localmente:
  - Abrir `index.html` en el navegador, o
  - Ejecutar `node scripts/serve.js` (por defecto en `http://127.0.0.1:4173`, configurable con `PORT`).

## Datos y generación de contenido
- `content/` contiene fuentes en `.docx`.
- `build_irregularidades.py` procesa uno o varios `.docx` y actualiza:
  - `docs/irregularidades.md`
  - `data/sources.csv`
- Requiere: `python-docx` y `pandas`.
- Ejemplo:
  ```
  python build_irregularidades.py --docx "content/Auditorías post-electorales no realizadas.docx" --create-if-missing
  ```
- `docs/` y `mkdocs.yml` mantienen el sitio alterno en MkDocs (opcional).

## Scripts (Node)
- `npm run lint`: ESLint + Stylelint.
- `npm run test:e2e`: Playwright (puede requerir `npx playwright install`).
- `npm run lighthouse`: Lighthouse CI local (requiere Chrome).
- `npm run format`: Prettier sobre el repo.

## Estructura (resumen)
```
.
├── index.html                # Sitio web principal (estático)
├── assets/                   # CSS, JS e imágenes
├── content/                  # Fuentes .docx
├── data/                     # CSV con matriz de evidencia
├── docs/                     # Contenido opcional para MkDocs
├── scripts/                  # Servidor estático local
├── tests/                    # Tests E2E con Playwright
└── .github/workflows/        # CI (lint + LHCI) y despliegue opcional MkDocs
```

## Contribuir
- Toda afirmación debe estar respaldada por **fuente primaria o secundaria confiable** y **fecha exacta**.
- Cita artículos de ley (LOPRE y reglamentos) cuando se alegue violación normativa.
- Adjunta enlaces públicos o, cuando no sea posible, el *hash* y copia reproducible (PDF) en `sources/` (usa Git LFS si es pesado).

## Licencia
Contenido bajo CC BY 4.0. Código MIT.
