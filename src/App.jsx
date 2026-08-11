import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Páginas públicas
import Alta        from './pages/Alta.jsx'
import Verificar   from './pages/Verificar.jsx'
import MiZona      from './pages/MiZona.jsx'

// Páginas privadas (junta)
import JuntaLogin  from './pages/JuntaLogin.jsx'
import Junta       from './pages/Junta.jsx'

// ── Guardia de ruta privada ──────────────────────────────
function RutaPrivada({ children }) {
  const autenticado = sessionStorage.getItem('junta_auth') === 'true'
  if (!autenticado) return <Navigate to="/junta/login" replace />
  return children
}

// ── Redireccionador GitHub Pages ─────────────────────────
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
        {/* Página de inicio → redirige a /alta por defecto */}
        <Route path="/"                element={<Navigate to="/alta" replace />} />

        {/* ── PÚBLICAS ─────────────────────────────────── */}
        <Route path="/alta"            element={<Alta />} />
        <Route path="/verificar"       element={<Verificar />} />
        <Route path="/mi-zona"         element={<MiZona />} />

        {/* ── JUNTA ────────────────────────────────────── */}
        <Route path="/junta/login"     element={<JuntaLogin />} />
        <Route path="/junta/*"         element={
          <RutaPrivada>
            <Junta />
          </RutaPrivada>
        } />

        {/* Catch-all */}
        <Route path="*"                element={<Navigate to="/alta" replace />} />
      </Routes>
    </>
  )
}
