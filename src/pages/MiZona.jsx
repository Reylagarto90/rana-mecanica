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

// ── DATOS DEMO DEL PEÑISTA ────────────────────────────────
// En producción vienen de Supabase con RLS: SELECT * FROM socios WHERE telefono = $1
const SOCIO_DEMO = {
  id:24, numero:"LRM-0024", nombre:"Arturo", apellidos:"Palacios Buitrago",
  dni:"70582608R", fecha_nac:"1989-12-28", telefono:"661701672",
  email:"arturopalaciosbuitrago@gmail.com", municipio:"Godella",
  tipo:"adulto", cargo:"Vicepresidente", estado:"activo",
  rgpd:true, foto_aut:true, fecha_alta:"2025-09-01",
};

const CUOTAS_DEMO = [
  {id:1, temporada:"2025/2026", categoria:"nueva_alta",  importe:30, pagado:true,  fecha_pago:"2025-09-05", forma_pago:"Bizum"},
  {id:2, temporada:"2026/2027", categoria:"renovacion",  importe:25, pagado:false, fecha_pago:null,         forma_pago:null},
];

const ACTIVIDADES_DEMO = [
  {id:1, nombre:"Autocar Valencia vs Getafe",  fecha:"2026-06-07", tipo:"autocar", precio_socio:12, plazas:50, inscritos:38, inscrito:true,  pasada:false},
  {id:2, nombre:"Cena de Fin de Temporada",    fecha:"2026-06-14", tipo:"cena",    precio_socio:20, plazas:80, inscritos:67, inscrito:false, pasada:false},
  {id:3, nombre:"Autocar Valencia vs Betis",   fecha:"2026-05-25", tipo:"autocar", precio_socio:12, plazas:50, inscritos:50, inscrito:true,  pasada:true},
  {id:4, nombre:"Cena de Navidad",             fecha:"2025-12-20", tipo:"cena",    precio_socio:18, plazas:60, inscritos:56, inscrito:true,  pasada:true},
  {id:5, nombre:"Asamblea General",            fecha:"2026-06-21", tipo:"reunion", precio_socio:0,  plazas:200,inscritos:12, inscrito:false, pasada:false},
];

const LOTERIA_DEMO = [
  {id:1, sorteo:"Navidad 2025", unidades:2, precio_und:20, total:40, pagado:true,  fecha_pago:"2025-11-20"},
  {id:2, sorteo:"El Niño 2026", unidades:1, precio_und:20, total:20, pagado:false, fecha_pago:null},
];

const DOCS_DEMO = [
  {id:1, tipo:"rgpd",        nombre:"Consentimiento RGPD",       fecha:"2025-09-01", estado:"firmado"},
  {id:2, tipo:"alta",        nombre:"Solicitud de alta",          fecha:"2025-09-01", estado:"aprobada"},
  {id:3, tipo:"justificante",nombre:"Justificante cuota 2025/26", fecha:"2025-09-05", estado:"disponible"},
];

// ── CENSO CON VÍNCULOS TUTOR-INFANTIL ────────────────────
// tutor_id: ID del adulto responsable del menor
const CENSO_COMPLETO = [
  // ADULTOS
  {id:3,  numero:"LRM-0003", nombre:"Rafael",       apellidos:"Bernabéu Llorens",  telefono:"653211861", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:4,  numero:"LRM-0004", nombre:"Guillem",      apellidos:"Carrion Oliva",      telefono:"649652544", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:7,  numero:"LRM-0007", nombre:"José Ramón",   apellidos:"Esteban Mena",       telefono:"617331167", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:8,  numero:"LRM-0008", nombre:"Jose Antonio", apellidos:"Garcia Alcantud",    telefono:"619818917", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:9,  numero:"LRM-0009", nombre:"Marta",        apellidos:"García Alcantud",    telefono:"619818917", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:13, numero:"LRM-0013", nombre:"Olivia",       apellidos:"Gimeno Martí",       telefono:"669815161", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:15, numero:"LRM-0015", nombre:"Patricia",     apellidos:"Herrero Gil",        telefono:"692645562", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:22, numero:"LRM-0022", nombre:"Marta",        apellidos:"Oliveros Romero",    telefono:"635298719", tipo:"adulto",   cargo:"Vocal",         tutor_de:[]},
  // Arturo — tutor de Antonella (23) y Alma (40)
  {id:24, numero:"LRM-0024", nombre:"Arturo",       apellidos:"Palacios Buitrago",  telefono:"661701672", tipo:"adulto",   cargo:"Vicepresidente",tutor_de:[23,40]},
  {id:25, numero:"LRM-0025", nombre:"Jose Ignacio", apellidos:"Pellicer Doñate",    telefono:"722472204", tipo:"adulto",   cargo:"Presidente",    tutor_de:[36]}, // Neus vinculada manualmente
  {id:27, numero:"LRM-0027", nombre:"Daniel",       apellidos:"Sempere Manuel",     telefono:"645774034", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:31, numero:"LRM-0031", nombre:"Carlos",       apellidos:"Yago Granell",       telefono:"637808538", tipo:"adulto",   cargo:"Secretario",    tutor_de:[]},
  // Olga — tutora de Antonella (23) y Alma (40)
  {id:33, numero:"LRM-0033", nombre:"Olga",         apellidos:"Arroyave Jordan",    telefono:"661701672", tipo:"adulto",   cargo:"Peñista",       tutor_de:[23,40]},
  {id:34, numero:"LRM-0034", nombre:"Antonio",      apellidos:"Almenar Antón",      telefono:"607697923", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:35, numero:"LRM-0035", nombre:"Francisco",    apellidos:"Alfonso Belenguer",  telefono:"667946421", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:38, numero:"LRM-0038", nombre:"Mari Carmen",  apellidos:"López Casares",      telefono:"616519900", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:39, numero:"LRM-0039", nombre:"Adrián",       apellidos:"Pérez Seguí",        telefono:"665171998", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:41, numero:"LRM-0041", nombre:"Eduard",       apellidos:"Galindo",            telefono:"628069013", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:42, numero:"LRM-0042", nombre:"Eduardo",      apellidos:"Hervás Lafuente",    telefono:"635664315", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:43, numero:"LRM-0043", nombre:"Luisa",        apellidos:"González Moya",      telefono:"671090657", tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  // INFANTILES
  {id:23, numero:"LRM-0023", nombre:"Antonella",    apellidos:"Palacios Arroyave",  telefono:"661701672", tipo:"infantil", cargo:"Peñista",       tutor_de:[], tutor_id:24},
  {id:40, numero:"LRM-0040", nombre:"Alma",         apellidos:"Palacios Arroyave",  telefono:"661701672", tipo:"infantil", cargo:"Peñista",       tutor_de:[], tutor_id:24},
  {id:36, numero:"LRM-0036", nombre:"Neus",         apellidos:"Pellicer Oliveros",  telefono:"512512",    tipo:"infantil", cargo:"Peñista",       tutor_de:[], tutor_id:25}, // hija de Jose Ignacio Pellicer (id:25)
  {id:32, numero:"LRM-0032", nombre:"Andrea",       apellidos:"Mocholi Herrero",    telefono:"512512",    tipo:"infantil", cargo:"Peñista",       tutor_de:[], tutor_id:21}, // hija de Jose Mocholi Ferrer (id:21)
  {id:37, numero:"LRM-0037", nombre:"Diego",        apellidos:"Mocholi Herrero",    telefono:"512512",    tipo:"infantil", cargo:"Peñista",       tutor_de:[], tutor_id:21}, // hijo de Jose Mocholi Ferrer (id:21)
  // CÓDIGO TEMPORAL 512512
  {id:10, numero:"LRM-0010", nombre:"Ivan",         apellidos:"Garcia Bayona",      telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:12, numero:"LRM-0012", nombre:"Vicente",      apellidos:"Gimeno Carot",       telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:19, numero:"LRM-0019", nombre:"Manuel",       apellidos:"Martínez Navarro",   telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:20, numero:"LRM-0020", nombre:"Óscar",        apellidos:"Martínez Romero",    telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:21, numero:"LRM-0021", nombre:"Jose",         apellidos:"Mocholi Ferrer",     telefono:"512512",    tipo:"adulto",   cargo:"Tesorero",      tutor_de:[32,37]}, // padre de Andrea (32) y Diego (37) — actualizar tel. en Supabase
  {id:28, numero:"LRM-0028", nombre:"Emma",         apellidos:"Torres Gimeno",      telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:29, numero:"LRM-0029", nombre:"Mateo",        apellidos:"Torres Gimeno",      telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
  {id:30, numero:"LRM-0030", nombre:"Sergio",       apellidos:"Torres González",    telefono:"512512",    tipo:"adulto",   cargo:"Peñista",       tutor_de:[]},
];

const CENSO_ACCESO = CENSO_COMPLETO; // alias para compatibilidad

const fmtFecha=(f)=>{ if(!f) return "—"; const[y,m,d]=f.split("-"); return `${d}/${m}/${y}`; };
const fmt=(n)=>`${Number(n).toFixed(2).replace(".",",")}€`;

// ── COMPONENTES BASE ──────────────────────────────────────
function Pill({text,color,bg}){
  return <span style={{background:bg||"#eee",color:color||"#333",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{text}</span>;
}
function Card({children,style={},onClick}){
  return <div onClick={onClick} style={{background:C.blanco,borderRadius:14,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",cursor:onClick?"pointer":undefined,...style}}>{children}</div>;
}
function Modal({open,onClose,title,children}){
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <Card style={{width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h3 style={{fontSize:17,fontWeight:700,color:C.granateDark}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted}}>✕</button>
        </div>
        {children}
      </Card>
    </div>
  );
}

const TABS=[
  {id:"inicio",    label:"Inicio",      icon:"🏠"},
  {id:"cuotas",    label:"Mi cuota",    icon:"💶"},
  {id:"actividades",label:"Actividades",icon:"📅"},
  {id:"loteria",   label:"Lotería",     icon:"🎟️"},
  {id:"documentos",label:"Documentos",  icon:"📁"},
];

// ── SELECTOR DE PERFIL ───────────────────────────────────
function SelectorPerfil({perfiles,onSeleccionar,onVolver}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:90,height:90,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 14px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h2 style={{color:C.blanco,fontSize:20,fontWeight:700,marginBottom:6}}>¿Quién accede?</h2>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Hemos encontrado varios perfiles con este teléfono</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {perfiles.map(p=>(
            <button key={p.id} onClick={()=>onSeleccionar(p)} style={{background:C.blanco,border:"none",borderRadius:14,padding:"16px 18px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:14,textAlign:"left",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",transition:"transform 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <div style={{width:46,height:46,borderRadius:"50%",background:p.tipo==="infantil"?C.azul:C.granate,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,color:C.blanco}}>
                {p.tipo==="infantil"?"👶":p.nombre[0]+p.apellidos[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>{p.nombre} {p.apellidos}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                  {p.numero} · {p.tipo==="infantil"
                    ? "👶 Menor — acceso tutor/a"
                    : p.cargo}
                </div>
              </div>
              <span style={{color:C.muted,fontSize:18}}>›</span>
            </button>
          ))}
        </div>
        <button onClick={onVolver} style={{width:"100%",marginTop:14,padding:11,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,color:C.blanco,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
          ← Volver
        </button>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────
function Login({onLogin,onMultiple}){
  const [tel,setTel]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const buscar=()=>{
    const t=tel.replace(/\s/g,"").replace(/^(\+34|0034)/,"");
    if(t.length<6){setError("Introduce un teléfono válido");return;}
    setLoading(true); setError("");
    setTimeout(()=>{
      setLoading(false);
      // En producción: SELECT * FROM socios WHERE telefono=$1 (Supabase RLS)
      const encontrados=CENSO_COMPLETO.filter(s=>s.telefono===t);
      if(encontrados.length===0){
        setError("No hemos encontrado ningún peñista con ese teléfono. Contacta con la junta.");
        return;
      }
      // Separar adultos y menores
      const adultos=encontrados.filter(s=>s.tipo!=="infantil");
      const menores=encontrados.filter(s=>s.tipo==="infantil");
      // También añadir menores vinculados por tutor_de
      const tutorAdulto=adultos[0];
      const menoresTutor = tutorAdulto
        ? CENSO_COMPLETO.filter(s=>s.tipo==="infantil"&&s.tutor_id===tutorAdulto.id)
        : [];
      const todosMenores=[...new Map([...menores,...menoresTutor].map(s=>[s.id,s])).values()];
      // Si hay varios perfiles posibles → selector
      const perfiles=[...adultos,...todosMenores];
      if(perfiles.length>1){
        onMultiple(perfiles);
      } else if(perfiles.length===1){
        onLogin(SOCIO_DEMO); // demo; en prod: cargar datos completos del socio
      } else {
        setError("No hemos encontrado ningún peñista con ese teléfono. Contacta con la junta.");
      }
    },700);
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:120,height:120,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:22,fontWeight:700,marginBottom:6}}>Mi zona de peñista</h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.5}}>Peña Levantinista La Rana Mecánica<br/>Temporada 2026/2027</p>
        </div>

        <div style={{background:C.blanco,borderRadius:20,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>Accede con el teléfono registrado en la peña para ver tu ficha, cuotas, actividades y documentos.</p>

          <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tu teléfono</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{background:C.grisLight,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:15,color:C.gris,flexShrink:0}}>🇪🇸 +34</div>
            <input type="tel" value={tel} onChange={e=>{setTel(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&buscar()}
              placeholder="6XX XXX XXX" maxLength={12} autoFocus
              style={{flex:1,padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:18,fontWeight:600,letterSpacing:2,outline:"none",fontFamily:"monospace",color:C.text,boxSizing:"border-box",width:"100%"}}/>
          </div>
          {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo,display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}
          <button onClick={buscar} disabled={loading} style={{width:"100%",padding:13,background:loading?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {loading?"Buscando...":"Entrar a mi zona →"}
          </button>
          <p style={{marginTop:14,fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.5}}>
            ¿No recuerdas tu número? Contacta con la junta.<br/>Código temporal sin teléfono: <strong>512512</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── TAB: INICIO ───────────────────────────────────────────
function TabInicio({socio,cuotas,actividades,setTab,onSolicitarCambio}){
  const cuotaActual=cuotas.find(c=>c.temporada==="2026/2027");
  const actInscritas=actividades.filter(a=>a.inscrito&&!a.pasada).length;
  const proxima=actividades.filter(a=>!a.pasada).sort((a,b)=>a.fecha.localeCompare(b.fecha))[0];

  return(
    <div>
      {/* Tarjeta de bienvenida */}
      <Card style={{marginBottom:14,borderTop:`4px solid ${C.granate}`,background:`linear-gradient(135deg,${C.granateLight} 0%,${C.blanco} 100%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h2 style={{fontSize:21,fontWeight:700,color:C.granateDark,marginBottom:3}}>Hola, {socio.nombre} 👋</h2>
            <p style={{color:C.gris,fontSize:13,marginBottom:10}}>Temporada 2026/2027 · {socio.cargo}</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Pill text={`🆔 ${socio.numero}`} color={C.granateDark} bg={C.granateLight}/>
              <Pill text={socio.tipo==="infantil"?"👶 Infantil":"🏟️ "+socio.tipo.charAt(0).toUpperCase()+socio.tipo.slice(1)} color={C.azul} bg={C.azulLight}/>
              {socio.rgpd&&<Pill text="✅ RGPD" color={C.verde} bg={C.verdeLight}/>}
              {socio.tipo==="infantil"&&<Pill text="👨‍👩‍👧 Acceso tutor/a" color={C.gris} bg={C.grisLight}/>}
            </div>
          </div>
          <div style={{width:56,height:56,borderRadius:"50%",background:C.granate,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
            {socio.nombre[0]}{socio.apellidos[0]}
          </div>
        </div>
      </Card>

      {/* Alerta cuota pendiente */}
      {cuotaActual&&!cuotaActual.pagado&&(
        <div onClick={()=>setTab("cuotas")} style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"13px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"center",cursor:"pointer"}}>
          <span style={{fontSize:22}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.oro,fontSize:14}}>Tienes una cuota pendiente</div>
            <div style={{fontSize:12,color:"#7a5c00"}}>Cuota {cuotaActual.temporada} · {fmt(cuotaActual.importe)} pendiente de pago</div>
          </div>
          <span style={{color:C.oro,fontWeight:700}}>Ver →</span>
        </div>
      )}

      {/* Resumen en tarjetas */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {icon:"💶",label:"Cuota temporada",value:cuotaActual?(!cuotaActual.pagado?"Pendiente":"Al día"):"—",color:cuotaActual?.pagado?C.verde:C.oro,bg:cuotaActual?.pagado?C.verdeLight:C.oroLight,tab:"cuotas"},
          {icon:"📅",label:"Actividades apuntado",value:`${actInscritas} próximas`,color:C.azul,bg:C.azulLight,tab:"actividades"},
          {icon:"🎟️",label:"Lotería pendiente",value:fmt(LOTERIA_DEMO.filter(l=>!l.pagado).reduce((a,l)=>a+l.total,0)),color:C.granate,bg:C.granateLight,tab:"loteria"},
          {icon:"📁",label:"Documentos",value:`${DOCS_DEMO.length} archivos`,color:C.gris,bg:C.grisLight,tab:"documentos"},
        ].map(k=>(
          <Card key={k.tab} onClick={()=>setTab(k.tab)} style={{background:k.bg,cursor:"pointer",padding:"14px 16px"}}>
            <div style={{fontSize:22,marginBottom:4}}>{k.icon}</div>
            <div style={{fontSize:11,color:C.gris,marginBottom:2}}>{k.label}</div>
            <div style={{fontSize:15,fontWeight:700,color:k.color}}>{k.value}</div>
          </Card>
        ))}
      </div>

      {/* Próxima actividad */}
      {proxima&&(
        <Card style={{marginBottom:14,borderLeft:`4px solid ${C.azul}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Próxima actividad</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{proxima.nombre}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>📅 {fmtFecha(proxima.fecha)} · {proxima.precio_socio===0?"Gratis":fmt(proxima.precio_socio)}</div>
            </div>
            {proxima.inscrito
              ?<Pill text="✅ Apuntado" color={C.verde} bg={C.verdeLight}/>
              :<Pill text="⏳ Sin apuntar" color={C.oro} bg={C.oroLight}/>}
          </div>
        </Card>
      )}

      {/* Mis datos */}
      {socio.tipo==="infantil"&&(
        <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:12,padding:"11px 14px",marginBottom:12,fontSize:13,color:C.azul,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18}}>ℹ️</span>
          <span>Este panel pertenece a <strong>{socio.nombre}</strong> (menor de edad). Estás accediendo como su tutor/a.</span>
        </div>
      )}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5}}>{socio.tipo==="infantil"?"Datos del menor":"Mis datos"}</div>
          <button onClick={onSolicitarCambio} style={{padding:"6px 12px",background:C.granateLight,color:C.granate,border:`1px solid ${C.granate}30`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>✏️ Solicitar cambio</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Nombre",`${socio.nombre} ${socio.apellidos}`],["DNI",socio.dni||"—"],["Teléfono",socio.telefono],["Email",socio.email||"—"],["Municipio",socio.municipio||"—"],["Alta",fmtFecha(socio.fecha_alta)]].map(([k,v])=>(
            <div key={k} style={{padding:"9px 11px",background:C.grisLight,borderRadius:9}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>{k}</div>
              <div style={{fontSize:13,fontWeight:600,color:v==="—"?C.muted:C.text,wordBreak:"break-word"}}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── TAB: CUOTAS ───────────────────────────────────────────
function TabCuotas({cuotas}){
  const total=cuotas.reduce((a,c)=>a+c.importe,0);
  const cobrado=cuotas.filter(c=>c.pagado).reduce((a,c)=>a+c.importe,0);

  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>💶 Mis cuotas</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{background:C.verdeLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.verde,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pagado</div>
          <div style={{fontSize:24,fontWeight:800,color:C.verde}}>{fmt(cobrado)}</div>
        </Card>
        <Card style={{background:C.oroLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.oro,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pendiente</div>
          <div style={{fontSize:24,fontWeight:800,color:C.oro}}>{fmt(total-cobrado)}</div>
        </Card>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {cuotas.map(c=>(
          <Card key={c.id} style={{borderLeft:`4px solid ${c.pagado?C.verde:C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>Temporada {c.temporada}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2,textTransform:"capitalize"}}>{c.categoria?.replace("_"," ")}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,fontWeight:800,color:c.pagado?C.verde:C.oro}}>{fmt(c.importe)}</div>
                <Pill text={c.pagado?"✅ Pagada":"⏳ Pendiente"} color={c.pagado?C.verde:C.oro} bg={c.pagado?C.verdeLight:C.oroLight}/>
              </div>
            </div>
            {c.pagado?(
              <div style={{display:"flex",gap:16,fontSize:12,color:C.gris,background:C.grisLight,borderRadius:8,padding:"8px 12px"}}>
                <span>📅 Pagado: {fmtFecha(c.fecha_pago)}</span>
                <span>💳 {c.forma_pago}</span>
              </div>
            ):(
              <div style={{background:C.oroLight,borderRadius:8,padding:"10px 12px",fontSize:13,color:"#7a5c00"}}>
                💡 Para pagar tu cuota contacta con la junta directiva o entrega el importe en la próxima reunión.
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── TAB: ACTIVIDADES ──────────────────────────────────────
function TabActividades({actividades,setActividades}){
  const [modalAct,setModalAct]=useState(null);
  const [notif,setNotif]=useState(null);
  const proximas=actividades.filter(a=>!a.pasada);
  const pasadas=actividades.filter(a=>a.pasada&&a.inscrito);

  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const apuntarse=(id)=>{
    setActividades(p=>p.map(a=>a.id===id?{...a,inscrito:true,inscritos:a.inscritos+1}:a));
    setModalAct(null);
    ok("✅ Te has apuntado correctamente. La junta confirmará tu plaza.");
  };

  const desapuntarse=(id)=>{
    setActividades(p=>p.map(a=>a.id===id?{...a,inscrito:false,inscritos:a.inscritos-1}:a));
    ok("Has cancelado tu inscripción.");
  };

  const tipoIcon={autocar:"🚌",cena:"🍽️",excursion:"🏔️",reunion:"📋",sorteo:"🎰"};

  return(
    <div>
      {notif&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{notif}</div>}

      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>📅 Actividades</h2>

      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Próximas ({proximas.length})</h3>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
        {proximas.map(a=>{
          const lleno=a.inscritos>=a.plazas;
          return(
            <Card key={a.id} style={{borderTop:`3px solid ${a.inscrito?C.verde:C.border}`}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:24,flexShrink:0}}>{tipoIcon[a.tipo]||"📌"}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.text,paddingRight:8}}>{a.nombre}</div>
                    <Pill text={a.inscrito?"✅ Apuntado":lleno?"🔴 Completo":"Plaza libre"} color={a.inscrito?C.verde:lleno?C.rojo:C.azul} bg={a.inscrito?C.verdeLight:lleno?C.rojoLight:C.azulLight}/>
                  </div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📅 {fmtFecha(a.fecha)} · {a.precio_socio===0?"Gratis":fmt(a.precio_socio)}/persona · {a.inscritos}/{a.plazas} plazas</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setModalAct(a)} style={{padding:"7px 14px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.text}}>Ver detalles</button>
                    {!a.inscrito&&!lleno&&(
                      <button onClick={()=>apuntarse(a.id)} style={{padding:"7px 14px",background:C.granate,border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",color:C.blanco}}>Apuntarme</button>
                    )}
                    {a.inscrito&&(
                      <button onClick={()=>desapuntarse(a.id)} style={{padding:"7px 14px",background:C.blanco,border:`1px solid ${C.rojo}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.rojo}}>Cancelar</button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {pasadas.length>0&&(
        <>
          <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Mis actividades pasadas ({pasadas.length})</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {pasadas.map(a=>(
              <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:C.grisLight,borderRadius:12}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:C.text}}>{tipoIcon[a.tipo]||"📌"} {a.nombre}</div>
                  <div style={{fontSize:11,color:C.muted}}>{fmtFecha(a.fecha)}</div>
                </div>
                <Pill text="✅ Asistí" color={C.verde} bg={C.verdeLight}/>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={!!modalAct} onClose={()=>setModalAct(null)} title={modalAct?.nombre||""}>
        {modalAct&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[["Fecha",fmtFecha(modalAct.fecha)],["Tipo",modalAct.tipo],["Precio",modalAct.precio_socio===0?"Gratis":fmt(modalAct.precio_socio)],["Plazas",`${modalAct.inscritos}/${modalAct.plazas}`]].map(([k,v])=>(
                <div key={k} style={{padding:"9px 12px",background:C.grisLight,borderRadius:9}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                  <div style={{fontSize:14,fontWeight:600,textTransform:"capitalize"}}>{v}</div>
                </div>
              ))}
            </div>
            {!modalAct.inscrito&&modalAct.inscritos<modalAct.plazas&&(
              <button onClick={()=>apuntarse(modalAct.id)} style={{width:"100%",padding:13,background:C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
                ✅ Apuntarme a esta actividad
              </button>
            )}
            {modalAct.inscrito&&(
              <div style={{padding:"12px 16px",background:C.verdeLight,borderRadius:10,fontSize:14,color:C.verde,fontWeight:600,textAlign:"center"}}>
                ✅ Ya estás apuntado/a a esta actividad
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── TAB: LOTERÍA ──────────────────────────────────────────
function TabLoteria({loteria}){
  const totalPend=loteria.filter(l=>!l.pagado).reduce((a,l)=>a+l.total,0);
  const totalPag=loteria.filter(l=>l.pagado).reduce((a,l)=>a+l.total,0);

  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>🎟️ Mi lotería</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{background:C.verdeLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.verde,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pagado</div>
          <div style={{fontSize:24,fontWeight:800,color:C.verde}}>{fmt(totalPag)}</div>
        </Card>
        <Card style={{background:C.oroLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.oro,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pendiente</div>
          <div style={{fontSize:24,fontWeight:800,color:C.oro}}>{fmt(totalPend)}</div>
        </Card>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {loteria.map(l=>(
          <Card key={l.id} style={{borderLeft:`4px solid ${l.pagado?C.verde:C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>🎟️ {l.sorteo}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{l.unidades} décimo{l.unidades>1?"s":""} × {fmt(l.precio_und)}/ud</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,fontWeight:800,color:l.pagado?C.verde:C.oro}}>{fmt(l.total)}</div>
                <Pill text={l.pagado?"✅ Pagado":"⏳ Pendiente"} color={l.pagado?C.verde:C.oro} bg={l.pagado?C.verdeLight:C.oroLight}/>
              </div>
            </div>
            {l.pagado?(
              <div style={{fontSize:12,color:C.gris,background:C.grisLight,borderRadius:8,padding:"8px 12px"}}>
                📅 Pagado el {fmtFecha(l.fecha_pago)}
              </div>
            ):(
              <div style={{background:C.oroLight,borderRadius:8,padding:"10px 12px",fontSize:13,color:"#7a5c00"}}>
                💡 Entrega el importe en la próxima reunión de la peña o por Bizum a la junta.
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── TAB: DOCUMENTOS ───────────────────────────────────────
function TabDocumentos({socio,docs}){
  const tipoInfo={
    rgpd:        {label:"RGPD",             icon:"📋",color:C.azul,   bg:C.azulLight},
    alta:        {label:"Solicitud alta",   icon:"✍️",color:C.verde,  bg:C.verdeLight},
    justificante:{label:"Justificante pago",icon:"💶",color:C.oro,    bg:C.oroLight},
    foto:        {label:"Autorización foto",icon:"📸",color:C.granate,bg:C.granateLight},
  };

  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>📁 Mis documentos</h2>

      {/* Estado RGPD */}
      <Card style={{marginBottom:16,borderLeft:`4px solid ${socio.rgpd?C.verde:C.rojo}`}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <span style={{fontSize:28}}>{socio.rgpd?"✅":"❌"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.text}}>Consentimiento RGPD</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              {socio.rgpd?"Firmado correctamente · Tus datos están protegidos":"Pendiente de firma · Contacta con la junta"}
            </div>
          </div>
        </div>
      </Card>

      {/* Autorización foto */}
      <Card style={{marginBottom:16,borderLeft:`4px solid ${socio.foto_aut?C.verde:C.gris}`}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <span style={{fontSize:28}}>{socio.foto_aut?"📸":"📵"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.text}}>Autorización de fotografías</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              {socio.foto_aut?"Autorizado · Puedes aparecer en fotos de la peña":"No autorizado · No aparecerás en publicaciones"}
            </div>
          </div>
        </div>
      </Card>

      {/* Listado documentos */}
      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Documentos disponibles</h3>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {docs.map(d=>{
          const ti=tipoInfo[d.tipo]||{label:d.tipo,icon:"📄",color:C.gris,bg:C.grisLight};
          return(
            <Card key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:10,background:ti.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ti.icon}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:14,color:C.text}}>{d.nombre}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtFecha(d.fecha)} · <Pill text={d.estado} color={ti.color} bg={ti.bg}/></div>
                </div>
              </div>
              <button style={{padding:"7px 14px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.gris,flexShrink:0}}>
                Ver
              </button>
            </Card>
          );
        })}
      </div>

      <div style={{marginTop:16,padding:"12px 16px",background:C.azulLight,borderRadius:12,fontSize:13,color:C.azul,lineHeight:1.5}}>
        ℹ️ Para solicitar un documento adicional o corregir alguno, contacta con la junta directiva.
      </div>
    </div>
  );
}

// ── MODAL SOLICITAR CAMBIO ────────────────────────────────
function ModalCambio({open,onClose,socio}){
  const [campo,setCampo]=useState("telefono");
  const [valor,setValor]=useState("");
  const [comentario,setComentario]=useState("");
  const [enviado,setEnviado]=useState(false);

  const enviar=()=>{
    if(!valor) return;
    // En producción: INSERT INTO verificaciones (socio_id, campo, valor_nuevo, comentario)
    setEnviado(true);
  };

  const camposEditables=[
    {key:"nombre",label:"Nombre"},
    {key:"apellidos",label:"Apellidos"},
    {key:"dni",label:"DNI / NIE"},
    {key:"fecha_nac",label:"Fecha de nacimiento"},
    {key:"telefono",label:"Teléfono"},
    {key:"email",label:"Email"},
    {key:"municipio",label:"Municipio"},
  ];

  if(!open) return null;

  return(
    <Modal open={open} onClose={()=>{onClose();setEnviado(false);setValor("");setComentario("");}}>
      {enviado?(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>📨</div>
          <h3 style={{color:C.azul,fontSize:18,fontWeight:700,marginBottom:8}}>Solicitud enviada</h3>
          <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>La junta revisará tu solicitud de cambio y lo actualizará en breve.</p>
          <button onClick={()=>{onClose();setEnviado(false);setValor("");setComentario("");}} style={{padding:"10px 24px",background:C.granate,color:C.blanco,border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>Cerrar</button>
        </div>
      ):(
        <div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>¿Qué dato quieres cambiar?</label>
            <select value={campo} onChange={e=>setCampo(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit"}}>
              {camposEditables.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Nuevo valor</label>
            <input value={valor} onChange={e=>setValor(e.target.value)} placeholder={`Nuevo ${camposEditables.find(c=>c.key===campo)?.label||"valor"}`}
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Comentario (opcional)</label>
            <textarea value={comentario} onChange={e=>setComentario(e.target.value)} rows={3} placeholder="Explica brevemente el motivo del cambio..."
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:11,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontWeight:600,color:C.gris,fontFamily:"inherit"}}>Cancelar</button>
            <button onClick={enviar} style={{flex:1,padding:11,background:C.granate,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:C.blanco,fontFamily:"inherit",fontSize:15}}>Enviar solicitud</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────
export default function PanelPenista(){
  const [socio,setSocio]=useState(null);
  const [tab,setTab]=useState("inicio");
  const [cuotas,setCuotas]=useState(CUOTAS_DEMO);
  const [actividades,setActividades]=useState(ACTIVIDADES_DEMO);
  const [modalCambio,setModalCambio]=useState(false);
  const [perfilesDisponibles,setPerfilesDisponibles]=useState(null); // para selector
  const [perfilesSession,setPerfilesSession]=useState([]); // todos los perfiles del tel.

  const logout=()=>{setSocio(null);setTab("inicio");setPerfilesDisponibles(null);setPerfilesSession([]);};

  const handleMultiple=(perfiles)=>{
    setPerfilesSession(perfiles);
    setPerfilesDisponibles(perfiles);
  };

  const handleSeleccionar=(perfil)=>{
    setPerfilesDisponibles(null);
    setSocio(perfil); // en prod: cargar datos completos del perfil desde Supabase
    setTab("inicio");
  };

  // Perfiles disponibles para cambiar (el propio + tutelados)
  const otrosPerfiles=perfilesSession.filter(p=>p.id!==socio?.id);

  if(!socio&&!perfilesDisponibles) return <Login onLogin={s=>{setSocio(s);setPerfilesSession([s]);}} onMultiple={handleMultiple}/>;
  if(perfilesDisponibles) return <SelectorPerfil perfiles={perfilesDisponibles} onSeleccionar={handleSeleccionar} onVolver={()=>{setPerfilesDisponibles(null);}}/>;

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* HEADER */}
      <div style={{background:C.granateDark,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO} alt="logo" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.3)"}}/>
          <div>
            <div style={{color:C.blanco,fontWeight:700,fontSize:13,lineHeight:1.2}}>La Rana Mecánica</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>{socio.nombre} · {socio.numero}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {otrosPerfiles.length>0&&(
            <button onClick={()=>setPerfilesDisponibles(perfilesSession)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",color:C.blanco,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
              👥 Cambiar perfil
            </button>
          )}
          <button onClick={logout} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Salir</button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{flex:1,maxWidth:560,width:"100%",margin:"0 auto",padding:"16px 14px 90px"}}>
        {tab==="inicio"     &&<TabInicio      socio={socio} cuotas={cuotas} actividades={actividades} setTab={setTab} onSolicitarCambio={()=>setModalCambio(true)}/>}
        {tab==="cuotas"     &&<TabCuotas      cuotas={cuotas}/>}
        {tab==="actividades"&&<TabActividades actividades={actividades} setActividades={setActividades}/>}
        {tab==="loteria"    &&<TabLoteria     loteria={LOTERIA_DEMO}/>}
        {tab==="documentos" &&<TabDocumentos  socio={socio} docs={DOCS_DEMO}/>}
      </div>

      {/* BARRA INFERIOR DE NAVEGACIÓN (estilo app móvil) */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.blanco,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100,boxShadow:"0 -4px 16px rgba(0,0,0,0.08)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"inherit"}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:tab===t.id?700:400,color:tab===t.id?C.granate:C.muted}}>{t.label}</span>
            {tab===t.id&&<div style={{width:20,height:2,background:C.granate,borderRadius:2}}/>}
          </button>
        ))}
      </div>

      {/* MODAL SOLICITAR CAMBIO */}
      <ModalCambio open={modalCambio} onClose={()=>setModalCambio(false)} socio={socio}/>
    </div>
  );
}
