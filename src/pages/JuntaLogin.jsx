import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://qgmovsqawnadgvywlbyw.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
)

const LOGO = "/rana-mecanica/logo.jpg"
const C = {
  granate:"#C0185A", granateDark:"#8B0A3A", granateLight:"#fceef5",
  azul:"#003DA5", verde:"#1a7a3c", verdeLight:"#e8f5ee",
  oro:"#C9963A", oroLight:"#fdf6e8",
  rojo:"#c0392b", rojoLight:"#fdecea",
  gris:"#64748b", grisLight:"#f8fafc",
  border:"#e2e8f0", text:"#1e293b", muted:"#94a3b8", blanco:"#fff",
}

const PASS_INICIAL = "Rana2026!"

// ── PANTALLA: LOGIN ───────────────────────────────────────
function PantallaLogin({ onLogin, onCambiarPass }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const entrar = async () => {
    if (!email || !pass) { setError('Introduce email y contraseña'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (err) { setError('Email o contraseña incorrectos'); return }
    // Detectar si es primera vez (contraseña inicial)
    if (pass === PASS_INICIAL) {
      onCambiarPass(data.user)
    } else {
      onLogin(data.user)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src={LOGO} alt="La Rana Mecánica" style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', display:'block', margin:'0 auto 16px', border:'3px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}/>
          <h1 style={{ color:C.blanco, fontSize:22, fontWeight:700, marginBottom:4 }}>Panel Junta Directiva</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>Peña La Rana Mecánica · Temporada 2026/2027</p>
        </div>

        <div style={{ background:C.blanco, borderRadius:20, padding:'28px 24px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Email</label>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}}
              onKeyDown={e=>e.key==='Enter'&&entrar()}
              placeholder="tu@email.com" autoFocus
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${error?C.rojo:C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Contraseña</label>
            <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setError('')}}
              onKeyDown={e=>e.key==='Enter'&&entrar()}
              placeholder="Tu contraseña"
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${error?C.rojo:C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>
          {error && <div style={{ marginBottom:12, padding:'10px 14px', background:C.rojoLight, borderRadius:10, fontSize:13, color:C.rojo }}>{error}</div>}
          <button onClick={entrar} disabled={loading} style={{ width:'100%', padding:13, background:loading?'#bbb':C.granate, color:C.blanco, border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {loading ? 'Entrando...' : 'Entrar al panel →'}
          </button>
          <div style={{ marginTop:14, padding:'10px 14px', background:C.grisLight, borderRadius:10, fontSize:12, color:C.muted, textAlign:'center' }}>
            Solo para miembros de la junta directiva
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PANTALLA: CAMBIAR CONTRASEÑA ──────────────────────────
function PantallaCambiarPass({ user, onCambiada }) {
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validar = () => {
    if (nueva.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(nueva)) return 'Debe contener al menos una mayúscula'
    if (!/[0-9]/.test(nueva)) return 'Debe contener al menos un número'
    if (nueva === PASS_INICIAL) return 'No puedes usar la contraseña inicial'
    if (nueva !== confirmar) return 'Las contraseñas no coinciden'
    return null
  }

  const cambiar = async () => {
    const err = validar()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    const { error: err2 } = await supabase.auth.updateUser({ password: nueva })
    setLoading(false)
    if (err2) { setError('Error al cambiar la contraseña. Inténtalo de nuevo.'); return }
    onCambiada(user)
  }

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <img src={LOGO} alt="La Rana Mecánica" style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', display:'block', margin:'0 auto 14px', border:'3px solid rgba(255,255,255,0.3)' }}/>
          <h2 style={{ color:C.blanco, fontSize:20, fontWeight:700, marginBottom:6 }}>Cambia tu contraseña</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.5 }}>Es tu primera vez. Por seguridad debes<br/>establecer una contraseña personal.</p>
        </div>

        <div style={{ background:C.blanco, borderRadius:20, padding:'28px 24px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ background:C.oroLight, border:`1px solid ${C.oro}50`, borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#7a5c00' }}>
            🔐 La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Nueva contraseña</label>
            <input type="password" value={nueva} onChange={e=>{setNueva(e.target.value);setError('')}}
              placeholder="Mínimo 8 caracteres"
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${error?C.rojo:C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Confirmar contraseña</label>
            <input type="password" value={confirmar} onChange={e=>{setConfirmar(e.target.value);setError('')}}
              onKeyDown={e=>e.key==='Enter'&&cambiar()}
              placeholder="Repite la contraseña"
              style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${error?C.rojo:C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>

          {/* Indicador de seguridad */}
          {nueva && (
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                {[
                  { ok: nueva.length>=8, label:'8+ caracteres' },
                  { ok: /[A-Z]/.test(nueva), label:'Mayúscula' },
                  { ok: /[0-9]/.test(nueva), label:'Número' },
                  { ok: nueva!==PASS_INICIAL, label:'No inicial' },
                ].map(r=>(
                  <div key={r.label} style={{ flex:1, textAlign:'center', padding:'4px', borderRadius:6, background:r.ok?C.verdeLight:C.rojoLight, fontSize:10, color:r.ok?C.verde:C.rojo, fontWeight:600 }}>
                    {r.ok?'✓':''} {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ marginBottom:12, padding:'10px 14px', background:C.rojoLight, borderRadius:10, fontSize:13, color:C.rojo }}>{error}</div>}

          <button onClick={cambiar} disabled={loading} style={{ width:'100%', padding:13, background:loading?'#bbb':C.verde, color:C.blanco, border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {loading ? 'Guardando...' : '🔐 Establecer mi contraseña'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── APP ───────────────────────────────────────────────────
export default function JuntaLogin() {
  const [pantalla, setPantalla] = useState('login')
  const [userTemp, setUserTemp] = useState(null)
  const navigate = useNavigate()

  const handleLogin = (user) => {
    sessionStorage.setItem('junta_auth', 'true')
    sessionStorage.setItem('junta_email', user.email)
    navigate('/junta')
  }

  const handleCambiarPass = (user) => {
    setUserTemp(user)
    setPantalla('cambiar')
  }

  const handleCambiada = (user) => {
    sessionStorage.setItem('junta_auth', 'true')
    sessionStorage.setItem('junta_email', user.email)
    navigate('/junta')
  }

  if (pantalla === 'cambiar') return <PantallaCambiarPass user={userTemp} onCambiada={handleCambiada}/>
  return <PantallaLogin onLogin={handleLogin} onCambiarPass={handleCambiarPass}/>
}
