import os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
LOGO_URL = "/rana-mecanica/logo.jpg"

# ── 1. Actualizar App.jsx con router correcto ────────────
app_jsx = '''import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Alta       from './pages/Alta.jsx'
import Verificar  from './pages/Verificar.jsx'
import MiZona     from './pages/MiZona.jsx'
import JuntaLogin from './pages/JuntaLogin.jsx'
import Junta      from './pages/Junta.jsx'

function RutaPrivada({ children }) {
  const ok = sessionStorage.getItem('junta_auth') === 'true'
  if (!ok) return <Navigate to="/junta/login" replace />
  return children
}

function GithubPagesRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const ruta = sessionStorage.getItem('redirect_route')
    if (ruta && ruta !== '/') {
      sessionStorage.removeItem('redirect_route')
      navigate(ruta, { replace: true })
    }
  }, [navigate])
  return null
}

export default function App() {
  return (
    <>
      <GithubPagesRedirect />
      <Routes>
        <Route path="/"            element={<Navigate to="/alta" replace />} />
        <Route path="/alta"        element={<Alta />} />
        <Route path="/verificar"   element={<Verificar />} />
        <Route path="/mi-zona"     element={<MiZona />} />
        <Route path="/junta/login" element={<JuntaLogin />} />
        <Route path="/junta/*"     element={<RutaPrivada><Junta /></RutaPrivada>} />
        <Route path="*"            element={<Navigate to="/alta" replace />} />
      </Routes>
    </>
  )
}
'''

app_path = os.path.join(BASE, 'src', 'App.jsx')
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_jsx)
print("✅ App.jsx actualizado")

# ── 2. Actualizar main.jsx ────────────────────────────────
main_jsx = '''import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/rana-mecanica">
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
'''

main_path = os.path.join(BASE, 'src', 'main.jsx')
with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_jsx)
print("✅ main.jsx actualizado")

# ── 3. Actualizar logo en todas las páginas ───────────────
pages_dir = os.path.join(BASE, 'src', 'pages')
pages = ['Alta.jsx', 'Verificar.jsx', 'MiZona.jsx', 'JuntaLogin.jsx', 'Junta.jsx']

for page in pages:
    path = os.path.join(pages_dir, page)
    if not os.path.exists(path):
        print(f"⚠️  {page} no encontrado")
        continue

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Reemplazar LOGO base64 por URL
    content = re.sub(
        r'const LOGO = "data:image/jpeg;base64,[A-Za-z0-9+/=]*";',
        f'const LOGO = "{LOGO_URL}";',
        content
    )

    # Reemplazar emoji rana del index.html por nada (se gestiona en index.html)
    # Sustituir favicon emoji por logo real
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {page} — logo actualizado")
    else:
        print(f"ℹ️  {page} — sin cambios de logo (puede que ya use URL)")

# ── 4. Actualizar index.html — favicon con logo ──────────
index_path = os.path.join(BASE, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    idx = f.read()

idx = idx.replace(
    '''<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐸</text></svg>"/>''',
    '<link rel="icon" href="/rana-mecanica/logo.jpg"/>'
)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(idx)
print("✅ index.html — favicon actualizado")

print("\n🐸 ¡Todo actualizado! Ahora ejecuta:")
print("   git add .")
print('   git commit -m "Fix rutas y logo oficial"')
print("   git push")
