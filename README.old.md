# CNE Monitor - Elecciones Presidenciales Venezuela 2024

## Descripción

Este proyecto es una página web que monitorea y visualiza los retrasos en el proceso electoral de las Elecciones Presidenciales de Venezuela 2024, específicamente enfocándose en las infracciones legales cometidas por el Consejo Nacional Electoral (CNE).

## Propósito

El objetivo principal de este sitio es proporcionar información clara y accesible sobre:

1. El retraso en la totalización y escrutinio de votos.
2. El retraso en la publicación de resultados en la Gaceta Oficial.
3. El deterioro progresivo y sistemático de las libertades civiles y personales en Venezuela.

Estos retrasos se contrastan con los plazos legales establecidos en la Ley Orgánica de Procesos Electorales (LOPRE) de Venezuela.

## Características

- Contadores en tiempo real que muestran la duración de los retrasos.
- Información sobre los artículos relevantes de la LOPRE.
- Enlaces a recursos adicionales y análisis sobre el proceso electoral.
- Botones de compartir en redes sociales para difundir la información.
- Modo oscuro para mejorar la experiencia del usuario en diferentes condiciones de iluminación.

## Tecnologías Utilizadas

- HTML5
- CSS3 (con diseño responsivo)
- JavaScript (ES6+)
- Bootstrap 5 (para el diseño y componentes responsivos)
- Font Awesome (para iconos)
- AOS (Animate On Scroll library para animaciones)
- Google Analytics (para seguimiento de usuarios)

## Estructura del Proyecto

```text
retardo_cne/
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
├── favicon.ico
├── index.html
├── lighthouserc.json
├── package-lock.json
├── package.json
└── README.md
```

## Cómo Contribuir

Las contribuciones son bienvenidas. Si deseas contribuir al proyecto:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tus cambios: `git checkout -b feature/nueva-caracteristica`
3. Realiza tus cambios y haz commit de ellos: `git commit -am 'Añade nueva característica'`
4. Sube tus cambios a tu fork: `git push origin feature/nueva-caracteristica`
5. Envía un pull request con una descripción clara de tus modificaciones.

Por favor, asegúrate de seguir las mejores prácticas de codificación y de mantener el estilo consistente con el resto del proyecto.

## Instalación Local

Para ejecutar este proyecto localmente:

1. Clona el repositorio: `git clone https://github.com/cortega26/retardo_cne.git`
2. Navega al directorio del proyecto: `cd retardo_cne`
3. Abre el archivo `index.html` en tu navegador web.

### Desarrollo

1. Instala las dependencias: `npm install`.
2. Ejecuta los linters: `npm run lint`.
3. Formatea el código: `npm run format`.
4. Ejecuta Lighthouse CI: `npm run lighthouse` (requiere Google Chrome).

Nota: Debido a las restricciones de seguridad de CORS, es posible que necesites un servidor local para probar completamente todas las funcionalidades. Puedes usar herramientas como `http-server` para Node.js o la extensión "Live Server" para Visual Studio Code.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas, comentarios o reportar problemas, por favor abre un issue en este repositorio de GitHub.

---

**Nota**: Este proyecto no está afiliado oficialmente al CNE ni a ninguna organización política. Su propósito es puramente informativo y educativo.
