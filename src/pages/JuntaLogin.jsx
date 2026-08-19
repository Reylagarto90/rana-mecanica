import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'

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
const URL_APP = "https://reylagarto90.github.io/rana-mecanica/#/junta/login"

const Shell = ({ children }) => (
  <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
    <div style={{ width:'100%', maxWidth:420 }}>{children}</div>
  </div>
)
const Cabecera = ({ titulo, subtitulo }) => (
  <div style={{ textAlign:'center', marginBottom:24 }}>
    <img src={LOGO} alt="La Rana Mecánica" style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', display:'block', margin:'0 auto 14px', border:'3px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}/>
    <h2 style={{ color:C.blanco, fontSize:20, fontWeight:700, marginBottom:6 }}>{titulo}</h2>
    {subtitulo && <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.5 }}>{subtitulo}</p>}
  </div>
)
const Tarjeta = ({ children }) => (
  <div style={{ background:C.blanco, borderRadius:20, padding:'28px 24px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>{children}</div>
)
const Campo = ({ label, ...props }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:12, fontWeight:600, color:C.gris, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</label>
    <input {...props} style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1.5px solid ${props.error?C.rojo:C.border}`, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
  </div>
)
const Aviso = ({ children, color=C.rojo, bg=C.rojoLight }) => (
  <div style={{ marginBottom:12, padding:'10px 14px', background:bg, borderRadius:10, fontSize:13, color }}>{children}</div>
)
const Boton = ({ children, loading, color=C.granate, ...props }) => (
  <button {...props} disabled={loading || props.disabled} style={{ width:'100%', padding:13, background:(loading||props.disabled)?'#bbb':color, color:C.blanco, border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:(loading||props.disabled)?'not-allowed':'pointer', fontFamily:'inherit' }}>
    {children}
  </button>
)

// ── PANTALLA: LOGIN ───────────────────────────────────────
function PantallaLogin({ onLogin, onCambiarPass, onNecesitaMFA, onOfrecer2FA, onRecuperar }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const entrar = async () => {
    if (!email || !pass) { setError('Introduce email y contraseña'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (err) { setLoading(false); setError('Email o contraseña incorrectos'); return }

    if (pass === PASS_INICIAL) { setLoading(false); onCambiarPass(data.user); return }

    const { data: factores } = await supabase.auth.mfa.listFactors()
    const tieneTOTP = (factores?.totp || []).length > 0

    if (tieneTOTP) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      setLoading(false)
      if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== aal?.nextLevel) {
        onNecesitaMFA(factores.totp[0])
        return
      }
      onLogin(data.user)
    } else {
      setLoading(false)
      onOfrecer2FA(data.user)
    }
  }

  return (
    <Shell>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <img src={LOGO} alt="La Rana Mecánica" style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', display:'block', margin:'0 auto 16px', border:'3px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}/>
        <h1 style={{ color:C.blanco, fontSize:22, fontWeight:700, marginBottom:4 }}>Panel Junta Directiva</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>Peña La Rana Mecánica · Temporada 2026/2027</p>
      </div>
      <Tarjeta>
        <Campo label="Email" type="email" value={email} error={error} onChange={e=>{setEmail(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&entrar()} placeholder="tu@email.com" autoFocus/>
        <Campo label="Contraseña" type="password" value={pass} error={error} onChange={e=>{setPass(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&entrar()} placeholder="Tu contraseña"/>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={entrar} loading={loading}>{loading ? 'Entrando...' : 'Entrar al panel →'}</Boton>
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={onRecuperar} style={{ background:'none', border:'none', color:C.azul, fontSize:13, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline' }}>¿Olvidaste tu contraseña?</button>
        </div>
        <div style={{ marginTop:14, padding:'10px 14px', background:C.grisLight, borderRadius:10, fontSize:12, color:C.muted, textAlign:'center' }}>
          Solo para miembros de la junta directiva
        </div>
      </Tarjeta>
    </Shell>
  )
}

// ── PANTALLA: VERIFICACIÓN EN DOS PASOS (al entrar) ───────
function PantallaMFA({ factor, onVerificado, onVolver }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const verificar = async () => {
    if (codigo.length !== 6) { setError('Introduce los 6 dígitos de tu app de autenticación'); return }
    setLoading(true); setError('')
    const { data: challenge, error: errC } = await supabase.auth.mfa.challenge({ factorId: factor.id })
    if (errC) { setLoading(false); setError('No se pudo iniciar la verificación'); return }
    const { error: errV } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: codigo })
    setLoading(false)
    if (errV) { setError('Código incorrecto. Revisa tu app de autenticación.'); return }
    onVerificado()
  }

  return (
    <Shell>
      <Cabecera titulo="Verificación en dos pasos" subtitulo="Abre tu app de autenticación (Google Authenticator, Authy...) e introduce el código de 6 dígitos." />
      <Tarjeta>
        <Campo label="Código de 6 dígitos" value={codigo} error={error}
          onChange={e=>{setCodigo(e.target.value.replace(/\D/g,'').slice(0,6));setError('')}}
          onKeyDown={e=>e.key==='Enter'&&verificar()}
          placeholder="000000" inputMode="numeric" autoFocus
          style={{ textAlign:'center', fontSize:24, letterSpacing:6 }}/>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={verificar} loading={loading} color={C.verde}>{loading?'Verificando...':'Verificar y entrar'}</Boton>
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={onVolver} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Volver</button>
        </div>
      </Tarjeta>
    </Shell>
  )
}

// ── PANTALLA: OFRECER ACTIVAR 2FA (tras un login sin 2FA) ──
function PantallaOfrecer2FA({ onOmitir, onActivar }) {
  return (
    <Shell>
      <Cabecera titulo="Protege tu cuenta" subtitulo="Añade una capa extra de seguridad: aunque alguien consiga tu contraseña, no podrá entrar sin tu móvil." />
      <Tarjeta>
        <div style={{ background:C.oroLight, border:`1px solid ${C.oro}50`, borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#7a5c00' }}>
          🔐 Recomendado para todos los miembros de la junta, ya que esta cuenta da acceso a datos personales y económicos de la peña.
        </div>
        <Boton onClick={onActivar} color={C.verde}>🔐 Activar verificación en dos pasos</Boton>
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={onOmitir} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Ahora no, entrar directamente →</button>
        </div>
      </Tarjeta>
    </Shell>
  )
}

// ── PANTALLA: CONFIGURAR 2FA (QR + confirmación) ──────────
function PantallaConfigurar2FA({ onActivado, onCancelar }) {
  const [paso, setPaso] = useState('cargando')
  const [qr, setQr] = useState('')
  const [secreto, setSecreto] = useState('')
  const [factorId, setFactorId] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (err) { setPaso('error'); setError('No se pudo iniciar la configuración. Inténtalo de nuevo más tarde.'); return }
      setQr(data.totp.qr_code); setSecreto(data.totp.secret); setFactorId(data.id); setPaso('qr')
    })()
  }, [])

  const confirmar = async () => {
    if (codigo.length !== 6) { setError('Introduce los 6 dígitos que muestra tu app'); return }
    setLoading(true); setError('')
    const { data: challenge, error: errC } = await supabase.auth.mfa.challenge({ factorId })
    if (errC) { setLoading(false); setError('Error al verificar, inténtalo de nuevo'); return }
    const { error: errV } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: codigo })
    setLoading(false)
    if (errV) { setError('Código incorrecto. Comprueba que la hora de tu móvil es correcta.'); return }
    onActivado()
  }

  return (
    <Shell>
      <Cabecera titulo="Configura la verificación en dos pasos" subtitulo="Escanea este código con Google Authenticator, Authy o similar." />
      <Tarjeta>
        {paso === 'cargando' && <p style={{ textAlign:'center', color:C.muted, fontSize:14 }}>Generando código QR...</p>}
        {paso === 'error' && <Aviso>{error}</Aviso>}
        {paso === 'qr' && (<>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <img src={qr} alt="Código QR" style={{ width:180, height:180 }}/>
            <p style={{ fontSize:11, color:C.muted, marginTop:8, wordBreak:'break-all' }}>¿No puedes escanear? Introduce este código manualmente: <strong>{secreto}</strong></p>
          </div>
          <Campo label="Código de tu app" value={codigo} error={error}
            onChange={e=>{setCodigo(e.target.value.replace(/\D/g,'').slice(0,6));setError('')}}
            onKeyDown={e=>e.key==='Enter'&&confirmar()}
            placeholder="000000" inputMode="numeric"
            style={{ textAlign:'center', fontSize:22, letterSpacing:6 }}/>
          {error && <Aviso>{error}</Aviso>}
          <Boton onClick={confirmar} loading={loading} color={C.verde}>{loading?'Comprobando...':'Confirmar y activar'}</Boton>
        </>)}
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={onCancelar} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
        </div>
      </Tarjeta>
    </Shell>
  )
}

// ── PANTALLA: RECUPERAR CONTRASEÑA ────────────────────────
function PantallaRecuperar({ onVolver }) {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const enviar = async () => {
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: URL_APP })
    setLoading(false)
    if (err) { setError('No se pudo enviar el email. Comprueba la dirección.'); return }
    setEnviado(true)
  }

  return (
    <Shell>
      <Cabecera titulo="Recuperar contraseña" subtitulo="Te enviaremos un enlace para crear una nueva." />
      <Tarjeta>
        {enviado ? (
          <Aviso color={C.verde} bg={C.verdeLight}>✅ Si ese email está registrado como junta, te llegará un enlace en unos minutos. Revisa también spam.</Aviso>
        ) : (<>
          <Campo label="Email" type="email" value={email} error={error} onChange={e=>{setEmail(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&enviar()} placeholder="tu@email.com" autoFocus/>
          {error && <Aviso>{error}</Aviso>}
          <Boton onClick={enviar} loading={loading}>{loading?'Enviando...':'Enviar enlace de recuperación'}</Boton>
        </>)}
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={onVolver} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Volver al login</button>
        </div>
      </Tarjeta>
    </Shell>
  )
}

// ── PANTALLA: CAMBIAR / ESTABLECER CONTRASEÑA ─────────────
function PantallaCambiarPass({ esRecuperacion, onCambiada }) {
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
    const { data, error: err2 } = await supabase.auth.updateUser({ password: nueva })
    setLoading(false)
    if (err2) { setError('Error al cambiar la contraseña. Inténtalo de nuevo.'); return }
    onCambiada(data.user)
  }

  return (
    <Shell>
      <Cabecera titulo={esRecuperacion ? "Crea tu nueva contraseña" : "Cambia tu contraseña"}
        subtitulo={esRecuperacion ? "Establece una contraseña nueva para tu cuenta." : "Es tu primera vez. Por seguridad debes establecer una contraseña personal."} />
      <Tarjeta>
        <div style={{ background:C.oroLight, border:`1px solid ${C.oro}50`, borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#7a5c00' }}>
          🔐 La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
        </div>
        <Campo label="Nueva contraseña" type="password" value={nueva} error={error} onChange={e=>{setNueva(e.target.value);setError('')}} placeholder="Mínimo 8 caracteres"/>
        <Campo label="Confirmar contraseña" type="password" value={confirmar} error={error} onChange={e=>{setConfirmar(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&cambiar()} placeholder="Repite la contraseña"/>
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
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={cambiar} loading={loading} color={C.verde}>{loading ? 'Guardando...' : '🔐 Establecer mi contraseña'}</Boton>
      </Tarjeta>
    </Shell>
  )
}

// ── APP ───────────────────────────────────────────────────
export default function JuntaLogin() {
  const [pantalla, setPantalla] = useState('login')
  const [userTemp, setUserTemp] = useState(null)
  const [factorMFA, setFactorMFA] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPantalla('recuperacion-nueva-pass')
    })
    return () => sub?.subscription?.unsubscribe()
  }, [])

  const finalizarLogin = (user) => {
    sessionStorage.setItem('junta_auth', 'true')
    sessionStorage.setItem('junta_email', user.email)
    navigate('/junta')
  }

  if (pantalla === 'mfa') return <PantallaMFA factor={factorMFA} onVerificado={()=>finalizarLogin(userTemp)} onVolver={()=>setPantalla('login')}/>
  if (pantalla === 'ofrecer2fa') return <PantallaOfrecer2FA onOmitir={()=>finalizarLogin(userTemp)} onActivar={()=>setPantalla('configurar2fa')}/>
  if (pantalla === 'configurar2fa') return <PantallaConfigurar2FA onActivado={()=>finalizarLogin(userTemp)} onCancelar={()=>finalizarLogin(userTemp)}/>
  if (pantalla === 'recuperar') return <PantallaRecuperar onVolver={()=>setPantalla('login')}/>
  if (pantalla === 'recuperacion-nueva-pass') return <PantallaCambiarPass esRecuperacion onCambiada={finalizarLogin}/>
  if (pantalla === 'cambiar') return <PantallaCambiarPass onCambiada={finalizarLogin}/>

  return (
    <PantallaLogin
      onLogin={finalizarLogin}
      onCambiarPass={(user)=>{setUserTemp(user);setPantalla('cambiar')}}
      onNecesitaMFA={(factor)=>{setFactorMFA(factor);setPantalla('mfa')}}
      onOfrecer2FA={(user)=>{setUserTemp(user);setPantalla('ofrecer2fa')}}
      onRecuperar={()=>setPantalla('recuperar')}
    />
  )
}
