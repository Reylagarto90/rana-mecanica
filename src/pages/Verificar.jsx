import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  const confirmar=async()=>{
    // Marcar como verificado en Supabase
    await supabase.from("socios").update({verificado:true}).eq("id",socio.id);
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
        <p style={{color:C.gris,fontSize:14,marginBottom:20,lineHeight:1.6}}>Gracias <strong>{socio.nombre}</strong>. La junta ha recibido tu confirmación para la temporada 2026/2027.</p>
        <div style={{background:C.granateLight,borderRadius:10,padding:"12px",marginBottom:20,fontSize:14,color:C.granateDark,fontWeight:600}}>🐸 ¡Visca el Levante i la Rana Mecànica!</div>
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

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={confirmar} style={{padding:15,background:C.verde,color:C.blanco,border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            ✅ {socio.tipo==="infantil"?"Los datos del menor son correctos":"Mis datos son correctos — Confirmar"}
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
