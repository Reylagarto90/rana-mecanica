# 🐸 La Rana Mecánica — App de Gestión

Peña Levantinista La Rana Mecánica · Godella-Rocafort · Temporada 2026/2027

---

## URLs de la app

| URL | Quién la usa |
|-----|-------------|
| `/alta` | Cualquiera — formulario de alta pública |
| `/verificar` | Peñistas — verificar datos por teléfono |
| `/mi-zona` | Peñistas — panel privado personal |
| `/junta/login` | Junta directiva — acceso con contraseña |
| `/junta` | Junta directiva — panel completo de gestión |

---

## Despliegue en GitHub Pages

### 1. Supabase (15 min)
1. Crear proyecto en [supabase.com](https://supabase.com) — región West EU
2. SQL Editor → pegar `supabase_schema.sql` → Run
3. SQL Editor → pegar `supabase_schema_censo.sql` → Run (importa los 33 socios)
4. Settings → API → copiar URL y anon key

### 2. Variables de entorno
Crear `.env.local` (no se sube a GitHub):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. GitHub
```bash
git init
git add .
git commit -m "🐸 Initial commit — La Rana Mecánica"
git remote add origin https://github.com/Reylagarto90/rana-mecanica.git
git push -u origin main
```

### 4. Activar GitHub Pages
1. GitHub → repo → Settings → Pages
2. Source: **GitHub Actions**
3. Crear `.github/workflows/deploy.yml` (ver abajo)

### 5. Workflow de despliegue automático
Crear el archivo `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 6. Secrets en GitHub
Settings → Secrets → Actions → New secret:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Desarrollo local
```bash
npm install
npm run dev
# → http://localhost:5173/rana-mecanica/
```

---

## Contraseña panel junta (demo)
`rana2026` — cambiar antes del lanzamiento en `src/pages/JuntaLogin.jsx`

En producción: migrar a Supabase Auth.
