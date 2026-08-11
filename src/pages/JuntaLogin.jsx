import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../colors.js'

// En producción: usar Supabase Auth
// Por ahora: contraseña simple para las pruebas
const PASS_DEMO = 'rana2026'

export default function JuntaLogin() {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const entrar = () => {
    if (pass === PASS_DEMO) {
      sessionStorage.setItem('junta_auth', 'true')
      navigate('/junta')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:C.blanco, borderRadius:20, padding:'32px 28px', maxWidth:380, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔐</div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.granateDark, marginBottom:4 }}>Panel Junta Directiva</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Peña La Rana Mecánica</p>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Contraseña</label>
          <input type="password" value={pass} onChange={e => { setPass(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && entrar()}
            placeholder="Contraseña de la junta" autoFocus
            style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${error ? C.rojo : C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          {error && <p style={{ fontSize:12, color:C.rojo, marginTop:6 }}>⚠ {error}</p>}
        </div>
        <button onClick={entrar} style={{ width:'100%', padding:13, background:C.granate, color:C.blanco, border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
          Entrar al panel →
        </button>
        <div style={{ marginTop:16, padding:'10px 14px', background:C.grisLight, borderRadius:10, fontSize:12, color:C.muted, textAlign:'center' }}>
          Solo para miembros de la junta directiva
        </div>
      </div>
    </div>
  )
}
