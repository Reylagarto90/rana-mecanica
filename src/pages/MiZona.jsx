import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

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

const fmtFecha=(f)=>{ if(!f) return "—"; const[y,m,d]=f.split("-"); return `${d}/${m}/${y}`; };
const fmt=(n)=>`${Number(n||0).toFixed(2).replace(".",",")}€`;

// ── PDF REAL con jsPDF (texto nativo, sin capturas de pantalla) ────────
let _jsPDFPromise = null;
const cargarJsPDF = () => {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (_jsPDFPromise) return _jsPDFPromise;
  _jsPDFPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = () => reject(new Error("No se pudo cargar jsPDF"));
    document.head.appendChild(s);
  });
  return _jsPDFPromise;
};

// Genera el PDF de la ficha con texto real (jsPDF) — sin capturas de pantalla,
// así que la paginación y el ancho quedan siempre correctos.
const generarPDFBlob = async (socio) => {
  const jsPDFCtor = await cargarJsPDF();
  const doc = new jsPDFCtor({ unit: "mm", format: "a4" });

  const M = 15;                    // margen
  const W = 210 - M * 2;           // ancho útil
  const PH = 297;                  // alto de página
  let y = M;

  const nuevaPagina = () => { doc.addPage(); y = M; };
  const check = (alto) => { if (y + alto > PH - M) nuevaPagina(); };

  const fmtF=(f)=>{ if(!f) return "—"; const d=f.split("T")[0].split("-"); return `${d[2]}/${d[1]}/${d[0]}`; };
  const si_no=(v)=>v?"Sí":"No";
  const ahora = new Date().toLocaleString("es-ES");

  // ── Cabecera ──
  doc.setFillColor(139,10,58);
  doc.roundedRect(M, y, W, 20, 2, 2, "F");
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold"); doc.setFontSize(14);
  doc.text("Peña Levantinista La Rana Mecánica", M+6, y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(9);
  doc.text("Godella-Rocafort · Temporada 2026/2027", M+6, y+15);
  y += 28;

  // ── Título sección ──
  const titulo=(txt)=>{
    check(10);
    doc.setTextColor(139,10,58);
    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text(txt, M, y);
    doc.setDrawColor(139,10,58);
    doc.line(M, y+1.5, M+W, y+1.5);
    y += 8;
  };

  // ── Fila etiqueta: valor (con fondo alterno) ──
  let filaIdx=0;
  const fila=(label,valor)=>{
    const alto=7;
    check(alto);
    if(filaIdx%2===0){ doc.setFillColor(248,250,252); doc.rect(M,y-4.5,W,alto,"F"); }
    filaIdx++;
    doc.setTextColor(30,41,59);
    doc.setFont("helvetica","bold"); doc.setFontSize(9.5);
    doc.text(label, M+2, y);
    doc.setFont("helvetica","normal");
    doc.text(String(valor), M+2+W*0.42, y);
    y += alto;
  };

  const tabla=(filas)=>{ filaIdx=0; filas.forEach(([l,v])=>fila(l,v)); y+=5; };

  // Caja de color con texto envuelto (calcula alto y hace salto de página si hace falta)
  const caja=(titulo2, texto, rgb, rgbTexto)=>{
    doc.setFont("helvetica","bold"); doc.setFontSize(9);
    const lineasTitulo = doc.splitTextToSize(titulo2, W-8);
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    const lineasTexto = doc.splitTextToSize(texto, W-8);
    const altoCaja = 6 + lineasTitulo.length*4.5 + lineasTexto.length*4 + 6;
    check(altoCaja);
    doc.setFillColor(...rgb);
    doc.roundedRect(M, y-4, W, altoCaja, 2, 2, "F");
    let yy=y+2;
    doc.setTextColor(...rgbTexto);
    doc.setFont("helvetica","bold"); doc.setFontSize(9);
    lineasTitulo.forEach(l=>{ doc.text(l, M+4, yy); yy+=4.5; });
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    lineasTexto.forEach(l=>{ doc.text(l, M+4, yy); yy+=4; });
    y += altoCaja + 6;
  };

  titulo("Verificación de datos del socio");
  tabla([
    ["Nº Socio", socio.numero],
    ["Nombre completo", `${socio.nombre} ${socio.apellidos}`],
    ["DNI / NIE", socio.dni||"—"],
    ["Fecha nacimiento", fmtF(socio.fecha_nac)],
    ["Teléfono", socio.telefono==="512512"?"(pendiente)":socio.telefono||"—"],
    ["Email", socio.email||"—"],
    ["Municipio", socio.municipio||"—"],
    ["Tipo", socio.tipo],
    ["Cargo", socio.cargo],
    ["Acciones Levante", socio.tiene_acciones?(socio.num_acciones||1)+" acción/es":"No"],
    ["Nº Abonado", socio.es_abonado?(socio.num_abonado||"Sí"):"No abonado/a"],
  ]);

  titulo("Consentimientos otorgados");
  tabla([
    ["Tratamiento de datos (obligatorio)", si_no(socio.rgpd||socio.consent_datos)],
    ["Foto comunicación interna", si_no(socio.consent_foto_interna)],
    ["Foto redes sociales", si_no(socio.consent_foto_rrss)],
    ["Foto web y materiales", si_no(socio.consent_foto_web)],
    ["Foto cesión Levante UD/Federación", si_no(socio.consent_foto_levante)],
    ["Comunicaciones promocionales peña", si_no(socio.consent_promo_pena)],
    ["Info patrocinadores", si_no(socio.consent_patrocinadores)],
    ["Grupo WhatsApp", si_no(socio.consent_whatsapp)],
  ]);

  caja("", `Datos verificados digitalmente el ${ahora}. El socio ha confirmado que sus datos son correctos a través del portal de verificación de la Peña Levantinista La Rana Mecánica.`,
    [240,253,244],[22,101,52]);

  caja("INFORMACIÓN BÁSICA SOBRE PROTECCIÓN DE DATOS",
    "Responsable: Peña Levantinista La Rana Mecánica (Godella-Rocafort). "+
    "Finalidad: Gestión de la relación asociativa (altas/bajas, cuotas, comunicaciones operativas, administración interna y cumplimiento de obligaciones legales). "+
    "Legitimación: Consentimiento del interesado y ejecución del vínculo asociativo. "+
    "Destinatarios: Levante UD/Fundación Levante UD y Federación de Peñas; Administraciones Públicas; entidades bancarias; aseguradoras; proveedores tecnológicos como encargados del tratamiento. "+
    "Plazo: Mientras se mantenga la condición de socio y, tras la baja, durante los plazos legales de conservación. "+
    "Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad en penyaranamecanica@gmail.com. Puede reclamar ante la AEPD (www.aepd.es). "+
    "La negativa a autorizar imágenes no impide ser socio. Los consentimientos opcionales pueden retirarse en cualquier momento.",
    [254,242,242],[30,41,59]);

  caja("NORMAS DE USO DEL GRUPO DE WHATSAPP (si ha otorgado consentimiento)",
    "La incorporación al grupo de WhatsApp es voluntaria. Queda prohibido compartir datos personales, fotografías o conversaciones de otros miembros fuera del grupo sin su autorización expresa. El grupo se utilizará exclusivamente para comunicaciones de la peña. El incumplimiento podrá conllevar la expulsión del grupo.",
    [240,249,255],[12,74,110]);

  caja("Nota",
    "Este documento debe ser impreso, firmado por el socio (o su tutor legal si es menor de edad) y entregado al Secretario de la Peña para su archivo. La firma acredita que el socio ha sido informado sobre el tratamiento de sus datos y ha prestado los consentimientos indicados.",
    [254,249,195],[113,63,18]);

  // ── Firma ──
  check(30);
  doc.setDrawColor(226,232,240); doc.line(M,y,M+W,y); y+=8;
  doc.setTextColor(100,116,139); doc.setFont("helvetica","normal"); doc.setFontSize(9.5);
  doc.text("Firma del socio / tutor legal (en caso de menor):", M, y); y+=16;
  doc.setDrawColor(148,163,184); doc.line(M,y,M+70,y); y+=5;
  doc.setFontSize(8.5); doc.setTextColor(148,163,184);
  doc.text(`Nombre: ${socio.nombre} ${socio.apellidos}     Fecha: ___/___/______`, M, y);

  // ── Pie ──
  const nPaginas = doc.internal.getNumberOfPages();
  for(let i=1;i<=nPaginas;i++){
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(148,163,184);
    doc.text("Peña Levantinista La Rana Mecánica · Godella-Rocafort · penyaranamecanica@gmail.com", 105, 290, {align:"center"});
  }

  return doc.output("blob");
};


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
  {id:"cuotas",    label:"Mis pagos",   icon:"💶"},
  {id:"actividades",label:"Actividades",icon:"📅"},
  {id:"noticias",  label:"Noticias",    icon:"📢"},
  {id:"actas",     label:"Actas",       icon:"📜"},
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

// ── ACCESO CON USUARIO Y CONTRASEÑA (con aprobación de junta) ────────
function AccesoCuenta({onLogin,onMultiple,onPendiente,onVolver}){
  const [modo,setModo]=useState("entrar"); // entrar | registro
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [numero,setNumero]=useState("");
  const [dni,setDni]=useState("");
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");
  const [loading,setLoading]=useState(false);

  const entrar=async()=>{
    if(!email||!password){setError("Rellena email y contraseña");return;}
    setLoading(true); setError(""); setInfo("");
    const {data,error:errAuth}=await supabase.auth.signInWithPassword({email,password});
    if(errAuth||!data?.user){ setLoading(false); setError("Email o contraseña incorrectos."); return; }
    const {data:socioRow}=await supabase.from("socios").select("*").eq("auth_user_id",data.user.id).maybeSingle();
    if(!socioRow){ setLoading(false); setError("Tu cuenta no está vinculada a ningún socio. Contacta con la junta."); return; }
    if(!socioRow.cuenta_aprobada){ setLoading(false); onPendiente(); return; }
    // Igual que en el acceso por teléfono: si es tutor de menores, se le ofrece elegir perfil
    const {data:menores}=await supabase.from("socios").select("*").eq("tutor_id",socioRow.id).eq("estado","activo");
    const perfiles=[socioRow, ...(menores||[])];
    setLoading(false);
    if(perfiles.length>1) onMultiple(perfiles);
    else onLogin(socioRow);
  };

  const registrar=async()=>{
    if(!numero||!dni||!email||!password){setError("Rellena todos los campos");return;}
    if(password.length<6){setError("La contraseña debe tener al menos 6 caracteres");return;}
    setLoading(true); setError(""); setInfo("");

    const {data:socioRow,error:errBuscar}=await supabase.from("socios").select("*")
      .ilike("numero",numero.trim()).ilike("dni",dni.trim()).is("auth_user_id",null).maybeSingle();
    if(errBuscar||!socioRow){
      setLoading(false);
      setError("No encontramos un socio con ese número y DNI, o esa cuenta ya está registrada. Contacta con la junta si crees que es un error.");
      return;
    }

    const {data:authData,error:errAuth}=await supabase.auth.signUp({email,password});
    if(errAuth||!authData?.user){ setLoading(false); setError(errAuth?.message||"No se pudo crear la cuenta."); return; }

    const {error:errVincular}=await supabase.from("socios").update({
      auth_user_id: authData.user.id,
      cuenta_aprobada: false,
      cuenta_solicitada_at: new Date().toISOString(),
      email: socioRow.email||email,
    }).eq("id",socioRow.id);

    setLoading(false);
    if(errVincular){ setError("Cuenta creada pero no se pudo vincular a tu ficha. Contacta con la junta."); return; }
    setInfo("✅ Cuenta creada. La junta revisará tu solicitud y la aprobará en breve. Te avisaremos.");
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:100,height:100,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 14px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:21,fontWeight:700,marginBottom:6}}>{modo==="entrar"?"Accede a tu cuenta":"Crea tu cuenta"}</h1>
        </div>

        <div style={{background:C.blanco,borderRadius:20,padding:"26px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          {info?(
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:44,marginBottom:10}}>📨</div>
              <p style={{color:C.text,fontSize:14,lineHeight:1.6,marginBottom:18}}>{info}</p>
              <button onClick={()=>{setModo("entrar");setInfo("");setPassword("");}} style={{width:"100%",padding:12,background:C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Ir a iniciar sesión</button>
            </div>
          ):(<>
            {modo==="registro"&&(<>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Nº de socio</label>
              <input value={numero} onChange={e=>setNumero(e.target.value)} placeholder="LRM-0024" style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>DNI / NIE</label>
              <input value={dni} onChange={e=>setDni(e.target.value)} placeholder="12345678A" style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
            </>)}
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&(modo==="entrar"?entrar():registrar())} style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:14}}/>

            {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo}}>⚠️ {error}</div>}

            <button onClick={modo==="entrar"?entrar:registrar} disabled={loading} style={{width:"100%",padding:13,background:loading?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",marginBottom:10}}>
              {loading?"Un momento...":modo==="entrar"?"Entrar":"Crear cuenta"}
            </button>

            <button onClick={()=>{setModo(modo==="entrar"?"registro":"entrar");setError("");}} style={{width:"100%",padding:10,background:"transparent",border:"none",color:C.granate,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600}}>
              {modo==="entrar"?"¿No tienes cuenta? Regístrate":"¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </>)}

          <button onClick={onVolver} style={{width:"100%",marginTop:10,padding:10,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Volver</button>
        </div>
      </div>
    </div>
  );
}

// ── PANTALLA: CUENTA PENDIENTE DE APROBACIÓN ─────────────────────────
function PantallaPendiente({onLogout}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,background:C.blanco,borderRadius:20,padding:"32px 24px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:52,marginBottom:14}}>⏳</div>
        <h2 style={{fontSize:19,fontWeight:700,color:C.granateDark,marginBottom:10}}>Cuenta pendiente de aprobación</h2>
        <p style={{color:C.gris,fontSize:14,lineHeight:1.6,marginBottom:22}}>Tu cuenta ha sido creada correctamente. La junta directiva la revisará y la aprobará en breve. Te avisaremos por email cuando puedas acceder.</p>
        <button onClick={onLogout} style={{width:"100%",padding:12,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:10,color:C.gris,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Salir</button>
      </div>
    </div>
  );
}

// ── PANTALLA INICIAL: ELEGIR MÉTODO DE ACCESO ────────────────────────
function AccesoInicial({onCuenta,onTelefono}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:120,height:120,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:22,fontWeight:700,marginBottom:6}}>Mi zona de peñista</h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.5}}>Peña Levantinista La Rana Mecánica<br/>Temporada 2026/2027</p>
        </div>
        <div style={{background:C.blanco,borderRadius:20,padding:"26px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <button onClick={onCuenta} style={{width:"100%",padding:14,background:C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>
            🔐 Entrar con usuario y contraseña
          </button>
          <button onClick={onTelefono} style={{width:"100%",padding:12,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:10,color:C.gris,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            📱 Acceso temporal por teléfono
          </button>
          <p style={{marginTop:14,fontSize:11,color:C.muted,textAlign:"center",lineHeight:1.5}}>El acceso por teléfono se retirará cuando todos los socios tengan cuenta creada.</p>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN POR TELÉFONO (temporal, durante la transición) ────────────
function Login({onLogin,onMultiple,onVolver}){
  const [tel,setTel]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const buscar=async()=>{
    const t=tel.replace(/\s/g,"").replace(/^(\+34|0034)/,"");
    if(t.length<6){setError("Introduce un teléfono válido");return;}
    setLoading(true); setError("");
    try{
      const {data,error:err}=await supabase.from("socios").select("*").eq("telefono",t).eq("estado","activo");
      if(err) throw err;
      if(!data||data.length===0){
        setError("No hemos encontrado ningún peñista con ese teléfono. Contacta con la junta.");
        setLoading(false); return;
      }
      const adultos=data.filter(s=>s.tipo!=="infantil");
      const tutorAdulto=adultos[0];
      let menoresTutor=[];
      if(tutorAdulto){
        const {data:m}=await supabase.from("socios").select("*").eq("tutor_id",tutorAdulto.id).eq("estado","activo");
        if(m) menoresTutor=m;
      }
      const perfilesTodos=[...new Map([...data,...menoresTutor].map(s=>[s.id,s])).values()];
      // Si algún adulto de este teléfono ya tiene cuenta aprobada, se bloquea el
      // acceso por teléfono para TODA la familia (adultos y menores vinculados a
      // él), no solo para quien tiene la cuenta — así migran juntos, y el tutor
      // puede seguir accediendo a sus hijos desde su propia cuenta.
      const algunTutorConCuenta=adultos.some(a=>a.cuenta_aprobada);
      const bloqueado=(s)=>s.cuenta_aprobada || (s.tutor_id && algunTutorConCuenta);
      const conCuentaAprobada=perfilesTodos.filter(bloqueado);
      const perfiles=perfilesTodos.filter(s=>!bloqueado(s));
      if(perfiles.length===0){
        setError(conCuentaAprobada.length>0
          ? "Ya tenéis una cuenta creada con usuario y contraseña en esta familia. Usa esa opción para entrar (podrás elegir entre los perfiles vinculados)."
          : "No hemos encontrado ningún peñista con ese teléfono. Contacta con la junta.");
        setLoading(false); return;
      }
      if(perfiles.length>1) onMultiple(perfiles);
      else onLogin(perfiles[0]);
    }catch(e){ setError("Error de conexión. Inténtalo de nuevo."); }
    setLoading(false);
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
          {onVolver&&<button onClick={onVolver} style={{width:"100%",marginTop:10,padding:10,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Volver</button>}
        </div>
      </div>
    </div>
  );
}

// ── TAB: INICIO ───────────────────────────────────────────
function TabInicio({socio,cuotas,actividades,loteria,setTab,onSolicitarCambio}){
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
          {icon:"🎟️",label:"Lotería pendiente",value:fmt(loteria.filter(l=>!l.pagado).reduce((a,l)=>{const v=Math.max(0,(Number(l.entregados)||0)-(Number(l.devueltos)||0));return a+v*((Number(l.precio_base)||0)+(Number(l.recargo)||0));},0)),color:C.granate,bg:C.granateLight,tab:"cuotas"},
          {icon:"📁",label:"Documentos",value:"Consentimientos",color:C.gris,bg:C.grisLight,tab:"documentos"},
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
          {[["Nombre",`${socio.nombre} ${socio.apellidos}`],["DNI",socio.dni||"—"],["Teléfono",socio.telefono],["Email",socio.email||"—"],["Municipio",socio.municipio||"—"],["Alta",fmtFecha(socio.fecha_alta)],["Acciones Levante",socio.tiene_acciones?"Sí":"No"],["Nº acciones",socio.tiene_acciones?(socio.num_acciones||"—"):"—"],["Abonado",socio.es_abonado?"Sí":"No"],["Nº abonado",socio.es_abonado?(socio.num_abonado||"—"):"—"]].map(([k,v])=>(
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

// ── TAB: MIS PAGOS (cuotas + lotería) ─────────────────────
function TabCuotas({cuotas,loteria,historialPagos}){
  const totalCuotas=cuotas.reduce((a,c)=>a+Number(c.importe),0);
  const cobradoCuotas=cuotas.filter(c=>c.pagado).reduce((a,c)=>a+Number(c.importe),0);
  const importeLoteria=(l)=>{
    const vendidos=Math.max(0,(Number(l.entregados)||0)-(Number(l.devueltos)||0));
    return l.pagado?Number(l.importe_total||0):vendidos*((Number(l.precio_base)||0)+(Number(l.recargo)||0));
  };
  const totalLoteria=loteria.reduce((a,l)=>a+importeLoteria(l),0);
  const cobradoLoteria=loteria.filter(l=>l.pagado).reduce((a,l)=>a+Number(l.importe_total||0),0);
  const totalGeneral=totalCuotas+totalLoteria;
  const cobradoGeneral=cobradoCuotas+cobradoLoteria;

  const tipoIcon={Cuota:"💶",Lotería:"🎟️",Actividad:"📅"};

  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>💶 Mis pagos</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <Card style={{background:C.verdeLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.verde,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pagado</div>
          <div style={{fontSize:24,fontWeight:800,color:C.verde}}>{fmt(cobradoGeneral)}</div>
        </Card>
        <Card style={{background:C.oroLight,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.oro,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Pendiente</div>
          <div style={{fontSize:24,fontWeight:800,color:C.oro}}>{fmt(totalGeneral-cobradoGeneral)}</div>
        </Card>
      </div>

      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>📜 Historial de pagos realizados</h3>
      <Card style={{padding:0,marginBottom:24}}>
        {historialPagos.length===0?(
          <p style={{padding:16,color:C.muted,fontSize:13}}>Todavía no tienes pagos registrados.</p>
        ):historialPagos.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<historialPagos.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{tipoIcon[p.tipo]||"💰"}</span>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:C.text}}>{p.concepto}</div>
                <div style={{fontSize:11,color:C.muted}}>{p.tipo}{p.forma?` · ${p.forma}`:""} · {fmtFecha(p.fecha)}</div>
              </div>
            </div>
            <div style={{fontWeight:700,fontSize:14,color:C.verde}}>{fmt(p.importe)}</div>
          </div>
        ))}
      </Card>

      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Cuotas</h3>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:cuotas.length?24:8}}>
        {cuotas.length===0&&<p style={{color:C.muted,fontSize:13}}>No tienes cuotas registradas todavía.</p>}
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

      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Lotería</h3>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {loteria.length===0&&<p style={{color:C.muted,fontSize:13}}>No tienes lotería registrada todavía.</p>}
        {loteria.map(l=>{
          const vendidos=Math.max(0,(Number(l.entregados)||0)-(Number(l.devueltos)||0));
          const importe=l.pagado?Number(l.importe_total):vendidos*((Number(l.precio_base)||0)+(Number(l.recargo)||0));
          return(
          <Card key={l.id} style={{borderLeft:`4px solid ${l.pagado?C.verde:C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>🎟️ {l.concepto}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                  {l.entregados} entregados · {l.devueltos||0} devueltos · {vendidos} vendidos
                  {l.decimos_de?` · ${l.decimos_de}`:""}
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>Precio: {fmt(l.precio_base)} + recargo {fmt(l.recargo)}/ud</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,fontWeight:800,color:l.pagado?C.verde:C.oro}}>{fmt(importe)}</div>
                <Pill text={l.pagado?"✅ Liquidado":"⏳ Pendiente"} color={l.pagado?C.verde:C.oro} bg={l.pagado?C.verdeLight:C.oroLight}/>
              </div>
            </div>
            {l.pagado?(
              <div style={{fontSize:12,color:C.gris,background:C.grisLight,borderRadius:8,padding:"8px 12px"}}>
                📅 Liquidado el {fmtFecha(l.fecha_pago)}
              </div>
            ):(
              <div style={{background:C.oroLight,borderRadius:8,padding:"10px 12px",fontSize:13,color:"#7a5c00"}}>
                💡 Entrega lo vendido y lo no vendido en la próxima reunión de la peña para liquidar.
              </div>
            )}
          </Card>
          );})}
      </div>
    </div>
  );
}

// ── TAB: ACTIVIDADES ──────────────────────────────────────
function TabActividades({actividades,setActividades,socio}){
  const [modalAct,setModalAct]=useState(null);
  const [notif,setNotif]=useState(null);
  const [procesando,setProcesando]=useState(null);
  const proximas=actividades.filter(a=>!a.pasada);
  const pasadas=actividades.filter(a=>a.pasada&&a.inscrito);

  const ok=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3000);};

  const apuntarse=async(id)=>{
    setProcesando(id);
    // Si ya existe una fila cancelada previa, la reactivamos; si no, insertamos una nueva
    const {data:actualizada}=await supabase.from("inscripciones")
      .update({estado:"pendiente"}).eq("actividad_id",id).eq("socio_id",socio.id).select();
    let error=null;
    if(!actualizada||actualizada.length===0){
      const res=await supabase.from("inscripciones").insert({actividad_id:id, socio_id:socio.id, estado:"pendiente"});
      error=res.error;
    }
    setProcesando(null);
    if(error){ ok("❌ Error al apuntarte, inténtalo de nuevo"); return; }
    setActividades(p=>p.map(a=>a.id===id?{...a,inscrito:true,miEstado:"pendiente",inscritos:a.inscritos+1}:a));
    setModalAct(null);
    ok("✅ Te has apuntado correctamente. La junta confirmará tu plaza.");
  };

  const desapuntarse=async(id)=>{
    setProcesando(id);
    const {error}=await supabase.from("inscripciones").update({estado:"cancelada"}).eq("actividad_id",id).eq("socio_id",socio.id);
    setProcesando(null);
    if(error){ ok("❌ Error al cancelar, inténtalo de nuevo"); return; }
    setActividades(p=>p.map(a=>a.id===id?{...a,inscrito:false,miEstado:null,inscritos:Math.max(0,a.inscritos-1)}:a));
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
            <Card key={a.id} style={{borderTop:`3px solid ${a.inscrito?C.verde:C.border}`,padding:a.cartel_url?0:16,overflow:"hidden"}}>
              {a.cartel_url&&<img src={a.cartel_url} alt={a.nombre} style={{width:"100%",height:110,objectFit:"cover",display:"block"}}/>}
              <div style={a.cartel_url?{padding:16}:{}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:24,flexShrink:0}}>{tipoIcon[a.tipo]||"📌"}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.text,paddingRight:8}}>{a.nombre}</div>
                    <Pill text={a.inscrito?(a.miEstado==="confirmada"?"✅ Confirmado":"⏳ Pendiente de confirmar"):lleno?"🔴 Completo":"Plaza libre"} color={a.inscrito?(a.miEstado==="confirmada"?C.verde:C.oro):lleno?C.rojo:C.azul} bg={a.inscrito?(a.miEstado==="confirmada"?C.verdeLight:C.oroLight):lleno?C.rojoLight:C.azulLight}/>
                  </div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📅 {fmtFecha(a.fecha)} · {a.precio_socio===0?"Gratis":fmt(a.precio_socio)}/persona · {a.inscritos}/{a.plazas} plazas</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setModalAct(a)} style={{padding:"7px 14px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.text}}>Ver detalles</button>
                    {!a.inscrito&&!lleno&&(
                      <button onClick={()=>apuntarse(a.id)} disabled={procesando===a.id} style={{padding:"7px 14px",background:procesando===a.id?"#bbb":C.granate,border:"none",borderRadius:8,cursor:procesando===a.id?"not-allowed":"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",color:C.blanco}}>{procesando===a.id?"...":"Apuntarme"}</button>
                    )}
                    {a.inscrito&&(
                      <button onClick={()=>desapuntarse(a.id)} disabled={procesando===a.id} style={{padding:"7px 14px",background:C.blanco,border:`1px solid ${C.rojo}`,borderRadius:8,cursor:procesando===a.id?"not-allowed":"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",color:C.rojo}}>{procesando===a.id?"...":"Cancelar"}</button>
                    )}
                  </div>
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

// ── TAB: NOTICIAS ─────────────────────────────────────────
function TabNoticias({noticias}){
  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>📢 Noticias</h2>
      {noticias.length===0?(
        <p style={{color:C.muted,fontSize:13}}>Todavía no hay noticias publicadas.</p>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {noticias.map(n=>(
            <Card key={n.id}>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{n.titulo}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2,marginBottom:8}}>{new Date(n.created_at).toLocaleDateString("es-ES")}</div>
              <p style={{fontSize:13,color:C.gris,lineHeight:1.5,whiteSpace:"pre-wrap",marginBottom:n.adjunto_url?10:0}}>{n.cuerpo}</p>
              {n.adjunto_url&&<a href={n.adjunto_url} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"7px 14px",background:C.granateLight,borderRadius:8,fontSize:12,fontWeight:700,color:C.granateDark,textDecoration:"none"}}>📎 {n.adjunto_nombre||"Ver adjunto"}</a>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB: ACTAS ────────────────────────────────────────────
function TabActas({actas}){
  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>📜 Actas de la peña</h2>
      {actas.length===0?(
        <p style={{color:C.muted,fontSize:13}}>Todavía no hay actas publicadas.</p>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {actas.map(a=>(
            <Card key={a.id}>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{a.titulo}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2,marginBottom:a.resumen?8:0}}>{fmtFecha(a.fecha)}</div>
              {a.resumen&&<p style={{fontSize:13,color:C.gris,lineHeight:1.5,marginBottom:a.pdf_url?10:0}}>{a.resumen}</p>}
              {a.pdf_url&&<a href={a.pdf_url} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"7px 14px",background:C.granateLight,borderRadius:8,fontSize:12,fontWeight:700,color:C.granateDark,textDecoration:"none"}}>📄 Ver PDF del acta</a>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB: DOCUMENTOS ───────────────────────────────────────
function TabDocumentos({socio,generandoPDF,onDescargarFicha,misSolicitudes}){
  const consentimientos=[
    {k:"rgpd",                   l:"Tratamiento de datos (obligatorio)"},
    {k:"consent_foto_interna",   l:"Foto comunicación interna"},
    {k:"consent_foto_rrss",      l:"Foto redes sociales"},
    {k:"consent_foto_web",       l:"Foto web y materiales"},
    {k:"consent_foto_levante",   l:"Foto cesión Levante UD/Federación"},
    {k:"consent_promo_pena",     l:"Comunicaciones promocionales peña"},
    {k:"consent_patrocinadores", l:"Info patrocinadores"},
    {k:"consent_whatsapp",       l:"Grupo WhatsApp"},
  ];
  const campoBonito=(c)=>({nombre:"Nombre",apellidos:"Apellidos",dni:"DNI/NIE",telefono:"Teléfono",email:"Email",fecha_nac:"Fecha nacimiento",municipio:"Municipio",tiene_acciones:"Tiene acciones Levante",num_acciones:"Nº de acciones",es_abonado:"Es abonado",num_abonado:"Nº de abonado"}[c]||c);
  const estadoInfo={
    pendiente:{text:"⏳ Pendiente",color:C.oro,bg:C.oroLight},
    aprobada:{text:"✅ Aprobada",color:C.verde,bg:C.verdeLight},
    rechazada:{text:"❌ Rechazada",color:C.rojo,bg:C.rojoLight},
  };

  return(
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark,marginBottom:16}}>📁 Mis documentos</h2>

      {/* Descargar ficha PDF */}
      <Card style={{marginBottom:16,borderLeft:`4px solid ${C.granate}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.text}}>📄 Mi ficha de verificación</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>Genera un PDF actualizado con tus datos y consentimientos actuales</div>
          </div>
          <button onClick={onDescargarFicha} disabled={generandoPDF} style={{padding:"9px 16px",background:generandoPDF?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:8,cursor:generandoPDF?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",flexShrink:0}}>
            {generandoPDF?"Generando...":"Descargar PDF"}
          </button>
        </div>
      </Card>

      {/* Estado RGPD */}
      <Card style={{marginBottom:16,borderLeft:`4px solid ${socio.rgpd?C.verde:C.rojo}`}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <span style={{fontSize:28}}>{socio.rgpd?"✅":"❌"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.text}}>Consentimiento RGPD</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              {socio.rgpd?"Firmado correctamente · Tus datos están protegidos":"Pendiente de firma · Ve a Inicio y solicita el cambio"}
            </div>
          </div>
        </div>
      </Card>

      {/* Todos los consentimientos */}
      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Consentimientos otorgados</h3>
      <Card style={{padding:0,marginBottom:16}}>
        {consentimientos.map((c,i)=>(
          <div key={c.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<consentimientos.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:13,color:C.text}}>{c.l}</span>
            <Pill text={socio[c.k]?"✅ Sí":"❌ No"} color={socio[c.k]?C.verde:C.gris} bg={socio[c.k]?C.verdeLight:C.grisLight}/>
          </div>
        ))}
      </Card>

      {/* Mis solicitudes de cambio */}
      <h3 style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Mis solicitudes de cambio</h3>
      <Card style={{padding:0,marginBottom:16}}>
        {misSolicitudes.length===0?(
          <p style={{padding:16,color:C.muted,fontSize:13}}>Todavía no has solicitado ningún cambio.</p>
        ):misSolicitudes.map((v,i)=>{
          const ei=estadoInfo[v.estado]||estadoInfo.pendiente;
          return(
            <div key={v.id} style={{padding:"11px 16px",borderBottom:i<misSolicitudes.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:v.comentario_junta?4:0}}>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{campoBonito(v.campo)}</span>
                  <span style={{fontSize:12,color:C.muted,marginLeft:8}}>→ {v.valor_nuevo}</span>
                </div>
                <Pill text={ei.text} color={ei.color} bg={ei.bg}/>
              </div>
              {v.comentario_junta&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Junta: {v.comentario_junta}</div>}
            </div>
          );
        })}
      </Card>

      <div style={{padding:"12px 16px",background:C.azulLight,borderRadius:12,fontSize:13,color:C.azul,lineHeight:1.5}}>
        ℹ️ Para cambiar cualquier consentimiento, entra en el portal de verificación de datos o contacta con la junta directiva.
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
  const [enviando,setEnviando]=useState(false);

  const enviar=async()=>{
    if(!valor) return;
    setEnviando(true);
    await supabase.from("verificaciones").insert({
      socio_id: socio.id,
      campo,
      valor_anterior: String(socio[campo]||""),
      valor_nuevo: valor,
      comentario,
      estado: "pendiente",
    });
    setEnviando(false);
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
    {key:"tiene_acciones",label:"¿Tienes acciones del Levante?",type:"boolean"},
    {key:"num_acciones",label:"Número de acciones",type:"number"},
    {key:"es_abonado",label:"¿Eres abonado?",type:"boolean"},
    {key:"num_abonado",label:"Número de abonado"},
  ];
  const campoActual=camposEditables.find(c=>c.key===campo);

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
            <select value={campo} onChange={e=>{setCampo(e.target.value);setValor("");}} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit"}}>
              {camposEditables.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Nuevo valor</label>
            {campoActual?.type==="boolean"?(
              <select value={valor} onChange={e=>setValor(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit"}}>
                <option value="">— Selecciona —</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            ):(
              <input value={valor} onChange={e=>setValor(e.target.value)} type={campoActual?.type==="number"?"number":"text"} placeholder={`Nuevo ${campoActual?.label||"valor"}`}
                style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            )}
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Comentario (opcional)</label>
            <textarea value={comentario} onChange={e=>setComentario(e.target.value)} rows={3} placeholder="Explica brevemente el motivo del cambio..."
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:11,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontWeight:600,color:C.gris,fontFamily:"inherit"}}>Cancelar</button>
            <button onClick={enviar} disabled={enviando} style={{flex:1,padding:11,background:enviando?"#bbb":C.granate,border:"none",borderRadius:8,cursor:enviando?"not-allowed":"pointer",fontWeight:700,color:C.blanco,fontFamily:"inherit",fontSize:15}}>{enviando?"Enviando...":"Enviar solicitud"}</button>
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
  const [cuotas,setCuotas]=useState([]);
  const [actividades,setActividades]=useState([]);
  const [loteria,setLoteria]=useState([]);
  const [actas,setActas]=useState([]);
  const [historialPagos,setHistorialPagos]=useState([]);
  const [misSolicitudes,setMisSolicitudes]=useState([]);
  const [noticias,setNoticias]=useState([]);
  const [cargandoDatos,setCargandoDatos]=useState(false);
  const [modalCambio,setModalCambio]=useState(false);
  const [perfilesDisponibles,setPerfilesDisponibles]=useState(null); // para selector
  const [perfilesSession,setPerfilesSession]=useState([]); // todos los perfiles del tel.
  const [generandoPDF,setGenerandoPDF]=useState(false);
  const [pantalla,setPantalla]=useState("inicial"); // inicial | telefono | cuenta | pendiente
  const [comprobandoSesion,setComprobandoSesion]=useState(true);

  const logout=async()=>{
    await supabase.auth.signOut().catch(()=>{});
    setSocio(null);setTab("inicio");setPerfilesDisponibles(null);setPerfilesSession([]);setPantalla("inicial");
  };

  // Al cargar: si hay una sesión de Supabase Auth activa (cuenta usuario/contraseña), entrar directo
  useEffect(()=>{
    (async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(session?.user){
        const {data:socioRow}=await supabase.from("socios").select("*").eq("auth_user_id",session.user.id).maybeSingle();
        if(socioRow){
          if(socioRow.cuenta_aprobada){
            // Igual que en el login manual: si es tutor de menores, se ofrece elegir perfil
            const {data:menores}=await supabase.from("socios").select("*").eq("tutor_id",socioRow.id).eq("estado","activo");
            const perfiles=[socioRow, ...(menores||[])];
            if(perfiles.length>1) handleMultiple(perfiles);
            else { setSocio(socioRow); setPerfilesSession([socioRow]); }
          }
          else setPantalla("pendiente");
        }
      }
      setComprobandoSesion(false);
    })();
  },[]);

  const handleMultiple=(perfiles)=>{
    setPerfilesSession(perfiles);
    setPerfilesDisponibles(perfiles);
  };

  const handleSeleccionar=(perfil)=>{
    setPerfilesDisponibles(null);
    setSocio(perfil);
    setTab("inicio");
  };

  // Cargar cuotas, actividades+inscripciones y lotería del socio activo
  useEffect(()=>{
    if(!socio) return;
    let cancelado=false;
    (async()=>{
      setCargandoDatos(true);
      const [cuotasRes, actRes, inscRes, insTodasRes, loteriaRes, actasRes, noticiasRes, verifRes] = await Promise.all([
        supabase.from("cuotas").select("*").eq("socio_id",socio.id).order("temporada",{ascending:false}),
        supabase.from("actividades").select("*").neq("estado","cancelada").order("fecha",{ascending:true}),
        supabase.from("inscripciones").select("actividad_id,estado,pagado,fecha_pago").eq("socio_id",socio.id).neq("estado","cancelada"),
        supabase.from("inscripciones").select("actividad_id").neq("estado","cancelada"),
        supabase.from("loteria").select("*").eq("socio_id",socio.id).order("id",{ascending:false}),
        supabase.from("actas").select("*").order("fecha",{ascending:false}),
        supabase.from("noticias").select("*").order("created_at",{ascending:false}),
        supabase.from("verificaciones").select("*").eq("socio_id",socio.id).order("created_at",{ascending:false}),
      ]);
      if(cancelado) return;
      const misInscripciones = inscRes.data||[];
      const misInscripcionesMap = new Map(misInscripciones.map(i=>[i.actividad_id,i]));
      const conteoPorActividad = {};
      (insTodasRes.data||[]).forEach(i=>{ conteoPorActividad[i.actividad_id]=(conteoPorActividad[i.actividad_id]||0)+1; });
      const hoyStr = new Date().toISOString().split("T")[0];
      const actividadesFinal = (actRes.data||[]).map(a=>({
        ...a,
        inscrito: misInscripcionesMap.has(a.id),
        miEstado: misInscripcionesMap.get(a.id)?.estado||null,
        inscritos: conteoPorActividad[a.id]||0,
        pasada: a.fecha < hoyStr,
      }));

      // Historial de pagos consolidado: cuotas + lotería + actividades, todo ya PAGADO
      const historial=[];
      (cuotasRes.data||[]).filter(c=>c.pagado).forEach(c=>historial.push({
        tipo:"Cuota", concepto:`Cuota ${c.temporada}`, importe:Number(c.importe),
        fecha:c.fecha_pago, forma:c.forma_pago,
      }));
      (loteriaRes.data||[]).filter(l=>l.pagado).forEach(l=>historial.push({
        tipo:"Lotería", concepto:l.concepto, importe:Number(l.importe_total||0),
        fecha:l.fecha_pago, forma:null,
      }));
      misInscripciones.filter(i=>i.pagado).forEach(i=>{
        const act=(actRes.data||[]).find(a=>a.id===i.actividad_id);
        historial.push({
          tipo:"Actividad", concepto:act?.nombre||"Actividad", importe:Number(act?.precio_socio||0),
          fecha:i.fecha_pago, forma:null,
        });
      });
      historial.sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""));

      setCuotas(cuotasRes.data||[]);
      setActividades(actividadesFinal);
      setLoteria(loteriaRes.data||[]);
      setActas(actasRes.data||[]);
      setNoticias(noticiasRes.data||[]);
      setHistorialPagos(historial);
      setMisSolicitudes(verifRes.data||[]);
      setCargandoDatos(false);
    })();
    return ()=>{cancelado=true;};
  },[socio?.id]);

  const descargarFicha=async()=>{
    setGenerandoPDF(true);
    try{
      const blob=await generarPDFBlob(socio);
      const url=URL.createObjectURL(blob);
      window.open(url,"_blank");
    }catch(e){ console.error("Error generando PDF:",e); alert("No se ha podido generar el PDF, inténtalo de nuevo."); }
    setGenerandoPDF(false);
  };

  // Perfiles disponibles para cambiar (el propio + tutelados)
  const otrosPerfiles=perfilesSession.filter(p=>p.id!==socio?.id);

  if(comprobandoSesion) return <div style={{minHeight:"100vh",background:C.granateDark,display:"flex",alignItems:"center",justifyContent:"center",color:C.blanco,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;
  if(pantalla==="pendiente") return <PantallaPendiente onLogout={logout}/>;
  if(!socio&&pantalla==="inicial") return <AccesoInicial onCuenta={()=>setPantalla("cuenta")} onTelefono={()=>setPantalla("telefono")}/>;
  if(!socio&&pantalla==="cuenta") return <AccesoCuenta onLogin={s=>{setSocio(s);setPerfilesSession([s]);}} onMultiple={handleMultiple} onPendiente={()=>setPantalla("pendiente")} onVolver={()=>setPantalla("inicial")}/>;
  if(!socio&&pantalla==="telefono"&&!perfilesDisponibles) return <Login onLogin={s=>{setSocio(s);setPerfilesSession([s]);}} onMultiple={handleMultiple} onVolver={()=>setPantalla("inicial")}/>;
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
        {cargandoDatos?(
          <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>Cargando tus datos...</div>
        ):(<>
          {tab==="inicio"     &&<TabInicio      socio={socio} cuotas={cuotas} actividades={actividades} loteria={loteria} setTab={setTab} onSolicitarCambio={()=>setModalCambio(true)}/>}
          {tab==="cuotas"     &&<TabCuotas      cuotas={cuotas} loteria={loteria} historialPagos={historialPagos}/>}
          {tab==="actividades"&&<TabActividades actividades={actividades} setActividades={setActividades} socio={socio}/>}
          {tab==="noticias"   &&<TabNoticias noticias={noticias}/>}
          {tab==="actas"      &&<TabActas actas={actas}/>}
          {tab==="documentos" &&<TabDocumentos  socio={socio} generandoPDF={generandoPDF} onDescargarFicha={descargarFicha} misSolicitudes={misSolicitudes}/>}
        </>)}
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
