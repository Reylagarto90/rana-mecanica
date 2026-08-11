import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Navigate to="/alta" replace />} />
      <Route path="/alta"        element={<Alta />} />
      <Route path="/verificar"   element={<Verificar />} />
      <Route path="/mi-zona"     element={<MiZona />} />
      <Route path="/junta/login" element={<JuntaLogin />} />
      <Route path="/junta/*"     element={<RutaPrivada><Junta /></RutaPrivada>} />
      <Route path="*"            element={<Navigate to="/alta" replace />} />
    </Routes>
  )
}