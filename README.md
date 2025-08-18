
# Retardo CNE — Irregularidades Elecciones 2024

Este repositorio documenta, de manera técnica y verificable, **violaciones e irregularidades** del Consejo Nacional Electoral (CNE) de Venezuela durante la elección presidencial de 2024.

> Enfoque: hechos → norma aplicable → evidencia → impacto → réplica (si procede).

## Cómo verlo como sitio web
Este repo está listo para publicarse con **MkDocs Material** en GitHub Pages.

1. Habilita Pages: *Settings → Pages → Build and deployment → GitHub Actions*.
2. Crea el *workflow* incluido (`.github/workflows/mkdocs.yml`).
3. Una vez que corra, visita `https://<tu_usuario>.github.io/retardo_cne/`.

## Estructura
```
.
├── docs/                     # Contenido del sitio
│   ├── index.md
│   ├── irregularidades.md
│   ├── evidencia.md
│   ├── faq.md
│   └── metodologia.md
├── data/
│   └── sources.csv           # Matriz de evidencia (machine-readable)
├── mkdocs.yml                # Configuración del sitio
└── .github/workflows/
    └── mkdocs.yml            # CI para desplegar con gh-pages
```

## Contribuir
- Toda afirmación debe estar respaldada por **fuente primaria o secundaria confiable** y **fecha exacta**.
- Cita artículos de ley (LOPRE y reglamentos) cuando se alegue violación normativa.
- Adjunta enlaces públicos o, cuando no sea posible, el *hash* y copia reproducible (PDF) en `sources/` (usa Git LFS si es pesado).

## Licencia
Contenido bajo CC BY 4.0. Código MIT.
