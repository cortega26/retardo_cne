
# Retardo CNE — Irregularidades Elecciones 2024

Este repositorio contiene un sitio web estático que documenta, de manera técnica y verificable, **violaciones e irregularidades** del Consejo Nacional Electoral (CNE) de Venezuela durante la elección presidencial de 2024.

> Enfoque: hechos → norma aplicable → evidencia → impacto → réplica (si procede).

## Sitio web (Astro)
- Entrada principal: `src/pages/index.astro`.
- Componentes: `src/components/`.
- Estilos e imágenes públicas: `public/assets/` y `public/img/`.
- Ver localmente:
  - `npm run dev` para desarrollo con Astro.
  - `npm run build && node scripts/serve.js dist` para revisar el sitio estático generado.

## Datos y generación de contenido
- `docs/retardo-cne/archive/legacy-content/` conserva fuentes antiguas en `.docx`.
- `scripts/build_irregularidades.py` procesa uno o varios `.docx` y actualiza:
  - `docs/irregularidades.md`
  - `data/sources.csv`
- Requiere: `python-docx` y `pandas`.
- Ejemplo:
  ```
  python scripts/build_irregularidades.py --docx "docs/retardo-cne/archive/legacy-content/Auditorías post-electorales no realizadas.docx" --create-if-missing
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
├── src/                      # Páginas, componentes, i18n y contenido Astro
├── public/                   # Assets publicados por Astro
├── assets/data/              # Traducciones compartidas
├── docs/                     # Contenido opcional para MkDocs
├── scripts/                  # Utilidades y servidor estático local
├── tests/                    # Tests E2E con Playwright
└── .github/workflows/        # CI, Lighthouse y despliegue de Astro a GitHub Pages
```

## Contribuir
- Toda afirmación debe estar respaldada por **fuente primaria o secundaria confiable** y **fecha exacta**.
- Cita artículos de ley (LOPRE y reglamentos) cuando se alegue violación normativa.
- Adjunta enlaces públicos o, cuando no sea posible, el *hash* y copia reproducible (PDF) en `sources/` (usa Git LFS si es pesado).

## Licencia
Contenido bajo CC BY 4.0. Código MIT.
