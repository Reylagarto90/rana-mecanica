import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase.js'
import Bienvenida from './pages/Bienvenida.jsx'
import Alta       from './pages/Alta.jsx'
import Verificar  from './pages/Verificar.jsx'
import MiZona     from './pages/MiZona.jsx'
import JuntaLogin from './pages/JuntaLogin.jsx'
import Junta      from './pages/Junta.jsx'

const EMAILS_JUNTA = [
  'j.ignaciopellicer@gmail.com',
  'arturopalaciosbuitrago@gmail.com',
  'carlosyagogranell@gmail.com',
  'aupa_levante@hotmail.com',
  'martaoli21@gmail.com',
]

function RutaPrivada({ children }) {
  const [estado, setEstado] = useState('comprobando') // comprobando | ok | no

  useEffect(() => {
    (async () => {
      const flag = sessionStorage.getItem('junta_auth') === 'true'
      if (!flag) { setEstado('no'); return }
      // No basta con el flag guardado en el navegador: puede haber quedado
      // obsoleto si, en la misma pestaña, se inició sesión con otra cuenta
      // después (por ejemplo, al registrar una cuenta de peñista en Mi Zona).
      // Se comprueba también que la sesión real de Supabase Auth activa
      // corresponda de verdad a un email de la junta directiva.
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email?.toLowerCase()
      if (email && EMAILS_JUNTA.includes(email)) {
        setEstado('ok')
      } else {
        sessionStorage.removeItem('junta_auth')
        setEstado('no')
      }
    })()
  }, [])

  if (estado === 'comprobando') return null
  if (estado === 'no') return <Navigate to="/junta/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Bienvenida />} />
      <Route path="/alta"        element={<Alta />} />
      <Route path="/verificar"   element={<Verificar />} />
      <Route path="/mi-zona"     element={<MiZona />} />
      <Route path="/junta/login" element={<JuntaLogin />} />
      <Route path="/junta/*"     element={<RutaPrivada><Junta /></RutaPrivada>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}
