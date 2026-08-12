import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// URL Edge Function Resend
const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || "https://qgmovsqawnadgvywlbyw.supabase.co/functions/v1";
const SECRETARIO_EMAIL = "penyaranamecanica@gmail.com";

// Generar PDF de verificación usando solo HTML/CSS (sin librería externa)
const generarPDFHTML = (socio) => {
  const fmtF=(f)=>{ if(!f) return "—"; const d=f.split("T")[0].split("-"); return `${d[2]}/${d[1]}/${d[0]}`; };
  const si_no=(v)=>v?"✅ Sí":"❌ No";
  const ahora = new Date().toLocaleString("es-ES");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <div style="text-align:center; background:#8B0A3A; padding:20px; border-radius:8px; margin-bottom:20px;">
        <h1 style="color:white; margin:0; font-size:20px;">🐸 Peña Levantinista La Rana Mecánica</h1>
        <p style="color:rgba(255,255,255,0.8); margin:6px 0 0;">Godella-Rocafort · Temporada 2026/2027</p>
      </div>

      <h2 style="color:#8B0A3A; border-bottom:2px solid #8B0A3A; padding-bottom:8px;">Verificación de datos del socio</h2>
      
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600; width:40%;">Nº Socio</td><td style="padding:8px 12px;">${socio.numero}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:600;">Nombre completo</td><td style="padding:8px 12px;">${socio.nombre} ${socio.apellidos}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600;">DNI / NIE</td><td style="padding:8px 12px;">${socio.dni||"—"}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:600;">Fecha nacimiento</td><td style="padding:8px 12px;">${fmtF(socio.fecha_nac)}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600;">Teléfono</td><td style="padding:8px 12px;">${socio.telefono==="512512"?"(pendiente)":socio.telefono||"—"}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:600;">Email</td><td style="padding:8px 12px;">${socio.email||"—"}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600;">Municipio</td><td style="padding:8px 12px;">${socio.municipio||"—"}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:600;">Tipo</td><td style="padding:8px 12px;">${socio.tipo}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600;">Cargo</td><td style="padding:8px 12px;">${socio.cargo}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:600;">Acciones Levante</td><td style="padding:8px 12px;">${socio.tiene_acciones?(socio.num_acciones||1)+" acción/es":"No"}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:8px 12px; font-weight:600;">Nº Abonado</td><td style="padding:8px 12px;">${socio.es_abonado?(socio.num_abonado||"Sí"):"No abonado/a"}</td></tr>
      </table>

      <h3 style="color:#8B0A3A; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Consentimientos otorgados</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr style="background:#f8fafc;"><td style="padding:7px 12px; font-weight:600;">📋 Tratamiento de datos (obligatorio)</td><td style="padding:7px 12px;">${si_no(socio.rgpd||socio.consent_datos)}</td></tr>
        <tr><td style="padding:7px 12px;">📸 Foto comunicación interna</td><td style="padding:7px 12px;">${si_no(socio.consent_foto_interna)}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 12px;">📱 Foto redes sociales</td><td style="padding:7px 12px;">${si_no(socio.consent_foto_rrss)}</td></tr>
        <tr><td style="padding:7px 12px;">🌐 Foto web y materiales</td><td style="padding:7px 12px;">${si_no(socio.consent_foto_web)}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 12px;">⚽ Foto cesión Levante UD/Federación</td><td style="padding:7px 12px;">${si_no(socio.consent_foto_levante)}</td></tr>
        <tr><td style="padding:7px 12px;">📢 Comunicaciones promocionales peña</td><td style="padding:7px 12px;">${si_no(socio.consent_promo_pena)}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 12px;">🤝 Info patrocinadores</td><td style="padding:7px 12px;">${si_no(socio.consent_patrocinadores)}</td></tr>
        <tr><td style="padding:7px 12px;">💬 Grupo WhatsApp</td><td style="padding:7px 12px;">${si_no(socio.consent_whatsapp)}</td></tr>
      </table>

      <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:14px; margin-bottom:20px;">
        <p style="margin:0; font-size:13px; color:#166534;">
          ✅ Datos verificados digitalmente el <strong>${ahora}</strong><br/>
          El socio ha confirmado que sus datos son correctos a través del portal de verificación de la Peña Levantinista La Rana Mecánica.
        </p>
      </div>

      <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; padding:16px; margin-bottom:16px; font-size:11px; color:#1e293b; line-height:1.6;">
        <p style="font-weight:700; font-size:12px; margin:0 0 8px; color:#8B0A3A;">INFORMACIÓN BÁSICA SOBRE PROTECCIÓN DE DATOS</p>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <tr><td style="padding:4px 8px; font-weight:700; width:30%; vertical-align:top;">Responsable</td><td style="padding:4px 8px;">Peña Levantinista La Rana Mecánica (Godella-Rocafort)</td></tr>
          <tr style="background:#fef9f9;"><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Finalidad</td><td style="padding:4px 8px;">Gestión de la relación asociativa: altas/bajas, cuotas, comunicaciones operativas sobre actividades, administración interna y cumplimiento de obligaciones legales.</td></tr>
          <tr><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Legitimación</td><td style="padding:4px 8px;">Consentimiento del interesado y ejecución del vínculo asociativo.</td></tr>
          <tr style="background:#fef9f9;"><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Destinatarios</td><td style="padding:4px 8px;">Levante UD / Fundación Levante UD y Federación de Peñas (cuando sea necesario para acreditaciones, entradas, actos o actividades conjuntas); Administraciones Públicas (Agencia Tributaria, Ayuntamiento, Generalitat u otras, cuando exista obligación legal, subvenciones o procedimientos administrativos); Entidades bancarias (para gestión de cuotas y pagos); Aseguradoras (si determinadas actividades están aseguradas); Proveedores de servicios tecnológicos como encargados del tratamiento (alojamiento web, plataforma de gestión, almacenamiento cloud).</td></tr>
          <tr><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Plazo</td><td style="padding:4px 8px;">Mientras se mantenga la condición de socio y, tras la baja, durante los plazos legales de conservación.</td></tr>
          <tr style="background:#fef9f9;"><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Derechos</td><td style="padding:4px 8px;">Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndose a: <strong>penyaranamecanica@gmail.com</strong>. Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</td></tr>
          <tr><td style="padding:4px 8px; font-weight:700; vertical-align:top;">Información adicional</td><td style="padding:4px 8px;">La negativa a autorizar la publicación de imágenes no impide ser socio ni participar normalmente en las actividades. Los consentimientos opcionales pueden retirarse en cualquier momento sin efectos retroactivos.</td></tr>
        </table>
      </div>

      <div style="background:#f0f9ff; border:1px solid #7dd3fc; border-radius:8px; padding:14px; margin-bottom:20px; font-size:11px; color:#0c4a6e; line-height:1.6;">
        <p style="font-weight:700; font-size:12px; margin:0 0 8px;">NORMAS DE USO DEL GRUPO DE WHATSAPP (si ha otorgado consentimiento)</p>
        <p style="margin:0;">La incorporación al grupo de WhatsApp de La Rana Mecánica es voluntaria. Queda prohibido compartir datos personales, fotografías o conversaciones de otros miembros fuera del grupo sin su autorización expresa. El grupo se utilizará exclusivamente para comunicaciones relacionadas con las actividades de la peña. El incumplimiento de estas normas podrá conllevar la expulsión del grupo.</p>
      </div>

      <div style="background:#fef9c3; border:1px solid #fde047; border-radius:8px; padding:12px; margin-bottom:20px; font-size:11px; color:#713f12;">
        <strong>⚠️ Nota:</strong> Este documento debe ser impreso, firmado por el socio (o su tutor legal si es menor de edad) y entregado al Secretario de la Peña para su archivo. La firma de este documento acredita que el socio ha sido informado sobre el tratamiento de sus datos personales y ha prestado los consentimientos indicados.
      </div>

      <div style="border-top:2px solid #e2e8f0; padding-top:20px; margin-top:20px;">
        <p style="font-size:13px; color:#64748b; margin-bottom:30px;">
          Firma del socio / tutor legal (en caso de menor):
        </p>
        <div style="border-bottom:1px solid #94a3b8; margin-bottom:8px; height:40px;"></div>
        <p style="font-size:12px; color:#94a3b8; margin:0;">Nombre: ${socio.nombre} ${socio.apellidos} &nbsp;&nbsp;&nbsp; Fecha: ___/___/______</p>
      </div>

      <p style="font-size:11px; color:#94a3b8; text-align:center; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px;">
        Peña Levantinista La Rana Mecánica · Godella-Rocafort · penyaranamecanica@gmail.com
      </p>
    </div>
  `;
};

// Enviar email via Edge Function Resend
const enviarEmail = async (destinatario, asunto, html) => {
  try {
    const res = await fetch(`${FUNCTIONS_URL}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: destinatario, subject: asunto, html }),
    });
    return res.ok;
  } catch(e) {
    console.error("Error enviando email:", e);
    return false;
  }
};

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

// Cliente Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://qgmovsqawnadgvywlbyw.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

const fmtFecha = (f) => { if(!f) return "—"; const[y,m,d]=f.split("T")[0].split("-"); return `${d}/${m}/${y}`; };

// ── SELECTOR DE PERFIL ────────────────────────────────
function SelectorPerfil({perfiles, onSeleccionar, onVolver}){
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
            <button key={p.id} onClick={()=>onSeleccionar(p)}
              style={{background:C.blanco,border:"none",borderRadius:14,padding:"16px 18px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:14,textAlign:"left",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:p.tipo==="infantil"?C.azul:C.granate,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,color:C.blanco}}>
                {p.tipo==="infantil"?"👶":p.nombre[0]+p.apellidos[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text}}>{p.nombre} {p.apellidos}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                  {p.numero} · {p.tipo==="infantil"?"👶 Menor — acceso tutor/a":p.cargo}
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

// ── LOGIN ─────────────────────────────────────────────
function Login({onLogin, onMultiple}){
  const [tel,setTel]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const buscar=async()=>{
    const t=tel.replace(/\s/g,"").replace(/^(\+34|0034)/,"");
    if(t.length<6){setError("Introduce un teléfono válido");return;}
    setLoading(true); setError("");
    try {
      // Buscar en Supabase por teléfono
      const {data, error:err} = await supabase
        .from("socios")
        .select("*")
        .eq("telefono", t)
        .eq("estado", "activo");

      if(err) throw err;

      if(!data || data.length===0){
        // Intentar con 512512 (código temporal)
        setError("No encontramos ningún peñista con ese teléfono. Si no tienes teléfono registrado, usa el código 512512.");
        setLoading(false);
        return;
      }

      // Separar adultos e infantiles
      const adultos = data.filter(s=>s.tipo!=="infantil");
      const infantiles = data.filter(s=>s.tipo==="infantil");

      // Buscar menores vinculados por tutor_id
      let menoresVinculados = [];
      if(adultos.length>0){
        const tutorId = adultos[0].id;
        const {data:menores} = await supabase
          .from("socios")
          .select("*")
          .eq("tutor_id", tutorId)
          .eq("estado", "activo");
        if(menores) menoresVinculados = menores;
      }

      // Combinar todos los perfiles únicos
      const todos = [...new Map([...data,...menoresVinculados].map(s=>[s.id,s])).values()];

      if(todos.length>1){
        onMultiple(todos);
      } else {
        onLogin(todos[0]);
      }
    } catch(e) {
      console.error(e);
      setError("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="La Rana Mecánica" style={{width:120,height:120,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:22,fontWeight:700,marginBottom:6}}>Verifica tus datos</h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.5}}>Peña Levantinista La Rana Mecánica<br/>Temporada 2026/2027 · Rocafort-Godella</p>
        </div>

        <div style={{background:C.blanco,borderRadius:20,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>
            Accede con el teléfono registrado en la peña para ver y confirmar tus datos de esta temporada.
          </p>
          <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tu teléfono</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{background:C.grisLight,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:15,color:C.gris,flexShrink:0}}>🇪🇸 +34</div>
            <input type="tel" value={tel} onChange={e=>{setTel(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&buscar()}
              placeholder="6XX XXX XXX" maxLength={12} autoFocus
              style={{flex:1,padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:18,fontWeight:600,letterSpacing:2,outline:"none",fontFamily:"monospace",color:C.text,boxSizing:"border-box",width:"100%"}}/>
          </div>
          {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo,display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}
          <button onClick={buscar} disabled={loading} style={{width:"100%",padding:13,background:loading?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {loading?"Buscando...":"Acceder a mis datos →"}
          </button>
          <p style={{marginTop:14,fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.5}}>
            Sin teléfono registrado: usa el código <strong>512512</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── MIS DATOS ─────────────────────────────────────────
function MisDatos({socio, onLogout, onCorregir, onCambiarPerfil}){
  const [confirmado,setConfirmado]=useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [consents,setConsents]=useState({
    rgpd:             socio.rgpd||false,
    consent_foto_interna:  socio.consent_foto_interna||false,
    consent_foto_rrss:     socio.consent_foto_rrss||false,
    consent_foto_web:      socio.consent_foto_web||false,
    consent_foto_levante:  socio.consent_foto_levante||false,
    consent_promo_pena:    socio.consent_promo_pena||false,
    consent_patrocinadores:socio.consent_patrocinadores||false,
    consent_whatsapp:      socio.consent_whatsapp||false,
  });
  const setC=(k,v)=>setConsents(c=>({...c,[k]:v}));

  const descargarPDF=(s)=>{
    const htmlDoc = generarPDFHTML(s);
    const ventana = window.open("","_blank");
    if(ventana){
      ventana.document.write(htmlDoc);
      ventana.document.close();
      setTimeout(()=>ventana.print(),500);
    }
  };

  const confirmar=async()=>{
    setEnviandoEmail(true);
    // Marcar como verificado en Supabase
    await supabase.from("socios").update({
      verificado:true,
      fecha_consentimiento: new Date().toISOString(),
      rgpd: consents.rgpd,
      consent_foto_interna:   consents.consent_foto_interna,
      consent_foto_rrss:      consents.consent_foto_rrss,
      consent_foto_web:       consents.consent_foto_web,
      consent_foto_levante:   consents.consent_foto_levante,
      consent_promo_pena:     consents.consent_promo_pena,
      consent_patrocinadores: consents.consent_patrocinadores,
      consent_whatsapp:       consents.consent_whatsapp,
    }).eq("id",socio.id);
    // Actualizar el objeto socio local con los consentimientos
    Object.assign(socio, consents);

    // Generar HTML del documento
    const htmlDoc = generarPDFHTML(socio);

    // Enviar email al peñista (si tiene email)
    if(socio.email && socio.email !== "512512") {
      await enviarEmail(
        socio.email,
        `✅ Verificación de datos - La Rana Mecánica - Temporada 2026/2027`,
        `<h2>Hola ${socio.nombre},</h2>
        <p>Has verificado correctamente tus datos en la Peña Levantinista La Rana Mecánica para la temporada 2026/2027.</p>
        <p>Adjunto encontrarás tu ficha de socio con los consentimientos otorgados. <strong>Por favor, imprímela, fírmala y entrégala al Secretario de la Peña.</strong></p>
        <hr/>
        ${htmlDoc}`
      );
    }

    // Enviar copia al secretario
    await enviarEmail(
      SECRETARIO_EMAIL,
      `📋 Verificación completada: ${socio.nombre} ${socio.apellidos} (${socio.numero})`,
      `<h2>Verificación completada</h2>
      <p><strong>${socio.nombre} ${socio.apellidos}</strong> (${socio.numero}) ha verificado sus datos correctamente el ${new Date().toLocaleString("es-ES")}.</p>
      <hr/>
      ${htmlDoc}`
    );

    setEnviandoEmail(false);
    setConfirmado(true);
  };

  const vacios=[];
  if(!socio.dni) vacios.push("DNI / NIE");
  if(!socio.email) vacios.push("Email");
  if(!socio.fecha_nac) vacios.push("Fecha de nacimiento");

  if(confirmado) return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.blanco,borderRadius:20,padding:"36px 28px",maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>✅</div>
        <h2 style={{color:C.verde,fontSize:22,fontWeight:700,marginBottom:10}}>¡Datos confirmados!</h2>
        <p style={{color:C.gris,fontSize:14,marginBottom:16,lineHeight:1.6}}>Gracias <strong>{socio.nombre}</strong>. La junta ha recibido tu confirmación para la temporada 2026/2027.</p>
        {socio.email&&<div style={{background:C.azulLight,borderRadius:10,padding:"12px",marginBottom:12,fontSize:13,color:C.azul}}>
          📧 Te hemos enviado un email a <strong>{socio.email}</strong> con tu ficha de socio. Imprímela, fírmala y entrégala al Secretario.
        </div>}
        <div style={{background:C.oroLight,borderRadius:10,padding:"12px",marginBottom:16,fontSize:13,color:"#7a5c00"}}>
          📋 También hemos enviado una copia a la junta directiva.
        </div>
        <div style={{background:C.granateLight,borderRadius:10,padding:"12px",marginBottom:16,fontSize:14,color:C.granateDark,fontWeight:600}}>🐸 ¡Visca el Levante i la Rana Mecànica!</div>
        <button onClick={()=>descargarPDF(socio)} style={{width:"100%",padding:13,background:C.azul,color:C.blanco,border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",marginBottom:10}}>
          📄 Descargar mi ficha en PDF
        </button>
        <p style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.5}}>Imprímela, fírmala y entrégala al Secretario de la peña.</p>
        <button onClick={onLogout} style={{width:"100%",padding:11,background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",fontWeight:600,color:C.gris,fontFamily:"inherit"}}>Cerrar sesión</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.granateDark,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO} alt="logo" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
          <div>
            <div style={{color:C.blanco,fontWeight:700,fontSize:14}}>La Rana Mecánica</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Temporada 2026/2027</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {onCambiarPerfil&&<button onClick={onCambiarPerfil} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>👥 Cambiar</button>}
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Salir</button>
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",borderTop:`4px solid ${C.granate}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <h2 style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:2}}>
                {socio.tipo==="infantil"?`Panel de ${socio.nombre} 👶`:`Hola, ${socio.nombre} 👋`}
              </h2>
              <p style={{color:C.muted,fontSize:13}}>
                {socio.tipo==="infantil"?"Acceso gestionado por el tutor/a":"Revisa que tus datos son correctos"}
              </p>
            </div>
            <div style={{background:C.granateLight,borderRadius:10,padding:"8px 12px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.granate,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Nº Socio</div>
              <div style={{fontFamily:"monospace",fontWeight:800,color:C.granateDark,fontSize:14}}>{socio.numero}</div>
            </div>
          </div>
        </div>

        {socio.tipo==="infantil"&&(
          <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:12,padding:"11px 14px",marginBottom:12,fontSize:13,color:C.azul,display:"flex",gap:8,alignItems:"center"}}>
            <span>ℹ️</span><span>Este perfil pertenece a <strong>{socio.nombre}</strong> (menor de edad). Estás accediendo como su tutor/a.</span>
          </div>
        )}

        {vacios.length>0&&(
          <div style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div>
              <div style={{fontWeight:600,color:C.oro,fontSize:13,marginBottom:2}}>Datos incompletos</div>
              <div style={{fontSize:13,color:"#7a5c00"}}>Faltan: <strong>{vacios.join(", ")}</strong></div>
            </div>
          </div>
        )}

        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14}}>
            {socio.tipo==="infantil"?"Datos del menor":"Tus datos en la peña"}
          </h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["Nombre",socio.nombre],
              ["Apellidos",socio.apellidos],
              ["DNI / NIE",socio.dni||"—"],
              ["Fecha nac.",fmtFecha(socio.fecha_nac)],
              ["Teléfono",socio.telefono==="512512"?"(pendiente)":socio.telefono||"—"],
              ["Email",socio.email||"—"],
              ["Tipo",socio.tipo],
              ["Cargo",socio.cargo],
              ["Acciones Levante",socio.tiene_acciones?(socio.num_acciones||1)+" acción/es":"No"],
              ["Nº Abonado",socio.es_abonado?(socio.num_abonado||"Sí"):"No abonado/a"],
            ].map(([k,v])=>(
              <div key={k} style={{padding:"10px 12px",background:C.grisLight,borderRadius:10}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,fontWeight:600}}>{k}</div>
                <div style={{fontSize:14,fontWeight:600,color:v==="—"?C.muted:C.text,wordBreak:"break-word",textTransform:"capitalize"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONSENTIMIENTOS ── */}
        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:C.granateDark,marginBottom:4}}>📋 Consentimientos</h3>
          <p style={{fontSize:12,color:C.muted,marginBottom:14}}>Revisa y marca tus preferencias. Puedes cambiarlas en cualquier momento.</p>

          {/* Obligatorio */}
          <div style={{background:consents.rgpd?C.verdeLight:"#fff8e1",border:`2px solid ${consents.rgpd?C.verde:"#f59e0b"}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <label style={{display:"flex",gap:10,cursor:"pointer",alignItems:"flex-start"}}>
              <input type="checkbox" checked={consents.rgpd} onChange={e=>setC("rgpd",e.target.checked)}
                style={{marginTop:2,width:18,height:18,accentColor:C.verde,flexShrink:0}}/>
              <span style={{fontSize:13,color:C.text,lineHeight:1.5}}>
                <strong>Consiento el tratamiento de mis datos</strong> para la gestión de la relación asociativa: altas/bajas, cuotas, actividades, comunicaciones operativas y obligaciones legales. <em style={{color:C.rojo}}>*Obligatorio para ser socio.</em>
              </span>
            </label>
          </div>

          {/* Imagen */}
          <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.azul,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>📸 Autorización de imagen (opcional)</div>
            <p style={{fontSize:11,color:C.gris,marginBottom:10,fontStyle:"italic"}}>Negarse no impide ser socio ni participar en las actividades.</p>
            {[
              ["consent_foto_interna", "Fotografías/vídeos para comunicación interna de la Peña."],
              ["consent_foto_rrss",    "Publicación en redes sociales oficiales de la Peña."],
              ["consent_foto_web",     "Publicación en web y materiales promocionales."],
              ["consent_foto_levante", "Cesión de imágenes al Levante UD / Federación de Peñas."],
            ].map(([k,l])=>(
              <label key={k} style={{display:"flex",gap:10,cursor:"pointer",padding:"6px 0",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
                <input type="checkbox" checked={consents[k]} onChange={e=>setC(k,e.target.checked)}
                  style={{marginTop:2,width:16,height:16,accentColor:C.azul,flexShrink:0}}/>
                <span style={{fontSize:13,color:C.text,lineHeight:1.4}}>{l}</span>
              </label>
            ))}
          </div>

          {/* Comunicaciones */}
          <div style={{background:C.granateLight,border:`1px solid ${C.granate}30`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.granate,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>📢 Comunicaciones (opcional)</div>
            {[
              ["consent_promo_pena",       "Comunicaciones promocionales propias de la Peña."],
              ["consent_patrocinadores",   "Información de patrocinadores enviada por la Peña (sin ceder mis datos)."],
              ["consent_whatsapp",          "Incorporarme al grupo de WhatsApp de La Rana Mecánica."],
            ].map(([k,l])=>(
              <label key={k} style={{display:"flex",gap:10,cursor:"pointer",padding:"6px 0",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
                <input type="checkbox" checked={consents[k]} onChange={e=>setC(k,e.target.checked)}
                  style={{marginTop:2,width:16,height:16,accentColor:C.granate,flexShrink:0}}/>
                <span style={{fontSize:13,color:C.text,lineHeight:1.4}}>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={confirmar} disabled={enviandoEmail} style={{padding:15,background:enviandoEmail?"#aaa":C.verde,color:C.blanco,border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:enviandoEmail?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {enviandoEmail?"📨 Enviando documentación...":"✅ "+(socio.tipo==="infantil"?"Los datos del menor son correctos":"Mis datos son correctos — Confirmar")}
          </button>
          <button onClick={onCorregir} style={{padding:13,background:C.blanco,color:C.granate,border:`2px solid ${C.granate}`,borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            ✏️ Hay algún dato incorrecto — Solicitar corrección
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:12,color:C.muted,marginTop:14,lineHeight:1.5}}>Las correcciones serán revisadas por la junta antes de aplicarse.</p>
      </div>
    </div>
  );
}

// ── SOLICITAR CORRECCIÓN ──────────────────────────────
function SolicitarCorreccion({socio, onVolver, onEnviado}){
  const [form,setForm]=useState({
    nombre:socio.nombre, apellidos:socio.apellidos,
    dni:socio.dni||"", fecha_nac:socio.fecha_nac?socio.fecha_nac.split("T")[0]:"",
    email:socio.email||"", telefono:socio.telefono==="512512"?"":socio.telefono||"",
    tiene_acciones:socio.tiene_acciones||false,
    num_acciones:socio.num_acciones||0,
    es_abonado:socio.es_abonado||false,
    num_abonado:socio.num_abonado||"",
    comentarios:"",
  });
  const [enviando,setEnviando]=useState(false);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const enviar=async()=>{
    setEnviando(true);
    // Detectar cambios de texto y guardar en verificaciones
    const campos = ["nombre","apellidos","dni","fecha_nac","email","telefono"];
    for(const campo of campos){
      const original = socio[campo]||"";
      const nuevo = form[campo]||"";
      if(nuevo && nuevo!==original){
        await supabase.from("verificaciones").insert({
          socio_id: socio.id,
          campo,
          valor_anterior: String(original),
          valor_nuevo: String(nuevo),
          comentario: form.comentarios,
          estado: "pendiente"
        });
      }
    }
    // Guardar campos de acciones y abono directamente (no necesitan aprobación)
    await supabase.from("socios").update({
      tiene_acciones: form.tiene_acciones,
      num_acciones: form.tiene_acciones ? Number(form.num_acciones)||0 : 0,
      es_abonado: form.es_abonado,
      num_abonado: form.es_abonado ? form.num_abonado : null,
    }).eq("id", socio.id);
    setEnviando(false);
    onEnviado();
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
            {campo("Teléfono","telefono","tel","6XX XXX XXX")}
          </div>
          {campo("Email","email","email","tu@email.com")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px",marginBottom:14}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>¿Tienes acciones del Levante?</label>
              <div style={{display:"flex",gap:8}}>
                {[{v:true,l:"Sí"},{v:false,l:"No"}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setF("tiene_acciones",o.v)} style={{flex:1,padding:"9px",borderRadius:8,border:`2px solid ${form.tiene_acciones===o.v?C.granate:C.border}`,background:form.tiene_acciones===o.v?C.granateLight:C.blanco,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",color:form.tiene_acciones===o.v?C.granateDark:C.gris}}>{o.l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>¿Cuántas acciones?</label>
              <input type="number" min="0" value={form.num_acciones||""} onChange={e=>setF("num_acciones",e.target.value)}
                disabled={!form.tiene_acciones}
                placeholder="0"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box",opacity:form.tiene_acciones?1:0.4}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px",marginBottom:14}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>¿Eres abonado/a?</label>
              <div style={{display:"flex",gap:8}}>
                {[{v:true,l:"Sí"},{v:false,l:"No"}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setF("es_abonado",o.v)} style={{flex:1,padding:"9px",borderRadius:8,border:`2px solid ${form.es_abonado===o.v?C.azul:C.border}`,background:form.es_abonado===o.v?C.azulLight:C.blanco,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",color:form.es_abonado===o.v?C.azul:C.gris}}>{o.l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>Nº de abonado</label>
              <input type="text" value={form.num_abonado||""} onChange={e=>setF("num_abonado",e.target.value)}
                disabled={!form.es_abonado}
                placeholder="12345"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box",opacity:form.es_abonado?1:0.4}}/>
            </div>
          </div>
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

// ── CORRECCIÓN ENVIADA ────────────────────────────────
function Enviado({socio, onLogout}){
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

// ── APP ───────────────────────────────────────────────
export default function PortalVerificacion(){
  const [pantalla,setPantalla]=useState("login");
  const [socio,setSocio]=useState(null);
  const [perfiles,setPerfiles]=useState([]);

  const logout=()=>{setSocio(null);setPantalla("login");setPerfiles([]);};

  const handleMultiple=(p)=>{setPerfiles(p);setPantalla("selector");};

  const handleSeleccionar=(s)=>{setSocio(s);setPantalla("datos");};

  if(pantalla==="login")     return <Login onLogin={s=>{setSocio(s);setPantalla("datos");}} onMultiple={handleMultiple}/>;
  if(pantalla==="selector")  return <SelectorPerfil perfiles={perfiles} onSeleccionar={handleSeleccionar} onVolver={()=>setPantalla("login")}/>;
  if(pantalla==="datos")     return <MisDatos socio={socio} onLogout={logout} onCorregir={()=>setPantalla("correccion")} onCambiarPerfil={perfiles.length>1?()=>setPantalla("selector"):null}/>;
  if(pantalla==="correccion")return <SolicitarCorreccion socio={socio} onVolver={()=>setPantalla("datos")} onEnviado={()=>setPantalla("enviado")}/>;
  if(pantalla==="enviado")   return <Enviado socio={socio} onLogout={logout}/>;
}
