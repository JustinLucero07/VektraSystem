# Vektra Systems — sitio web

Sitio web de Vektra Systems: Node.js + Express sirviendo un frontend estático (HTML/CSS/JS) con animaciones nativas (CSS + IntersectionObserver, sin librerías) y SEO optimizado.

## Estructura

```
server.js           → servidor Express (sirve la carpeta public/)
package.json
public/
  index.html         → todo el contenido del sitio
  css/style.css
  js/main.js         → reveal, cotizador, filtros, menú móvil
  img/                → imágenes del sitio
  robots.txt
  sitemap.xml
design-reference/    → mockup y capturas originales (no se sube al sitio ni al repo)
```

## Probar en tu computadora

```bash
npm install
npm start
```

Abre http://localhost:3000

## Subir a GitHub

Desde esta carpeta (`VektraSystem`):

```bash
git init                          # si aún no está inicializado
git add .
git commit -m "Rediseño de vektrasystems.com"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## Conectar con Hostinger

En hPanel, en la pantalla "Implementa tu app web" → **Despliega desde GitHub**:

1. Conecta tu cuenta de GitHub y selecciona el repositorio que acabas de crear.
2. Cuando pida el tipo de app / stack: elige **Node.js**.
3. Comando de instalación: `npm install`
4. Comando de inicio: `npm start` (o `node server.js`)
5. Puerto: la app usa `process.env.PORT`, así que toma automáticamente el puerto que Hostinger le asigne — no hace falta configurarlo a mano.
6. Guarda y despliega. Cada vez que hagas `git push` a `main`, puedes volver a desplegar desde el mismo panel para actualizar el sitio en vivo.

## Reemplazar las imágenes

Las imágenes actuales (`public/img/hero.jpg`, `portfolio-1.jpg` a `portfolio-4.jpg`) son fotos de stock puestas temporalmente porque no había material real disponible. Cuando tengas capturas reales de tus proyectos, reemplaza esos archivos manteniendo el mismo nombre y visualízalos con `npm start` antes de subir los cambios.

## SEO

- Meta title, description, Open Graph y Twitter Card ya configurados en `public/index.html`.
- `sitemap.xml` y `robots.txt` incluidos en `public/`.
- Datos estructurados (schema.org `ProfessionalService`) para que Google entienda mejor el negocio.
- Se corrigió un bug del sitio anterior: el `canonical` apuntaba a `localhost` en vez de `https://vektrasystems.com/`.
- Después de publicar, registra el dominio en [Google Search Console](https://search.google.com/search-console) y envía el sitemap (`https://vektrasystems.com/sitemap.xml`) para que Google indexe el sitio más rápido.
