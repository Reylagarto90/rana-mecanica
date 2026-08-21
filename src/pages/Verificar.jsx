import { useState } from "react";
import { supabase } from "../supabase.js";

// ── EMAILJS ───────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_g9n6e5c";
const EMAILJS_TEMPLATE_ID = "template_0rjj2y8";
const EMAILJS_PUBLIC_KEY  = "IvxWWpgwA15GDRGyF";
const SECRETARIO_EMAIL    = "penyaranamecanica@gmail.com";

// Generar PDF de verificación usando solo HTML/CSS (sin librería externa)
const generarPDFHTML = (socio) => {
  const fmtF=(f)=>{ if(!f) return "—"; const d=f.split("T")[0].split("-"); return `${d[2]}/${d[1]}/${d[0]}`; };
  const si_no=(v)=>v?"✅ Sí":"❌ No";
  const ahora = new Date().toLocaleString("es-ES");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <div style="page-break-inside:avoid; break-inside:avoid; text-align:center; background:#8B0A3A; padding:20px; border-radius:8px; margin-bottom:20px;">
        <h1 style="color:white; margin:0; font-size:20px;">🐸 Peña Levantinista La Rana Mecánica</h1>
        <p style="color:rgba(255,255,255,0.8); margin:6px 0 0;">Godella-Rocafort · Temporada 2026/2027</p>
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid;">
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
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid;">
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
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:14px; margin-bottom:20px;">
        <p style="margin:0; font-size:13px; color:#166534;">
          ✅ Datos verificados digitalmente el <strong>${ahora}</strong><br/>
          El socio ha confirmado que sus datos son correctos a través del portal de verificación de la Peña Levantinista La Rana Mecánica.
        </p>
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; padding:16px; margin-bottom:16px; font-size:11px; color:#1e293b; line-height:1.6;">
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

      <div style="page-break-inside:avoid; break-inside:avoid; background:#f0f9ff; border:1px solid #7dd3fc; border-radius:8px; padding:14px; margin-bottom:20px; font-size:11px; color:#0c4a6e; line-height:1.6;">
        <p style="font-weight:700; font-size:12px; margin:0 0 8px;">NORMAS DE USO DEL GRUPO DE WHATSAPP (si ha otorgado consentimiento)</p>
        <p style="margin:0;">La incorporación al grupo de WhatsApp de La Rana Mecánica es voluntaria. Queda prohibido compartir datos personales, fotografías o conversaciones de otros miembros fuera del grupo sin su autorización expresa. El grupo se utilizará exclusivamente para comunicaciones relacionadas con las actividades de la peña. El incumplimiento de estas normas podrá conllevar la expulsión del grupo.</p>
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid; background:#fef9c3; border:1px solid #fde047; border-radius:8px; padding:12px; margin-bottom:20px; font-size:11px; color:#713f12;">
        <strong>⚠️ Nota:</strong> Este documento debe ser impreso, firmado por el socio (o su tutor legal si es menor de edad) y entregado al Secretario de la Peña para su archivo. La firma de este documento acredita que el socio ha sido informado sobre el tratamiento de sus datos personales y ha prestado los consentimientos indicados.
      </div>

      <div style="page-break-inside:avoid; break-inside:avoid; border-top:2px solid #e2e8f0; padding-top:20px; margin-top:20px;">
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

// Carga el logo real de la peña como base64 para insertarlo en el PDF
let _logoBase64PromiseV = null;
const cargarLogoBase64V = () => {
  if (_logoBase64PromiseV) return _logoBase64PromiseV;
  _logoBase64PromiseV = fetch("/rana-mecanica/logo.jpg")
    .then(r => r.blob())
    .then(blob => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    }))
    .catch(() => null);
  return _logoBase64PromiseV;
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
  const logoB64 = await cargarLogoBase64V();

  // ── Cabecera ──
  doc.setFillColor(139,10,58);
  doc.roundedRect(M, y, W, 20, 2, 2, "F");
  if(logoB64) doc.addImage(logoB64, "JPEG", M+4, y+3, 14, 14);
  const offCab = logoB64 ? 22 : 6;
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold"); doc.setFontSize(14);
  doc.text("Peña Levantinista La Rana Mecánica", M+offCab, y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(9);
  doc.text("Godella-Rocafort · Temporada 2026/2027", M+offCab, y+15);
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

// Genera el PDF de la ficha y lo sube a Supabase Storage (bucket privado 'fichas').
// Devuelve una URL firmada válida 180 días, o null si falla.
const generarYSubirPDF = async (socio) => {
  try {
    const blob = await generarPDFBlob(socio);

    const nombreArchivo = `${crypto.randomUUID()}.pdf`;
    const { error: errSubida } = await supabase.storage
      .from("fichas")
      .upload(nombreArchivo, blob, { contentType: "application/pdf", upsert: false });
    if (errSubida) { console.error("Error subiendo PDF:", errSubida); return null; }

    const { data: firmada, error: errFirma } = await supabase.storage
      .from("fichas")
      .createSignedUrl(nombreArchivo, 60 * 60 * 24 * 180); // 180 días
    if (errFirma) { console.error("Error creando enlace firmado:", errFirma); return null; }

    return firmada?.signedUrl || null;
  } catch (e) {
    console.error("Error generando PDF:", e);
    return null;
  }
};

// Enviar email via EmailJS
const enviarEmail = async (destinatario, asunto, mensaje) => {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": "https://reylagarto90.github.io",
      },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email:  destinatario,
          subject:   asunto,
          message:   mensaje,
          name:      "La Rana Mecánica",
          reply_to:  SECRETARIO_EMAIL,
        },
      }),
    });
    if(!res.ok){
      const txt = await res.text();
      console.error("EmailJS error:", res.status, txt);
    }
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
  border:"#e2e8f0", text:"#1e293b", muted:"#94a3b8", blanco:"#fff",
};

const fmtFecha=(f)=>{ if(!f) return "—"; const d=f.split("T")[0].split("-"); return `${d[2]}/${d[1]}/${d[0]}`; };

// ── SELECTOR DE PERFIL ────────────────────────────────
function SelectorPerfil({perfiles,onSeleccionar,onVolver}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src={LOGO} alt="logo" style={{width:90,height:90,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 14px"}}/>
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
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{p.numero} · {p.tipo==="infantil"?"👶 Menor — acceso tutor/a":p.cargo}</div>
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
function Login({onLogin,onMultiple}){
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
      if(!data||data.length===0){setError("No encontramos ningún peñista con ese teléfono. Usa el código 512512 si no tienes teléfono registrado.");setLoading(false);return;}
      const adultos=data.filter(s=>s.tipo!=="infantil");
      const tutorId=adultos[0]?.id;
      let menoresTutor=[];
      if(tutorId){
        const {data:m}=await supabase.from("socios").select("*").eq("tutor_id",tutorId).eq("estado","activo");
        if(m) menoresTutor=m;
      }
      const todos=[...new Map([...data,...menoresTutor].map(s=>[s.id,s])).values()];
      if(todos.length>1) onMultiple(todos);
      else onLogin(todos[0]);
    }catch(e){setError("Error de conexión. Inténtalo de nuevo.");}
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="logo" style={{width:120,height:120,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.3)",objectFit:"cover",display:"block",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}/>
          <h1 style={{color:C.blanco,fontSize:22,fontWeight:700,marginBottom:6}}>Verifica tus datos</h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.5}}>Peña Levantinista La Rana Mecánica<br/>Temporada 2026/2027 · Rocafort-Godella</p>
        </div>
        <div style={{background:C.blanco,borderRadius:20,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>Accede con el teléfono registrado para revisar y actualizar tus datos y consentimientos.</p>
          <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tu teléfono</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{background:C.grisLight,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:15,color:C.gris,flexShrink:0}}>🇪🇸 +34</div>
            <input type="tel" value={tel} onChange={e=>{setTel(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&buscar()}
              placeholder="6XX XXX XXX" maxLength={12} autoFocus
              style={{flex:1,padding:"11px 13px",borderRadius:10,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:18,fontWeight:600,letterSpacing:2,outline:"none",fontFamily:"monospace",color:C.text,boxSizing:"border-box",width:"100%"}}/>
          </div>
          {error&&<div style={{marginBottom:12,padding:"10px 14px",background:C.rojoLight,borderRadius:10,fontSize:13,color:C.rojo,display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}
          <button onClick={buscar} disabled={loading} style={{width:"100%",padding:13,background:loading?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {loading?"Buscando...":"Acceder →"}
          </button>
          <p style={{marginTop:14,fontSize:12,color:C.muted,textAlign:"center"}}>Sin teléfono: código <strong>512512</strong></p>
        </div>
      </div>
    </div>
  );
}

// ── FORMULARIO UNIFICADO ──────────────────────────────
function FormularioUnificado({socio,onEnviado,onLogout,onCambiarPerfil,perfiles}){
  const [form,setForm]=useState({
    // Datos personales
    nombre:    socio.nombre||"",
    apellidos: socio.apellidos||"",
    dni:       socio.dni||"",
    fecha_nac: socio.fecha_nac?socio.fecha_nac.split("T")[0]:"",
    email:     socio.email||"",
    telefono:  socio.telefono==="512512"?"":socio.telefono||"",
    municipio: socio.municipio||"",
    // Levante
    tiene_acciones: socio.tiene_acciones===true,
    num_acciones:   socio.num_acciones||0,
    es_abonado:     socio.es_abonado===true,
    num_abonado:    socio.num_abonado||"",
    // Consentimientos
    rgpd:                  socio.rgpd===true,
    consent_foto_interna:  socio.consent_foto_interna===true,
    consent_foto_rrss:     socio.consent_foto_rrss===true,
    consent_foto_web:      socio.consent_foto_web===true,
    consent_foto_levante:  socio.consent_foto_levante===true,
    consent_promo_pena:    socio.consent_promo_pena===true,
    consent_patrocinadores:socio.consent_patrocinadores===true,
    consent_whatsapp:      socio.consent_whatsapp===true,
    comentarios: "",
  });
  const [enviando,setEnviando]=useState(false);
  const [webTrampa,setWebTrampa]=useState(""); // honeypot anti-spam: invisible para personas
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const hayCambiosDatos=()=>{
    const campos=["nombre","apellidos","dni","fecha_nac","email","telefono","municipio"];
    return campos.some(k=>{
      const orig=String(socio[k]||"");
      const nuevo=String(form[k]||"");
      return nuevo && nuevo!==orig;
    });
  };

  const enviar=async()=>{
    if(!form.rgpd){alert("El consentimiento de tratamiento de datos es obligatorio para ser socio.");return;}
    if(webTrampa){setEnviando(true);return;} // honeypot: si esto tiene contenido, es un bot — se descarta en silencio
    setEnviando(true);

    // 1. Guardar consentimientos y datos de Levante mediante función segura
    //    (el acceso por teléfono no tiene permiso de UPDATE directo en socios;
    //    esta función solo puede tocar estos campos concretos, nada más)
    const {error: errConsent} = await supabase.rpc("actualizar_consentimientos", {
      p_socio_id: socio.id,
      p_rgpd: form.rgpd,
      p_consent_foto_interna: form.consent_foto_interna,
      p_consent_foto_rrss: form.consent_foto_rrss,
      p_consent_foto_web: form.consent_foto_web,
      p_consent_foto_levante: form.consent_foto_levante,
      p_consent_promo_pena: form.consent_promo_pena,
      p_consent_patrocinadores: form.consent_patrocinadores,
      p_consent_whatsapp: form.consent_whatsapp,
      p_tiene_acciones: form.tiene_acciones,
      p_num_acciones: form.tiene_acciones?Number(form.num_acciones)||0:0,
      p_es_abonado: form.es_abonado,
      p_num_abonado: form.es_abonado?form.num_abonado:null,
    });
    if(errConsent) console.error("Error guardando consentimientos:", errConsent);

    // 2. Si hay cambios en datos personales → crear verificaciones pendientes
    const camposDatos=["nombre","apellidos","dni","fecha_nac","email","telefono","municipio"];
    const cambios=[];
    for(const campo of camposDatos){
      const orig=String(socio[campo]||"");
      const nuevo=String(form[campo]||"");
      if(nuevo && nuevo!==orig){
        await supabase.from("verificaciones").insert({
          socio_id:socio.id, campo,
          valor_anterior:orig, valor_nuevo:nuevo,
          comentario:form.comentarios, estado:"pendiente"
        });
        cambios.push({campo,orig,nuevo});
      }
    }

    // 3. Generar PDF real (jsPDF) con datos actuales + cambios propuestos, y subirlo a Storage
    const socioPDF={...socio,...form};
    const htmlDoc=generarPDFHTML(socioPDF); // se mantiene como fallback de impresión si falla la subida
    const pdfUrl = await generarYSubirPDF(socioPDF);
    const enlaceFicha = pdfUrl || "https://reylagarto90.github.io/rana-mecanica/#/verificar"; // fallback si falla la subida

    // 4. Enviar email al peñista (mensaje simple)
    const emailDest=form.email||socio.email;
    if(emailDest){
      const tieneCambios=cambios.length>0;
      const mensajePenista = tieneCambios
        ? `Hola ${socio.nombre},\n\nHemos recibido tu solicitud de cambios en los siguientes datos: ${cambios.map(c=>c.campo).join(", ")}.\n\nLa junta los revisará y aplicará en breve. Tus datos actuales no cambiarán hasta que la junta los apruebe.\n\nAquí tienes tu ficha provisional en PDF:\n${enlaceFicha}\n\nPara cualquier consulta: penyaranamecanica@gmail.com\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`
        : `Hola ${socio.nombre},\n\nTus datos y consentimientos han sido verificados correctamente para la temporada 2026/2027. ¡Gracias!\n\nAquí tienes tu ficha en PDF, lista para imprimir y entregar firmada al Secretario:\n${enlaceFicha}\n\nPara cualquier consulta: penyaranamecanica@gmail.com\n\n🐸 Matxo Llevant!\nPeña Levantinista La Rana Mecánica`;
      await enviarEmail(emailDest, `La Rana Mecánica · ${tieneCambios?"Solicitud de cambios":"Verificación"} — ${socio.nombre} ${socio.apellidos}`, mensajePenista);
    }

    // 5. Enviar copia a la junta siempre
    const resumenCambios = cambios.length>0
      ? `Cambios solicitados:\n${cambios.map(c=>`  - ${c.campo}: "${c.orig||"(vacío)"}" → "${c.nuevo}"`).join("\n")}`
      : "Ha confirmado que sus datos son correctos.";
    const mensajeJunta = `${socio.nombre} ${socio.apellidos} (${socio.numero}) ha completado su verificación.\n\n${resumenCambios}\n\nFicha en PDF:\n${enlaceFicha}\n\nAccede al panel de la junta para gestionar los cambios:\nhttps://reylagarto90.github.io/rana-mecanica/#/junta/login`;
    await enviarEmail(SECRETARIO_EMAIL, `[VERIFICACIÓN] ${socio.nombre} ${socio.apellidos} (${socio.numero})`, mensajeJunta);

    setEnviando(false);
    onEnviado({socio:socioPDF,hayCambios:cambios.length>0,htmlDoc,pdfUrl});
  };

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",fontFamily:"system-ui,sans-serif"}}>
      {/* Honeypot anti-spam: invisible para personas, los bots lo suelen rellenar */}
      <div style={{position:"absolute",left:"-9999px",width:1,height:1,overflow:"hidden"}} aria-hidden="true">
        <label htmlFor="web">No rellenar este campo</label>
        <input id="web" name="web" type="text" tabIndex="-1" autoComplete="off" value={webTrampa} onChange={e=>setWebTrampa(e.target.value)}/>
      </div>
      {/* HEADER */}
      <div style={{background:C.granateDark,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO} alt="logo" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover"}}/>
          <div>
            <div style={{color:C.blanco,fontWeight:700,fontSize:13}}>La Rana Mecánica</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>
              {socio.tipo==="infantil"?`Perfil de ${socio.nombre} (tutor/a)`:`${socio.nombre} · ${socio.numero}`}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {perfiles&&perfiles.length>1&&(
            <button onClick={onCambiarPerfil} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>👥 Cambiar</button>
          )}
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:C.blanco,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Salir</button>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px 40px"}}>

        {/* Aviso menor */}
        {socio.tipo==="infantil"&&(
          <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:12,padding:"11px 14px",marginBottom:14,fontSize:13,color:C.azul,display:"flex",gap:8}}>
            <span>ℹ️</span><span>Estás gestionando el perfil de <strong>{socio.nombre}</strong> (menor de edad) como tutor/a.</span>
          </div>
        )}

        <div style={{background:C.blanco,borderRadius:16,padding:"20px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",borderTop:`4px solid ${C.granate}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h2 style={{fontSize:18,fontWeight:700,color:C.granateDark}}>
              {socio.tipo==="infantil"?`Datos de ${socio.nombre}`:"Mis datos"}
            </h2>
            <div style={{background:C.granateLight,borderRadius:10,padding:"6px 12px",textAlign:"center"}}>
              <div style={{fontSize:9,color:C.granate,fontWeight:700,textTransform:"uppercase"}}>Nº Socio</div>
              <div style={{fontFamily:"monospace",fontWeight:800,color:C.granateDark,fontSize:13}}>{socio.numero}</div>
            </div>
          </div>
          <p style={{fontSize:13,color:C.muted,marginBottom:16}}>Revisa y actualiza tus datos y consentimientos. Los cambios en datos personales serán revisados por la junta antes de aplicarse.</p>

          {/* DATOS PERSONALES */}
          <div style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Datos personales</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            {[
              {l:"Nombre",k:"nombre"},
              {l:"Apellidos",k:"apellidos"},
              {l:"DNI / NIE",k:"dni"},
              {l:"Fecha nacimiento",k:"fecha_nac",t:"date"},
              {l:"Teléfono",k:"telefono",t:"tel"},
              {l:"Email",k:"email",t:"email"},
              {l:"Municipio",k:"municipio"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.4}}>{f.l}</label>
                <input type={f.t||"text"} value={form[f.k]} onChange={e=>setF(f.k,e.target.value)}
                  style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${form[f.k]&&form[f.k]!==String(socio[f.k]||"")?C.azul:C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                {form[f.k]&&form[f.k]!==String(socio[f.k]||"")&&(
                  <div style={{fontSize:10,color:C.azul,marginTop:2}}>✏️ Cambio pendiente de aprobación</div>
                )}
              </div>
            ))}
          </div>

          {/* LEVANTE */}
          <div style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,margin:"14px 0 10px"}}>Vinculación con el Levante UD</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px",marginBottom:4}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>¿Tienes acciones?</label>
              <div style={{display:"flex",gap:8}}>
                {[{v:true,l:"Sí"},{v:false,l:"No"}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setF("tiene_acciones",o.v)} style={{flex:1,padding:"8px",borderRadius:8,border:`2px solid ${form.tiene_acciones===o.v?C.granate:C.border}`,background:form.tiene_acciones===o.v?C.granateLight:C.blanco,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",color:form.tiene_acciones===o.v?C.granateDark:C.gris}}>{o.l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>¿Cuántas acciones?</label>
              <input type="number" min="0" value={form.num_acciones||""} onChange={e=>setF("num_acciones",e.target.value)}
                disabled={!form.tiene_acciones} placeholder="0"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",opacity:form.tiene_acciones?1:0.4}}/>
            </div>
            <div style={{marginTop:12}}>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>¿Eres abonado/a?</label>
              <div style={{display:"flex",gap:8}}>
                {[{v:true,l:"Sí"},{v:false,l:"No"}].map(o=>(
                  <button key={String(o.v)} onClick={()=>setF("es_abonado",o.v)} style={{flex:1,padding:"8px",borderRadius:8,border:`2px solid ${form.es_abonado===o.v?C.azul:C.border}`,background:form.es_abonado===o.v?C.azulLight:C.blanco,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",color:form.es_abonado===o.v?C.azul:C.gris}}>{o.l}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop:12}}>
              <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>Nº de abonado</label>
              <input type="text" value={form.num_abonado||""} onChange={e=>setF("num_abonado",e.target.value)}
                disabled={!form.es_abonado} placeholder="12345"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",opacity:form.es_abonado?1:0.4}}/>
            </div>
          </div>

          {/* CONSENTIMIENTOS */}
          <div style={{fontSize:12,fontWeight:700,color:C.gris,textTransform:"uppercase",letterSpacing:0.5,margin:"18px 0 10px"}}>Consentimientos RGPD</div>

          {/* Obligatorio */}
          <div style={{background:form.rgpd?C.verdeLight:"#fff8e1",border:`2px solid ${form.rgpd?C.verde:"#f59e0b"}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <label style={{display:"flex",gap:10,cursor:"pointer",alignItems:"flex-start"}}>
              <input type="checkbox" checked={form.rgpd} onChange={e=>setF("rgpd",e.target.checked)}
                style={{marginTop:2,width:18,height:18,accentColor:C.verde,flexShrink:0}}/>
              <span style={{fontSize:13,color:C.text,lineHeight:1.5}}>
                <strong>Consiento el tratamiento de mis datos</strong> para gestión asociativa: altas/bajas, cuotas, actividades, comunicaciones y obligaciones legales. Los datos podrán comunicarse a Levante UD, Federación de Peñas, AAPP, entidades bancarias y aseguradoras cuando sea necesario. <em style={{color:C.rojo}}>*Obligatorio.</em>
              </span>
            </label>
          </div>

          {/* Imagen */}
          <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.azul,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>📸 Autorización de imagen (opcional)</div>
            <p style={{fontSize:11,color:C.gris,marginBottom:10,fontStyle:"italic"}}>Negarse no impide ser socio ni participar en las actividades.</p>
            {[
              ["consent_foto_interna","Fotografías/vídeos para comunicación interna de la Peña."],
              ["consent_foto_rrss",   "Publicación en redes sociales oficiales de la Peña."],
              ["consent_foto_web",    "Publicación en web y materiales promocionales."],
              ["consent_foto_levante","Cesión de imágenes al Levante UD / Federación de Peñas."],
            ].map(([k,l])=>(
              <label key={k} style={{display:"flex",gap:10,cursor:"pointer",padding:"6px 0",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
                <input type="checkbox" checked={form[k]} onChange={e=>setF(k,e.target.checked)}
                  style={{marginTop:2,width:16,height:16,accentColor:C.azul,flexShrink:0}}/>
                <span style={{fontSize:13,color:C.text,lineHeight:1.4}}>{l}</span>
              </label>
            ))}
          </div>

          {/* Comunicaciones */}
          <div style={{background:C.granateLight,border:`1px solid ${C.granate}30`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:C.granate,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>📢 Comunicaciones (opcional)</div>
            {[
              ["consent_promo_pena",      "Comunicaciones promocionales propias de la Peña."],
              ["consent_patrocinadores",  "Información de patrocinadores enviada por la Peña (sin ceder mis datos)."],
              ["consent_whatsapp",         "Incorporarme al grupo de WhatsApp de La Rana Mecánica."],
            ].map(([k,l])=>(
              <label key={k} style={{display:"flex",gap:10,cursor:"pointer",padding:"6px 0",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
                <input type="checkbox" checked={form[k]} onChange={e=>setF(k,e.target.checked)}
                  style={{marginTop:2,width:16,height:16,accentColor:C.granate,flexShrink:0}}/>
                <span style={{fontSize:13,color:C.text,lineHeight:1.4}}>{l}</span>
              </label>
            ))}
          </div>

          {/* Comentarios */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>Comentarios adicionales (opcional)</label>
            <textarea value={form.comentarios} onChange={e=>setF("comentarios",e.target.value)} rows={2}
              placeholder="Cualquier aclaración sobre los cambios solicitados..."
              style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>
          </div>

          <button onClick={enviar} disabled={enviando} style={{width:"100%",padding:15,background:enviando?"#bbb":C.granate,color:C.blanco,border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:enviando?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {enviando?"⏳ Guardando y enviando documentación...":"✅ Guardar y enviar mi ficha"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CONFIRMACIÓN FINAL ────────────────────────────────
function Confirmacion({socio,hayCambios,htmlDoc,pdfUrl,onLogout}){
  const descargar=()=>{
    if(pdfUrl){ window.open(pdfUrl,"_blank"); return; }
    // Fallback si la subida del PDF falló: abre el HTML para imprimir/guardar como PDF
    const v=window.open("","_blank");
    if(v){v.document.write(htmlDoc);v.document.close();setTimeout(()=>v.print(),500);}
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.granateDark} 0%,#5a0020 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.blanco,borderRadius:20,padding:"36px 28px",maxWidth:440,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>{hayCambios?"📨":"✅"}</div>
        <h2 style={{color:hayCambios?C.azul:C.verde,fontSize:22,fontWeight:700,marginBottom:10}}>
          {hayCambios?"¡Solicitud enviada!":"¡Datos verificados!"}
        </h2>
        <p style={{color:C.gris,fontSize:14,marginBottom:16,lineHeight:1.6}}>
          {hayCambios
            ?`Gracias ${socio.nombre}. Tus cambios han sido enviados a la junta para revisión. Los consentimientos se han guardado correctamente.`
            :`Gracias ${socio.nombre}. Tus datos y consentimientos han sido guardados correctamente para la temporada 2026/2027.`
          }
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {socio.email&&<div style={{background:C.azulLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.azul,textAlign:"left"}}>📧 Hemos enviado tu ficha a <strong>{socio.email}</strong></div>}
          {hayCambios&&<div style={{background:C.oroLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#7a5c00",textAlign:"left"}}>⏳ Los cambios en datos personales están <strong>pendientes de aprobación</strong> por la junta.</div>}
          <div style={{background:C.granateLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.granateDark,textAlign:"left"}}>📋 La junta ha recibido copia de tu ficha.</div>
        </div>
        <button onClick={descargar} style={{width:"100%",padding:13,background:C.azul,color:C.blanco,border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",marginBottom:10}}>
          📄 Descargar mi ficha en PDF
        </button>
        <p style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.5}}>Imprímela, fírmala y entrégala al Secretario.</p>
        <div style={{background:C.granateLight,borderRadius:10,padding:"10px",marginBottom:14,fontSize:13,color:C.granateDark,fontWeight:600}}>🐸 Matxo Llevant!</div>
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
  const [resultado,setResultado]=useState(null);

  const logout=()=>{setSocio(null);setPantalla("login");setPerfiles([]);setResultado(null);};

  const handleMultiple=(p)=>{setPerfiles(p);setPantalla("selector");};

  const handleSeleccionar=(s)=>{setSocio(s);setPantalla("formulario");};

  const handleEnviado=(res)=>{setResultado(res);setPantalla("confirmacion");};

  if(pantalla==="login")        return <Login onLogin={s=>{setSocio(s);setPerfiles([s]);setPantalla("formulario");}} onMultiple={handleMultiple}/>;
  if(pantalla==="selector")     return <SelectorPerfil perfiles={perfiles} onSeleccionar={handleSeleccionar} onVolver={()=>setPantalla("login")}/>;
  if(pantalla==="formulario")   return <FormularioUnificado socio={socio} onEnviado={handleEnviado} onLogout={logout} onCambiarPerfil={()=>setPantalla("selector")} perfiles={perfiles}/>;
  if(pantalla==="confirmacion") return <Confirmacion socio={resultado?.socio||socio} hayCambios={resultado?.hayCambios} htmlDoc={resultado?.htmlDoc} pdfUrl={resultado?.pdfUrl} onLogout={logout}/>;
}
