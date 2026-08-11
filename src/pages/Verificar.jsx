import { useState } from "react";

const LOGO = "/rana-mecanica/logo.jpg";

const C = {
  granate:"#C0185A", granateDark:"#8B0A3A", granateLight:"#fceef5",
  azul:"#003DA5", azulLight:"#e8eef9",
  verde:"#1a7a3c", verdeLight:"#e8f5ee",
  oro:"#C9963A", oroLight:"#fdf6e8",
  rojo:"#c0392b", rojoLight:"#fdecea",
  gris:"#64748b", grisLight:"#f8fafc",
  border:"#e2e8f0", text:"#1e293b", muted:"#94a3b8",
  blanco:"#fff",
};

const CENSO = [
  {id:3,  numero:"LRM-0003", nombre:"Rafael",      apellidos:"Bernabéu Llorens",   dni:"52653620L", fecha_nac:null,       telefono:"653211861", email:"rafabernabeu0@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:4,  numero:"LRM-0004", nombre:"Guillem",     apellidos:"Carrion Oliva",       dni:"21014212D", fecha_nac:null,       telefono:"649652544", email:"cem201102@gmail.com",              estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:7,  numero:"LRM-0007", nombre:"José Ramón",  apellidos:"Esteban Mena",        dni:"23937659H", fecha_nac:null,       telefono:"617331167", email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:8,  numero:"LRM-0008", nombre:"Jose Antonio",apellidos:"Garcia Alcantud",     dni:"53051968F", fecha_nac:null,       telefono:"619818917", email:"jagalcantud78@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:9,  numero:"LRM-0009", nombre:"Marta",       apellidos:"García Alcantud",     dni:"53257526Z", fecha_nac:null,       telefono:"619818917", email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:10, numero:"LRM-0010", nombre:"Ivan",        apellidos:"Garcia Bayona",       dni:"49357092N", fecha_nac:null,       telefono:"512512",        email:"ivangb2005@gmail.com",             estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:12, numero:"LRM-0012", nombre:"Vicente",     apellidos:"Gimeno Carot",        dni:"52656148V", fecha_nac:null,       telefono:"512512",        email:"vicentegimenocarot@gmail.com",     estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:13, numero:"LRM-0013", nombre:"Olivia",      apellidos:"Gimeno Martí",        dni:"44521943S", fecha_nac:null,       telefono:"669815161", email:"olivia.gimeno@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:15, numero:"LRM-0015", nombre:"Patricia",    apellidos:"Herrero Gil",         dni:"26757146G", fecha_nac:null,       telefono:"692645562", email:"hegilpa92@gmail.com",              estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:19, numero:"LRM-0019", nombre:"Manuel",      apellidos:"Martínez Navarro",    dni:"48435716Q", fecha_nac:null,       telefono:"512512",        email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:20, numero:"LRM-0020", nombre:"Óscar",       apellidos:"Martínez Romero",     dni:null,        fecha_nac:null,       telefono:"512512",        email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:21, numero:"LRM-0021", nombre:"Jose",        apellidos:"Mocholi Ferrer",      dni:"44888320W", fecha_nac:null,       telefono:"512512",        email:"aupa_levante@hotmail.com",         estado:"activo", tipo:"adulto",   cargo:"Tesorero"},
  {id:22, numero:"LRM-0022", nombre:"Marta",       apellidos:"Oliveros Romero",     dni:"48676900E", fecha_nac:null,       telefono:"635298719", email:"martaoli21@gmail.com",             estado:"activo", tipo:"adulto",   cargo:"Vocal"},
  {id:23, numero:"LRM-0023", nombre:"Antonella",   apellidos:"Palacios Arroyave",   dni:null,        fecha_nac:null,       telefono:"661701672", email:"arturopalaciosbuitrago@gmail.com", estado:"activo", tipo:"infantil", cargo:"Peñista"},
  {id:24, numero:"LRM-0024", nombre:"Arturo",      apellidos:"Palacios Buitrago",   dni:"70582608R", fecha_nac:null,       telefono:"661701672", email:"arturopalaciosbuitrago@gmail.com", estado:"activo", tipo:"adulto",   cargo:"Vicepresidente"},
  {id:25, numero:"LRM-0025", nombre:"Jose Ignacio",apellidos:"Pellicer Doñate",     dni:"48676454J", fecha_nac:null,       telefono:"722472204", email:"j.ignaciopellicer@gmail.com",      estado:"activo", tipo:"adulto",   cargo:"Presidente"},
  {id:27, numero:"LRM-0027", nombre:"Daniel",      apellidos:"Sempere Manuel",      dni:"73573354B", fecha_nac:null,       telefono:"645774034", email:"sempere.dani@icloud.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:28, numero:"LRM-0028", nombre:"Emma",        apellidos:"Torres Gimeno",       dni:null,        fecha_nac:null,       telefono:"512512",        email:"olivia.gimeno@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:29, numero:"LRM-0029", nombre:"Mateo",       apellidos:"Torres Gimeno",       dni:null,        fecha_nac:null,       telefono:"512512",        email:"olivia.gimeno@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:30, numero:"LRM-0030", nombre:"Sergio",      apellidos:"Torres González",     dni:"48441190Q", fecha_nac:null,       telefono:"512512",        email:"olivia.gimeno@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:31, numero:"LRM-0031", nombre:"Carlos",      apellidos:"Yago Granell",        dni:"49571469Y", fecha_nac:null,       telefono:"637808538", email:"carlosyagogranell@gmail.com",      estado:"activo", tipo:"adulto",   cargo:"Secretario"},
  {id:32, numero:"LRM-0032", nombre:"Andrea",      apellidos:"Mocholi Herrero",     dni:null,        fecha_nac:null,       telefono:"512512",        email:null,                               estado:"activo", tipo:"infantil", cargo:"Peñista"},
  {id:33, numero:"LRM-0033", nombre:"Olga",        apellidos:"Arroyave Jordan",     dni:"Z1607188E", fecha_nac:null,       telefono:"661701672", email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:34, numero:"LRM-0034", nombre:"Antonio",     apellidos:"Almenar Antón",       dni:"53751095A", fecha_nac:null,       telefono:"607697923", email:"aalmenar057@gmail.com",            estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:35, numero:"LRM-0035", nombre:"Francisco",   apellidos:"Alfonso Belenguer",   dni:"85026686X", fecha_nac:null,       telefono:"667946421", email:"es.j.alfbelen@gmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:36, numero:"LRM-0036", nombre:"Neus",        apellidos:"Pellicer Oliveros",   dni:null,        fecha_nac:null,       telefono:"512512",        email:null,                               estado:"activo", tipo:"infantil", cargo:"Peñista"},
  {id:37, numero:"LRM-0037", nombre:"Diego",       apellidos:"Mocholi Herrero",     dni:null,        fecha_nac:null,       telefono:"512512",        email:null,                               estado:"activo", tipo:"infantil", cargo:"Peñista"},
  {id:38, numero:"LRM-0038", nombre:"Mari Carmen", apellidos:"López Casares",       dni:"19875345X", fecha_nac:null,       telefono:"616519900", email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:39, numero:"LRM-0039", nombre:"Adrián",      apellidos:"Pérez Seguí",         dni:"21687528T", fecha_nac:null,       telefono:"665171998", email:"perezadriansegui1986@gmail.com",   estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:40, numero:"LRM-0040", nombre:"Alma",        apellidos:"Palacios Arroyave",   dni:null,        fecha_nac:null,       telefono:"661701672", email:null,                               estado:"activo", tipo:"infantil", cargo:"Peñista"},
  {id:41, numero:"LRM-0041", nombre:"Eduard",      apellidos:"Galindo",             dni:"19865992H", fecha_nac:null,       telefono:"628069013", email:"galindonaya@hotmail.com",          estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:42, numero:"LRM-0042", nombre:"Eduardo",     apellidos:"Hervás Lafuente",     dni:"18417667A", fecha_nac:null,       telefono:"635664315", email:null,                               estado:"activo", tipo:"adulto",   cargo:"Peñista"},
  {id:43, numero:"LRM-0043", nombre:"Luisa",       apellidos:"González Moya",       dni:"24322779A", fecha_nac:null,       telefono:"671090657", email:"luisagonmo@gmail.com",             estado:"activo", tipo:"adulto",   cargo:"Peñista"},
];

const fmtFecha = (f) => { if(!f) return "—"; const [y,m,d]=f.split("-"); return `${d}/${m}/${y}`; };

// ── LOGIN ────────────────────────────────────────────────
function Login({onLogin}){
  const [tel,setTel]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const buscar=()=>{
    const t=tel.replace(/\s/g,"").replace(/^(\+34|0034)/,"");
    if(t.length<9){setError("Introduce un teléfono válido de 9 dígitos");return;}
    setLoading(true); setError("");
    setTimeout(()=>{
      const found=CENSO.find(s=>s.telefono===t);
      setLoading(false);
      if(found) onLogin(found);
      else setError("No encontramos ningún peñista con ese teléfono. Contacta con la junta directiva.");
    },700);
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:130,height:130,borderRadius:"50%",border:"4px solid rgba(255,255,255,0.35)",objectFit:"cover",display:"block",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:22,fontWeight:700,marginBottom:6}}>Verifica tus datos</h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.5}}>Peña Levantinista La Rana Mecánica<br/>Temporada 2026/2027 · Rocafort-Godella</p>
        </div>

        <div style={{background:C.blanco,borderRadius:20,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>
            Accede con el teléfono registrado en la peña para ver y confirmar tus datos de esta temporada.
          </p>

          <label style={{fontSize:12,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tu teléfono</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{background:C.grisLight,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:15,color:C.gris,flexShrink:0}}>🇪🇸 +34</div>
            <input type="tel" value={tel} onChange={e=>{setTel(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&buscar()}
              placeholder="6XX XXX XXX" maxLength={12}
              style={{flex:1,padding:"12px 14px",borderRadius:10,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:18,fontWeight:600,letterSpacing:2,outline:"none",fontFamily:"monospace",color:C.text}}/>
          </div>

          {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo,display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}

          <button onClick={buscar} disabled={loading} style={{width:"100%",padding:13,background:loading?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {loading?"Buscando...":"Acceder a mis datos →"}
          </button>

          <p style={{marginTop:16,fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.5}}>
            Si no reconoces tu número o hay un error,<br/>contacta con la junta directiva.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── ACTUALIZAR TELÉFONO ───────────────────────────────────
function ActualizarTelefono({socio,onActualizado}){
  const [tel,setTel]=useState("");
  const [error,setError]=useState("");
  const [guardando,setGuardando]=useState(false);

  const guardar=()=>{
    const t=tel.replace(/\s/g,"").replace(/^(\+34|0034)/,"");
    if(t.length<9||!t.match(/^[6-9]\d{8}$/)){
      setError("Introduce un teléfono móvil español válido (9 dígitos)");return;
    }
    setGuardando(true);
    setTimeout(()=>{
      // En producción: UPDATE socios SET telefono=t WHERE id=socio.id + INSERT verificacion
      setGuardando(false);
      onActualizado({...socio, telefono:t});
    },800);
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:110,height:110,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",marginBottom:16,objectFit:"cover",display:"block",margin:"0 auto 16px"}}/>
          <h2 style={{color:C.blanco,fontSize:20,fontWeight:700,marginBottom:6}}>Hola, {socio.nombre} 👋</h2>
          <p style={{color:"rgba(255,255,255,0.65)",fontSize:14}}>Te hemos encontrado en el censo.</p>
        </div>

        <div style={{background:C.blanco,borderRadius:20,padding:"26px 22px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <div style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:10,padding:"12px 14px",marginBottom:20,fontSize:13,color:"#7a5c00",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:16}}>📱</span>
            <span>No tenemos tu teléfono real. Añádelo para poder identificarte directamente la próxima vez.</span>
          </div>

          <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tu teléfono móvil</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{background:C.grisLight,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:15,color:C.gris,flexShrink:0}}>🇪🇸 +34</div>
            <input type="tel" value={tel} onChange={e=>{setTel(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&guardar()}
              placeholder="6XX XXX XXX" maxLength={12} autoFocus
              style={{flex:1,padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:18,fontWeight:600,letterSpacing:2,outline:"none",fontFamily:"monospace",color:C.text,boxSizing:"border-box",width:"100%"}}/>
          </div>

          {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo,display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}

          <button onClick={guardar} disabled={guardando} style={{width:"100%",padding:13,background:guardando?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:guardando?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {guardando?"Guardando...":"💾 Guardar mi teléfono"}
          </button>

          <p style={{marginTop:14,fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.5}}>
            La junta aprobará el cambio. Mientras tanto ya puedes ver y verificar tus datos.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── MIS DATOS ─────────────────────────────────────────────
function MisDatos({socio,onLogout,onCorregir}){
  const [confirmado,setConfirmado]=useState(false);
  const vacios=[];
  if(!socio.dni) vacios.push("DNI / NIE");
  if(!socio.email) vacios.push("Email");
  if(!socio.fecha_nac) vacios.push("Fecha de nacimiento");

  if(confirmado) return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.blanco,borderRadius:20,padding:"36px 28px",maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>✅</div>
        <h2 style={{color:C.verde,fontSize:22,fontWeight:700,marginBottom:10}}>¡Datos confirmados!</h2>
        <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>Gracias <strong>{socio.nombre}</strong>. La junta ha recibido tu confirmación para la temporada 2026/2027.</p>
        <div style={{background:C.granateLight,borderRadius:10,padding:"12px",marginBottom:20,fontSize:14,color:C.granateDark,fontWeight:600}}>🐸 ¡Visca el Levante i la Rana Mecànica!</div>
        <button onClick={onLogout} style={{width:"100%",padding:11,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",fontWeight:600,color:C.gris,fontFamily:"inherit"}}>Cerrar sesión</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:C.granateDark,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO} alt="logo" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
          <div>
            <div style={{color:C.blanco,fontWeight:700,fontSize:14}}>La Rana Mecánica</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Temporada 2026/2027</div>
          </div>
        </div>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Salir</button>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px"}}>
        {/* Tarjeta socio */}
        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",borderTop:`4px solid ${C.granate}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <h2 style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:2}}>Hola, {socio.nombre} 👋</h2>
              <p style={{color:C.muted,fontSize:13}}>Revisa que tus datos son correctos</p>
            </div>
            <div style={{background:C.granateLight,borderRadius:10,padding:"8px 12px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.granate,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Nº Socio</div>
              <div style={{fontFamily:"monospace",fontWeight:800,color:C.granateDark,fontSize:14}}>{socio.numero}</div>
            </div>
          </div>
        </div>

        {/* Alerta datos vacíos */}
        {vacios.length>0&&(
          <div style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div>
              <div style={{fontWeight:600,color:C.oro,fontSize:13,marginBottom:2}}>Datos incompletos</div>
              <div style={{fontSize:13,color:"#7a5c00"}}>Faltan: <strong>{vacios.join(", ")}</strong>. Puedes añadirlos solicitando una corrección.</div>
            </div>
          </div>
        )}

        {/* Grid de datos */}
        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14}}>Tus datos en la peña</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["Nombre",socio.nombre],["Apellidos",socio.apellidos],
              ["DNI / NIE",socio.dni||"—"],["Fecha nac.",fmtFecha(socio.fecha_nac)],
              ["Teléfono",socio.telefono||"—"],["Email",socio.email||"—"],
              ["Tipo",socio.tipo],["Cargo",socio.cargo],
            ].map(([k,v])=>(
              <div key={k} style={{padding:"10px 12px",background:C.grisLight,borderRadius:10}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,fontWeight:600}}>{k}</div>
                <div style={{fontSize:14,fontWeight:600,color:v==="—"?C.muted:C.text,wordBreak:"break-word"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>setConfirmado(true)} style={{padding:15,background:C.verde,color:C.blanco,border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            ✅ Mis datos son correctos — Confirmar
          </button>
          <button onClick={onCorregir} style={{padding:13,background:C.blanco,color:C.granate,border:`2px solid ${C.granate}`,borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            ✏️ Hay algún dato incorrecto — Solicitar corrección
          </button>
        </div>

        <p style={{textAlign:"center",fontSize:12,color:C.muted,marginTop:14,lineHeight:1.5}}>
          Las correcciones serán revisadas por la junta antes de aplicarse.
        </p>
      </div>
    </div>
  );
}

// ── SOLICITAR CORRECCIÓN ──────────────────────────────────
function SolicitarCorreccion({socio,onVolver,onEnviado}){
  const [form,setForm]=useState({
    nombre:socio.nombre, apellidos:socio.apellidos,
    dni:socio.dni||"", fecha_nac:socio.fecha_nac||"",
    email:socio.email||"", comentarios:"",
  });
  const [enviando,setEnviando]=useState(false);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const enviar=()=>{
    setEnviando(true);
    setTimeout(()=>{ setEnviando(false); onEnviado(); },900);
  };

  const campo=(label,key,type="text",ph="")=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setF(key,e.target.value)} placeholder={ph}
        style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
      {form[key]!==(socio[key]||"")&&form[key]!==""&&(
        <div style={{fontSize:11,color:C.azul,marginTop:3}}>✏️ Antes: <em>{socio[key]||"(vacío)"}</em></div>
      )}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.granateDark,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onVolver} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Volver</button>
        <div style={{color:C.blanco,fontWeight:700,fontSize:14}}>Solicitar corrección</div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{background:"#e8f4fd",border:"1px solid #b3d4f0",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#1a5276",display:"flex",gap:8}}>
          <span>ℹ️</span><span>Modifica solo los campos incorrectos. La junta los revisará y aplicará los cambios.</span>
        </div>

        <div style={{background:C.blanco,borderRadius:16,padding:"22px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
            {campo("Nombre","nombre")}
            {campo("Apellidos","apellidos")}
            {campo("DNI / NIE","dni","text","12345678A")}
            {campo("Fecha de nacimiento","fecha_nac","date")}
          </div>
          {campo("Email","email","email","tu@email.com")}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Comentarios</label>
            <textarea value={form.comentarios} onChange={e=>setF("comentarios",e.target.value)} rows={3}
              placeholder="Qué datos son incorrectos y por qué..."
              style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <button onClick={enviar} disabled={enviando} style={{width:"100%",padding:13,background:enviando?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:enviando?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {enviando?"Enviando...":"📨 Enviar solicitud de corrección"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CORRECCIÓN ENVIADA ────────────────────────────────────
function Enviado({socio,onLogout}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.blanco,borderRadius:20,padding:"36px 28px",maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>📨</div>
        <h2 style={{color:C.azul,fontSize:22,fontWeight:700,marginBottom:10}}>¡Solicitud enviada!</h2>
        <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}><strong>{socio.nombre}</strong>, la junta directiva revisará tus correcciones y las aplicará en breve.</p>
        <button onClick={onLogout} style={{width:"100%",padding:11,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",fontWeight:600,color:C.gris,fontFamily:"inherit"}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────
export default function PortalVerificacion(){
  const [pantalla,setPantalla]=useState("login");
  const [socio,setSocio]=useState(null);
  const logout=()=>{setSocio(null);setPantalla("login");};

  const handleLogin=(s)=>{
    setSocio(s);
    // Si entró con el código temporal 512512, pedir teléfono real
    if(s.telefono==="512512") setPantalla("actualizar_tel");
    else setPantalla("datos");
  };

  const handleActualizado=(sActualizado)=>{
    setSocio(sActualizado);
    setPantalla("datos");
  };

  if(pantalla==="login")          return <Login onLogin={handleLogin}/>;
  if(pantalla==="actualizar_tel") return <ActualizarTelefono socio={socio} onActualizado={handleActualizado}/>;
  if(pantalla==="datos")          return <MisDatos socio={socio} onLogout={logout} onCorregir={()=>setPantalla("correccion")}/>;
  if(pantalla==="correccion")     return <SolicitarCorreccion socio={socio} onVolver={()=>setPantalla("datos")} onEnviado={()=>setPantalla("enviado")}/>;
  if(pantalla==="enviado")        return <Enviado socio={socio} onLogout={logout}/>;
}
