import { useState } from "react";

const C = {
  granate: "#8B1A2F", granateDark: "#6B0F20", granateLight: "#f9eaed",
  azul: "#003DA5", oro: "#C9963A", verde: "#1a7a3c", verdeLight: "#e8f5ee",
  border: "#e2e8f0", text: "#1e293b", muted: "#94a3b8", blanco: "#fff", crema: "#FFF8F0",
};

const TIPOS = [
  { value: "adulto", label: "Adulto", precio: 30, desc: "Mayor de 18 años" },
  { value: "juvenil", label: "Juvenil", precio: 20, desc: "Menor de 18 años" },
  { value: "familia", label: "Familia", precio: 45, desc: "Unidad familiar completa" },
];

const MUNICIPIOS = ["Godella", "Rocafort", "Moncada", "Bétera", "Burjassot", "Paterna", "Valencia", "Otro"];

function Step({ numero, titulo, activo, completado }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: completado ? C.verde : activo ? C.granate : C.border,
        color: completado || activo ? C.blanco : C.muted,
        fontWeight: 800, fontSize: 14, flexShrink: 0,
        transition: "all 0.3s"
      }}>
        {completado ? "✓" : numero}
      </div>
      <span style={{ fontSize: 13, fontWeight: activo ? 700 : 400, color: activo ? C.text : C.muted }}>{titulo}</span>
    </div>
  );
}

function Campo({ label, children, error, required }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.granate }}> *</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: C.granate, marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, error }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "13px 14px", borderRadius: 10,
        border: `2px solid ${error ? C.granate : C.border}`,
        fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        background: C.blanco, transition: "border-color 0.2s",
      }}
      onFocus={e => { if (!error) e.target.style.borderColor = C.granate; }}
      onBlur={e => { if (!error) e.target.style.borderColor = C.border; }}
    />
  );
}

const PASOS = ["Datos personales", "Tipo de socio", "Confirmación"];

export default function FormularioAlta() {
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nombre: "", apellidos: "", dni: "", fechaNac: "",
    telefono: "", email: "", municipio: "", comoConocio: "",
    tipo: "adulto", rgpd: false, comentarios: "",
    tieneAcciones: false, numAcciones: 0, esAbonado: false, numAbonado: "",
    consentFotoInterna: false, consentFotoRrss: false, consentFotoWeb: false,
    consentFotoLevante: false, consentPromoPena: false, consentPatrocinadores: false,
    consentWhatsapp: false,
  });
  const [errores, setErrores] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validarPaso0 = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email no válido";
    if (!form.municipio) e.municipio = "Selecciona tu municipio";
    return e;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!form.rgpd) e.rgpd = "Debes aceptar el tratamiento de datos";
    return e;
  };

  const siguiente = () => {
    if (paso === 0) {
      const e = validarPaso0();
      if (Object.keys(e).length) { setErrores(e); return; }
    }
    if (paso === 2) {
      const e = validarPaso2();
      if (Object.keys(e).length) { setErrores(e); return; }
      setEnviado(true);
      return;
    }
    setErrores({});
    setPaso(p => p + 1);
  };

  const tipoSelec = TIPOS.find(t => t.value === form.tipo);

  if (enviado) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.granateDark} 0%, #4a0f1c 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: C.blanco, borderRadius: 24, padding: "40px 32px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.granateDark, fontSize: 24, marginBottom: 12 }}>
            ¡Solicitud enviada!
          </h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
            Hola <strong style={{ color: C.text }}>{form.nombre}</strong>, hemos recibido tu solicitud para unirte a la Peña La Rana Mecánica. La junta directiva la revisará y te contactará en breve por teléfono o email.
          </p>
          <div style={{ background: C.granateLight, borderRadius: 14, padding: "18px 20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>Resumen de tu solicitud</div>
            {[
              ["Nombre", `${form.nombre} ${form.apellidos}`],
              ["Teléfono", form.telefono],
              ["Municipio", form.municipio],
              ["Tipo de socio", `${tipoSelec?.label} — ${tipoSelec?.precio}€/año`],
              ["Acciones Levante", form.tieneAcciones ? `Sí (${form.numAcciones||1})` : "No"],
              ["Abonado/a", form.esAbonado ? `Sí${form.numAbonado?" — Nº "+form.numAbonado:""}` : "No"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontWeight: 600, color: C.text }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#fffbea", border: `1px solid ${C.oro}40`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 20 }}>
            📱 Te avisaremos cuando tu alta sea aprobada. El pago de la cuota se gestionará tras la confirmación.
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: C.muted }}>
            <span style={{ fontSize: 20 }}>🐸</span> Peña La Rana Mecánica · Levante UD
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.granateDark} 0%, #4a0f1c 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Crimson+Pro:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea, button { font-family: 'Crimson Pro', Georgia, serif; }
        input:focus, select:focus, textarea:focus { outline: none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* CABECERA */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐸</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: C.blanco, fontSize: 26, marginBottom: 6 }}>
            Hazte peñista
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Peña La Rana Mecánica · Levante UD · Godella</p>
        </div>

        {/* PASOS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "0 8px" }}>
          {PASOS.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < PASOS.length - 1 ? 1 : undefined }}>
              <Step numero={i + 1} titulo={p} activo={paso === i} completado={paso > i} />
              {i < PASOS.length - 1 && <div style={{ flex: 1, height: 2, background: paso > i ? C.verde : "rgba(255,255,255,0.2)", margin: "0 8px", borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        {/* TARJETA */}
        <div style={{ background: C.blanco, borderRadius: 24, padding: "30px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>

          {/* PASO 0 — Datos personales */}
          {paso === 0 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.granateDark, fontSize: 20, marginBottom: 6 }}>Tus datos</h2>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>Rellena tus datos personales para la solicitud.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <Campo label="Nombre" required error={errores.nombre}>
                  <Input value={form.nombre} onChange={v => set("nombre", v)} placeholder="Tu nombre" error={errores.nombre} />
                </Campo>
                <Campo label="Apellidos" required error={errores.apellidos}>
                  <Input value={form.apellidos} onChange={v => set("apellidos", v)} placeholder="Tus apellidos" error={errores.apellidos} />
                </Campo>
              </div>
              <Campo label="Teléfono" required error={errores.telefono}>
                <Input value={form.telefono} onChange={v => set("telefono", v)} type="tel" placeholder="666 000 000" error={errores.telefono} />
              </Campo>
              <Campo label="Email" error={errores.email}>
                <Input value={form.email} onChange={v => set("email", v)} type="email" placeholder="tu@email.com" error={errores.email} />
              </Campo>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <Campo label="DNI / NIE">
                  <Input value={form.dni} onChange={v => set("dni", v)} placeholder="12345678A" />
                </Campo>
                <Campo label="Fecha de nacimiento">
                  <Input value={form.fechaNac} onChange={v => set("fechaNac", v)} type="date" />
                </Campo>
              </div>
              <div style={{ gridColumn: "1 / -1", marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: C.text, display: "block", marginBottom: 10 }}>
                  ¿Tienes acciones del Levante UD?
                </label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[{v:true,l:"Sí, tengo acciones"},{v:false,l:"No tengo acciones"}].map(o=>(
                    <button key={String(o.v)} onClick={()=>set("tieneAcciones",o.v)} style={{
                      padding:"11px 20px", borderRadius:10,
                      border:`2px solid ${form.tieneAcciones===o.v?C.granate:C.border}`,
                      background:form.tieneAcciones===o.v?C.granateLight:C.blanco,
                      cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"inherit",
                      color:form.tieneAcciones===o.v?C.granateDark:C.gris
                    }}>{o.l}</button>
                  ))}
                </div>
                {form.tieneAcciones&&(
                  <div style={{marginTop:10}}>
                    <label style={{fontSize:13,color:C.gris,display:"block",marginBottom:5}}>¿Cuántas acciones?</label>
                    <input type="number" min="1" value={form.numAcciones||""} onChange={e=>set("numAcciones",e.target.value)}
                      placeholder="Número de acciones"
                      style={{padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",width:180}}/>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "1 / -1", marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: C.text, display: "block", marginBottom: 10 }}>
                  ¿Eres abonado/a del Levante UD?
                </label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[{v:true,l:"Sí, soy abonado/a"},{v:false,l:"No soy abonado/a"}].map(o=>(
                    <button key={String(o.v)} onClick={()=>set("esAbonado",o.v)} style={{
                      padding:"11px 20px", borderRadius:10,
                      border:`2px solid ${form.esAbonado===o.v?C.azul:C.border}`,
                      background:form.esAbonado===o.v?C.azulLight:C.blanco,
                      cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"inherit",
                      color:form.esAbonado===o.v?C.azul:C.gris
                    }}>{o.l}</button>
                  ))}
                </div>
                {form.esAbonado&&(
                  <div style={{marginTop:10}}>
                    <label style={{fontSize:13,color:C.gris,display:"block",marginBottom:5}}>Número de abonado</label>
                    <input type="text" value={form.numAbonado||""} onChange={e=>set("numAbonado",e.target.value)}
                      placeholder="Tu número de abonado"
                      style={{padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:15,outline:"none",fontFamily:"inherit",width:220}}/>
                  </div>
                )}
              </div>
              <Campo label="Municipio" required error={errores.municipio}>
                <select value={form.municipio} onChange={e => set("municipio", e.target.value)}
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `2px solid ${errores.municipio ? C.granate : C.border}`, fontSize: 16, outline: "none", background: C.blanco }}>
                  <option value="">— Selecciona tu municipio —</option>
                  {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errores.municipio && <p style={{ fontSize: 12, color: C.granate, marginTop: 4 }}>⚠ {errores.municipio}</p>}
              </Campo>
              <Campo label="¿Cómo nos conociste?">
                <select value={form.comoConocio} onChange={e => set("comoConocio", e.target.value)}
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `2px solid ${C.border}`, fontSize: 16, outline: "none", background: C.blanco }}>
                  <option value="">— Selecciona una opción —</option>
                  <option>Un amigo o familiar</option>
                  <option>Redes sociales</option>
                  <option>En el estadio</option>
                  <option>Por el barrio</option>
                  <option>Otro</option>
                </select>
              </Campo>
            </div>
          )}

          {/* PASO 1 — Tipo de socio */}
          {paso === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.granateDark, fontSize: 20, marginBottom: 6 }}>Tipo de socio</h2>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>Elige la modalidad que mejor se adapta a ti.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
                {TIPOS.map(t => (
                  <div key={t.value} onClick={() => set("tipo", t.value)} style={{
                    padding: "18px 20px", borderRadius: 14,
                    border: `2.5px solid ${form.tipo === t.value ? C.granate : C.border}`,
                    background: form.tipo === t.value ? C.granateLight : C.blanco,
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: form.tipo === t.value ? C.granateDark : C.text }}>{t.label}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{t.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: form.tipo === t.value ? C.granate : C.text }}>{t.precio}€</div>
                      <div style={{ fontSize: 11, color: C.muted }}>/ año</div>
                    </div>
                  </div>
                ))}
              </div>
              <Campo label="Comentarios o peticiones especiales">
                <textarea value={form.comentarios} onChange={e => set("comentarios", e.target.value)} rows={3}
                  placeholder="Cualquier cosa que quieras comentar a la junta..."
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `2px solid ${C.border}`, fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit" }} />
              </Campo>
            </div>
          )}

          {/* PASO 2 — Confirmación */}
          {paso === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.granateDark, fontSize: 20, marginBottom: 6 }}>Confirmación</h2>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Revisa tus datos antes de enviar la solicitud.</p>

              <div style={{ background: C.granateLight, borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
                {[
                  ["Nombre completo", `${form.nombre} ${form.apellidos}`],
                  ["Teléfono", form.telefono],
                  ["Email", form.email || "—"],
                  ["Municipio", form.municipio],
                  ["Tipo de socio", `${tipoSelec?.label} — ${tipoSelec?.precio}€/año`],
              ["Acciones Levante", form.tieneAcciones ? `Sí (${form.numAcciones||1})` : "No"],
              ["Abonado/a", form.esAbonado ? `Sí${form.numAbonado?" — Nº "+form.numAbonado:""}` : "No"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.granate}20`, fontSize: 14 }}>
                    <span style={{ color: C.muted }}>{k}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* ── CONSENTIMIENTOS RGPD ── */}
              <div style={{ marginBottom: 20 }}>

                {/* OBLIGATORIO */}
                <div style={{ background: "#fff8e1", border: "2px solid #f59e0b", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>⚠️ Consentimiento obligatorio</div>
                  <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
                    <input type="checkbox" checked={form.rgpd} onChange={e => set("rgpd", e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: C.verde, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                      <strong>Consiento el tratamiento de mis datos personales</strong> por la Peña Levantinista La Rana Mecánica (Godella-Rocafort) para la gestión de la relación asociativa: altas/bajas, cuotas, comunicaciones operativas sobre actividades, administración interna y cumplimiento de obligaciones legales. Los datos podrán comunicarse a Levante UD, Fundación Levante UD, Federación de Peñas, Administraciones Públicas, entidades bancarias y aseguradoras cuando sea necesario. Puede ejercer sus derechos de acceso, rectificación, supresión y oposición en <strong>penyaranamecanica@gmail.com</strong>. <em>Sin este consentimiento no es posible hacerse socio.</em> *
                    </span>
                  </label>
                  {errores.rgpd && <p style={{ fontSize: 12, color: C.granate, marginTop: 6 }}>⚠ {errores.rgpd}</p>}
                </div>

                {/* IMAGEN */}
                <div style={{ background: C.azulLight, border: `1px solid ${C.azul}30`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.azul, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>📸 Autorización de imagen (opcional)</div>
                  <p style={{ fontSize: 12, color: C.gris, marginBottom: 12, fontStyle: "italic" }}>Negarse a autorizar la publicación de imágenes no impide ser socio ni participar en las actividades.</p>
                  {[
                    ["consentFotoInterna", "Fotografías y vídeos de actividades para comunicación interna de la Peña."],
                    ["consentFotoRrss",    "Publicación en redes sociales oficiales de la Peña."],
                    ["consentFotoWeb",     "Publicación en página web y materiales corporativos/promocionales de la Peña."],
                    ["consentFotoLevante", "Cesión de imágenes al Levante UD, Fundación Levante UD o Federación de Peñas para comunicar o promocionar actividades conjuntas."],
                  ].map(([k, label]) => (
                    <label key={k} style={{ display: "flex", gap: 10, cursor: "pointer", padding: "8px 0", borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
                      <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.azul, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{label}</span>
                    </label>
                  ))}
                </div>

                {/* COMUNICACIONES */}
                <div style={{ background: C.granateLight, border: `1px solid ${C.granate}30`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.granate, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>📢 Comunicaciones (opcional)</div>
                  {[
                    ["consentPromoPena",      "Recibir comunicaciones promocionales propias de la Peña (merchandising, campañas, etc.)."],
                    ["consentPatrocinadores", "Recibir información de patrocinadores y colaboradores enviada por la Peña (sin cesión de mis datos a terceros)."],
                    ["consentWhatsapp",        "Incorporarme al grupo/comunidad de WhatsApp de La Rana Mecánica. He sido informado/a de las condiciones de funcionamiento y visibilidad de mis datos en el grupo."],
                  ].map(([k, label]) => (
                    <label key={k} style={{ display: "flex", gap: 10, cursor: "pointer", padding: "8px 0", borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
                      <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.granate, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{label}</span>
                    </label>
                  ))}
                </div>

              </div>


            </div>
          )}

          {/* NAVEGACIÓN */}
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            {paso > 0 && (
              <button onClick={() => setPaso(p => p - 1)} style={{ flex: 1, padding: "14px", background: C.blanco, border: `2px solid ${C.border}`, borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15, color: C.text }}>
                ← Atrás
              </button>
            )}
            <button onClick={siguiente} style={{
              flex: 2, padding: "14px", background: C.granate, border: "none", borderRadius: 12,
              cursor: "pointer", fontWeight: 700, fontSize: 16, color: C.blanco,
              boxShadow: `0 4px 16px ${C.granate}60`, transition: "opacity 0.2s"
            }}>
              {paso === 2 ? "🐸 Enviar solicitud" : "Siguiente →"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 20 }}>
          🔒 Tus datos están protegidos · Solo los usa la peña
        </p>
      </div>
    </div>
  );
}
