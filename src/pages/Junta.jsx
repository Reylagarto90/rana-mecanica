import { useState, useEffect, useMemo, Fragment } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabase.js";

// ── PALETA ────────────────────────────────────────────────
const C = {
  granate:"#C0185A", granateDark:"#8B0A3A", granateLight:"#fceef5",
  azul:"#003DA5", azulLight:"#e8eef9",
  verde:"#1a7a3c", verdeLight:"#e8f5ee",
  oro:"#C9963A", oroLight:"#fdf6e8",
  rojo:"#c0392b", rojoLight:"#fdecea",
  gris:"#64748b", grisLight:"#f8fafc",
  border:"#e2e8f0", text:"#1e293b", muted:"#94a3b8",
  blanco:"#fff", crema:"#FFF8F0",
};

const LOGO = "/rana-mecanica/logo.jpg";
const TEMPORADA_ACTUAL = "2026/2027";
const TEMPORADA_ANTERIOR = "2025/2026";
const hoy = new Date().toISOString().split("T")[0];

// ── EmailJS (mismo servicio usado en Verificar.jsx / Alta.jsx) ──────
const EMAILJS_SERVICE_ID  = "service_g9n6e5c";
const EMAILJS_TEMPLATE_ID = "template_0rjj2y8";
const EMAILJS_PUBLIC_KEY  = "IvxWWpgwA15GDRGyF";

// Compartir por WhatsApp — enlace estándar wa.me, sin API ni cuenta especial
const compartirWhatsApp = (texto) => {
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
};

const BotonWhatsApp = ({texto, style}) => (
  <button onClick={()=>compartirWhatsApp(texto)} style={{padding:"7px 12px",background:"#25D366",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,...style}}>
    📤 WhatsApp
  </button>
);

const enviarEmailJS = async (destinatario, asunto, mensaje) => {
  try{
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID, template_id: EMAILJS_TEMPLATE_ID, user_id: EMAILJS_PUBLIC_KEY,
        template_params: { to_email: destinatario, subject: asunto, message: mensaje, name: "La Rana Mecánica", reply_to: "penyaranamecanica@gmail.com" },
      }),
    });
    if(!res.ok){ const txt = await res.text(); console.error("EmailJS error:", res.status, txt); return false; }
    return true;
  }catch(e){ console.error("Error enviando email:", e); return false; }
};

// Edad calculada a partir de fecha_nac; si no hay fecha, se asume adulto si tipo==="adulto"
const calcularEdad = (fechaNac) => {
  if(!fechaNac) return null;
  const nac = new Date(fechaNac);
  const ahora = new Date();
  let edad = ahora.getFullYear() - nac.getFullYear();
  const m = ahora.getMonth() - nac.getMonth();
  if(m < 0 || (m === 0 && ahora.getDate() < nac.getDate())) edad--;
  return edad;
};

// Tarifa automática por socio: honorífico si consta como tal, si no según edad
const tarifaParaSocio=(s)=>{
  if((s.cargo||"").toLowerCase().includes("honor")) return "honorifico";
  const edad=calcularEdad(s.fecha_nac);
  if(edad!=null){
    if(edad<=3) return "infantil_0_3";
    if(edad<18) return "infantil_mayor";
    return "renovacion";
  }
  return s.tipo==="infantil" ? "infantil_mayor" : "renovacion";
};
// Tarifas cuyo importe es 0€: nunca cuentan como "moroso" aunque no tengan cuota pagada
const TARIFAS_GRATIS=["infantil_0_3","honorifico"];

// Socios activos, con email, de 14 años o más (o adultos sin fecha de nacimiento registrada)
// Destinatarios de comunicaciones masivas: activos, con email, con el consentimiento
// de "Comunicaciones promocionales peña" otorgado, y de 14 años o más
const destinatariosMayores14 = (socios) => socios.filter(s=>{
  if(s.estado!=="activo" || !s.email) return false;
  if(!s.consent_promo_pena) return false; // sin este consentimiento, no se le envía nada masivo
  const edad = calcularEdad(s.fecha_nac);
  if(edad!=null) return edad>=14;
  return s.tipo==="adulto"; // sin fecha de nacimiento: solo se envía si consta como adulto
});

// Envía a una lista de socios con una pequeña pausa entre envíos (evita saturar EmailJS)
const enviarEmailMasivo = async (socios, asunto, mensajeFn) => {
  let enviados=0;
  for(const s of socios){
    const ok = await enviarEmailJS(s.email, asunto, mensajeFn(s));
    if(ok) enviados++;
    await new Promise(r=>setTimeout(r,300));
  }
  return enviados;
};

const fmt = (n) => `${Number(n||0).toFixed(2).replace(".",",")}€`;
const fmtFecha = (f) => { if(!f) return "—"; const d=f.split("T")[0].split("-"); return `${d[2]}/${d[1]}/${d[0]}`; };
const edad = (fn) => { if(!fn) return "—"; const b=new Date(fn); const h=new Date(); let a=h.getFullYear()-b.getFullYear(); if(h<new Date(h.getFullYear(),b.getMonth(),b.getDate())) a--; return a; };
const nextId = (arr) => Math.max(0,...(arr||[]).map(x=>x.id))+1;

// ── COMPONENTES BASE ──────────────────────────────────────
function Card({children,style={},onClick}){ return <div onClick={onClick} style={{background:C.blanco,borderRadius:14,padding:20,boxShadow:"0 2px 14px rgba(0,0,0,0.07)",cursor:onClick?"pointer":undefined,...style}}>{children}</div>; }
function Pill({text,color=C.gris,bg}){ return <span style={{background:bg||(color+"18"),color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{text}</span>; }
function Btn({children,onClick,color=C.granate,outline,small,style={}}){ return <button onClick={onClick} style={{padding:small?"6px 12px":"9px 18px",background:outline?"transparent":color,color:outline?color:C.blanco,border:`2px solid ${color}`,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:small?12:14,fontFamily:"inherit",...style}}>{children}</button>; }
function Input({label,value,onChange,type="text",placeholder="",required,error,style={}}){
  return(<div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.rojo}}> *</span>}</label>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...style}}/>
    {error&&<span style={{fontSize:11,color:C.rojo}}>{error}</span>}
  </div>);
}
function Select({label,value,onChange,options,required}){
  return(<div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.rojo}}> *</span>}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",background:C.blanco}}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>);
}
// ── SELECTOR DE DESTINATARIOS DE EMAIL ────────────────────────
// Reutilizado en Noticias, Actas y Actividades: casilla general para
// activar el envío + lista de personas para marcar/desmarcar a mano.
function SelectorEmail({socios, habilitado, setHabilitado, seleccion, setSeleccion}){
  const destinatarios = destinatariosMayores14(socios);
  const [busqueda,setBusqueda]=useState("");

  useEffect(()=>{
    // Al activarse por primera vez, seleccionar a todos por defecto
    if(habilitado && seleccion.size===0 && destinatarios.length>0){
      setSeleccion(new Set(destinatarios.map(s=>s.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[habilitado]);

  const todosMarcados = destinatarios.length>0 && destinatarios.every(s=>seleccion.has(s.id));
  const toggleTodos = () => setSeleccion(todosMarcados ? new Set() : new Set(destinatarios.map(s=>s.id)));
  const toggleUno = (id) => setSeleccion(prev=>{
    const next=new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtrados = destinatarios.filter(s=>`${s.nombre} ${s.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()));

  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer",padding:"10px 12px",borderRadius:8,background:habilitado?C.verdeLight:C.grisLight}}>
        <input type="checkbox" checked={habilitado} onChange={e=>setHabilitado(e.target.checked)} style={{accentColor:C.verde}}/>
        Enviar por email ({destinatarios.length} peñistas cumplen los requisitos: 14+ años, con consentimiento)
      </label>
      {habilitado&&(
        <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,marginTop:8,padding:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8}}>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="🔍 Buscar..."
              style={{flex:1,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={toggleTodos} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"}}>
              {todosMarcados?"Ninguno":"Todos"}
            </button>
          </div>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{seleccion.size} de {destinatarios.length} seleccionados</div>
          <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
            {filtrados.map(s=>(
              <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",fontSize:13,cursor:"pointer",borderRadius:6}}>
                <input type="checkbox" checked={seleccion.has(s.id)} onChange={()=>toggleUno(s.id)} style={{accentColor:C.verde}}/>
                {s.nombre} {s.apellidos} <span style={{color:C.muted,fontSize:11}}>({s.numero})</span>
              </label>
            ))}
            {filtrados.length===0&&<p style={{fontSize:12,color:C.muted,padding:6}}>Sin resultados.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({label,value,sub,color=C.granate,icon}){
  return(<Card style={{borderLeft:`5px solid ${color}`,flex:1,minWidth:140,padding:"18px 20px"}}>
    {icon&&<div style={{fontSize:18,marginBottom:4}}>{icon}</div>}
    <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color,fontFamily:"serif"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{sub}</div>}
  </Card>);
}
function Modal({open,onClose,title,children,width=500}){
  if(!open) return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <Card style={{width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:18,fontWeight:700,color:C.granateDark}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted}}>✕</button>
      </div>
      {children}
    </Card>
  </div>);
}
function TH({children}){ return <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,background:C.grisLight}}>{children}</th>; }
function TD({children,style={}}){ return <td style={{padding:"11px 14px",fontSize:13,color:C.text,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>; }

const TABS = [
  {id:"dashboard",    label:"Panel",         icon:"🏠"},
  {id:"peñistas",     label:"Peñistas",      icon:"👥"},
  {id:"cuentas",      label:"Cuentas",       icon:"🔐"},
  {id:"consentimientos",label:"Consentim.",  icon:"📋"},
  {id:"solicitudes",  label:"Solicitudes",   icon:"📥"},
  {id:"verificaciones",label:"Verificaciones",icon:"✏️"},
  {id:"cuotas",       label:"Cuotas",        icon:"💶"},
  {id:"loteria",      label:"Lotería",       icon:"🎟️"},
  {id:"actividades",  label:"Actividades",   icon:"📅"},
  {id:"noticias",     label:"Noticias",      icon:"📢"},
  {id:"actas",        label:"Actas",         icon:"📜"},
  {id:"auditoria",    label:"Auditoría",     icon:"🔍"},
  {id:"tesoreria",    label:"Tesorería",     icon:"📒"},
  {id:"informes",     label:"Informes",      icon:"📊"},
  {id:"configuracion",label:"Config.",       icon:"⚙️"},
];

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════
function Dashboard({socios,cuotas,actividades,solicitudes,verificaciones,setTab}){
  const activos = socios.filter(s=>s.estado==="activo");
  const cobradas = cuotas.filter(c=>c.pagado).reduce((a,c)=>a+Number(c.importe),0);
  const pendiente = cuotas.filter(c=>!c.pagado).reduce((a,c)=>a+Number(c.importe),0);
  const solPend = solicitudes.filter(s=>s.estado==="pendiente");
  const verPend = verificaciones.filter(v=>v.estado==="pendiente");
  // "Al corriente" = tiene una cuota de esta temporada marcada como pagada.
  // Cualquier otro activo (sin cuota creada, o con cuota impagada) cuenta como pendiente/moroso.
  const morosos = activos.filter(s=>!TARIFAS_GRATIS.includes(tarifaParaSocio(s)) && !cuotas.some(c=>c.socio_id===s.id&&c.temporada===TEMPORADA_ACTUAL&&c.pagado));
  const municipios = {};
  activos.forEach(s=>{ if(s.municipio) municipios[s.municipio]=(municipios[s.municipio]||0)+1; });

  // Desglose por franja de edad (calculada desde fecha_nac; sin fecha, se usa tipo como aproximación)
  const bucketEdad = (s) => {
    const edad = calcularEdad(s.fecha_nac);
    if(edad!=null){
      if(edad<=3) return "bebe";
      if(edad<18) return "nino";
      return "adulto";
    }
    return s.tipo==="infantil" ? "nino" : "adulto";
  };
  const nAdultos = activos.filter(s=>bucketEdad(s)==="adulto").length;
  const nNinos   = activos.filter(s=>bucketEdad(s)==="nino").length;
  const nBebes   = activos.filter(s=>bucketEdad(s)==="bebe").length;

  return(<div>
    <div style={{marginBottom:24}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.granateDark}}>🐸 Panel de la Junta Directiva</h2>
      <p style={{color:C.muted,fontSize:14,marginTop:4}}>Peña La Rana Mecánica · {TEMPORADA_ACTUAL}</p>
    </div>

    {/* Alertas */}
    {(solPend.length>0||verPend.length>0)&&(
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        {solPend.length>0&&<div onClick={()=>setTab("solicitudes")} style={{flex:1,minWidth:200,background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:22}}>📥</span>
          <div><div style={{fontWeight:700,color:C.oro,fontSize:13}}>{solPend.length} solicitud{solPend.length>1?"es":""} de alta pendiente{solPend.length>1?"s":""}</div>
          <div style={{fontSize:11,color:C.muted}}>Clic para gestionar</div></div>
        </div>}
        {verPend.length>0&&<div onClick={()=>setTab("verificaciones")} style={{flex:1,minWidth:200,background:C.azulLight,border:`1px solid ${C.azul}50`,borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:22}}>✏️</span>
          <div><div style={{fontWeight:700,color:C.azul,fontSize:13}}>{verPend.length} corrección{verPend.length>1?"es":""} pendiente{verPend.length>1?"s":""}</div>
          <div style={{fontSize:11,color:C.muted}}>Clic para revisar</div></div>
        </div>}
      </div>
    )}

    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:22}}>
      <KPI label="Peñistas activos" value={activos.length} icon="👥" color={C.granate} sub={`${nAdultos} adultos · ${nNinos} niños · ${nBebes} bebés`}/>
      <KPI label="Cuotas cobradas" value={fmt(cobradas)} icon="✅" color={C.verde}/>
      <KPI label="Pendiente cobrar" value={fmt(pendiente)} icon="⏳" color={C.oro}/>
      <KPI label="Actividades" value={actividades.length} icon="📅" color={C.azul}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <h3 style={{fontSize:15,fontWeight:700,color:C.granateDark,marginBottom:14}}>⚠️ Cuotas pendientes</h3>
        {morosos.length===0?<p style={{color:C.verde,fontSize:13}}>✅ Todos al corriente</p>
        :morosos.slice(0,6).map(s=>{
          const cuotaSocio=cuotas.find(c=>c.socio_id===s.id&&c.temporada===TEMPORADA_ACTUAL);
          return <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span>{s.nombre} {s.apellidos}</span>
            <span style={{fontWeight:700,color:C.oro}}>{cuotaSocio?fmt(cuotaSocio.importe):"Sin cuota registrada"}</span>
          </div>;
        })}
        {morosos.length>6&&<div style={{fontSize:12,color:C.muted,marginTop:8,textAlign:"right"}}>+{morosos.length-6} más</div>}
      </Card>
      <Card>
        <h3 style={{fontSize:15,fontWeight:700,color:C.granateDark,marginBottom:14}}>📍 Municipios</h3>
        {Object.entries(municipios).sort((a,b)=>b[1]-a[1]).map(([m,n])=>(
          <div key={m} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
              <span>{m}</span><span style={{fontWeight:700,color:C.granate}}>{n}</span>
            </div>
            <div style={{background:C.border,borderRadius:6,height:6}}>
              <div style={{width:`${(n/activos.length)*100}%`,background:C.granate,height:6,borderRadius:6}}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════
// CONSENTIMIENTOS — vista de tabla, todo de un vistazo
// ══════════════════════════════════════════════════════════
const COLUMNAS_CONSENT = [
  {k:"rgpd",                   l:"RGPD",      icon:"📋", obligatorio:true},
  {k:"consent_foto_interna",   l:"Foto interna", icon:"📸"},
  {k:"consent_foto_rrss",      l:"Foto RRSS",    icon:"📱"},
  {k:"consent_foto_web",       l:"Foto web",     icon:"🌐"},
  {k:"consent_foto_levante",   l:"Foto Levante", icon:"⚽"},
  {k:"consent_promo_pena",     l:"Promo peña",   icon:"📢"},
  {k:"consent_patrocinadores", l:"Patrocin.",    icon:"🤝"},
  {k:"consent_whatsapp",       l:"WhatsApp",     icon:"💬"},
];

function Consentimientos({socios,setSocios}){
  const [busqueda,setBusqueda]=useState("");
  const [filtroCol,setFiltroCol]=useState("todos"); // muestra solo socios a los que les falta esa columna
  const [notif,setNotif]=useState(null);
  const [guardandoId,setGuardandoId]=useState(null);

  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),2000);};

  const activos = socios.filter(s=>s.estado==="activo");
  const filtrados = activos.filter(s=>{
    const m=`${s.nombre} ${s.apellidos} ${s.numero}`.toLowerCase().includes(busqueda.toLowerCase());
    if(!m) return false;
    if(filtroCol==="todos") return true;
    return !s[filtroCol]; // solo los que NO tienen ese consentimiento marcado
  });

  const toggle = async (socio, campo) => {
    const nuevoValor = !socio[campo];
    setGuardandoId(`${socio.id}-${campo}`);
    setSocios(prev=>prev.map(s=>s.id===socio.id?{...s,[campo]:nuevoValor}:s)); // optimista
    const { error } = await supabase.from("socios").update({ [campo]: nuevoValor }).eq("id", socio.id);
    setGuardandoId(null);
    if(error){
      setSocios(prev=>prev.map(s=>s.id===socio.id?{...s,[campo]:!nuevoValor}:s)); // revertir
      ok("❌ Error al guardar, inténtalo de nuevo");
    }
  };

  const exportarExcel = () => {
    const data = activos.map(s=>{
      const row = { "Nº Socio":s.numero, "Nombre":`${s.nombre} ${s.apellidos}` };
      COLUMNAS_CONSENT.forEach(c=>{ row[c.l]=s[c.k]?"Sí":"No"; });
      return row;
    });
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Consentimientos");
    XLSX.writeFile(wb,`consentimientos_rana_mecanica_${hoy}.xlsx`);
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.rojo,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif}</div>}

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>📋 Consentimientos RGPD · {activos.length} activos</h2>
      <Btn small outline onClick={exportarExcel}>📥 Excel</Btn>
    </div>

    <p style={{fontSize:13,color:C.muted,marginBottom:14}}>Clic directo en cualquier casilla ✅/❌ para marcar o desmarcar — se guarda al instante, sin necesidad de entrar socio por socio.</p>

    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="🔍 Buscar por nombre o número..."
        style={{flex:1,minWidth:200,padding:"9px 13px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
      <select value={filtroCol} onChange={e=>setFiltroCol(e.target.value)}
        style={{padding:"9px 13px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:C.blanco}}>
        <option value="todos">Mostrar todos</option>
        {COLUMNAS_CONSENT.map(c=><option key={c.k} value={c.k}>Solo sin "{c.l}"</option>)}
      </select>
    </div>

    <Card style={{padding:0}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <TH>Nº</TH>
              <TH>Nombre</TH>
              {COLUMNAS_CONSENT.map(c=><TH key={c.k}><span title={c.l}>{c.icon} {c.l}</span></TH>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((s,i)=>(
              <tr key={s.id} style={{background:i%2===0?C.blanco:"#fafafa"}}>
                <TD style={{fontFamily:"monospace",color:C.muted,fontSize:11}}>{s.numero}</TD>
                <TD style={{fontWeight:600,whiteSpace:"nowrap"}}>{s.nombre} {s.apellidos}</TD>
                {COLUMNAS_CONSENT.map(c=>{
                  const activo=!!s[c.k];
                  const cargando=guardandoId===`${s.id}-${c.k}`;
                  return(
                    <TD key={c.k} style={{textAlign:"center"}}>
                      <button onClick={()=>toggle(s,c.k)} disabled={cargando}
                        title={`${c.l}: ${activo?"Sí":"No"} — clic para cambiar`}
                        style={{
                          width:30,height:30,borderRadius:8,cursor:cargando?"wait":"pointer",
                          border:`2px solid ${activo?C.verde:c.obligatorio?C.rojo:C.border}`,
                          background:activo?C.verdeLight:c.obligatorio?C.rojoLight:C.grisLight,
                          fontSize:15,opacity:cargando?0.5:1,
                        }}>
                        {activo?"✅":"❌"}
                      </button>
                    </TD>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{padding:"10px 16px",color:C.muted,fontSize:13,borderTop:`1px solid ${C.border}`}}>{filtrados.length} peñistas</div>
    </Card>
  </div>);
}

// ══════════════════════════════════════════════════════════
// CUENTAS — aprobación de registros usuario/contraseña
// ══════════════════════════════════════════════════════════
function CuentasPendientes({socios,setSocios}){
  const [notif,setNotif]=useState(null);
  const [procesando,setProcesando]=useState(null);
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const pendientes = socios.filter(s=>s.auth_user_id && !s.cuenta_aprobada);
  const aprobadas = socios.filter(s=>s.auth_user_id && s.cuenta_aprobada);

  const aprobar=async(socio)=>{
    setProcesando(socio.id);
    const {error}=await supabase.from("socios").update({cuenta_aprobada:true}).eq("id",socio.id);
    setProcesando(null);
    if(error){ ok("❌ Error al aprobar"); return; }
    setSocios(prev=>prev.map(s=>s.id===socio.id?{...s,cuenta_aprobada:true}:s));
    ok(`✅ Cuenta de ${socio.nombre} aprobada`);
  };

  const rechazar=async(socio)=>{
    if(!confirm(`¿Rechazar la solicitud de cuenta de ${socio.nombre} ${socio.apellidos}? Podrá volver a registrarse.`)) return;
    setProcesando(socio.id);
    const {error}=await supabase.from("socios").update({auth_user_id:null,cuenta_aprobada:false,cuenta_solicitada_at:null}).eq("id",socio.id);
    setProcesando(null);
    if(error){ ok("❌ Error al rechazar"); return; }
    setSocios(prev=>prev.map(s=>s.id===socio.id?{...s,auth_user_id:null,cuenta_aprobada:false}:s));
    ok(`Solicitud de ${socio.nombre} rechazada`);
  };

  const eliminarCuenta=async(socio)=>{
    if(!confirm(`¿Eliminar la cuenta de ${socio.nombre} ${socio.apellidos}? Dejará de poder entrar con usuario y contraseña; podrá volver a registrarse si hace falta.`)) return;
    setProcesando(socio.id);
    const {error}=await supabase.from("socios").update({auth_user_id:null,cuenta_aprobada:false,cuenta_solicitada_at:null}).eq("id",socio.id);
    setProcesando(null);
    if(error){ ok("❌ Error al eliminar la cuenta"); return; }
    setSocios(prev=>prev.map(s=>s.id===socio.id?{...s,auth_user_id:null,cuenta_aprobada:false}:s));
    ok(`🗑️ Cuenta de ${socio.nombre} eliminada`);
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.rojo,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif}</div>}

    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:6}}>🔐 Cuentas de usuario</h2>
    <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Los socios se registran con email y contraseña en Mi Zona; aquí apruebas el acceso antes de que puedan entrar.</p>

    <h3 style={{fontSize:13,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Pendientes de aprobar ({pendientes.length})</h3>
    {pendientes.length===0?(
      <p style={{color:C.muted,fontSize:13,marginBottom:24}}>No hay solicitudes pendientes.</p>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
        {pendientes.map(s=>(
          <Card key={s.id} style={{borderLeft:`4px solid ${C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{s.nombre} {s.apellidos} <span style={{fontFamily:"monospace",color:C.muted,fontWeight:400,fontSize:12}}>({s.numero})</span></div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{s.email} · Solicitado {s.cuenta_solicitada_at?new Date(s.cuenta_solicitada_at).toLocaleDateString("es-ES"):"—"}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn small outline onClick={()=>rechazar(s)} disabled={procesando===s.id}>Rechazar</Btn>
                <Btn small color={C.verde} onClick={()=>aprobar(s)} disabled={procesando===s.id}>{procesando===s.id?"...":"✅ Aprobar"}</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}

    <h3 style={{fontSize:13,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Cuentas activas ({aprobadas.length})</h3>
    <Card style={{padding:0}}>
      {aprobadas.length===0?(
        <p style={{padding:16,color:C.muted,fontSize:13}}>Todavía no hay cuentas aprobadas.</p>
      ):aprobadas.map((s,i)=>(
        <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<aprobadas.length-1?`1px solid ${C.border}`:"none"}}>
          <div>
            <span style={{fontWeight:600,fontSize:13}}>{s.nombre} {s.apellidos}</span>
            <span style={{fontFamily:"monospace",color:C.muted,fontSize:11,marginLeft:8}}>{s.numero}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:C.muted}}>{s.email}</span>
            <button onClick={()=>eliminarCuenta(s)} disabled={procesando===s.id} title="Eliminar cuenta" style={{background:"none",border:"none",cursor:procesando===s.id?"wait":"pointer",color:C.rojo,fontSize:15}}>🗑️</button>
          </div>
        </div>
      ))}
    </Card>
  </div>);
}

// ══════════════════════════════════════════════════════════
// PEÑISTAS
// ══════════════════════════════════════════════════════════
function Peñistas({socios,setSocios,cuotas,setCuotas}){
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState("activo");
  const [editando,setEditando]=useState(null);
  const [form,setForm]=useState({});
  const [notif,setNotif]=useState(null);

  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const filtrados=socios.filter(s=>{
    const m=`${s.nombre} ${s.apellidos} ${s.municipio||""} ${s.numero}`.toLowerCase().includes(busqueda.toLowerCase());
    if(filtro==="todos") return m;
    return m&&s.estado===filtro;
  });

  const abrirEditar=(s)=>{setEditando(s);setForm({...s});};

  const guardar=async()=>{
    const {error}=await supabase.from("socios").update({
      nombre:form.nombre, apellidos:form.apellidos, dni:form.dni||null,
      telefono:form.telefono||null, email:form.email||null,
      municipio:form.municipio||null, tipo:form.tipo, cargo:form.cargo,
      rgpd:form.rgpd||false, foto_aut:form.foto_aut||false,
      tiene_acciones:form.tiene_acciones||false,
      num_acciones:form.num_acciones||0,
      es_abonado:form.es_abonado||false,
      num_abonado:form.num_abonado||null,
      verificado:form.verificado||false,
      consent_foto_interna:form.consent_foto_interna||false,
      consent_foto_rrss:form.consent_foto_rrss||false,
      consent_foto_web:form.consent_foto_web||false,
      consent_foto_levante:form.consent_foto_levante||false,
      consent_promo_pena:form.consent_promo_pena||false,
      consent_patrocinadores:form.consent_patrocinadores||false,
      consent_whatsapp:form.consent_whatsapp||false,
    }).eq("id",editando.id);
    if(error){ok("❌ Error al guardar");return;}
    setSocios(p=>p.map(s=>s.id===editando.id?{...s,...form}:s));
    setEditando(null);
    ok("✅ Datos actualizados");
  };

  const darBaja=async(s)=>{
    await supabase.from("socios").update({estado:"baja",fecha_baja:hoy}).eq("id",s.id);
    setSocios(p=>p.map(x=>x.id===s.id?{...x,estado:"baja",fecha_baja:hoy}:x));
    ok(`${s.nombre} dado de baja`);
  };

  const reactivar=async(s)=>{
    await supabase.from("socios").update({estado:"activo",fecha_baja:null}).eq("id",s.id);
    setSocios(p=>p.map(x=>x.id===s.id?{...x,estado:"activo",fecha_baja:null}:x));
    ok(`${s.nombre} reactivado`);
  };

  const eliminarSocio=async(s)=>{
    const confirmacion=prompt(`Vas a ELIMINAR PERMANENTEMENTE todos los datos de ${s.nombre} ${s.apellidos} (${s.numero}). Esta acción no se puede deshacer y borrará también sus cuotas, lotería e inscripciones.\n\nEscribe ELIMINAR para confirmar:`);
    if(confirmacion!=="ELIMINAR") return;
    await supabase.from("inscripciones").delete().eq("socio_id",s.id);
    await supabase.from("loteria").delete().eq("socio_id",s.id);
    await supabase.from("cuotas").delete().eq("socio_id",s.id);
    const {error}=await supabase.from("socios").delete().eq("id",s.id);
    if(error){ok("❌ Error al eliminar");return;}
    setSocios(p=>p.filter(x=>x.id!==s.id));
    ok(`🗑️ ${s.nombre} eliminado permanentemente`);
  };

  const exportarExcel=()=>{
    const data=socios.filter(s=>s.estado==="activo").map(s=>({
      "Nº Socio":s.numero,"Nombre":s.nombre,"Apellidos":s.apellidos,
      "DNI":s.dni||"","Teléfono":s.telefono==="512512"?"(pendiente)":s.telefono||"",
      "Email":s.email||"","Municipio":s.municipio||"","Tipo":s.tipo,"Cargo":s.cargo,
      "Acciones":s.tiene_acciones?(s.num_acciones||1):"No",
      "Nº Abonado":s.es_abonado?(s.num_abonado||"Sí"):"No",
      "RGPD":s.rgpd?"Sí":"No","Verificado":s.verificado?"Sí":"No",
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    ws["!cols"]=[{wch:10},{wch:14},{wch:22},{wch:12},{wch:13},{wch:28},{wch:12},{wch:10},{wch:16},{wch:8},{wch:12},{wch:6},{wch:10}];
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,`Censo ${TEMPORADA_ACTUAL}`.replace(/[\\/:*?[\]]/g,"-"));
    XLSX.writeFile(wb,`censo_rana_mecanica_${hoy}.xlsx`);
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>👥 Peñistas · {socios.filter(s=>s.estado==="activo").length} activos</h2>
      <div style={{display:"flex",gap:8}}>
        <Btn small outline onClick={exportarExcel}>📥 Excel</Btn>
      </div>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="🔍 Buscar..."
        style={{flex:1,minWidth:200,padding:"9px 13px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
      {["activo","baja","todos"].map(f=>(
        <button key={f} onClick={()=>setFiltro(f)} style={{padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtro===f?C.granate:"#f0f0f0",color:filtro===f?C.blanco:C.gris,fontFamily:"inherit"}}>
          {f==="activo"?"Activos":f==="baja"?"Bajas":"Todos"}
        </button>
      ))}
    </div>
    <Card style={{padding:0}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Nº","Nombre","Tel.","Municipio","Tipo","Abonado","Acciones","RGPD","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filtrados.map((s,i)=>(
              <tr key={s.id} style={{background:i%2===0?C.blanco:"#fafafa"}}>
                <TD style={{fontFamily:"monospace",color:C.muted,fontSize:11}}>{s.numero}</TD>
                <TD style={{fontWeight:600}}>{s.nombre} {s.apellidos}{s.verificado&&<span style={{marginLeft:4,fontSize:10,background:C.verdeLight,color:C.verde,padding:"1px 5px",borderRadius:6}}>✓</span>}</TD>
                <TD style={{color:s.telefono==="512512"?C.rojo:C.text}}>{s.telefono==="512512"?"⚠️ Pendiente":s.telefono||"—"}</TD>
                <TD>{s.municipio||"—"}</TD>
                <TD style={{textTransform:"capitalize"}}>{s.tipo}</TD>
                <TD>{s.es_abonado?<Pill text={`✅ ${s.num_abonado||"Sí"}`} color={C.verde} bg={C.verdeLight}/>:<Pill text="No" color={C.gris} bg={C.grisLight}/>}</TD>
                <TD>{s.tiene_acciones?<Pill text={`📈 ${s.num_acciones||1}`} color={C.azul} bg={C.azulLight}/>:<Pill text="No" color={C.gris} bg={C.grisLight}/>}</TD>
                <TD>{s.rgpd?<Pill text="✅" color={C.verde} bg={C.verdeLight}/>:<Pill text="❌" color={C.rojo} bg={C.rojoLight}/>}</TD>
                <TD>{s.estado==="activo"?<Pill text="● Activo" color={C.verde} bg={C.verdeLight}/>:<Pill text="● Baja" color={C.rojo} bg={C.rojoLight}/>}</TD>
                <TD><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Btn small outline onClick={()=>abrirEditar(s)}>✏️</Btn>
                  {s.estado==="activo"&&<Btn small outline color={C.rojo} onClick={()=>darBaja(s)}>Baja</Btn>}
                  {s.estado==="baja"&&<Btn small outline color={C.verde} onClick={()=>reactivar(s)}>Reactivar</Btn>}
                  <Btn small outline color={C.rojo} onClick={()=>eliminarSocio(s)}>🗑️</Btn>
                </div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{padding:"10px 16px",color:C.muted,fontSize:13,borderTop:`1px solid ${C.border}`}}>{filtrados.length} peñistas</div>
    </Card>

    <Modal open={!!editando} onClose={()=>setEditando(null)} title={editando?`✏️ ${editando.nombre} ${editando.apellidos}`:""} width={600}>
      {editando&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Input label="Nombre" value={form.nombre} onChange={v=>setF("nombre",v)}/>
          <Input label="Apellidos" value={form.apellidos} onChange={v=>setF("apellidos",v)}/>
          <Input label="DNI/NIE" value={form.dni} onChange={v=>setF("dni",v)}/>
          <Input label="Teléfono" value={form.telefono} onChange={v=>setF("telefono",v)} type="tel"/>
          <Input label="Email" value={form.email} onChange={v=>setF("email",v)} type="email"/>
          <Input label="Municipio" value={form.municipio} onChange={v=>setF("municipio",v)}/>
          <Select label="Tipo" value={form.tipo} onChange={v=>setF("tipo",v)} options={["adulto","infantil","honorifico"].map(t=>({value:t,label:t.charAt(0).toUpperCase()+t.slice(1)}))}/>
          <Select label="Cargo" value={form.cargo} onChange={v=>setF("cargo",v)} options={["Peñista","Presidente","Vicepresidente","Secretario","Tesorero","Vocal"].map(c=>({value:c,label:c}))}/>
          <Input label="Nº acciones" value={form.num_acciones} onChange={v=>setF("num_acciones",v)} type="number"/>
          <Input label="Nº abonado" value={form.num_abonado} onChange={v=>setF("num_abonado",v)}/>
        </div>

        {/* Historial de pagos de cuotas */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>💶 Cuotas</div>
          {(()=>{
            const cuotasSocio=cuotas.filter(c=>c.socio_id===editando.id).sort((a,b)=>(b.temporada||"").localeCompare(a.temporada||""));
            const cuotaActual=cuotasSocio.find(c=>c.temporada===TEMPORADA_ACTUAL);
            return(<>
              <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                <div style={{padding:"8px 14px",borderRadius:8,background:cuotaActual?.pagado?C.verdeLight:C.oroLight,fontSize:13,fontWeight:700,color:cuotaActual?.pagado?C.verde:C.oro}}>
                  {cuotaActual?(cuotaActual.pagado?`✅ Cuota ${TEMPORADA_ACTUAL} pagada`:`⏳ Cuota ${TEMPORADA_ACTUAL} pendiente`):`⚠️ Sin cuota ${TEMPORADA_ACTUAL} registrada`}
                </div>
                {cuotaActual&&<div style={{padding:"8px 14px",borderRadius:8,background:C.grisLight,fontSize:13,fontWeight:700,color:C.text}}>{fmt(cuotaActual.importe)}</div>}
              </div>
              {cuotasSocio.length===0?(
                <p style={{fontSize:12,color:C.muted}}>Sin cuotas registradas todavía.</p>
              ):(
                <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  {cuotasSocio.map((c,i)=>(
                    <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",borderBottom:i<cuotasSocio.length-1?`1px solid ${C.border}`:"none",background:i%2===0?C.blanco:"#fafafa"}}>
                      <span style={{fontSize:12,color:C.text}}>{c.temporada} <span style={{color:C.muted}}>· {c.categoria}</span></span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:12,fontWeight:700,color:c.pagado?C.verde:C.oro}}>{fmt(c.importe)}</span>
                        <Pill text={c.pagado?`✓ ${fmtFecha(c.fecha_pago)}`:"Pendiente"} color={c.pagado?C.verde:C.oro} bg={c.pagado?C.verdeLight:C.oroLight}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>);
          })()}
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Estado y consentimientos</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            {[
              ["tiene_acciones","📈 Tiene acciones"],
              ["es_abonado","🎫 Es abonado/a"],
              ["rgpd","📋 RGPD firmado"],
              ["foto_aut","📸 Foto autorizada"],
              ["verificado","✅ Verificado"],
              ["consent_foto_interna","📸 Foto interna"],
              ["consent_foto_rrss","📱 Foto RRSS"],
              ["consent_foto_web","🌐 Foto web"],
              ["consent_foto_levante","⚽ Foto Levante/Fed."],
              ["consent_promo_pena","📢 Promo peña"],
              ["consent_patrocinadores","🤝 Patrocinadores"],
              ["consent_whatsapp","💬 WhatsApp"],
            ].map(([k,l])=>(
              <label key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,cursor:"pointer",padding:"5px 8px",borderRadius:6,background:form[k]?C.verdeLight:C.grisLight}}>
                <input type="checkbox" checked={!!form[k]} onChange={e=>setF(k,e.target.checked)} style={{accentColor:C.verde}}/>{l}
              </label>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setEditando(null)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardar} style={{flex:1}}>💾 Guardar</Btn>
        </div>
      </div>}
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// SOLICITUDES DE ALTA
// ══════════════════════════════════════════════════════════
function Solicitudes({solicitudes,setSolicitudes,socios,setSocios,setCuotas}){
  const [seleccionada,setSeleccionada]=useState(null);
  const [motivo,setMotivo]=useState("");
  const [notif,setNotif]=useState(null);
  const ok=(msg,color=C.verde)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),3500);};

  const pendientes=solicitudes.filter(s=>s.estado==="pendiente");
  const historial=solicitudes.filter(s=>s.estado!=="pendiente");

  const aprobar=async(sol)=>{
    // Calcular siguiente número
    const nums=socios.map(s=>parseInt(s.numero.replace("LRM-",""))).filter(n=>!isNaN(n));
    const siguiente=`LRM-${String(Math.max(0,...nums)+1).padStart(4,"0")}`;
    // Crear socio (se copian todos los consentimientos y datos de Levante de la solicitud)
    const {data:nuevo,error}=await supabase.from("socios").insert([{
      numero:siguiente, nombre:sol.nombre, apellidos:sol.apellidos,
      dni:sol.dni||null, telefono:sol.telefono||null, email:sol.email||null,
      municipio:sol.municipio||null, tipo:sol.tipo||"adulto",
      fecha_alta:hoy, estado:"activo",
      rgpd:sol.rgpd||false,
      consent_foto_interna:sol.consent_foto_interna||false,
      consent_foto_rrss:sol.consent_foto_rrss||false,
      consent_foto_web:sol.consent_foto_web||false,
      consent_foto_levante:sol.consent_foto_levante||false,
      consent_promo_pena:sol.consent_promo_pena||false,
      consent_patrocinadores:sol.consent_patrocinadores||false,
      consent_whatsapp:sol.consent_whatsapp||false,
      fecha_consentimiento:sol.fecha_consentimiento||hoy,
      tiene_acciones:sol.tiene_acciones||false, num_acciones:sol.num_acciones||0,
      es_abonado:sol.es_abonado||false, num_abonado:sol.num_abonado||null,
    }]).select();
    if(error){ok("❌ Error al crear socio",C.rojo);return;}
    // Crear cuota — importe según la tarifa real seleccionada en la solicitud
    const IMPORTE_POR_TARIFA={nueva_alta:30, infantil_mayor:10, infantil_0_3:0, honorifico:0};
    const cuotaImp = sol.tarifa_clave!=null
      ? (IMPORTE_POR_TARIFA[sol.tarifa_clave] ?? 30)
      : (sol.tipo==="infantil"?0:sol.tipo==="honorifico"?0:30); // fallback para solicitudes antiguas sin tarifa_clave
    await supabase.from("cuotas").insert([{
      socio_id:nuevo[0].id, temporada:TEMPORADA_ACTUAL,
      categoria:"nueva_alta", importe:cuotaImp, pagado:false,
    }]);
    // Actualizar solicitud
    await supabase.from("solicitudes_alta").update({estado:"aprobada",numero_asignado:siguiente,fecha_gestion:hoy}).eq("id",sol.id);
    setSocios(p=>[...p,nuevo[0]]);
    setSolicitudes(p=>p.map(s=>s.id===sol.id?{...s,estado:"aprobada",numero_asignado:siguiente}:s));
    setSeleccionada(null);
    ok(`✅ ${sol.nombre} dado de alta como ${siguiente}`);
  };

  const rechazar=async(sol)=>{
    await supabase.from("solicitudes_alta").update({estado:"rechazada",motivo_rechazo:motivo,fecha_gestion:hoy}).eq("id",sol.id);
    setSolicitudes(p=>p.map(s=>s.id===sol.id?{...s,estado:"rechazada",motivo_rechazo:motivo}:s));
    setSeleccionada(null); setMotivo("");
    ok(`Solicitud de ${sol.nombre} rechazada`,C.rojo);
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:notif.color,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif.msg}</div>}
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:20}}>📥 Solicitudes de alta</h2>

    {pendientes.length===0?(
      <Card style={{textAlign:"center",padding:"40px 20px",marginBottom:16}}>
        <div style={{fontSize:40,marginBottom:10}}>✅</div>
        <h3 style={{color:C.verde}}>Sin solicitudes pendientes</h3>
      </Card>
    ):(
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:24}}>
        {pendientes.map(s=>(
          <Card key={s.id} style={{borderTop:`4px solid ${C.oro}`,cursor:"pointer"}} onClick={()=>setSeleccionada(s)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:C.granateLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.granate}}>
                {s.nombre?.[0]}{s.apellidos?.[0]}
              </div>
              <Pill text="⏳ Pendiente" color={C.oro} bg={C.oroLight}/>
            </div>
            <h3 style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>{s.nombre} {s.apellidos}</h3>
            <p style={{fontSize:12,color:C.muted,marginBottom:10}}>📍 {s.municipio||"—"} · 📅 {fmtFecha(s.created_at)}</p>
            <div style={{display:"flex",gap:8}}>
              <Pill text={s.tipo||"adulto"} color={C.azul} bg={C.azulLight}/>
              {!s.rgpd&&<Pill text="⚠️ RGPD" color={C.rojo} bg={C.rojoLight}/>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={e=>{e.stopPropagation();rechazar(s);}} style={{flex:1,padding:"8px",background:C.blanco,border:`1.5px solid ${C.rojo}`,borderRadius:8,cursor:"pointer",fontWeight:600,color:C.rojo,fontSize:13,fontFamily:"inherit"}}>❌ Rechazar</button>
              <button onClick={e=>{e.stopPropagation();aprobar(s);}} style={{flex:1,padding:"8px",background:C.verde,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:C.blanco,fontSize:13,fontFamily:"inherit"}}>✅ Aprobar</button>
            </div>
          </Card>
        ))}
      </div>
    )}

    {historial.length>0&&(
      <Card style={{padding:0}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,fontWeight:700,color:C.granateDark}}>Historial ({historial.length})</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Nombre","Municipio","Tipo","Fecha","Estado","Nº asignado"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {historial.map((s,i)=>(
                <tr key={s.id} style={{background:i%2===0?C.blanco:"#fafafa"}}>
                  <TD style={{fontWeight:600}}>{s.nombre} {s.apellidos}</TD>
                  <TD>{s.municipio||"—"}</TD>
                  <TD style={{textTransform:"capitalize"}}>{s.tipo||"adulto"}</TD>
                  <TD style={{color:C.muted}}>{fmtFecha(s.created_at)}</TD>
                  <TD>{s.estado==="aprobada"?<Pill text="✅ Aprobada" color={C.verde} bg={C.verdeLight}/>:<Pill text="❌ Rechazada" color={C.rojo} bg={C.rojoLight}/>}</TD>
                  <TD style={{fontFamily:"monospace",color:C.azul}}>{s.numero_asignado||"—"}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )}

    <Modal open={!!seleccionada} onClose={()=>setSeleccionada(null)} title={seleccionada?`${seleccionada.nombre} ${seleccionada.apellidos}`:""}>
      {seleccionada&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[["Nombre",`${seleccionada.nombre} ${seleccionada.apellidos}`],["DNI",seleccionada.dni||"No facilitado"],["Teléfono",seleccionada.telefono||"—"],["Email",seleccionada.email||"—"],["Municipio",seleccionada.municipio||"—"],["Tipo",seleccionada.tipo||"adulto"],["Acciones",seleccionada.tiene_acciones?`Sí (${seleccionada.num_acciones||1})`:"No"],["Abonado",seleccionada.es_abonado?`Sí${seleccionada.num_abonado?" — Nº "+seleccionada.num_abonado:""}` :"No"]].map(([k,v])=>(
            <div key={k} style={{padding:"8px 12px",background:C.grisLight,borderRadius:8}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:2}}>{k}</div>
              <div style={{fontWeight:600,fontSize:13}}>{v}</div>
            </div>
          ))}
        </div>
        
        {/* CONSENTIMIENTOS */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Consentimientos otorgados</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:seleccionada.rgpd?C.verdeLight:C.rojoLight,borderRadius:8}}>
              <span style={{fontSize:13}}>📋 Tratamiento de datos (obligatorio)</span>
              <span style={{fontWeight:700,color:seleccionada.rgpd?C.verde:C.rojo,fontSize:12}}>{seleccionada.rgpd?"✅ Sí":"❌ NO"}</span>
            </div>
            {[
              ["consent_foto_interna","📸 Foto comunicación interna"],
              ["consent_foto_rrss","📱 Foto redes sociales"],
              ["consent_foto_web","🌐 Foto web y materiales"],
              ["consent_foto_levante","⚽ Foto cesión Levante UD/Federación"],
              ["consent_promo_pena","📢 Comunicaciones promocionales peña"],
              ["consent_patrocinadores","🤝 Info patrocinadores"],
              ["consent_whatsapp","💬 Grupo WhatsApp"],
            ].map(([k,l])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 12px",background:C.grisLight,borderRadius:8}}>
                <span style={{fontSize:12,color:C.text}}>{l}</span>
                <span style={{fontWeight:700,color:seleccionada[k]?C.verde:C.muted,fontSize:11}}>{seleccionada[k]?"✅ Sí":"No"}</span>
              </div>
            ))}
            {seleccionada.fecha_consentimiento&&(
              <div style={{fontSize:11,color:C.muted,textAlign:"right",marginTop:2}}>
                🕐 {new Date(seleccionada.fecha_consentimiento).toLocaleString("es-ES")}
              </div>
            )}
          </div>
        </div>

        {seleccionada.comentarios&&<div style={{background:C.oroLight,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#7a5c00"}}>💬 {seleccionada.comentarios}</div>}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>Motivo de rechazo (si aplica)</label>
          <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={2}
            style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>rechazar(seleccionada)} style={{flex:1,padding:12,background:C.blanco,border:`2px solid ${C.rojo}`,borderRadius:10,cursor:"pointer",fontWeight:700,color:C.rojo,fontFamily:"inherit"}}>❌ Rechazar</button>
          <button onClick={()=>aprobar(seleccionada)} style={{flex:2,padding:12,background:C.verde,border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,color:C.blanco,fontFamily:"inherit"}}>✅ Aprobar alta</button>
        </div>
      </div>}
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// VERIFICACIONES
// ══════════════════════════════════════════════════════════
function Verificaciones({verificaciones,setVerificaciones,socios,setSocios}){
  const [comentario,setComentario]=useState("");
  const [notif,setNotif]=useState(null);
  const ok=(msg,color=C.verde)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),3000);};

  const getSocio=(id)=>socios.find(s=>s.id===id);
  const pendientes=verificaciones.filter(v=>v.estado==="pendiente");
  const historial=verificaciones.filter(v=>v.estado!=="pendiente");

  const campoBonito=(c)=>({nombre:"Nombre",apellidos:"Apellidos",dni:"DNI/NIE",telefono:"Teléfono",email:"Email",fecha_nac:"Fecha nacimiento",municipio:"Municipio",tiene_acciones:"Tiene acciones Levante",num_acciones:"Nº de acciones",es_abonado:"Es abonado",num_abonado:"Nº de abonado"}[c]||c);

  const aprobar=async(v)=>{
    // Aplicar el cambio al socio
    await supabase.from("socios").update({[v.campo]:v.valor_nuevo}).eq("id",v.socio_id);
    await supabase.from("verificaciones").update({estado:"aprobada",comentario_junta:comentario,fecha_gestion:hoy}).eq("id",v.id);
    setSocios(p=>p.map(s=>s.id===v.socio_id?{...s,[v.campo]:v.valor_nuevo}:s));
    setVerificaciones(p=>p.map(x=>x.id===v.id?{...x,estado:"aprobada"}:x));
    setComentario("");
    ok(`✅ Corrección de ${getSocio(v.socio_id)?.nombre} aprobada y aplicada`);
    const socio=getSocio(v.socio_id);
    if(socio?.email){
      enviarEmailJS(socio.email, "La Rana Mecánica · Cambio de datos aprobado",
        `Hola ${socio.nombre},\n\nTu solicitud de cambio en "${campoBonito(v.campo)}" ha sido aprobada y ya está actualizada en tu ficha.\n\nNuevo valor: ${v.valor_nuevo}\n\nPara cualquier consulta: penyaranamecanica@gmail.com\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`);
    }
  };

  const rechazar=async(v)=>{
    await supabase.from("verificaciones").update({estado:"rechazada",comentario_junta:comentario,fecha_gestion:hoy}).eq("id",v.id);
    setVerificaciones(p=>p.map(x=>x.id===v.id?{...x,estado:"rechazada"}:x));
    setComentario("");
    ok(`Corrección rechazada`,C.rojo);
    const socio=getSocio(v.socio_id);
    if(socio?.email){
      enviarEmailJS(socio.email, "La Rana Mecánica · Cambio de datos rechazado",
        `Hola ${socio.nombre},\n\nTu solicitud de cambio en "${campoBonito(v.campo)}" no ha sido aprobada.${comentario?`\n\nComentario de la junta: ${comentario}`:""}\n\nSi crees que es un error, contacta con nosotros: penyaranamecanica@gmail.com\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`);
    }
  };

  const eliminar=async(v)=>{
    if(!confirm("¿Eliminar este registro de verificación? No se puede deshacer.")) return;
    await supabase.from("verificaciones").delete().eq("id",v.id);
    setVerificaciones(p=>p.filter(x=>x.id!==v.id));
    ok("🗑️ Eliminado");
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:notif.color,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif.msg}</div>}
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:20}}>✏️ Correcciones de datos</h2>

    {pendientes.length===0?(
      <Card style={{textAlign:"center",padding:"40px 20px",marginBottom:16}}>
        <div style={{fontSize:40,marginBottom:10}}>✅</div>
        <h3 style={{color:C.verde}}>Sin correcciones pendientes</h3>
      </Card>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
        {pendientes.map(v=>{
          const s=getSocio(v.socio_id);
          return(<Card key={v.id} style={{borderLeft:`4px solid ${C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>
                  {s?.nombre} {s?.apellidos} <span style={{color:C.muted,fontWeight:400,fontSize:12}}>({s?.numero})</span>
                </div>
                <div style={{fontSize:13,color:C.gris,marginBottom:6}}>
                  Quiere cambiar <strong>{campoBonito(v.campo)}</strong>
                </div>
                <div style={{display:"flex",gap:12,fontSize:13}}>
                  <span style={{color:C.rojo}}>Antes: <em>{v.valor_anterior||"(vacío)"}</em></span>
                  <span>→</span>
                  <span style={{color:C.verde,fontWeight:600}}>Ahora: <em>{v.valor_nuevo}</em></span>
                </div>
                {v.comentario&&<div style={{marginTop:6,fontSize:12,color:C.muted,fontStyle:"italic"}}>💬 "{v.comentario}"</div>}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:4}}>Comentario para el peñista (opcional)</label>
              <textarea value={comentario} onChange={e=>setComentario(e.target.value)} rows={2}
                style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>rechazar(v)} style={{flex:1,padding:"9px",background:C.blanco,border:`1.5px solid ${C.rojo}`,borderRadius:8,cursor:"pointer",fontWeight:700,color:C.rojo,fontSize:13,fontFamily:"inherit"}}>❌ Rechazar</button>
              <button onClick={()=>aprobar(v)} style={{flex:2,padding:"9px",background:C.verde,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:C.blanco,fontSize:13,fontFamily:"inherit"}}>✅ Aprobar y aplicar</button>
              <button onClick={()=>eliminar(v)} title="Eliminar" style={{padding:"9px 12px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",color:C.gris,fontSize:13,fontFamily:"inherit"}}>🗑️</button>
            </div>
          </Card>);
        })}
      </div>
    )}

    {historial.length>0&&(
      <Card style={{padding:0}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,fontWeight:700,color:C.granateDark}}>Historial ({historial.length})</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Socio","Campo","Valor nuevo","Estado","Fecha",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {historial.map((v,i)=>{
                const s=getSocio(v.socio_id);
                return(<tr key={v.id} style={{background:i%2===0?C.blanco:"#fafafa"}}>
                  <TD style={{fontWeight:600}}>{s?.nombre} {s?.apellidos}</TD>
                  <TD>{campoBonito(v.campo)}</TD>
                  <TD>{v.valor_nuevo}</TD>
                  <TD>{v.estado==="aprobada"?<Pill text="✅ Aprobada" color={C.verde} bg={C.verdeLight}/>:<Pill text="❌ Rechazada" color={C.rojo} bg={C.rojoLight}/>}</TD>
                  <TD style={{color:C.muted}}>{fmtFecha(v.fecha_gestion||v.created_at)}</TD>
                  <TD><button onClick={()=>eliminar(v)} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:13}}>🗑️</button></TD>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </Card>
    )}
  </div>);
}

// ══════════════════════════════════════════════════════════
// CUOTAS
// ══════════════════════════════════════════════════════════
function Cuotas({socios,cuotas,setCuotas,ejercicios,setMovimientos,tarifas}){
  const [modal,setModal]=useState(false);
  const [modalMasivo,setModalMasivo]=useState(false);
  const [filtro,setFiltro]=useState("pendientes");
  const [form,setForm]=useState({socio_id:"",temporada:TEMPORADA_ACTUAL,categoria:"nueva_alta",importe:"",pagado:false,fecha_pago:"",forma_pago:"Bizum"});
  const [notif,setNotif]=useState(null);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const getSocio=(id)=>socios.find(s=>s.id===Number(id));

  const filtradas=cuotas.filter(c=>{
    if(filtro==="pagadas") return c.pagado;
    if(filtro==="pendientes") return !c.pagado;
    return true;
  }).sort((a,b)=>a.pagado-b.pagado);

  const cobradas=cuotas.filter(c=>c.pagado).reduce((a,c)=>a+Number(c.importe),0);
  const pendiente=cuotas.filter(c=>!c.pagado).reduce((a,c)=>a+Number(c.importe),0);

  const [procesando,setProcesando]=useState(null);
  const [busquedaMasiva,setBusquedaMasiva]=useState("");

  // Reutilizable: crea el ingreso en Tesorería para una cuota pagada. Devuelve el id del movimiento o null.
  const crearIngresoCuota=async(c)=>{
    if(!c || Number(c.importe)<=0) return null;
    const socio=getSocio(c.socio_id);
    const ejercicioCuota=ejercicios.find(e=>e.nombre===c.temporada)||ejercicios.find(e=>e.nombre===TEMPORADA_ACTUAL)||ejercicios[ejercicios.length-1];
    if(!ejercicioCuota){ console.warn("No se encontró ejercicio para vincular el ingreso de la cuota", c); return null; }
    const mov={
      tipo:"ingreso",
      concepto:`Cuota ${c.temporada}${socio?` · ${socio.nombre} ${socio.apellidos}`:""}`,
      categoria:"Cuotas socios",
      importe:Number(c.importe), fecha:hoy, ejercicio_id:ejercicioCuota.id,
    };
    const {data:movData,error:errMov}=await supabase.from("movimientos_ejercicio").insert([mov]).select();
    if(errMov){ console.error("Error creando ingreso en Tesorería:",errMov); return null; }
    if(movData?.[0]){ setMovimientos(prev=>[...prev,...movData]); return movData[0].id; }
    return null;
  };

  const guardar=async()=>{
    if(!form.socio_id) return;
    const {data,error}=await supabase.from("cuotas").insert([{
      ...form, socio_id:Number(form.socio_id), importe:Number(form.importe)||0,
      fecha_pago:form.pagado?form.fecha_pago||hoy:null,
    }]).select();
    if(error){ok("❌ Error");return;}
    let cuotaFinal=data[0];
    if(cuotaFinal.pagado){
      const movimientoId=await crearIngresoCuota(cuotaFinal);
      if(movimientoId){
        await supabase.from("cuotas").update({movimiento_id:movimientoId}).eq("id",cuotaFinal.id);
        cuotaFinal={...cuotaFinal,movimiento_id:movimientoId};
      }
    }
    setCuotas(p=>[...p,cuotaFinal]);
    setModal(false);
    ok(cuotaFinal.pagado?(cuotaFinal.movimiento_id?"✅ Cuota registrada · ingreso añadido a Tesorería":"✅ Cuota registrada (revisa Tesorería, no se pudo vincular el ingreso)"):"✅ Cuota registrada");
  };

  const marcarPagado=async(id)=>{
    if(procesando) return;
    setProcesando(id);
    const c=cuotas.find(x=>x.id===id);
    const movimientoId=await crearIngresoCuota(c);
    await supabase.from("cuotas").update({pagado:true,fecha_pago:hoy,movimiento_id:movimientoId}).eq("id",id);
    setCuotas(p=>p.map(x=>x.id===id?{...x,pagado:true,fecha_pago:hoy,movimiento_id:movimientoId}:x));
    setProcesando(null);
    ok(movimientoId?"✅ Cuota marcada como pagada · ingreso añadido a Tesorería":"✅ Cuota marcada como pagada (revisa Tesorería, no se pudo vincular el ingreso)");
  };

  const deshacerPago=async(c)=>{
    if(!confirm(`¿Deshacer el pago de esta cuota? Se eliminará también el ingreso creado en Tesorería.`)) return;
    if(c.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",c.movimiento_id);
    await supabase.from("cuotas").update({pagado:false,fecha_pago:null,movimiento_id:null}).eq("id",c.id);
    setCuotas(p=>p.map(x=>x.id===c.id?{...x,pagado:false,fecha_pago:null,movimiento_id:null}:x));
    if(c.movimiento_id) setMovimientos(prev=>prev.filter(m=>m.id!==c.movimiento_id));
    ok("↩️ Pago deshecho");
  };

  const eliminarCuota=async(c)=>{
    if(!confirm(`¿Eliminar esta cuota por completo? ${c.movimiento_id?"También se borrará el ingreso de Tesorería asociado.":""}`)) return;
    if(c.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",c.movimiento_id);
    await supabase.from("cuotas").delete().eq("id",c.id);
    setCuotas(p=>p.filter(x=>x.id!==c.id));
    if(c.movimiento_id) setMovimientos(prev=>prev.filter(m=>m.id!==c.movimiento_id));
    ok("🗑️ Cuota eliminada");
  };

  // Tarifa automática por socio ya está definida arriba a nivel global (tarifaParaSocio)

  const [temporadaMasiva,setTemporadaMasiva]=useState(TEMPORADA_ACTUAL);
  const [seleccionMasiva,setSeleccionMasiva]=useState(new Set());
  const [generando,setGenerando]=useState(false);

  const abrirMasivo=()=>{
    const activos=socios.filter(s=>s.estado==="activo");
    const sinCuotaEsteAnio=activos.filter(s=>!cuotas.some(c=>c.socio_id===s.id&&c.temporada===TEMPORADA_ACTUAL));
    setTemporadaMasiva(TEMPORADA_ACTUAL);
    setSeleccionMasiva(new Set(sinCuotaEsteAnio.map(s=>s.id)));
    setModalMasivo(true);
  };

  const generarMasivo=async()=>{
    if(seleccionMasiva.size===0) return;
    setGenerando(true);
    const filas=[...seleccionMasiva].map(id=>{
      const s=getSocio(id);
      const clave=tarifaParaSocio(s);
      const tarifa=tarifas.find(t=>t.clave===clave);
      return {
        socio_id:id, temporada:temporadaMasiva, categoria:clave,
        importe:tarifa?tarifa.importe:0, pagado:false, fecha_pago:null, forma_pago:null,
      };
    });
    const {data,error}=await supabase.from("cuotas").insert(filas).select();
    setGenerando(false);
    if(error){ok("❌ Error al generar las cuotas");return;}
    setCuotas(p=>[...p,...data]);
    setModalMasivo(false);
    ok(`✅ ${data.length} cuotas generadas para ${temporadaMasiva}`);
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>💶 Cuotas · {TEMPORADA_ACTUAL}</h2>
      <div style={{display:"flex",gap:8}}>
        <Btn outline onClick={abrirMasivo}>🧾 Generar cuotas de temporada</Btn>
        <Btn onClick={()=>setModal(true)}>+ Registrar cuota</Btn>
      </div>
    </div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <KPI label="Cobrado" value={fmt(cobradas)} color={C.verde} icon="✅"/>
      <KPI label="Pendiente" value={fmt(pendiente)} color={C.oro} icon="⏳"/>
      <KPI label="Morosos" value={socios.filter(s=>s.estado==="activo").filter(s=>!TARIFAS_GRATIS.includes(tarifaParaSocio(s))).filter(s=>!cuotas.some(c=>c.socio_id===s.id&&c.temporada===TEMPORADA_ACTUAL&&c.pagado)).length} color={C.rojo} icon="⚠️"/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {["todos","pagadas","pendientes"].map(f=>(
        <button key={f} onClick={()=>setFiltro(f)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtro===f?C.granate:"#f0f0f0",color:filtro===f?C.blanco:C.gris,fontFamily:"inherit"}}>
          {f==="todos"?"Todas":f==="pagadas"?"Pagadas":"Pendientes"}
        </button>
      ))}
    </div>
    <Card style={{padding:0}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Socio","Temporada","Importe","Forma pago","Fecha pago","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filtradas.map(c=>{
              const s=getSocio(c.socio_id);
              return(<tr key={c.id}>
                <TD style={{fontWeight:600}}>{s?`${s.nombre} ${s.apellidos}`:"—"}<br/><span style={{fontSize:11,color:C.muted}}>{s?.numero}</span></TD>
                <TD style={{fontFamily:"monospace",fontSize:12,color:C.gris}}>{c.temporada}</TD>
                <TD style={{fontWeight:700,color:c.pagado?C.verde:C.oro}}>{Number(c.importe)===0?"Gratis":fmt(c.importe)}</TD>
                <TD>{c.forma_pago||"—"}</TD>
                <TD>{c.fecha_pago?fmtFecha(c.fecha_pago):"—"}</TD>
                <TD>{c.pagado?<Pill text="✓ Pagada" color={C.verde} bg={C.verdeLight}/>:<Pill text="⏳ Pendiente" color={C.oro} bg={C.oroLight}/>}</TD>
                <TD>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {!c.pagado&&Number(c.importe)>0&&<Btn small color={C.verde} onClick={()=>marcarPagado(c.id)} disabled={procesando===c.id}>{procesando===c.id?"...":"✓ Cobrada"}</Btn>}
                    {c.pagado&&<button onClick={()=>deshacerPago(c)} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:11,fontFamily:"inherit"}}>↩️ Deshacer</button>}
                    <button onClick={()=>eliminarCuota(c)} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:11,fontFamily:"inherit"}}>🗑️</button>
                  </div>
                </TD>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>

    <Modal open={modal} onClose={()=>setModal(false)} title="Registrar cuota">
      <Select label="Socio" value={form.socio_id} onChange={v=>setF("socio_id",v)} required
        options={[{value:"",label:"— Selecciona socio —"},...socios.filter(s=>s.estado==="activo").map(s=>({value:s.id,label:`${s.nombre} ${s.apellidos} (${s.numero})`}))]}/>
      <Select label="Tarifa" value={form.categoria} onChange={v=>{
          setF("categoria",v);
          const t=tarifas.find(t=>t.clave===v);
          if(t) setF("importe",t.importe);
        }}
        options={tarifas.length>0
          ? tarifas.map(t=>({value:t.clave,label:`${t.label} — ${fmt(t.importe)}`}))
          : [{value:"nueva_alta",label:"Nueva alta"},{value:"renovacion",label:"Renovación"}]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <Input label="Importe (€)" value={form.importe} onChange={v=>setF("importe",v)} type="number"/>
        <Select label="Forma pago" value={form.forma_pago} onChange={v=>setF("forma_pago",v)} options={["Efectivo","Bizum","Transferencia"]}/>
        <Input label="Fecha pago" value={form.fecha_pago} onChange={v=>setF("fecha_pago",v)} type="date"/>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:16,cursor:"pointer"}}>
        <input type="checkbox" checked={form.pagado} onChange={e=>setF("pagado",e.target.checked)}/> Marcar como ya pagada
      </label>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={guardar} style={{flex:1}}>Guardar</Btn>
      </div>
    </Modal>

    <Modal open={modalMasivo} onClose={()=>setModalMasivo(false)} title="🧾 Generar cuotas de temporada">
      <Input label="Temporada" value={temporadaMasiva} onChange={setTemporadaMasiva}/>
      <p style={{fontSize:12,color:C.muted,marginBottom:10}}>La tarifa se asigna sola por cada socio (General/Niños/Bebé según su edad, u Honorífico si consta como tal). Por defecto vienen marcados los activos que aún no tienen cuota de {TEMPORADA_ACTUAL}.</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8}}>
        <input value={busquedaMasiva} onChange={e=>setBusquedaMasiva(e.target.value)} placeholder="🔍 Buscar..."
          style={{flex:1,padding:"7px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={()=>{
            const activos=socios.filter(s=>s.estado==="activo");
            setSeleccionMasiva(seleccionMasiva.size===activos.length?new Set():new Set(activos.map(s=>s.id)));
          }} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"}}>
          Todos/Ninguno
        </button>
      </div>
      <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{seleccionMasiva.size} seleccionados</div>
      <div style={{maxHeight:220,overflowY:"auto",border:`1.5px solid ${C.border}`,borderRadius:8,padding:8,marginBottom:16}}>
        {socios.filter(s=>s.estado==="activo").filter(s=>`${s.nombre} ${s.apellidos}`.toLowerCase().includes(busquedaMasiva.toLowerCase())).map(s=>{
          const yaExiste=cuotas.some(c=>c.socio_id===s.id&&c.temporada===temporadaMasiva);
          return(
            <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",fontSize:13,cursor:"pointer"}}>
              <input type="checkbox" checked={seleccionMasiva.has(s.id)} onChange={()=>setSeleccionMasiva(prev=>{const n=new Set(prev); n.has(s.id)?n.delete(s.id):n.add(s.id); return n;})} style={{accentColor:C.verde}}/>
              {s.nombre} {s.apellidos} <span style={{color:C.muted,fontSize:11}}>({s.numero}) · {tarifaParaSocio(s)}</span>
              {yaExiste&&<span style={{color:C.oro,fontSize:11}}>· ya tiene cuota {temporadaMasiva}</span>}
            </label>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModalMasivo(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={generarMasivo} style={{flex:1}} disabled={generando||seleccionMasiva.size===0}>{generando?"Generando...":`Generar ${seleccionMasiva.size} cuotas`}</Btn>
      </div>
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// LOTERÍA
// ══════════════════════════════════════════════════════════
function Loteria({socios,loteria,setLoteria,ejercicios,setMovimientos}){
  const [modal,setModal]=useState(false);
  const [modalDevol,setModalDevol]=useState(null); // fila en la que se edita devueltos
  const [devueltosTemp,setDevueltosTemp]=useState("");
  const [filtro,setFiltro]=useState("pendientes");
  const [form,setForm]=useState({socio_id:"",concepto:"Lotería Navidad",decimos_de:"",entregados:1,precio_base:20,recargo:0});
  const [notif,setNotif]=useState(null);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const getSocio=(id)=>socios.find(s=>s.id===Number(id));
  const vendidos=(l)=>Math.max(0,(Number(l.entregados)||0)-(Number(l.devueltos)||0));
  const importeCalc=(l)=>vendidos(l)*((Number(l.precio_base)||0)+(Number(l.recargo)||0));

  const filtradas=loteria.filter(l=>{
    if(filtro==="pagadas") return l.pagado;
    if(filtro==="pendientes") return !l.pagado;
    return true;
  }).sort((a,b)=>a.pagado-b.pagado);

  const cobrado=loteria.filter(l=>l.pagado).reduce((a,l)=>a+Number(l.importe_total||0),0);
  const pendiente=loteria.filter(l=>!l.pagado).reduce((a,l)=>a+importeCalc(l),0);

  // Resumen agregado por peñista
  const resumenPorSocio = Object.values(
    loteria.reduce((acc,l)=>{
      const key=l.socio_id;
      if(!acc[key]) acc[key]={socio_id:key, entregados:0, devueltos:0, vendidos:0, aLiquidar:0, liquidado:0};
      acc[key].entregados+=Number(l.entregados)||0;
      acc[key].devueltos+=Number(l.devueltos)||0;
      acc[key].vendidos+=vendidos(l);
      if(l.pagado) acc[key].liquidado+=Number(l.importe_total||0);
      else acc[key].aLiquidar+=importeCalc(l);
      return acc;
    },{})
  ).sort((a,b)=>b.aLiquidar-a.aLiquidar);

  const guardar=async()=>{
    if(!form.socio_id) return;
    const entregados=Number(form.entregados)||0, precio_base=Number(form.precio_base)||0, recargo=Number(form.recargo)||0;
    const {data,error}=await supabase.from("loteria").insert([{
      socio_id:Number(form.socio_id), concepto:form.concepto, decimos_de:form.decimos_de||null,
      entregados, devueltos:0, precio_base, recargo,
      unidades:entregados, precio_und:precio_base, // se rellenan también las columnas antiguas por compatibilidad
      importe_total:entregados*(precio_base+recargo),
      pagado:false, fecha_pago:null,
    }]).select();
    if(error){ok("❌ Error");return;}
    setLoteria(p=>[...p,...data]);
    setModal(false);
    ok("✅ Lotería repartida");
  };

  const guardarDevueltos=async()=>{
    const l=modalDevol;
    const devueltos=Math.max(0,Math.min(Number(devueltosTemp)||0, l.entregados));
    await supabase.from("loteria").update({devueltos}).eq("id",l.id);
    setLoteria(p=>p.map(x=>x.id===l.id?{...x,devueltos}:x));
    setModalDevol(null);
    ok("✅ Devolución registrada");
  };

  const [procesando,setProcesando]=useState(null);

  const liquidar=async(l)=>{
    if(procesando) return; // evita doble-clic / doble envío
    setProcesando(l.id);
    const importeFinal=importeCalc(l);
    const socio=getSocio(l.socio_id);

    // Crear ingreso automático en Tesorería del ejercicio activo
    const ejercicioActivo=ejercicios.find(e=>e.nombre===TEMPORADA_ACTUAL)||ejercicios[ejercicios.length-1];
    let movimientoId=null;
    if(ejercicioActivo && importeFinal>0){
      const mov={
        tipo:"ingreso",
        concepto:`${l.concepto}${socio?` · ${socio.nombre} ${socio.apellidos}`:""}`,
        categoria: l.concepto.toLowerCase().includes("niño")?"Lotería Niño":"Lotería Navidad",
        importe: importeFinal, fecha: hoy, ejercicio_id: ejercicioActivo.id,
      };
      const {data:movData}=await supabase.from("movimientos_ejercicio").insert([mov]).select();
      if(movData?.[0]){ movimientoId=movData[0].id; setMovimientos(prev=>[...prev,...movData]); }
    }

    await supabase.from("loteria").update({pagado:true,fecha_pago:hoy,importe_total:importeFinal,movimiento_id:movimientoId}).eq("id",l.id);
    setLoteria(p=>p.map(x=>x.id===l.id?{...x,pagado:true,fecha_pago:hoy,importe_total:importeFinal,movimiento_id:movimientoId}:x));
    setProcesando(null);
    ok(`✅ Liquidado · ingreso añadido a Tesorería (${TEMPORADA_ACTUAL})`);
  };

  const deshacerLiquidacion=async(l)=>{
    if(!confirm(`¿Deshacer la liquidación de ${l.concepto}? Se eliminará también el ingreso creado en Tesorería.`)) return;
    if(l.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",l.movimiento_id);
    await supabase.from("loteria").update({pagado:false,fecha_pago:null,movimiento_id:null}).eq("id",l.id);
    setLoteria(p=>p.map(x=>x.id===l.id?{...x,pagado:false,fecha_pago:null,movimiento_id:null}:x));
    if(l.movimiento_id) setMovimientos(prev=>prev.filter(m=>m.id!==l.movimiento_id));
    ok("↩️ Liquidación deshecha");
  };

  const eliminarLoteria=async(l)=>{
    if(!confirm(`¿Eliminar por completo esta entrega de "${l.concepto}"? ${l.movimiento_id?"También se borrará el ingreso de Tesorería asociado.":""}`)) return;
    if(l.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",l.movimiento_id);
    await supabase.from("loteria").delete().eq("id",l.id);
    setLoteria(p=>p.filter(x=>x.id!==l.id));
    if(l.movimiento_id) setMovimientos(prev=>prev.filter(m=>m.id!==l.movimiento_id));
    ok("🗑️ Eliminado");
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>🎟️ Lotería</h2>
      <Btn onClick={()=>setModal(true)}>+ Repartir lotería</Btn>
    </div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <KPI label="Liquidado" value={fmt(cobrado)} color={C.verde} icon="✅"/>
      <KPI label="Pendiente de liquidar" value={fmt(pendiente)} color={C.oro} icon="⏳"/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {["todos","pagadas","pendientes"].map(f=>(
        <button key={f} onClick={()=>setFiltro(f)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtro===f?C.granate:"#f0f0f0",color:filtro===f?C.blanco:C.gris,fontFamily:"inherit"}}>
          {f==="todos"?"Todas":f==="pagadas"?"Liquidadas":"Pendientes"}
        </button>
      ))}
    </div>
    <Card style={{padding:0,marginBottom:28}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Socio","Concepto","Entreg.","Devuel.","Vend.","Precio+Rec.","A liquidar","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filtradas.map(l=>{
              const s=getSocio(l.socio_id);
              return(<tr key={l.id}>
                <TD style={{fontWeight:600}}>{s?`${s.nombre} ${s.apellidos}`:"—"}<br/><span style={{fontSize:11,color:C.muted}}>{s?.numero}</span></TD>
                <TD>{l.concepto}{l.decimos_de?<><br/><span style={{fontSize:11,color:C.muted}}>Décimos de: {l.decimos_de}</span></>:null}</TD>
                <TD style={{fontFamily:"monospace",fontSize:12}}>{l.entregados}</TD>
                <TD style={{fontFamily:"monospace",fontSize:12}}>
                  {l.devueltos}
                  {!l.pagado&&<button onClick={()=>{setModalDevol(l);setDevueltosTemp(String(l.devueltos||0));}} style={{marginLeft:6,background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:11,textDecoration:"underline",fontFamily:"inherit"}}>editar</button>}
                </TD>
                <TD style={{fontFamily:"monospace",fontSize:12,fontWeight:700}}>{vendidos(l)}</TD>
                <TD style={{fontFamily:"monospace",fontSize:12,color:C.gris}}>{fmt(l.precio_base)}+{fmt(l.recargo)}</TD>
                <TD style={{fontWeight:700,color:l.pagado?C.verde:C.oro}}>{fmt(l.pagado?l.importe_total:importeCalc(l))}</TD>
                <TD>{l.pagado?<Pill text="✓ Liquidada" color={C.verde} bg={C.verdeLight}/>:<Pill text="⏳ Pendiente" color={C.oro} bg={C.oroLight}/>}</TD>
                <TD>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {!l.pagado&&<Btn small color={C.verde} onClick={()=>liquidar(l)} disabled={procesando===l.id}>{procesando===l.id?"...":"✓ Liquidar"}</Btn>}
                    {l.pagado&&<button onClick={()=>deshacerLiquidacion(l)} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:11,fontFamily:"inherit"}}>↩️ Deshacer</button>}
                    <button onClick={()=>eliminarLoteria(l)} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:11,fontFamily:"inherit"}}>🗑️</button>
                  </div>
                </TD>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>

    <h3 style={{fontSize:14,fontWeight:700,color:C.gris,marginBottom:10}}>Resumen por peñista</h3>
    <Card style={{padding:0}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Peñista","Entregados","Devueltos","Vendidos","A liquidar","Liquidado"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {resumenPorSocio.map(r=>{
              const s=getSocio(r.socio_id);
              return(<tr key={r.socio_id}>
                <TD style={{fontWeight:600}}>{s?`${s.nombre} ${s.apellidos}`:"—"} <span style={{fontFamily:"monospace",color:C.muted,fontSize:11}}>{s?.numero}</span></TD>
                <TD style={{fontFamily:"monospace"}}>{r.entregados}</TD>
                <TD style={{fontFamily:"monospace"}}>{r.devueltos}</TD>
                <TD style={{fontFamily:"monospace",fontWeight:700}}>{r.vendidos}</TD>
                <TD style={{fontWeight:700,color:C.oro}}>{r.aLiquidar>0?fmt(r.aLiquidar):"—"}</TD>
                <TD style={{fontWeight:700,color:C.verde}}>{r.liquidado>0?fmt(r.liquidado):"—"}</TD>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>

    <Modal open={modal} onClose={()=>setModal(false)} title="Repartir lotería">
      <Select label="Socio" value={form.socio_id} onChange={v=>setF("socio_id",v)} required
        options={[{value:"",label:"— Selecciona socio —"},...socios.filter(s=>s.estado==="activo").map(s=>({value:s.id,label:`${s.nombre} ${s.apellidos} (${s.numero})`}))]}/>
      <Select label="Concepto" value={form.concepto} onChange={v=>setF("concepto",v)} options={["Lotería Navidad","Lotería Niño","Rifa","Otro sorteo"]}/>
      <Input label="Décimos de (opcional)" value={form.decimos_de} onChange={v=>setF("decimos_de",v)} placeholder="Ej: nº de décimo, referencia..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
        <Input label="Entregados" value={form.entregados} onChange={v=>setF("entregados",v)} type="number"/>
        <Input label="Precio base (€)" value={form.precio_base} onChange={v=>setF("precio_base",v)} type="number"/>
        <Input label="Recargo (€)" value={form.recargo} onChange={v=>setF("recargo",v)} type="number"/>
      </div>
      <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Si vende todos: <strong style={{color:C.text}}>{fmt((Number(form.entregados)||0)*((Number(form.precio_base)||0)+(Number(form.recargo)||0)))}</strong> a liquidar</div>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={guardar} style={{flex:1}}>Repartir</Btn>
      </div>
    </Modal>

    <Modal open={!!modalDevol} onClose={()=>setModalDevol(null)} title="Registrar devolución">
      {modalDevol&&(<>
        <p style={{fontSize:13,color:C.gris,marginBottom:14}}>Entregados: <strong>{modalDevol.entregados}</strong></p>
        <Input label="Nº devueltos (no vendidos)" value={devueltosTemp} onChange={setDevueltosTemp} type="number"/>
        <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Vendidos: <strong style={{color:C.text}}>{Math.max(0,modalDevol.entregados-(Number(devueltosTemp)||0))}</strong></div>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setModalDevol(null)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardarDevueltos} style={{flex:1}}>Guardar</Btn>
        </div>
      </>)}
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// ACTIVIDADES
// ══════════════════════════════════════════════════════════
function Actividades({socios,actividades,setActividades,inscripciones,setInscripciones,ejercicios,setMovimientos}){
  const [modal,setModal]=useState(false);
  const [editando,setEditando]=useState(null);
  const [verInscritos,setVerInscritos]=useState(null); // actividad seleccionada
  const [notif,setNotif]=useState(null);
  const [form,setForm]=useState({nombre:"",fecha:"",fecha_texto:"",tipo:"autocar",coste:0,precio_socio:0,plazas:50,responsable:"",descripcion:""});
  const [avisarEmail,setAvisarEmail]=useState(true);
  const [seleccionEmail,setSeleccionEmail]=useState(new Set());
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const tipoIcon={autocar:"🚌",cena:"🍽️",excursion:"🏔️",reunion:"📋",sorteo:"🎰",otro:"📌"};

  const getSocio=(id)=>socios.find(s=>s.id===id);
  const inscritosDe=(actividadId)=>inscripciones.filter(i=>i.actividad_id===actividadId && i.estado!=="cancelada");

  const abrirNueva=()=>{
    setEditando(null);
    setForm({nombre:"",fecha:"",fecha_texto:"",tipo:"autocar",coste:0,precio_socio:0,plazas:50,responsable:"",descripcion:""});
    setAvisarEmail(true);
    setSeleccionEmail(new Set());
    setModal(true);
  };

  const abrirEditar=(a)=>{
    setEditando(a);
    setForm({nombre:a.nombre,fecha:a.fecha||"",fecha_texto:a.fecha_texto||"",tipo:a.tipo,coste:a.coste||0,precio_socio:a.precio_socio||0,plazas:a.plazas||0,responsable:a.responsable||"",descripcion:a.descripcion||""});
    setModal(true);
  };

  const [enviandoAviso,setEnviandoAviso]=useState(false);

  const guardar=async()=>{
    if(!form.nombre) return;
    if(editando){
      const {error}=await supabase.from("actividades").update(form).eq("id",editando.id);
      if(error){ok("❌ Error");return;}
      setActividades(p=>p.map(a=>a.id===editando.id?{...a,...form}:a));
      ok("✅ Actividad actualizada");
    }else{
      const {data,error}=await supabase.from("actividades").insert([form]).select();
      if(error){ok("❌ Error");return;}
      setActividades(p=>[...p,...data]);
      const destinatariosFinal=destinatariosMayores14(socios).filter(s=>seleccionEmail.has(s.id));
      if(avisarEmail && destinatariosFinal.length>0){
        setEnviandoAviso(true);
        const detalles=[
          form.fecha_texto||fmtFecha(form.fecha),
          form.precio_socio>0?`Precio: ${fmt(form.precio_socio)}/persona`:"Actividad gratuita",
          form.plazas?`${form.plazas} plazas disponibles`:null,
        ].filter(Boolean).join(" · ");
        const enviados=await enviarEmailMasivo(destinatariosFinal, `La Rana Mecánica · Nueva actividad: ${form.nombre}`,
          (s)=>`Hola ${s.nombre},\n\nSe ha publicado una nueva actividad en la peña:\n\n🐸 ${form.nombre}\n${detalles}\n${form.descripcion?"\n"+form.descripcion+"\n":""}\nPuedes apuntarte desde Mi Zona:\nhttps://reylagarto90.github.io/rana-mecanica/#/mi-zona\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`);
        await supabase.from("actividades").update({aviso_enviados:enviados,aviso_total:destinatariosFinal.length}).eq("id",data[0].id);
        setActividades(p=>p.map(a=>a.id===data[0].id?{...a,aviso_enviados:enviados,aviso_total:destinatariosFinal.length}:a));
        setEnviandoAviso(false);
        ok(`✅ Actividad creada · aviso enviado a ${enviados}/${destinatariosFinal.length} peñistas`);
        setModal(false); setEditando(null);
        return;
      }
      ok("✅ Actividad creada");
    }
    setModal(false);
    setEditando(null);
  };

  const eliminarActividad=async(a)=>{
    const inscritos=inscritosDe(a.id);
    if(!confirm(`¿Eliminar la actividad "${a.nombre}"? Se borrarán también sus ${inscritos.length} inscripciones${inscritos.some(i=>i.movimiento_id)?" y los ingresos de Tesorería ya generados por sus pagos":""}.`)) return;
    for(const i of inscritos){
      if(i.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",i.movimiento_id);
    }
    await supabase.from("inscripciones").delete().eq("actividad_id",a.id);
    await supabase.from("actividades").delete().eq("id",a.id);
    setActividades(p=>p.filter(x=>x.id!==a.id));
    setInscripciones(prev=>prev.filter(i=>i.actividad_id!==a.id));
    const idsMovBorrados=inscritos.filter(i=>i.movimiento_id).map(i=>i.movimiento_id);
    if(idsMovBorrados.length) setMovimientos(prev=>prev.filter(m=>!idsMovBorrados.includes(m.id)));
    ok("🗑️ Actividad eliminada");
  };

  const [procesandoPago,setProcesandoPago]=useState(null);

  const marcarPagado=async(inscripcion,actividad)=>{
    if(procesandoPago) return;
    setProcesandoPago(inscripcion.id);
    const socio=getSocio(inscripcion.socio_id);
    const importe=Number(actividad.precio_socio)||0;
    let movimientoId=null;
    if(importe>0){
      const ejercicioActivo=ejercicios.find(e=>e.nombre===TEMPORADA_ACTUAL)||ejercicios[ejercicios.length-1];
      if(ejercicioActivo){
        const mov={
          tipo:"ingreso",
          concepto:`${actividad.nombre}${socio?` · ${socio.nombre} ${socio.apellidos}`:""}`,
          categoria:"Actividades",
          importe, fecha:hoy, ejercicio_id:ejercicioActivo.id,
        };
        const {data:movData}=await supabase.from("movimientos_ejercicio").insert([mov]).select();
        if(movData?.[0]){ movimientoId=movData[0].id; setMovimientos(prev=>[...prev,...movData]); }
      }
    }
    await supabase.from("inscripciones").update({pagado:true,fecha_pago:hoy,movimiento_id:movimientoId}).eq("id",inscripcion.id);
    setInscripciones(prev=>prev.map(i=>i.id===inscripcion.id?{...i,pagado:true,fecha_pago:hoy,movimiento_id:movimientoId}:i));
    setProcesandoPago(null);
    ok(`✅ Pago registrado${importe>0?" · ingreso añadido a Tesorería":""}`);
  };

  const deshacerPagoActividad=async(inscripcion)=>{
    if(!confirm("¿Deshacer este pago? Se eliminará también el ingreso creado en Tesorería.")) return;
    if(inscripcion.movimiento_id) await supabase.from("movimientos_ejercicio").delete().eq("id",inscripcion.movimiento_id);
    await supabase.from("inscripciones").update({pagado:false,fecha_pago:null,movimiento_id:null}).eq("id",inscripcion.id);
    setInscripciones(prev=>prev.map(i=>i.id===inscripcion.id?{...i,pagado:false,fecha_pago:null,movimiento_id:null}:i));
    if(inscripcion.movimiento_id) setMovimientos(prev=>prev.filter(m=>m.id!==inscripcion.movimiento_id));
    ok("↩️ Pago deshecho");
  };

  const confirmarPlaza=async(inscripcion)=>{
    await supabase.from("inscripciones").update({estado:"confirmada"}).eq("id",inscripcion.id);
    setInscripciones(prev=>prev.map(i=>i.id===inscripcion.id?{...i,estado:"confirmada"}:i));
    ok("✅ Plaza confirmada");
  };

  const quitarConfirmacion=async(inscripcion)=>{
    await supabase.from("inscripciones").update({estado:"pendiente"}).eq("id",inscripcion.id);
    setInscripciones(prev=>prev.map(i=>i.id===inscripcion.id?{...i,estado:"pendiente"}:i));
    ok("Vuelta a pendiente");
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>📅 Actividades · {TEMPORADA_ACTUAL}</h2>
      <Btn onClick={abrirNueva}>+ Nueva actividad</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
      {actividades.sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||"")).map(a=>{
        const inscritos=inscritosDe(a.id);
        const pagados=inscritos.filter(i=>i.pagado).length;
        return(
        <Card key={a.id} style={{borderTop:`4px solid ${a.fecha&&a.fecha<hoy?C.gris:C.granate}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:24}}>{tipoIcon[a.tipo]||"📌"}</span>
            <Pill text={a.fecha&&a.fecha<hoy?"Realizada":"Próxima"} color={a.fecha&&a.fecha<hoy?C.gris:C.azul} bg={a.fecha&&a.fecha<hoy?"#f0f0f0":C.azulLight}/>
          </div>
          <h3 style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:6}}>{a.nombre}</h3>
          <p style={{fontSize:12,color:C.muted,marginBottom:8}}>{a.fecha_texto||fmtFecha(a.fecha)}</p>
          {a.descripcion&&<p style={{fontSize:12,color:C.gris,marginBottom:8,fontStyle:"italic"}}>{a.descripcion}</p>}
          {a.precio_socio>0&&<div style={{fontSize:12,color:C.gris,marginBottom:8}}>💶 {fmt(a.precio_socio)}/persona · 🏟️ {a.plazas} plazas</div>}
          {a.aviso_total!=null&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>📧 aviso enviado a {a.aviso_enviados}/{a.aviso_total}</div>}
          <button onClick={()=>setVerInscritos(a)} style={{width:"100%",padding:"8px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",color:C.text,marginBottom:8}}>
            👥 {inscritos.length} apuntados{a.precio_socio>0?` · ${pagados} pagado${pagados===1?"":"s"}`:""}
          </button>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <button onClick={()=>abrirEditar(a)} style={{flex:1,padding:"7px",background:C.blanco,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.text}}>✏️ Editar</button>
            <button onClick={()=>eliminarActividad(a)} style={{flex:1,padding:"7px",background:C.rojoLight,border:`1px solid ${C.rojo}40`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.rojo}}>🗑️ Eliminar</button>
          </div>
          <BotonWhatsApp style={{width:"100%",justifyContent:"center"}} texto={`🐸 Nueva actividad en La Rana Mecánica:\n\n*${a.nombre}*\n📅 ${a.fecha_texto||fmtFecha(a.fecha)}\n${a.precio_socio>0?`💶 ${fmt(a.precio_socio)}/persona`:"Gratuita"}\n\nApúntate desde Mi Zona:\nhttps://reylagarto90.github.io/rana-mecanica/#/mi-zona`}/>
        </Card>
      );})}
    </div>

    <Modal open={modal} onClose={()=>{setModal(false);setEditando(null);}} title={editando?"Editar actividad":"Nueva actividad"} width={560}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <Input label="Nombre" value={form.nombre} onChange={v=>setF("nombre",v)} required/>
        <Input label="Fecha" value={form.fecha} onChange={v=>setF("fecha",v)} type="date"/>
        <Input label="Texto de fecha (opcional)" value={form.fecha_texto} onChange={v=>setF("fecha_texto",v)} placeholder="Ej: Agosto · Día 22"/>
        <Select label="Tipo" value={form.tipo} onChange={v=>setF("tipo",v)} options={["autocar","cena","excursion","reunion","sorteo","otro"].map(t=>({value:t,label:tipoIcon[t]+" "+t}))}/>
        <Input label="Precio socio (€)" value={form.precio_socio} onChange={v=>setF("precio_socio",v)} type="number"/>
        <Input label="Plazas" value={form.plazas} onChange={v=>setF("plazas",v)} type="number"/>
        <Input label="Responsable" value={form.responsable} onChange={v=>setF("responsable",v)}/>
      </div>
      <Input label="Descripción" value={form.descripcion} onChange={v=>setF("descripcion",v)}/>
      {!editando&&(
        <SelectorEmail socios={socios} habilitado={avisarEmail} setHabilitado={setAvisarEmail} seleccion={seleccionEmail} setSeleccion={setSeleccionEmail}/>
      )}
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>{setModal(false);setEditando(null);}} style={{flex:1}} disabled={enviandoAviso}>Cancelar</Btn>
        <Btn onClick={guardar} style={{flex:1}} disabled={enviandoAviso}>{enviandoAviso?"Enviando aviso...":editando?"Guardar cambios":"Crear actividad"}</Btn>
      </div>
    </Modal>

    <Modal open={!!verInscritos} onClose={()=>setVerInscritos(null)} title={verInscritos?`👥 Apuntados · ${verInscritos.nombre}`:""} width={560}>
      {verInscritos&&(()=>{
        const inscritos=inscritosDe(verInscritos.id);
        return(<div>
          {inscritos.length===0?(
            <p style={{color:C.muted,fontSize:13,marginBottom:10}}>Todavía no se ha apuntado nadie.</p>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
              {inscritos.map(i=>{
                const s=getSocio(i.socio_id);
                return(
                  <div key={i.id} style={{display:"flex",flexDirection:"column",gap:6,padding:"9px 12px",background:C.grisLight,borderRadius:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{s?`${s.nombre} ${s.apellidos}`:"—"}</div>
                        <div style={{fontSize:11,color:C.muted}}>{s?.numero}</div>
                      </div>
                      {verInscritos.precio_socio>0?(
                        i.pagado?
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <Pill text="✓ Pagado" color={C.verde} bg={C.verdeLight}/>
                            <button onClick={()=>deshacerPagoActividad(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:11,fontFamily:"inherit"}}>↩️</button>
                          </div>
                        :<Btn small color={C.verde} onClick={()=>marcarPagado(i,verInscritos)} disabled={procesandoPago===i.id}>{procesandoPago===i.id?"...":"✓ Marcar pagado"}</Btn>
                      ):(
                        <Pill text="Gratuita" color={C.gris} bg="#eee"/>
                      )}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:6,borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:11,color:C.muted}}>Plaza:</span>
                      {i.estado==="confirmada"?(
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <Pill text="✅ Confirmada" color={C.verde} bg={C.verdeLight}/>
                          <button onClick={()=>quitarConfirmacion(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.azul,fontSize:11,fontFamily:"inherit"}}>↩️</button>
                        </div>
                      ):(
                        <Btn small outline onClick={()=>confirmarPlaza(i)}>✅ Confirmar plaza</Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{fontSize:12,color:C.muted,textAlign:"right"}}>{inscritos.length} apuntados{verInscritos.plazas?` / ${verInscritos.plazas} plazas`:""}</div>
        </div>);
      })()}
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// NOTICIAS
// ══════════════════════════════════════════════════════════
function Noticias({noticias,setNoticias,socios}){
  const [modal,setModal]=useState(false);
  const [publicando,setPublicando]=useState(false);
  const [form,setForm]=useState({titulo:"",cuerpo:""});
  const [enviarEmail,setEnviarEmail]=useState(true);
  const [seleccionEmail,setSeleccionEmail]=useState(new Set());
  const [archivo,setArchivo]=useState(null);
  const [notif,setNotif]=useState(null);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),4000);};

  const destinatariosElegibles = destinatariosMayores14(socios);
  const destinatariosFinal = destinatariosElegibles.filter(s=>seleccionEmail.has(s.id));

  const guardar=async()=>{
    if(!form.titulo||!form.cuerpo) return;
    setPublicando(true);

    let adjunto_url=null, adjunto_path=null, adjunto_nombre=null;
    if(archivo){
      const ext=archivo.name.split(".").pop();
      const nombreArchivo=`${crypto.randomUUID()}.${ext}`;
      const {error:errSubida}=await supabase.storage.from("noticias").upload(nombreArchivo,archivo,{contentType:archivo.type});
      if(errSubida){ ok("❌ Error subiendo el adjunto"); setPublicando(false); return; }
      const {data:firmada}=await supabase.storage.from("noticias").createSignedUrl(nombreArchivo,60*60*24*365*2);
      adjunto_url=firmada?.signedUrl||null; adjunto_path=nombreArchivo; adjunto_nombre=archivo.name;
    }

    let enviados=0;
    if(enviarEmail && destinatariosFinal.length>0){
      const enlaceAdjunto = adjunto_url ? `\n\nDocumento adjunto:\n${adjunto_url}` : "";
      enviados = await enviarEmailMasivo(destinatariosFinal, `La Rana Mecánica · ${form.titulo}`,
        (s)=>`Hola ${s.nombre},\n\n${form.cuerpo}${enlaceAdjunto}\n\nPara cualquier consulta: penyaranamecanica@gmail.com\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`);
    }

    const {data,error}=await supabase.from("noticias").insert([{
      titulo:form.titulo, cuerpo:form.cuerpo, adjunto_url, adjunto_path, adjunto_nombre,
      enviado_email:enviarEmail, destinatarios_count:enviados, total_destinatarios:destinatariosFinal.length,
    }]).select();
    setPublicando(false);
    if(error){ok("❌ Error al publicar");return;}
    setNoticias(p=>[...data,...p]);
    setModal(false);
    setForm({titulo:"",cuerpo:""});
    setEnviarEmail(true);
    setSeleccionEmail(new Set());
    setArchivo(null);
    ok(`✅ Publicada${enviarEmail?` · email enviado a ${enviados}/${destinatariosFinal.length} peñistas`:""}`);
  };

  const eliminar=async(n)=>{
    if(!confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return;
    if(n.adjunto_path) await supabase.storage.from("noticias").remove([n.adjunto_path]);
    await supabase.from("noticias").delete().eq("id",n.id);
    setNoticias(p=>p.filter(x=>x.id!==n.id));
    ok("🗑️ Eliminada");
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,maxWidth:320}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>📢 Noticias</h2>
      <Btn onClick={()=>setModal(true)}>+ Publicar noticia</Btn>
    </div>
    <p style={{fontSize:12,color:C.muted,marginBottom:18}}>El email se envía solo a socios de 14 años o más, con email registrado y que han dado su consentimiento para comunicaciones de la peña ({destinatariosElegibles.length} cumplen los requisitos ahora mismo; puedes elegir a cuáles se lo mandas al publicar).</p>

    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {noticias.length===0&&<p style={{color:C.muted,fontSize:13}}>Todavía no hay noticias publicadas.</p>}
      {noticias.map(n=>(
        <Card key={n.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{n.titulo}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                {new Date(n.created_at).toLocaleDateString("es-ES")}
                {n.enviado_email&&<> · 📧 enviados {n.destinatarios_count}/{n.total_destinatarios||n.destinatarios_count}</>}
              </div>
              <p style={{fontSize:13,color:C.gris,marginTop:8,whiteSpace:"pre-wrap"}}>{n.cuerpo}</p>
              {n.adjunto_url&&<a href={n.adjunto_url} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:8,padding:"6px 12px",background:C.grisLight,borderRadius:8,fontSize:12,fontWeight:600,color:C.text,textDecoration:"none"}}>📎 {n.adjunto_nombre||"Ver adjunto"}</a>}
              <div style={{marginTop:10}}>
                <BotonWhatsApp texto={`🐸 *${n.titulo}*\n\n${n.cuerpo}${n.adjunto_url?`\n\n${n.adjunto_url}`:""}\n\nMás en Mi Zona: https://reylagarto90.github.io/rana-mecanica/#/mi-zona`}/>
              </div>
            </div>
            <button onClick={()=>eliminar(n)} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:16,flexShrink:0}}>🗑️</button>
          </div>
        </Card>
      ))}
    </div>

    <Modal open={modal} onClose={()=>setModal(false)} title="📢 Publicar noticia">
      <Input label="Título" value={form.titulo} onChange={v=>setF("titulo",v)} required/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>Contenido</label>
        <textarea value={form.cuerpo} onChange={e=>setF("cuerpo",e.target.value)} rows={5}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>Adjuntar documentación (opcional)</label>
        <input type="file" onChange={e=>setArchivo(e.target.files?.[0]||null)}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>
      <SelectorEmail socios={socios} habilitado={enviarEmail} setHabilitado={setEnviarEmail} seleccion={seleccionEmail} setSeleccion={setSeleccionEmail}/>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={guardar} style={{flex:1}} disabled={publicando}>{publicando?"Publicando...":"Publicar"}</Btn>
      </div>
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// ACTAS
// ══════════════════════════════════════════════════════════
function Actas({actas,setActas,socios}){
  const [modal,setModal]=useState(false);
  const [subiendo,setSubiendo]=useState(false);
  const [form,setForm]=useState({titulo:"",fecha:hoy,resumen:""});
  const [enviarEmail,setEnviarEmail]=useState(false);
  const [seleccionEmail,setSeleccionEmail]=useState(new Set());
  const [archivo,setArchivo]=useState(null);
  const [notif,setNotif]=useState(null);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),4000);};

  const destinatariosElegibles = destinatariosMayores14(socios);
  const destinatariosFinal = destinatariosElegibles.filter(s=>seleccionEmail.has(s.id));

  const guardar=async()=>{
    if(!form.titulo||!form.fecha) return;
    setSubiendo(true);
    let pdf_url=null, pdf_path=null;
    if(archivo){
      const nombreArchivo=`${crypto.randomUUID()}.pdf`;
      const {error:errSubida}=await supabase.storage.from("actas").upload(nombreArchivo,archivo,{contentType:"application/pdf"});
      if(errSubida){ ok("❌ Error subiendo el PDF"); setSubiendo(false); return; }
      const {data:firmada}=await supabase.storage.from("actas").createSignedUrl(nombreArchivo,60*60*24*365*2); // 2 años
      pdf_url=firmada?.signedUrl||null; pdf_path=nombreArchivo;
    }
    let enviados=0;
    if(enviarEmail && destinatariosFinal.length>0){
      const enlace = pdf_url ? `\n\nPDF del acta:\n${pdf_url}` : "";
      enviados = await enviarEmailMasivo(destinatariosFinal, `La Rana Mecánica · Nueva acta: ${form.titulo}`,
        (s)=>`Hola ${s.nombre},\n\nSe ha publicado una nueva acta:\n\n📜 ${form.titulo} (${fmtFecha(form.fecha)})\n${form.resumen?"\n"+form.resumen+"\n":""}${enlace}\n\nPuedes consultarla en Mi Zona:\nhttps://reylagarto90.github.io/rana-mecanica/#/mi-zona\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`);
    }
    const {data,error}=await supabase.from("actas").insert([{...form,pdf_url,pdf_path}]).select();
    setSubiendo(false);
    if(error){ok("❌ Error al guardar el acta");return;}
    setActas(p=>[...data,...p]);
    setModal(false);
    setForm({titulo:"",fecha:hoy,resumen:""});
    setEnviarEmail(false);
    setSeleccionEmail(new Set());
    setArchivo(null);
    ok(`✅ Acta publicada${enviarEmail?` · email enviado a ${enviados}/${destinatariosFinal.length}`:""}`);
  };

  const eliminar=async(a)=>{
    if(!confirm(`¿Eliminar el acta "${a.titulo}"?`)) return;
    if(a.pdf_path) await supabase.storage.from("actas").remove([a.pdf_path]);
    await supabase.from("actas").delete().eq("id",a.id);
    setActas(p=>p.filter(x=>x.id!==a.id));
    ok("🗑️ Acta eliminada");
  };

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>📜 Actas de la peña</h2>
      <Btn onClick={()=>setModal(true)}>+ Nueva acta</Btn>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {actas.length===0&&<p style={{color:C.muted,fontSize:13}}>Todavía no hay actas publicadas.</p>}
      {actas.sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).map(a=>(
        <Card key={a.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{a.titulo}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{fmtFecha(a.fecha)}</div>
              {a.resumen&&<p style={{fontSize:13,color:C.gris,marginTop:8}}>{a.resumen}</p>}
              <div style={{marginTop:10}}>
                <BotonWhatsApp texto={`📜 Nueva acta publicada: *${a.titulo}* (${fmtFecha(a.fecha)})${a.resumen?`\n\n${a.resumen}`:""}${a.pdf_url?`\n\n${a.pdf_url}`:""}\n\nConsúltala en Mi Zona: https://reylagarto90.github.io/rana-mecanica/#/mi-zona`}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              {a.pdf_url&&<a href={a.pdf_url} target="_blank" rel="noreferrer" style={{padding:"7px 12px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,fontWeight:600,color:C.text,textDecoration:"none"}}>📄 PDF</a>}
              <button onClick={()=>eliminar(a)} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:16}}>🗑️</button>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Modal open={modal} onClose={()=>setModal(false)} title="📜 Nueva acta">
      <Input label="Título" value={form.titulo} onChange={v=>setF("titulo",v)} placeholder="Ej: Asamblea General Ordinaria" required/>
      <Input label="Fecha" value={form.fecha} onChange={v=>setF("fecha",v)} type="date" required/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>Resumen (opcional, se lee en Mi Zona sin descargar nada)</label>
        <textarea value={form.resumen} onChange={e=>setF("resumen",e.target.value)} rows={4}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>PDF del acta original (opcional)</label>
        <input type="file" accept="application/pdf" onChange={e=>setArchivo(e.target.files?.[0]||null)}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>
      <SelectorEmail socios={socios} habilitado={enviarEmail} setHabilitado={setEnviarEmail} seleccion={seleccionEmail} setSeleccion={setSeleccionEmail}/>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={guardar} style={{flex:1}} disabled={subiendo}>{subiendo?"Publicando...":"Publicar acta"}</Btn>
      </div>
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// AUDITORÍA
// ══════════════════════════════════════════════════════════
function Auditoria(){
  const [registros,setRegistros]=useState([]);
  const [cargando,setCargando]=useState(true);
  const [filtroTabla,setFiltroTabla]=useState("todas");
  const [filtroOp,setFiltroOp]=useState("todas");
  const [expandido,setExpandido]=useState(null);

  useEffect(()=>{
    (async()=>{
      setCargando(true);
      const {data}=await supabase.from("auditoria").select("*").order("created_at",{ascending:false}).limit(500);
      setRegistros(data||[]);
      setCargando(false);
    })();
  },[]);

  const tablasDisponibles=[...new Set(registros.map(r=>r.tabla))].sort();

  const filtrados=registros.filter(r=>{
    if(filtroTabla!=="todas"&&r.tabla!==filtroTabla) return false;
    if(filtroOp!=="todas"&&r.operacion!==filtroOp) return false;
    return true;
  });

  const opIcon={INSERT:"➕",UPDATE:"✏️",DELETE:"🗑️"};
  const opColor={INSERT:C.verde,UPDATE:C.azul,DELETE:C.rojo};

  return(<div>
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:6}}>🔍 Auditoría</h2>
    <p style={{fontSize:12,color:C.muted,marginBottom:18}}>Registro automático de todos los cambios en la base de datos (últimos 500). Las acciones hechas sin sesión (ej. un peñista apuntándose por teléfono) no llevan email asociado.</p>

    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <select value={filtroTabla} onChange={e=>setFiltroTabla(e.target.value)}
        style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.blanco}}>
        <option value="todas">Todas las tablas</option>
        {tablasDisponibles.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filtroOp} onChange={e=>setFiltroOp(e.target.value)}
        style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.blanco}}>
        <option value="todas">Todas las acciones</option>
        <option value="INSERT">➕ Creaciones</option>
        <option value="UPDATE">✏️ Ediciones</option>
        <option value="DELETE">🗑️ Borrados</option>
      </select>
    </div>

    {cargando?(
      <p style={{color:C.muted,fontSize:13}}>Cargando...</p>
    ):(
      <Card style={{padding:0}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Fecha","Tabla","Acción","Quién",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {filtrados.map(r=>(
                <Fragment key={r.id}>
                  <tr onClick={()=>setExpandido(expandido===r.id?null:r.id)} style={{cursor:"pointer"}}>
                    <TD style={{fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>{new Date(r.created_at).toLocaleString("es-ES")}</TD>
                    <TD style={{fontWeight:600,fontSize:12}}>{r.tabla}</TD>
                    <TD><Pill text={`${opIcon[r.operacion]||""} ${r.operacion}`} color={opColor[r.operacion]||C.gris} bg={C.grisLight}/></TD>
                    <TD style={{fontSize:12}}>{r.usuario_email||<span style={{color:C.muted,fontStyle:"italic"}}>sin sesión</span>}</TD>
                    <TD style={{fontSize:11,color:C.azul}}>{expandido===r.id?"▲ ocultar":"▼ ver datos"}</TD>
                  </tr>
                  {expandido===r.id&&(
                    <tr>
                      <td colSpan={5} style={{padding:"10px 16px",background:C.grisLight}}>
                        {r.datos_anteriores&&(
                          <div style={{marginBottom:8}}>
                            <div style={{fontSize:11,fontWeight:700,color:C.rojo,marginBottom:4}}>ANTES</div>
                            <pre style={{fontSize:11,whiteSpace:"pre-wrap",wordBreak:"break-all",background:C.blanco,padding:8,borderRadius:6,margin:0}}>{JSON.stringify(r.datos_anteriores,null,2)}</pre>
                          </div>
                        )}
                        {r.datos_nuevos&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:C.verde,marginBottom:4}}>DESPUÉS</div>
                            <pre style={{fontSize:11,whiteSpace:"pre-wrap",wordBreak:"break-all",background:C.blanco,padding:8,borderRadius:6,margin:0}}>{JSON.stringify(r.datos_nuevos,null,2)}</pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length===0&&<p style={{padding:16,color:C.muted,fontSize:13}}>Sin registros para este filtro.</p>}
      </Card>
    )}
  </div>);
}

// ══════════════════════════════════════════════════════════
// TESORERÍA (simplificada, datos de Supabase)
// ══════════════════════════════════════════════════════════
function Tesoreria({ejercicios,setEjercicios,movimientos,setMovimientos}){
  const [ejId,setEjId]=useState(ejercicios[ejercicios.length-1]?.id);
  const [modal,setModal]=useState(null);
  const [modalNuevoEj,setModalNuevoEj]=useState(false);
  const [form,setForm]=useState({tipo:"ingreso",concepto:"",categoria:"Cuotas socios",importe:"",fecha:hoy,observaciones:""});
  const [formNuevoEj,setFormNuevoEj]=useState({nombre:"",ejercicioBaseId:"",incluirRemanente:true});
  const [notif,setNotif]=useState(null);
  const [categoriasAbiertas,setCategoriasAbiertas]=useState(new Set());
  const toggleCategoria=(cat)=>setCategoriasAbiertas(prev=>{const n=new Set(prev); n.has(cat)?n.delete(cat):n.add(cat); return n;});
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setFNE=(k,v)=>setFormNuevoEj(f=>({...f,[k]:v}));
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const ej=ejercicios.find(e=>e.id===ejId)||ejercicios[0];

  const calcularResultado=(ejercicioId)=>{
    const movs=movimientos.filter(m=>m.ejercicio_id===ejercicioId);
    const ing=movs.filter(m=>m.tipo==="ingreso").reduce((a,m)=>a+Number(m.importe),0);
    const gas=movs.filter(m=>m.tipo==="gasto").reduce((a,m)=>a+Number(m.importe),0);
    return ing-gas;
  };

  const abrirNuevoEjercicio=()=>{
    const ultimo=ejercicios[ejercicios.length-1];
    setFormNuevoEj({nombre:"",ejercicioBaseId:ultimo?.id||"",incluirRemanente:true});
    setModalNuevoEj(true);
  };

  const crearEjercicio=async()=>{
    if(!formNuevoEj.nombre.trim()){ok("❌ Ponle un nombre al ejercicio (p.ej. 2026/2027)");return;}
    if(ejercicios.some(e=>e.nombre.trim().toLowerCase()===formNuevoEj.nombre.trim().toLowerCase())){ok("❌ Ya existe un ejercicio con ese nombre");return;}

    const {data:nuevo,error}=await supabase.from("ejercicios").insert([{nombre:formNuevoEj.nombre.trim()}]).select();
    if(error||!nuevo?.[0]){ok("❌ Error al crear el ejercicio");return;}
    const nuevoEj=nuevo[0];
    setEjercicios(prev=>[...prev,nuevoEj]);

    // Traspaso automático del remanente del ejercicio anterior seleccionado
    if(formNuevoEj.incluirRemanente && formNuevoEj.ejercicioBaseId){
      const base=ejercicios.find(e=>e.id===Number(formNuevoEj.ejercicioBaseId)||e.id===formNuevoEj.ejercicioBaseId);
      const resultado=calcularResultado(base?.id);
      if(base && resultado!==0){
        const movRemanente={
          tipo: resultado>=0?"ingreso":"gasto",
          concepto: `Remanente ejercicio ${base.nombre}`,
          categoria: resultado>=0?"Remanente ejercicio anterior":"Otros gastos",
          importe: Math.abs(resultado),
          fecha: hoy,
          ejercicio_id: nuevoEj.id,
        };
        const {data:movData,error:errMov}=await supabase.from("movimientos_ejercicio").insert([movRemanente]).select();
        if(!errMov && movData) setMovimientos(prev=>[...prev,...movData]);
      }
    }

    setEjId(nuevoEj.id);
    setModalNuevoEj(false);
    ok(`✅ Ejercicio ${nuevoEj.nombre} creado`);
  };

  if(!ej) return(<div>
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:16}}>📒 Tesorería</h2>
    <p style={{marginBottom:16,color:C.muted}}>Sin ejercicios todavía.</p>
    <Btn onClick={abrirNuevoEjercicio}>+ Crear primer ejercicio</Btn>
    <Modal open={modalNuevoEj} onClose={()=>setModalNuevoEj(false)} title="🗓️ Nuevo ejercicio contable">
      <Input label="Nombre del ejercicio" value={formNuevoEj.nombre} onChange={v=>setFNE("nombre",v)} placeholder="2026/2027" required/>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModalNuevoEj(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={crearEjercicio} style={{flex:1}}>Crear</Btn>
      </div>
    </Modal>
  </div>);

  const movEj=movimientos.filter(m=>m.ejercicio_id===ej.id);
  const ingresos=movEj.filter(m=>m.tipo==="ingreso").reduce((a,m)=>a+Number(m.importe),0);
  const gastos=movEj.filter(m=>m.tipo==="gasto").reduce((a,m)=>a+Number(m.importe),0);
  const resultado=ingresos-gastos;

  const guardar=async()=>{
    if(!form.concepto||!form.importe) return;
    const {data,error}=await supabase.from("movimientos_ejercicio").insert([{...form,ejercicio_id:ej.id,importe:Number(form.importe)}]).select();
    if(error){ok("❌ Error");return;}
    setMovimientos(p=>[...p,...data]);
    setModal(null);
    ok("✅ Movimiento registrado");
  };

  const eliminarMovimiento=async(m)=>{
    if(!confirm(`¿Eliminar este ${m.tipo} de "${m.concepto}" (${fmt(m.importe)})? Los totales se recalculan solos al borrarlo.`)) return;
    await supabase.from("movimientos_ejercicio").delete().eq("id",m.id);
    setMovimientos(prev=>prev.filter(x=>x.id!==m.id));
    ok("🗑️ Movimiento eliminado, totales actualizados");
  };

  const CAT_ING=["Cuotas socios","Patrocinio","Lotería Navidad","Lotería Niño","Venta productos","Remanente ejercicio anterior","Otros ingresos"];
  const CAT_GAS=["Merchandising","Actos y eventos","Lotería (coste)","Diseño y material","Otros gastos"];

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark}}>📒 Tesorería</h2>
      <div style={{display:"flex",gap:8}}>
        <Btn small color={C.verde} onClick={()=>{setModal("ingreso");setForm(f=>({...f,tipo:"ingreso",categoria:CAT_ING[0]}))}}>+ Ingreso</Btn>
        <Btn small color={C.rojo} onClick={()=>{setModal("gasto");setForm(f=>({...f,tipo:"gasto",categoria:CAT_GAS[0]}))}}>+ Gasto</Btn>
      </div>
    </div>

    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
      {ejercicios.map(e=>(
        <button key={e.id} onClick={()=>setEjId(e.id)} style={{padding:"9px 16px",borderRadius:10,border:`2px solid ${ejId===e.id?C.granate:C.border}`,background:ejId===e.id?C.granateLight:C.blanco,cursor:"pointer",fontWeight:700,fontSize:13,color:ejId===e.id?C.granateDark:C.gris,fontFamily:"inherit"}}>
          {e.nombre}
        </button>
      ))}
      <Btn small outline onClick={abrirNuevoEjercicio}>+ Nuevo ejercicio</Btn>
    </div>

    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <KPI label="Ingresos" value={fmt(ingresos)} color={C.verde} icon="📈"/>
      <KPI label="Gastos" value={fmt(gastos)} color={C.rojo} icon="📉"/>
      <KPI label={resultado>=0?"Superávit":"Déficit"} value={`${resultado>=0?"+":""}${fmt(resultado)}`} color={resultado>=0?C.verde:C.rojo} icon={resultado>=0?"✅":"⚠️"}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {["ingreso","gasto"].map(tipo=>{
        const lista=movEj.filter(m=>m.tipo===tipo);
        const total=lista.reduce((a,m)=>a+Number(m.importe),0);
        const color=tipo==="ingreso"?C.verde:C.rojo;

        if(tipo==="ingreso"){
          // Agrupado por categoría, desplegable al pulsar
          const grupos={};
          lista.forEach(m=>{ (grupos[m.categoria||"Sin categoría"]=grupos[m.categoria||"Sin categoría"]||[]).push(m); });
          const categorias=Object.keys(grupos).sort((a,b)=>grupos[b].reduce((s,m)=>s+Number(m.importe),0)-grupos[a].reduce((s,m)=>s+Number(m.importe),0));
          return(<Card key={tipo} style={{padding:0,overflow:"hidden"}}>
            <div style={{background:color,padding:"12px 18px"}}>
              <div style={{color:C.blanco,fontWeight:700,fontSize:14}}>INGRESOS</div>
            </div>
            {categorias.map(cat=>{
              const items=grupos[cat];
              const subtotal=items.reduce((a,m)=>a+Number(m.importe),0);
              const abierta=categoriasAbiertas.has(cat);
              return(
                <div key={cat}>
                  <div onClick={()=>toggleCategoria(cat)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:abierta?`${color}08`:C.blanco}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:C.muted,transform:abierta?"rotate(90deg)":"none",display:"inline-block",transition:"transform 0.15s"}}>▶</span>
                      <span style={{fontSize:13,fontWeight:700,color:C.text}}>{cat}</span>
                      <span style={{fontSize:11,color:C.muted}}>({items.length})</span>
                    </div>
                    <span style={{fontWeight:700,color,fontSize:14}}>{fmt(subtotal)}</span>
                  </div>
                  {abierta&&items.map(m=>(
                    <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px 9px 32px",borderBottom:`1px solid ${C.border}`,background:"#fafafa"}}>
                      <div>
                        <div style={{fontSize:13}}>{m.concepto}</div>
                        {m.observaciones&&<div style={{fontSize:11,color:C.gris,marginTop:3,fontStyle:"italic"}}>📝 {m.observaciones}</div>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:600,color,fontSize:13}}>{fmt(m.importe)}</span>
                        <button onClick={()=>eliminarMovimiento(m)} title="Eliminar" style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,fontFamily:"inherit"}}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 18px",background:`${color}12`}}>
              <span style={{fontWeight:800,color}}>TOTAL</span>
              <span style={{fontWeight:800,color,fontSize:16}}>{fmt(total)}</span>
            </div>
          </Card>);
        }

        return(<Card key={tipo} style={{padding:0,overflow:"hidden"}}>
          <div style={{background:color,padding:"12px 18px"}}>
            <div style={{color:C.blanco,fontWeight:700,fontSize:14}}>GASTOS</div>
          </div>
          {lista.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{m.concepto}</div>
                <div style={{fontSize:10,color:C.muted}}>{m.categoria}</div>
                {m.observaciones&&<div style={{fontSize:11,color:C.gris,marginTop:3,fontStyle:"italic"}}>📝 {m.observaciones}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:700,color,fontSize:14}}>{fmt(m.importe)}</span>
                <button onClick={()=>eliminarMovimiento(m)} title="Eliminar" style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,fontFamily:"inherit"}}>🗑️</button>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"12px 18px",background:`${color}12`}}>
            <span style={{fontWeight:800,color}}>TOTAL</span>
            <span style={{fontWeight:800,color,fontSize:16}}>{fmt(total)}</span>
          </div>
        </Card>);
      })}
    </div>

    <Modal open={!!modal} onClose={()=>setModal(null)} title={modal==="ingreso"?"➕ Nuevo ingreso":"➖ Nuevo gasto"}>
      <Input label="Concepto" value={form.concepto} onChange={v=>setF("concepto",v)} required/>
      <Select label="Categoría" value={form.categoria} onChange={v=>setF("categoria",v)}
        options={(modal==="ingreso"?CAT_ING:CAT_GAS).map(c=>({value:c,label:c}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <Input label="Importe (€)" value={form.importe} onChange={v=>setF("importe",v)} type="number" required/>
        <Input label="Fecha" value={form.fecha} onChange={v=>setF("fecha",v)} type="date"/>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:6}}>Observaciones (opcional)</label>
        <textarea value={form.observaciones} onChange={e=>setF("observaciones",e.target.value)} rows={2}
          placeholder="Detalles adicionales sobre este movimiento..."
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModal(null)} style={{flex:1}}>Cancelar</Btn>
        <Btn color={modal==="ingreso"?C.verde:C.rojo} onClick={guardar} style={{flex:1}}>Guardar</Btn>
      </div>
    </Modal>

    <Modal open={modalNuevoEj} onClose={()=>setModalNuevoEj(false)} title="🗓️ Nuevo ejercicio contable">
      <Input label="Nombre del ejercicio" value={formNuevoEj.nombre} onChange={v=>setFNE("nombre",v)} placeholder="2026/2027" required/>
      {ejercicios.length>0&&(
        <>
          <Select label="Ejercicio del que traspasar el remanente" value={formNuevoEj.ejercicioBaseId} onChange={v=>setFNE("ejercicioBaseId",v)}
            options={ejercicios.map(e=>({value:e.id,label:e.nombre}))}/>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer",marginBottom:16,padding:"10px 12px",borderRadius:8,background:formNuevoEj.incluirRemanente?C.verdeLight:C.grisLight}}>
            <input type="checkbox" checked={formNuevoEj.incluirRemanente} onChange={e=>setFNE("incluirRemanente",e.target.checked)} style={{accentColor:C.verde}}/>
            Incluir remanente automáticamente como primer movimiento
          </label>
          {formNuevoEj.incluirRemanente&&formNuevoEj.ejercicioBaseId&&(()=>{
            const base=ejercicios.find(e=>String(e.id)===String(formNuevoEj.ejercicioBaseId));
            const resultado=calcularResultado(base?.id);
            return(<div style={{fontSize:12,color:C.muted,marginTop:-8,marginBottom:16}}>
              Remanente de {base?.nombre}: <strong style={{color:resultado>=0?C.verde:C.rojo}}>{resultado>=0?"+":""}{fmt(resultado)}</strong>
              {" "}se añadirá como {resultado>=0?"ingreso":"gasto"} en el nuevo ejercicio.
            </div>);
          })()}
        </>
      )}
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setModalNuevoEj(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={crearEjercicio} style={{flex:1}}>Crear ejercicio</Btn>
      </div>
    </Modal>
  </div>);
}

// ══════════════════════════════════════════════════════════
// BACKUP COMPLETO
// ══════════════════════════════════════════════════════════
let _jsZipPromise = null;
const cargarJSZip = () => {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (_jsZipPromise) return _jsZipPromise;
  _jsZipPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => resolve(window.JSZip);
    s.onerror = () => reject(new Error("No se pudo cargar JSZip"));
    document.head.appendChild(s);
  });
  return _jsZipPromise;
};

const TABLAS_BACKUP = ["socios","cuotas","loteria","actividades","inscripciones","verificaciones","solicitudes_alta","ejercicios","movimientos_ejercicio","tarifas","actas","noticias"];
const BUCKETS_BACKUP = ["fichas","actas","noticias"];

function SeccionBackup(){
  const [generando,setGenerando]=useState(false);
  const [progreso,setProgreso]=useState("");

  const generarBackup=async()=>{
    setGenerando(true);
    try{
      const JSZip=await cargarJSZip();
      const zip=new JSZip();

      // 1. Todas las tablas de la base de datos
      for(const tabla of TABLAS_BACKUP){
        setProgreso(`Exportando tabla ${tabla}...`);
        const {data,error}=await supabase.from(tabla).select("*");
        zip.file(`base_de_datos/${tabla}.json`, JSON.stringify(error?{error:error.message}:data, null, 2));
      }

      // 2. Archivos guardados en Storage (fichas, actas, noticias)
      for(const bucket of BUCKETS_BACKUP){
        setProgreso(`Listando archivos de ${bucket}...`);
        const {data:archivos,error:errList}=await supabase.storage.from(bucket).list();
        if(errList||!archivos) continue;
        for(const archivo of archivos){
          if(archivo.id===null) continue; // carpetas
          setProgreso(`Descargando ${bucket}/${archivo.name}...`);
          const {data:blob,error:errDown}=await supabase.storage.from(bucket).download(archivo.name);
          if(!errDown&&blob) zip.file(`storage/${bucket}/${archivo.name}`, blob);
        }
      }

      // 3. Manifiesto
      zip.file("manifiesto.json", JSON.stringify({
        generado_el: new Date().toISOString(),
        temporada: TEMPORADA_ACTUAL,
        tablas: TABLAS_BACKUP,
        buckets: BUCKETS_BACKUP,
      }, null, 2));

      setProgreso("Comprimiendo...");
      const contenido=await zip.generateAsync({type:"blob"});
      const url=URL.createObjectURL(contenido);
      const a=document.createElement("a");
      a.href=url;
      a.download=`backup_rana_mecanica_${hoy}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){
      console.error("Error generando backup:",e);
      alert("No se ha podido generar el backup. Revisa la consola para más detalles.");
    }
    setGenerando(false);
    setProgreso("");
  };

  return(
    <Card style={{marginBottom:24,borderLeft:`4px solid ${C.granate}`}}>
      <h3 style={{fontSize:15,fontWeight:700,color:C.granateDark,marginBottom:8}}>📦 Copia de seguridad completa</h3>
      <p style={{fontSize:13,color:C.gris,marginBottom:14}}>Descarga un .zip con todas las tablas (socios, cuotas, lotería, actividades...) y todos los documentos guardados (fichas, actas, adjuntos de noticias). Recomendado hacerlo al menos una vez al mes.</p>
      <Btn onClick={generarBackup} disabled={generando}>{generando?`⏳ ${progreso||"Generando..."}`:"📦 Descargar backup completo"}</Btn>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
// INFORMES
// ══════════════════════════════════════════════════════════
function Informes({socios,cuotas,loteria,actividades,inscripciones,ejercicios,movimientos}){
  const [notif,setNotif]=useState(null);
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};
  const getSocio=(id)=>socios.find(s=>s.id===id);
  const nombreSocio=(id)=>{const s=getSocio(id);return s?`${s.nombre} ${s.apellidos}`:"—";};

  const descargar=(wb,nombre)=>{
    XLSX.writeFile(wb,`${nombre}_rana_mecanica_${hoy}.xlsx`);
    ok(`✅ Descargado: ${nombre}`);
  };

  const exportarPenistas=()=>{
    const activos=socios.filter(s=>s.estado==="activo");
    const data=activos.map(s=>({
      "Nº Socio":s.numero,"Nombre":s.nombre,"Apellidos":s.apellidos,"DNI":s.dni||"",
      "Fecha Nac.":s.fecha_nac||"","Teléfono":s.telefono||"","Email":s.email||"","Municipio":s.municipio||"",
      "Tipo":s.tipo,"Cargo":s.cargo||"","Estado":s.estado,
      "RGPD":s.rgpd?"Sí":"No","Foto interna":s.consent_foto_interna?"Sí":"No","Foto RRSS":s.consent_foto_rrss?"Sí":"No",
      "Foto web":s.consent_foto_web?"Sí":"No","Foto Levante":s.consent_foto_levante?"Sí":"No","Promo peña":s.consent_promo_pena?"Sí":"No",
      "Patrocinadores":s.consent_patrocinadores?"Sí":"No","WhatsApp":s.consent_whatsapp?"Sí":"No",
      "Tiene acciones":s.tiene_acciones?"Sí":"No","Nº acciones":s.num_acciones||"","Abonado":s.es_abonado?"Sí":"No","Nº abonado":s.num_abonado||"",
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Censo");
    descargar(wb,"censo_penistas");
  };

  const exportarActividades=()=>{
    const resumen=actividades.map(a=>{
      const insc=inscripciones.filter(i=>i.actividad_id===a.id&&i.estado!=="cancelada");
      return{
        "Actividad":a.nombre,"Fecha":a.fecha||"","Tipo":a.tipo,"Precio socio":a.precio_socio||0,"Plazas":a.plazas||"",
        "Inscritos":insc.length,"Confirmados":insc.filter(i=>i.estado==="confirmada").length,
        "Pagados":insc.filter(i=>i.pagado).length,"Ingreso generado":insc.filter(i=>i.pagado).length*(a.precio_socio||0),
      };
    });
    const detalle=inscripciones.filter(i=>i.estado!=="cancelada").map(i=>{
      const a=actividades.find(x=>x.id===i.actividad_id);
      return{
        "Actividad":a?.nombre||"—","Socio":nombreSocio(i.socio_id),"Nº Socio":getSocio(i.socio_id)?.numero||"",
        "Estado":i.estado,"Pagado":i.pagado?"Sí":"No","Fecha pago":i.fecha_pago||"",
      };
    });
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(resumen),"Resumen actividades");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(detalle),"Detalle inscritos");
    descargar(wb,"actividades");
  };

  const exportarCuotas=()=>{
    const data=cuotas.map(c=>({
      "Socio":nombreSocio(c.socio_id),"Nº Socio":getSocio(c.socio_id)?.numero||"",
      "Temporada":c.temporada,"Categoría":c.categoria,"Importe":Number(c.importe),
      "Pagado":c.pagado?"Sí":"No","Fecha pago":c.fecha_pago||"","Forma pago":c.forma_pago||"",
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Cuotas");
    descargar(wb,"cuotas");
  };

  const exportarPresupuesto=()=>{
    const wb=XLSX.utils.book_new();
    ejercicios.forEach(ej=>{
      const movs=movimientos.filter(m=>m.ejercicio_id===ej.id);
      const porCategoria={};
      movs.forEach(m=>{
        const key=`${m.tipo}|${m.categoria||"Sin categoría"}`;
        porCategoria[key]=(porCategoria[key]||0)+Number(m.importe);
      });
      const data=Object.entries(porCategoria).map(([key,total])=>{
        const [tipo,categoria]=key.split("|");
        return {"Tipo":tipo==="ingreso"?"Ingreso":"Gasto","Categoría":categoria,"Total":total};
      });
      const ingresos=movs.filter(m=>m.tipo==="ingreso").reduce((a,m)=>a+Number(m.importe),0);
      const gastos=movs.filter(m=>m.tipo==="gasto").reduce((a,m)=>a+Number(m.importe),0);
      data.push({"Tipo":"","Categoría":"RESULTADO",Total:ingresos-gastos});
      const nombreHoja=ej.nombre.replace(/[\\/:*?[\]]/g,"-").slice(0,31);
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),nombreHoja);
    });
    const detalle=movimientos.map(m=>{
      const ejNombre=ejercicios.find(e=>e.id===m.ejercicio_id)?.nombre||"—";
      return{"Ejercicio":ejNombre,"Tipo":m.tipo,"Categoría":m.categoria,"Concepto":m.concepto,"Importe":Number(m.importe),"Fecha":m.fecha,"Observaciones":m.observaciones||""};
    });
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(detalle),"Detalle movimientos");
    descargar(wb,"presupuesto_tesoreria");
  };

  const exportarLoteria=()=>{
    const data=loteria.map(l=>{
      const vendidos=Math.max(0,(Number(l.entregados)||0)-(Number(l.devueltos)||0));
      return{
        "Socio":nombreSocio(l.socio_id),"Nº Socio":getSocio(l.socio_id)?.numero||"",
        "Concepto":l.concepto,"Entregados":l.entregados||0,"Devueltos":l.devueltos||0,"Vendidos":vendidos,
        "Precio base":Number(l.precio_base||0),"Recargo":Number(l.recargo||0),
        "Importe":l.pagado?Number(l.importe_total||0):vendidos*((Number(l.precio_base)||0)+(Number(l.recargo)||0)),
        "Liquidado":l.pagado?"Sí":"No","Fecha liquidación":l.fecha_pago||"",
      };
    });
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Lotería");
    descargar(wb,"loteria");
  };

  const informes=[
    {icon:"👥",titulo:"Censo de peñistas",desc:"Datos completos y consentimientos de todos los activos",fn:exportarPenistas},
    {icon:"📅",titulo:"Actividades",desc:"Resumen por actividad + detalle de quién se apuntó a cada una",fn:exportarActividades},
    {icon:"💶",titulo:"Cuotas",desc:"Estado de pago de toda la temporada, socio por socio",fn:exportarCuotas},
    {icon:"📒",titulo:"Presupuesto / Tesorería",desc:"Ingresos y gastos por categoría, una hoja por ejercicio",fn:exportarPresupuesto},
    {icon:"🎟️",titulo:"Lotería",desc:"Reparto, devolución y liquidación por persona",fn:exportarLoteria},
  ];

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:6}}>📊 Informes</h2>
    <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Descarga los datos en Excel para hacer seguimiento fuera de la app.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
      {informes.map(inf=>(
        <Card key={inf.titulo} style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:26}}>{inf.icon}</span>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>{inf.titulo}</div>
          </div>
          <p style={{fontSize:12,color:C.muted,margin:0,flex:1}}>{inf.desc}</p>
          <Btn small onClick={inf.fn}>📥 Descargar Excel</Btn>
        </Card>
      ))}
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════════════════════════
function Configuracion({tarifas,setTarifas}){
  const [editadas,setEditadas]=useState(tarifas);
  const [notif,setNotif]=useState(null);
  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const guardar=async()=>{
    for(const t of editadas){
      await supabase.from("tarifas").update({importe:t.importe,aprobado:t.aprobado,descripcion:t.descripcion}).eq("id",t.id);
    }
    setTarifas(editadas);
    ok("✅ Tarifas guardadas");
  };

  const setT=(id,k,v)=>setEditadas(p=>p.map(t=>t.id===id?{...t,[k]:v}:t));

  return(<div>
    {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14}}>{notif}</div>}
    <h2 style={{fontSize:20,fontWeight:700,color:C.granateDark,marginBottom:20}}>⚙️ Configuración</h2>

    <SeccionBackup/>

    <h3 style={{fontSize:16,fontWeight:700,color:C.granateDark,marginBottom:16}}>Tarifas</h3>
    <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
      {editadas.map(t=>(
        <Card key={t.id} style={{borderLeft:`5px solid ${t.aprobado?C.verde:C.oro}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:3}}>{t.label}</div>
              <input value={t.descripcion||""} onChange={e=>setT(t.id,"descripcion",e.target.value)}
                style={{width:"100%",padding:"7px 10px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div>
                <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600}}>Importe (€)</label>
                <input type="number" min="0" value={t.importe??""} onChange={e=>setT(t.id,"importe",e.target.value===""?null:Number(e.target.value))}
                  placeholder="Sin fijar"
                  style={{width:100,padding:"9px 12px",borderRadius:8,border:`2px solid ${C.border}`,fontSize:18,fontWeight:800,fontFamily:"inherit",outline:"none",textAlign:"center",color:C.granate}}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[{v:true,l:"✅ Aprobada",c:C.verde},{v:false,l:"⏳ Pendiente",c:C.oro}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setT(t.id,"aprobado",o.v)}
                    style={{padding:"8px 12px",borderRadius:8,border:`2px solid ${t.aprobado===o.v?o.c:C.border}`,background:t.aprobado===o.v?`${o.c}18`:"transparent",color:t.aprobado===o.v?o.c:C.gris,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit"}}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
    <div style={{display:"flex",gap:10}}>
      <Btn outline onClick={()=>setEditadas(tarifas)} style={{flex:1}}>↩ Descartar</Btn>
      <Btn onClick={guardar} style={{flex:2}}>💾 Guardar tarifas</Btn>
    </div>
  </div>);
}

// Fusiona un cambio en vivo (Realtime) dentro del estado local por id,
// evitando duplicados cuando el propio cliente ya había insertado la fila.
const mergeChange = (setState, payload) => {
  setState(prev=>{
    if(payload.eventType==="INSERT"){
      if(prev.some(r=>r.id===payload.new.id)) return prev;
      return [...prev, payload.new];
    }
    if(payload.eventType==="UPDATE") return prev.map(r=>r.id===payload.new.id?payload.new:r);
    if(payload.eventType==="DELETE") return prev.filter(r=>r.id!==payload.old.id);
    return prev;
  });
};

// ══════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════
export default function Junta(){
  const [tab,setTab]=useState("dashboard");
  const [loading,setLoading]=useState(true);
  const [menuAbierto,setMenuAbierto]=useState(false);
  const [esMovil,setEsMovil]=useState(typeof window!=="undefined" && window.innerWidth<=860);
  useEffect(()=>{
    const onResize=()=>setEsMovil(window.innerWidth<=860);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);
  const [socios,setSocios]=useState([]);
  const [cuotas,setCuotas]=useState([]);
  const [loteria,setLoteria]=useState([]);
  const [actividades,setActividades]=useState([]);
  const [inscripciones,setInscripciones]=useState([]);
  const [actas,setActas]=useState([]);
  const [noticias,setNoticias]=useState([]);
  const [solicitudes,setSolicitudes]=useState([]);
  const [verificaciones,setVerificaciones]=useState([]);
  const [ejercicios,setEjercicios]=useState([]);
  const [movimientos,setMovimientos]=useState([]);
  const [tarifas,setTarifas]=useState([]);
  const [error,setError]=useState(null);

  useEffect(()=>{
    const cargar=async()=>{
      setLoading(true);
      try{
        const [
          {data:s},{data:c},{data:lot},{data:a},{data:insc},{data:sol},{data:ver},
          {data:ej},{data:mov},{data:tar},{data:act},{data:not}
        ] = await Promise.all([
          supabase.from("socios").select("*").order("numero"),
          supabase.from("cuotas").select("*").order("created_at",{ascending:false}),
          supabase.from("loteria").select("*").order("created_at",{ascending:false}),
          supabase.from("actividades").select("*").order("fecha"),
          supabase.from("inscripciones").select("*").order("created_at",{ascending:false}),
          supabase.from("solicitudes_alta").select("*").order("created_at",{ascending:false}),
          supabase.from("verificaciones").select("*").order("created_at",{ascending:false}),
          supabase.from("ejercicios").select("*").order("id"),
          supabase.from("movimientos_ejercicio").select("*").order("fecha"),
          supabase.from("tarifas").select("*").order("id"),
          supabase.from("actas").select("*").order("fecha",{ascending:false}),
          supabase.from("noticias").select("*").order("created_at",{ascending:false}),
        ]);
        setSocios(s||[]); setCuotas(c||[]); setLoteria(lot||[]); setActividades(a||[]); setInscripciones(insc||[]);
        setSolicitudes(sol||[]); setVerificaciones(ver||[]);
        setEjercicios(ej||[]); setMovimientos(mov||[]); setTarifas(tar||[]); setActas(act||[]); setNoticias(not||[]);
      }catch(e){
        setError("Error al cargar datos de Supabase");
        console.error(e);
      }
      setLoading(false);
    };
    cargar();
  },[]);

  // Actualizaciones en vivo: cualquier cambio hecho por otro miembro de la
  // junta (u otro dispositivo tuyo) se refleja al instante, sin recargar.
  const [enVivo,setEnVivo]=useState(false);
  useEffect(()=>{
    const canal = supabase.channel("junta_realtime")
      .on("postgres_changes",{event:"*",schema:"public",table:"socios"}, p=>mergeChange(setSocios,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"cuotas"}, p=>mergeChange(setCuotas,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"loteria"}, p=>mergeChange(setLoteria,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"actividades"}, p=>mergeChange(setActividades,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"inscripciones"}, p=>mergeChange(setInscripciones,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"verificaciones"}, p=>mergeChange(setVerificaciones,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"solicitudes_alta"}, p=>mergeChange(setSolicitudes,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"ejercicios"}, p=>mergeChange(setEjercicios,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"movimientos_ejercicio"}, p=>mergeChange(setMovimientos,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"tarifas"}, p=>mergeChange(setTarifas,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"actas"}, p=>mergeChange(setActas,p))
      .on("postgres_changes",{event:"*",schema:"public",table:"noticias"}, p=>mergeChange(setNoticias,p))
      .subscribe(status=>setEnVivo(status==="SUBSCRIBED"));
    return ()=>{ supabase.removeChannel(canal); };
  },[]);

  // Badges alertas
  const badges={
    solicitudes: solicitudes.filter(s=>s.estado==="pendiente").length,
    verificaciones: verificaciones.filter(v=>v.estado==="pendiente").length,
  };

  if(loading) return(
    <div style={{minHeight:"100vh",background:C.crema,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{textAlign:"center"}}>
        <img src={LOGO} alt="logo" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",marginBottom:16,opacity:0.8}}/>
        <div style={{fontSize:16,color:C.gris}}>Cargando datos...</div>
      </div>
    </div>
  );

  if(error) return(
    <div style={{minHeight:"100vh",background:C.crema,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{textAlign:"center",color:C.rojo}}><div style={{fontSize:40}}>❌</div><div>{error}</div></div>
    </div>
  );

  const renderTab=()=>{
    switch(tab){
      case "dashboard":     return <Dashboard socios={socios} cuotas={cuotas} actividades={actividades} solicitudes={solicitudes} verificaciones={verificaciones} setTab={setTab}/>;
      case "peñistas":      return <Peñistas socios={socios} setSocios={setSocios} cuotas={cuotas} setCuotas={setCuotas}/>;
      case "cuentas":       return <CuentasPendientes socios={socios} setSocios={setSocios}/>;
      case "consentimientos": return <Consentimientos socios={socios} setSocios={setSocios}/>;
      case "solicitudes":   return <Solicitudes solicitudes={solicitudes} setSolicitudes={setSolicitudes} socios={socios} setSocios={setSocios} setCuotas={setCuotas}/>;
      case "verificaciones":return <Verificaciones verificaciones={verificaciones} setVerificaciones={setVerificaciones} socios={socios} setSocios={setSocios}/>;
      case "cuotas":        return <Cuotas socios={socios} cuotas={cuotas} setCuotas={setCuotas} ejercicios={ejercicios} setMovimientos={setMovimientos} tarifas={tarifas}/>;
      case "loteria":       return <Loteria socios={socios} loteria={loteria} setLoteria={setLoteria} ejercicios={ejercicios} setMovimientos={setMovimientos}/>;
      case "actividades":   return <Actividades socios={socios} actividades={actividades} setActividades={setActividades} inscripciones={inscripciones} setInscripciones={setInscripciones} ejercicios={ejercicios} setMovimientos={setMovimientos}/>;
      case "actas":         return <Actas actas={actas} setActas={setActas} socios={socios}/>;
      case "auditoria":     return <Auditoria/>;
      case "noticias":      return <Noticias noticias={noticias} setNoticias={setNoticias} socios={socios}/>;
      case "tesoreria":     return <Tesoreria ejercicios={ejercicios} setEjercicios={setEjercicios} movimientos={movimientos} setMovimientos={setMovimientos}/>;
      case "informes":      return <Informes socios={socios} cuotas={cuotas} loteria={loteria} actividades={actividades} inscripciones={inscripciones} ejercicios={ejercicios} movimientos={movimientos}/>;
      case "configuracion": return <Configuracion tarifas={tarifas} setTarifas={setTarifas}/>;
      default: return null;
    }
  };

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:C.crema,minHeight:"100vh",display:"flex"}}>
      {/* CABECERA MÓVIL (solo pantallas estrechas) */}
      {esMovil&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:150,background:C.granateDark,display:"flex",alignItems:"center",gap:12,padding:"10px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
          <button onClick={()=>setMenuAbierto(true)} aria-label="Abrir menú" style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,fontSize:18,color:C.blanco,cursor:"pointer",flexShrink:0}}>☰</button>
          <img src={LOGO} alt="logo" style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
          <div style={{color:C.blanco,fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {TABS.find(t=>t.id===tab)?.label||"Panel"}
          </div>
        </div>
      )}

      {/* FONDO OSCURO AL ABRIR EL MENÚ EN MÓVIL */}
      {esMovil&&menuAbierto&&(
        <div onClick={()=>setMenuAbierto(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:160}}/>
      )}

      {/* SIDEBAR */}
      <div style={{
        width:220,background:C.granateDark,minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",
        ...(esMovil
          ? {position:"fixed",top:0,left:0,height:"100vh",zIndex:170,transform:menuAbierto?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease"}
          : {position:"sticky",top:0,height:"100vh"}
        ),
      }}>
        <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)",textAlign:"center",position:"relative"}}>
          {esMovil&&(
            <button onClick={()=>setMenuAbierto(false)} aria-label="Cerrar menú" style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,0.12)",border:"none",borderRadius:6,width:28,height:28,color:C.blanco,cursor:"pointer",fontSize:14}}>✕</button>
          )}
          <img src={LOGO} alt="logo" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.3)",display:"block",margin:"0 auto 10px"}}/>
          <div style={{color:C.blanco,fontWeight:700,fontSize:13,lineHeight:1.3}}>Panel Junta Directiva</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:3}}>{TEMPORADA_ACTUAL}</div>
        </div>
        <nav style={{padding:"12px 10px",flex:1}}>
          {TABS.map(t=>{
            const badge=badges[t.id]||0;
            return(<button key={t.id} onClick={()=>{setTab(t.id); if(esMovil) setMenuAbierto(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 12px",marginBottom:2,background:tab===t.id?"rgba(255,255,255,0.18)":"transparent",border:tab===t.id?"1px solid rgba(255,255,255,0.2)":"1px solid transparent",borderRadius:8,cursor:"pointer",color:tab===t.id?C.blanco:"rgba(255,255,255,0.55)",fontSize:13,fontWeight:600,textAlign:"left",fontFamily:"inherit"}}>
              <span><span style={{marginRight:8}}>{t.icon}</span>{t.label}</span>
              {badge>0&&<span style={{background:C.oro,color:C.blanco,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{badge}</span>}
            </button>);
          })}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10,fontSize:11,color:enVivo?"#8fe0a8":"rgba(255,255,255,0.4)"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:enVivo?"#2ecc71":"#888",display:"inline-block"}}/>
            {enVivo?"En vivo":"Conectando..."}
          </div>
          <a href="#/mi-zona" style={{display:"flex",width:"100%",padding:"9px 12px",marginBottom:8,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,cursor:"pointer",color:C.blanco,fontSize:13,fontWeight:600,fontFamily:"inherit",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none",boxSizing:"border-box"}}>
            🐸 Ir a Mi Zona
          </a>
          <button onClick={()=>{ sessionStorage.removeItem("junta_auth"); window.location.hash="#/junta/login"; window.location.reload(); }}
            style={{width:"100%",padding:"9px 12px",marginBottom:10,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,cursor:"pointer",color:C.blanco,fontSize:13,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            🚪 Cerrar sesión
          </button>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 10px",fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.5,textAlign:"center"}}>
            🔐 Acceso restringido<br/>Junta Directiva
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{flex:1,padding:esMovil?"70px 14px 24px":"26px 28px",overflowY:"auto",minWidth:0,width:esMovil?"100%":"auto"}}>
        <div style={{maxWidth:1080}}>{renderTab()}</div>
      </div>
    </div>
  );
}
