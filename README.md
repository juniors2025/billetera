# Frente Acción — Sitio Web

Sitio estático en HTML/CSS/JS.

## Estructura
- `index.html`
- `styles/styles.css`
- `scripts/main.js`
- `assets/` (coloque imágenes aquí, ej.: `assets/banner.jpg`)

## Requisitos
No requiere Node ni build. Abrir `index.html` en el navegador.

## Desarrollo local
1. Coloque el banner en `assets/banner.jpg`.
2. Abra `index.html` con un servidor local (opcional):
   - VS Code: Live Server
   - Python: `python -m http.server 8080`

## Deploy en GitHub Pages
1. Cree el repo en GitHub (por ejemplo `WEBFRENTEACCION`).
2. Suba estos archivos a la rama `main`.
3. En Settings → Pages:
   - Source: `Deploy from a branch`
   - Branch: `main` y carpeta `/root`.
4. GitHub generará una URL del estilo `https://usuario.github.io/WEBFRENTEACCION/`.

## Deploy a GitHub Pages

- Repo: https://github.com/frenteaccion2025-maker/-WEBFRENTEACCION-.git

### 1) Inicializar y subir

```bash
cd WEBFRENTEACCION
git init
git add .
git commit -m "Publicación inicial: WEBFRENTEACCION"
git branch -M main
git remote add origin https://github.com/frenteaccion2025-maker/-WEBFRENTEACCION-.git
git push -u origin main
```

### 2) Activar Pages
- GitHub -> Settings -> Pages
- Source: Deploy from a branch
- Branch: `main` / root

### 3) Dominio personalizado (opcional)
- Crear archivo `CNAME` en la raíz con tu dominio, por ejemplo:
```
frenteaccion.com.ar
```
- DNS en tu proveedor:
  - CNAME `www` -> `frenteaccion2025-maker.github.io`
  - A records para el dominio raíz:
    - 185.199.108.153
    - 185.199.109.153
    - 185.199.110.153
    - 185.199.111.153
- Enforce HTTPS en GitHub Pages.

### 4) Edición de contenido
- Editá `index.html` (Tailwind + AOS + Feather)
- Las imágenes apuntan a URLs externas, por lo que no necesitás subir assets locales.

## Dominio propio
1. En Settings → Pages → Custom domain: escriba su dominio (ej.: `frenteaccion.com`).
2. En su proveedor DNS, agregue registros:
   - `A` → 185.199.108.153
   - `A` → 185.199.109.153
   - `A` → 185.199.110.153
   - `A` → 185.199.111.153
   - Opcional: `CNAME` de `www` → `<usuario>.github.io`.
3. Espere la propagación (puede tardar entre 15 min y 24 h).
4. Vuelva a Settings → Pages y active `Enforce HTTPS`.

## Personalización rápida
- Editar textos de secciones en `index.html`.
- Ajustar colores en `styles/styles.css` (variables `:root`).
- Reemplazar imágenes en `assets/`.

## Próximos pasos
- Integrar formulario con EmailJS o backend.
- Agregar secciones adicionales según campaña.
