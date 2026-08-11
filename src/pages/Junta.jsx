import { useState, useMemo } from "react";

// ── PALETA ────────────────────────────────────────────────
const C = {
  granate: "#8B1A2F", granateDark: "#6B0F20", granateLight: "#f9eaed",
  azul: "#003DA5", azulLight: "#e8eef9",
  oro: "#C9963A", oroLight: "#fdf6e8",
  verde: "#1a7a3c", verdeLight: "#e8f5ee",
  rojo: "#c0392b", rojoLight: "#fdecea",
  gris: "#64748b", grisLight: "#f8fafc",
  blanco: "#ffffff", crema: "#FFF8F0",
  border: "#e2e8f0", text: "#1e293b", muted: "#94a3b8",
};

// ── TEMPORADAS ───────────────────────────────────────────
const TEMPORADA_ANTERIOR = "2025/2026";
const TEMPORADA_ACTUAL   = "2026/2027";

// ── DATOS SEMILLA ─────────────────────────────────────────
const hoy = new Date().toISOString().split("T")[0];

const SOCIOS_INIT = [
  { id:1, numero:"LRM-0001", nombre:"Paco", apellidos:"Martínez Gil", dni:"12345678A", fechaNac:"1978-03-15", telefono:"666111222", email:"paco@gmail.com", municipio:"Godella", fechaAlta:"2025-09-01", fechaBaja:null, estado:"activo", tipo:"adulto", rgpd:true, fotoAut:true },
  { id:2, numero:"LRM-0002", nombre:"Maria", apellidos:"Ferrer Pérez", dni:"23456789B", fechaNac:"1985-07-22", telefono:"677222333", email:"maria@gmail.com", municipio:"Rocafort", fechaAlta:"2025-09-10", fechaBaja:null, estado:"activo", tipo:"adulto", rgpd:true, fotoAut:true },
  { id:3, numero:"LRM-0003", nombre:"Toni", apellidos:"Blasco Comes", dni:"34567890C", fechaNac:"2007-11-05", telefono:"688333444", email:"toni@gmail.com", municipio:"Godella", fechaAlta:"2025-10-05", fechaBaja:null, estado:"activo", tipo:"juvenil", rgpd:true, fotoAut:false },
  { id:4, numero:"LRM-0004", nombre:"Amparo", apellidos:"Soler Vidal", dni:"45678901D", fechaNac:"1970-01-20", telefono:"699444555", email:"amparo@gmail.com", municipio:"Rocafort", fechaAlta:"2025-09-20", fechaBaja:null, estado:"activo", tipo:"familia", rgpd:true, fotoAut:true },
  { id:5, numero:"LRM-0005", nombre:"Raúl", apellidos:"Gimeno Lluch", dni:"56789012E", fechaNac:"1990-05-30", telefono:"611555666", email:"raul@gmail.com", municipio:"Godella", fechaAlta:"2025-11-01", fechaBaja:null, estado:"activo", tipo:"adulto", rgpd:false, fotoAut:false },
  { id:6, numero:"LRM-0006", nombre:"Carmen", apellidos:"Llopis Sanz", dni:"67890123F", fechaNac:"1965-08-12", telefono:"622666777", email:"carmen@gmail.com", municipio:"Moncada", fechaAlta:"2025-09-05", fechaBaja:null, estado:"activo", tipo:"adulto", rgpd:true, fotoAut:true },
  { id:7, numero:"LRM-0007", nombre:"Vicent", apellidos:"Català Mora", dni:"78901234G", fechaNac:"1995-02-18", telefono:"633777888", email:"vicent@gmail.com", municipio:"Rocafort", fechaAlta:"2026-01-08", fechaBaja:null, estado:"activo", tipo:"adulto", rgpd:true, fotoAut:true },
];

const CUOTAS_INIT = [
  { id:1, socioId:1, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:true,  fechaPago:"2025-09-03", formaPago:"Bizum" },
  { id:2, socioId:2, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:true,  fechaPago:"2025-09-12", formaPago:"Transferencia" },
  { id:3, socioId:3, temporada:TEMPORADA_ANTERIOR, importe:0,  categoria:"infantil_0_3", pagado:true, fechaPago:"2025-10-05", formaPago:"Efectivo" },
  { id:4, socioId:4, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:true,  fechaPago:"2025-09-22", formaPago:"Efectivo" },
  { id:5, socioId:5, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:false, fechaPago:null, formaPago:null },
  { id:6, socioId:6, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:true,  fechaPago:"2025-09-08", formaPago:"Bizum" },
  { id:7, socioId:7, temporada:TEMPORADA_ANTERIOR, importe:30, categoria:"nueva_alta", pagado:true,  fechaPago:"2026-01-10", formaPago:"Efectivo" },
];

const ACTIVIDADES_INIT = [
  { id:1, nombre:"Autocar Valencia vs Getafe", fecha:"2026-06-07", tipo:"autocar", coste:480, preciSocio:12, plazas:50, responsable:"Paco Martínez", descripcion:"Partido de Liga", inscritos:[1,2,4,6,7] },
  { id:2, nombre:"Cena de Fin de Temporada", fecha:"2026-06-14", tipo:"cena", coste:1200, preciSocio:20, plazas:80, responsable:"Maria Ferrer", descripcion:"Restaurante El Levante", inscritos:[1,2,3,4,6] },
  { id:3, nombre:"Autocar Valencia vs Betis", fecha:"2026-05-25", tipo:"autocar", coste:480, preciSocio:12, plazas:50, responsable:"Paco Martínez", descripcion:"Partido de Liga", inscritos:[1,2,4,5,6,7] },
  { id:4, nombre:"Asamblea General", fecha:"2026-06-21", tipo:"reunion", coste:0, preciSocio:0, plazas:200, responsable:"Vicent Català", descripcion:"Asamblea anual de socios", inscritos:[1,2,6] },
  { id:5, nombre:"Cena de Navidad", fecha:"2025-12-20", tipo:"cena", coste:800, preciSocio:18, plazas:60, responsable:"Carmen Llopis", descripcion:"Celebración navideña", inscritos:[1,2,3,4,6,7] },
];

const LOTERIA_INIT = [
  { id:1, socioId:1, concepto:"Navidad 2025 - 2 décimos", decimosDe:"Navidad", unidades:2, precioUnd:20, importeTotal:40, pagado:true, fechaPago:"2025-11-15" },
  { id:2, socioId:2, concepto:"Navidad 2025 - 1 décimo", decimosDe:"Navidad", unidades:1, precioUnd:20, importeTotal:20, pagado:true, fechaPago:"2025-11-18" },
  { id:3, socioId:3, concepto:"Navidad 2025 - 3 décimos", decimosDe:"Navidad", unidades:3, precioUnd:20, importeTotal:60, pagado:false, fechaPago:null },
  { id:4, socioId:4, concepto:"Navidad 2025 - 1 décimo", decimosDe:"Navidad", unidades:1, precioUnd:20, importeTotal:20, pagado:true, fechaPago:"2025-11-20" },
  { id:5, socioId:6, concepto:"Navidad 2025 - 2 décimos", decimosDe:"Navidad", unidades:2, precioUnd:20, importeTotal:40, pagado:true, fechaPago:"2025-11-15" },
];

// ── TARIFAS (configurables por la junta desde el panel) ──
const TARIFAS_INIT = {
  nueva_alta:     { label:"Nueva alta",            importe:30,   aprobado:true,  descripcion:"Socios que se incorporan por primera vez" },
  renovacion:     { label:"Renovación (anterior)", importe:25,   aprobado:true,  descripcion:`Socios que estuvieron en ${TEMPORADA_ANTERIOR}` },
  infantil_0_3:   { label:"Infantil 0-3 años",     importe:0,    aprobado:true,  descripcion:"De 0 a 3 años. Cuota gratuita" },
  infantil_mayor: { label:"Infantil +3 años",      importe:null, aprobado:false, descripcion:"Pendiente de aprobar en asamblea" },
  honorifico:     { label:"Honorífico",            importe:0,    aprobado:true,  descripcion:"Designado por la junta directiva" },
};

const calcEdad = (fn) => {
  if(!fn) return null;
  const hoyD=new Date(); const b=new Date(fn);
  let a=hoyD.getFullYear()-b.getFullYear();
  if(hoyD<new Date(hoyD.getFullYear(),b.getMonth(),b.getDate())) a--;
  return a;
};

const detectarCategoria = (socio, cuotas) => {
  if(socio.tipo==="honorifico") return "honorifico";
  const años = calcEdad(socio.fechaNac);
  if(años!==null && años<=3) return "infantil_0_3";
  if(socio.tipo==="infantil") return "infantil_mayor";
  const eraAnterior = cuotas.some(c=>c.socioId===socio.id && c.temporada===TEMPORADA_ANTERIOR);
  return eraAnterior ? "renovacion" : "nueva_alta";
};

const importeCuota = (cat, tarifas) => {
  const t=tarifas[cat]; if(!t||!t.aprobado) return null; return t.importe;
};

const TIPOS_SOCIO = ["adulto","infantil","honorifico"];
const TIPOS_ACTIVIDAD = ["autocar","cena","excursion","reunion","sorteo","otro"];
const FORMAS_PAGO = ["Efectivo","Bizum","Transferencia","Domiciliación"];

// ── UTILIDADES ────────────────────────────────────────────
const fmt = (n) => `${Number(n).toFixed(2).replace(".",",")}€`;
const edad = (fn) => { if(!fn) return "—"; const d=new Date(); const b=new Date(fn); let a=d.getFullYear()-b.getFullYear(); if(d<new Date(d.getFullYear(),b.getMonth(),b.getDate())) a--; return a; };
const nextId = (arr) => Math.max(0,...arr.map(x=>x.id))+1;
const nextNumero = (socios) => `LRM-${String(nextId(socios)).padStart(4,"0")}`;

// ── COMPONENTES BASE ──────────────────────────────────────
function Card({children,style={},onClick}){
  return <div onClick={onClick} style={{background:C.blanco,borderRadius:14,padding:22,boxShadow:"0 2px 14px rgba(0,0,0,0.07)",cursor:onClick?"pointer":undefined,...style}}>{children}</div>;
}
function Pill({text,color=C.gris,bg}){
  const bgC = bg||(color+"18");
  return <span style={{background:bgC,color,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{text}</span>;
}
function Btn({children,onClick,color=C.granate,outline,small,style={}}){
  return <button onClick={onClick} style={{padding:small?"6px 12px":"9px 18px",background:outline?"transparent":color,color:outline?color:C.blanco,border:`2px solid ${color}`,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:small?12:14,fontFamily:"inherit",...style}}>{children}</button>;
}
function Input({label,value,onChange,type="text",placeholder="",required,error,style={}}){
  return(
    <div style={{marginBottom:14}}>
      {label&&<label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.rojo}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${error?C.rojo:C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...style}}/>
      {error&&<span style={{fontSize:11,color:C.rojo}}>{error}</span>}
    </div>
  );
}
function Select({label,value,onChange,options,required}){
  return(
    <div style={{marginBottom:14}}>
      {label&&<label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.rojo}}> *</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",background:C.blanco}}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}
function KPI({label,value,sub,color=C.granate,icon}){
  return(
    <Card style={{borderLeft:`5px solid ${color}`,flex:1,minWidth:140,padding:"18px 20px"}}>
      {icon&&<div style={{fontSize:18,marginBottom:4}}>{icon}</div>}
      <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
      <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Playfair Display',serif"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{sub}</div>}
    </Card>
  );
}
function Modal({open,onClose,title,children,width=500}){
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <Card style={{width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:18}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted}}>✕</button>
        </div>
        {children}
      </Card>
    </div>
  );
}
function TH({children}){ return <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,background:C.grisLight}}>{children}</th>; }
function TD({children,style={}}){ return <td style={{padding:"11px 14px",fontSize:13,color:C.text,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>; }

const TABS = [
  {id:"dashboard",label:"Panel",icon:"🏠"},
  {id:"peñistas",label:"Peñistas",icon:"👥"},
  {id:"cuotas",label:"Cuotas",icon:"💶"},
  {id:"actividades",label:"Actividades",icon:"📅"},
  {id:"participacion",label:"Participación",icon:"🏆"},
  {id:"comunicacion",label:"Comunicación",icon:"📣"},
  {id:"loteria",label:"Lotería",icon:"🎟️"},
  {id:"tesoreria",label:"Tesorería",icon:"📒"},
  {id:"documentacion",label:"Documentación",icon:"📁"},
  {id:"configuracion",label:"Configuración",icon:"⚙️"},
];

// ── CATEGORÍAS DE INGRESO / GASTO ─────────────────────────
const CAT_INGRESOS = ["Cuotas socios","Patrocinio","Lotería Navidad","Lotería Niño","Venta productos","Remanente ejercicio anterior","Otros ingresos"];
const CAT_GASTOS   = ["Merchandising","Actos y eventos","Lotería (coste)","Diseño y material","Gastos bancarios","Otros gastos"];

// ── EJERCICIOS REALES (del documento) ─────────────────────
const EJERCICIOS_INIT = [
  {
    id:1,
    nombre:"Ejercicio 2025",
    periodo:"1 Enero – 31 Agosto 2025",
    cerrado:true,
    ingresos:[
      {id:1,concepto:"Cuotas Socios",categoria:"Cuotas socios",importe:395,fecha:"2025-08-31"},
    ],
    gastos:[
      {id:1,concepto:"Camisetas",categoria:"Merchandising",importe:300,fecha:"2025-08-31"},
      {id:2,concepto:"Pancarta",categoria:"Merchandising",importe:60,fecha:"2025-08-31"},
      {id:3,concepto:"Diseño Pancarta",categoria:"Diseño y material",importe:25,fecha:"2025-08-31"},
    ],
  },
  {
    id:2,
    nombre:"Ejercicio 2025-2026",
    periodo:"1 Septiembre 2025 – 30 Junio 2026",
    cerrado:false,
    ingresos:[
      {id:1,concepto:"Cuotas Socios",categoria:"Cuotas socios",importe:490,fecha:"2025-09-30"},
      {id:2,concepto:"Patrocinio Inauguración",categoria:"Patrocinio",importe:150,fecha:"2025-09-15"},
      {id:3,concepto:"Patrocinio Feria Asociación",categoria:"Patrocinio",importe:150,fecha:"2025-10-01"},
      {id:4,concepto:"Lotería Navidad",categoria:"Lotería Navidad",importe:200,fecha:"2025-12-22"},
      {id:5,concepto:"Lotería Niño",categoria:"Lotería Niño",importe:100,fecha:"2026-01-06"},
      {id:6,concepto:"Venta Bufandas",categoria:"Venta productos",importe:100,fecha:"2025-12-01"},
      {id:7,concepto:"Remanente 2025",categoria:"Remanente ejercicio anterior",importe:10,fecha:"2025-09-01"},
    ],
    gastos:[
      {id:1,concepto:"Cuño Peña",categoria:"Merchandising",importe:40,fecha:"2025-09-10"},
      {id:2,concepto:"Bufandas",categoria:"Merchandising",importe:300,fecha:"2025-11-15"},
      {id:3,concepto:"Acto Feria Asociación",categoria:"Actos y eventos",importe:20,fecha:"2025-10-05"},
      {id:4,concepto:"Acto Inauguración",categoria:"Actos y eventos",importe:455,fecha:"2025-09-20"},
      {id:5,concepto:"Gastos Lotería",categoria:"Lotería (coste)",importe:50,fecha:"2025-11-20"},
      {id:6,concepto:"Acto I Aniversario",categoria:"Actos y eventos",importe:280,fecha:"2026-05-15"},
    ],
  },
];

// ══════════════════════════════════════════════════════════
// MÓDULO 1 — PANEL (Dashboard)
// ══════════════════════════════════════════════════════════
function Dashboard({socios,cuotas,actividades,loteria,ejercicios,setTab,setSocioFiltro}){
  const activos = socios.filter(s=>s.estado==="activo");
  const altas2026 = socios.filter(s=>s.fechaAlta?.startsWith("2026")).length;
  const bajas = socios.filter(s=>s.estado==="baja").length;
  const cuotasTemporada = cuotas.filter(c=>c.temporada===TEMPORADA_ACTUAL);
  const cuotasCobradas = cuotasTemporada.filter(c=>c.pagado).reduce((a,c)=>a+c.importe,0);
  const cuotasPend = cuotasTemporada.filter(c=>!c.pagado).reduce((a,c)=>a+c.importe,0);
  const actRealizadas = actividades.filter(a=>a.fecha<=hoy).length;
  const partMedia = actividades.length?(actividades.reduce((a,ac)=>a+ac.inscritos.length,0)/actividades.length).toFixed(1):0;
  const loPendiente = loteria.filter(l=>!l.pagado).reduce((a,l)=>a+l.importeTotal,0);
  const rgpdPendiente = activos.filter(s=>!s.rgpd);
  const morosos = activos.filter(s=>cuotas.some(c=>c.socioId===s.id&&!c.pagado&&c.temporada===TEMPORADA_ACTUAL));

  // Ejercicio actual
  const ejActual = ejercicios[ejercicios.length-1];
  const totalIng = ejActual?.ingresos.reduce((a,x)=>a+x.importe,0)||0;
  const totalGas = ejActual?.gastos.reduce((a,x)=>a+x.importe,0)||0;

  const municipios={};
  activos.forEach(s=>{municipios[s.municipio]=(municipios[s.municipio]||0)+1;});

  const irAConFiltro=(tab,filtro)=>{ if(filtro) setSocioFiltro(filtro); setTab(tab); };

  return(
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:22}}>🐸 Panel de la Junta Directiva</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:4}}>Peña La Rana Mecánica · Levante UD · {TEMPORADA_ACTUAL}</p>
      </div>

      {/* ALERTAS ACTIVAS */}
      {(morosos.length>0||rgpdPendiente.length>0||loPendiente>0)&&(
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
          {morosos.length>0&&(
            <div onClick={()=>setTab("cuotas")} style={{flex:1,minWidth:200,background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:22}}>⚠️</span>
              <div>
                <div style={{fontWeight:700,color:C.oro,fontSize:13}}>{morosos.length} socio{morosos.length>1?"s":""} con cuota pendiente</div>
                <div style={{fontSize:11,color:C.muted}}>Clic para gestionar → Cuotas</div>
              </div>
            </div>
          )}
          {rgpdPendiente.length>0&&(
            <div onClick={()=>setTab("documentacion")} style={{flex:1,minWidth:200,background:C.rojoLight,border:`1px solid ${C.rojo}50`,borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:22}}>📋</span>
              <div>
                <div style={{fontWeight:700,color:C.rojo,fontSize:13}}>{rgpdPendiente.length} RGPD sin firmar</div>
                <div style={{fontSize:11,color:C.muted}}>Clic para revisar → Documentación</div>
              </div>
            </div>
          )}
          {loPendiente>0&&(
            <div onClick={()=>setTab("loteria")} style={{flex:1,minWidth:200,background:C.azulLight,border:`1px solid ${C.azul}50`,borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:22}}>🎟️</span>
              <div>
                <div style={{fontWeight:700,color:C.azul,fontSize:13}}>{fmt(loPendiente)} lotería sin cobrar</div>
                <div style={{fontSize:11,color:C.muted}}>Clic para gestionar → Lotería</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPIs CLICKABLES */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:22}}>
        <div onClick={()=>setTab("peñistas")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Peñistas activos" value={activos.length} icon="👥" color={C.granate} sub="Ver censo →"/></div>
        <div onClick={()=>setTab("peñistas")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Nuevas altas 2026" value={altas2026} icon="✨" color={C.azul}/></div>
        <div onClick={()=>setTab("cuotas")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Cuotas cobradas" value={fmt(cuotasCobradas)} icon="✅" color={C.verde} sub={TEMPORADA_ACTUAL}/></div>
        <div onClick={()=>setTab("cuotas")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Pendiente cobrar" value={fmt(cuotasPend)} icon="⏳" color={C.oro} sub="Ver pendientes →"/></div>
        <div onClick={()=>setTab("tesoreria")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Saldo peña" value={fmt(totalIng-totalGas)} icon="💰" color={totalIng-totalGas>=0?C.verde:C.rojo} sub="Ver tesorería →"/></div>
        <div onClick={()=>setTab("participacion")} style={{cursor:"pointer",flex:1,minWidth:130}}><KPI label="Part. media" value={`${partMedia} p/acto`} icon="🏆" color={C.granate}/></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* MOROSOS */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15}}>⚠️ Cuotas pendientes</h3>
            {morosos.length>0&&<Btn small outline onClick={()=>setTab("comunicacion")}>📣 Recordatorio</Btn>}
          </div>
          {morosos.length===0
            ?<p style={{color:C.verde,fontSize:13}}>✅ Todos los socios al corriente</p>
            :morosos.map(s=>{
              const imp=cuotas.filter(c=>c.socioId===s.id&&!c.pagado).reduce((a,c)=>a+c.importe,0);
              return <div key={s.id} onClick={()=>{setSocioFiltro(s.id);setTab("cuotas");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,cursor:"pointer"}}>
                <span style={{color:C.text}}>{s.nombre} {s.apellidos} <span style={{color:C.muted,fontSize:11}}>{s.numero}</span></span>
                <span style={{fontWeight:700,color:C.oro,fontSize:13}}>{fmt(imp)} →</span>
              </div>;
            })
          }
        </Card>

        {/* MUNICIPIOS */}
        <Card>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15,marginBottom:14}}>📍 Municipios</h3>
          {Object.entries(municipios).sort((a,b)=>b[1]-a[1]).map(([m,n])=>(
            <div key={m} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                <span style={{color:C.text}}>{m}</span>
                <span style={{fontWeight:700,color:C.granate}}>{n} socio{n>1?"s":""}</span>
              </div>
              <div style={{background:C.border,borderRadius:6,height:6}}>
                <div style={{width:`${(n/activos.length)*100}%`,background:C.granate,height:6,borderRadius:6,transition:"width 0.5s"}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* PRÓXIMAS ACTIVIDADES */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15}}>📅 Próximas actividades</h3>
            <Btn small outline onClick={()=>setTab("actividades")}>Ver todas</Btn>
          </div>
          {actividades.filter(a=>a.fecha>=hoy).sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(0,4).map(a=>{
            const pct=Math.round((a.inscritos.length/a.plazas)*100);
            return <div key={a.id} onClick={()=>setTab("actividades")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:C.text}}>{a.nombre}</div>
                <div style={{fontSize:11,color:C.muted}}>{a.fecha}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:pct>=80?C.verde:C.azul}}>{a.inscritos.length}/{a.plazas}</div>
                <div style={{fontSize:10,color:C.muted}}>{pct}% ocupado</div>
              </div>
            </div>;
          })}
          {actividades.filter(a=>a.fecha>=hoy).length===0&&<p style={{color:C.muted,fontSize:13}}>No hay actividades próximas</p>}
        </Card>

        {/* ACCIONES RÁPIDAS */}
        <Card>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15,marginBottom:14}}>⚡ Acciones rápidas</h3>
          {[
            {label:"✍️ Dar de alta a un peñista",tab:"peñistas",color:C.granate},
            {label:"💶 Registrar cuota cobrada",tab:"cuotas",color:C.verde},
            {label:"📅 Crear nueva actividad",tab:"actividades",color:C.azul},
            {label:"🎟️ Asignar décimos lotería",tab:"loteria",color:C.oro},
            {label:"📒 Ver tesorería",tab:"tesoreria",color:C.gris},
          ].map(a=>(
            <button key={a.tab} onClick={()=>setTab(a.tab)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",marginBottom:7,padding:"10px 14px",background:C.grisLight,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,textAlign:"left",color:C.text,fontFamily:"inherit",transition:"all 0.15s"}}>
              {a.label}
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 2 — PEÑISTAS
// ══════════════════════════════════════════════════════════
function Peñistas({socios,setSocios,cuotas,setCuotas,tarifas,actividades,loteria,socioFiltro,setSocioFiltro}){
  const [busqueda,setBusqueda]=useState("");
  const [filtroEstado,setFiltroEstado]=useState("todos");
  const [modal,setModal]=useState(false);
  const [detalle,setDetalle]=useState(()=>socioFiltro?socios.find(s=>s.id===socioFiltro)||null:null);
  const [form,setForm]=useState({nombre:"",apellidos:"",dni:"",fechaNac:"",telefono:"",email:"",municipio:"",tipo:"adulto",rgpd:false,fotoAut:false});
  const [errores,setErrores]=useState({});

  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const validar=()=>{
    const e={};
    if(!form.nombre) e.nombre="Obligatorio";
    if(!form.apellidos) e.apellidos="Obligatorio";
    if(!form.telefono) e.telefono="Obligatorio";
    if(!form.municipio) e.municipio="Obligatorio";
    return e;
  };

  const guardar=()=>{
    const e=validar();
    if(Object.keys(e).length){setErrores(e);return;}
    const id=nextId(socios);
    const nuevo={...form,id,numero:nextNumero(socios),fechaAlta:hoy,fechaBaja:null,estado:"activo"};
    setSocios(p=>[...p,nuevo]);
    // Cuota automática: detectar categoría y tarifa
    const cat=detectarCategoria(nuevo,[...cuotas]);
    const imp=importeCuota(cat,tarifas);
    if(imp!==null){
      setCuotas(p=>[...p,{id:nextId(cuotas),socioId:id,temporada:TEMPORADA_ACTUAL,categoria:cat,importe:imp,pagado:false,fechaPago:null,formaPago:null}]);
    }
    setModal(false);
    setForm({nombre:"",apellidos:"",dni:"",fechaNac:"",telefono:"",email:"",municipio:"",tipo:"adulto",rgpd:false,fotoAut:false});
    setErrores({});
  };

  const darBaja=(id)=>setSocios(p=>p.map(s=>s.id===id?{...s,estado:"baja",fechaBaja:hoy}:s));
  const reactivar=(id)=>setSocios(p=>p.map(s=>s.id===id?{...s,estado:"activo",fechaBaja:null}:s));

  const filtrados=socios.filter(s=>{
    const m=`${s.nombre} ${s.apellidos} ${s.municipio} ${s.numero}`.toLowerCase().includes(busqueda.toLowerCase());
    if(filtroEstado==="todos") return m;
    return m&&s.estado===filtroEstado;
  });

  const estadoPill=(e)=>e==="activo"?<Pill text="● Activo" color={C.verde} bg={C.verdeLight}/>:<Pill text="● Baja" color={C.rojo} bg={C.rojoLight}/>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>👥 Peñistas</h2>
        <Btn onClick={()=>setModal(true)}>+ Nuevo peñista</Btn>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="🔍 Buscar por nombre, número, municipio..."
          style={{flex:1,minWidth:220,padding:"9px 13px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        {["todos","activo","baja"].map(f=>(
          <button key={f} onClick={()=>setFiltroEstado(f)} style={{padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtroEstado===f?C.granate:"#f0f0f0",color:filtroEstado===f?C.blanco:C.gris,fontFamily:"inherit"}}>
            {f==="todos"?"Todos":f==="activo"?"Activos":"Bajas"}
          </button>
        ))}
      </div>

      <Card style={{padding:0}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Nº Socio","Nombre","DNI","Municipio","Tipo","Edad","Alta","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {filtrados.map(s=>(
                <tr key={s.id} style={{background:C.blanco}}>
                  <TD style={{fontFamily:"monospace",color:C.muted}}>{s.numero}</TD>
                  <TD style={{fontWeight:600}}>{s.nombre} {s.apellidos}</TD>
                  <TD>{s.dni||"—"}</TD>
                  <TD>{s.municipio}</TD>
                  <TD><span style={{textTransform:"capitalize"}}>{s.tipo}</span></TD>
                  <TD>{edad(s.fechaNac)} años</TD>
                  <TD>{s.fechaAlta}</TD>
                  <TD>{estadoPill(s.estado)}</TD>
                  <TD>
                    <div style={{display:"flex",gap:6}}>
                      <Btn small outline onClick={()=>setDetalle(s)}>Ver</Btn>
                      {s.estado==="activo"
                        ?<Btn small outline color={C.rojo} onClick={()=>darBaja(s.id)}>Baja</Btn>
                        :<Btn small outline color={C.verde} onClick={()=>reactivar(s.id)}>Reactivar</Btn>}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 16px",color:C.muted,fontSize:13,borderTop:`1px solid ${C.border}`}}>{filtrados.length} peñistas</div>
      </Card>

      {/* MODAL NUEVO */}
      <Modal open={modal} onClose={()=>setModal(false)} title="✍️ Alta de peñista" width={600}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Input label="Nombre" value={form.nombre} onChange={v=>setF("nombre",v)} required error={errores.nombre}/>
          <Input label="Apellidos" value={form.apellidos} onChange={v=>setF("apellidos",v)} required error={errores.apellidos}/>
          <Input label="DNI / NIE" value={form.dni} onChange={v=>setF("dni",v)} placeholder="12345678A"/>
          <Input label="Fecha de nacimiento" value={form.fechaNac} onChange={v=>setF("fechaNac",v)} type="date"/>
          <Input label="Teléfono" value={form.telefono} onChange={v=>setF("telefono",v)} required error={errores.telefono} type="tel"/>
          <Input label="Email" value={form.email} onChange={v=>setF("email",v)} type="email"/>
          <Input label="Municipio" value={form.municipio} onChange={v=>setF("municipio",v)} required error={errores.municipio}/>
          <Select label="Tipo de socio" value={form.tipo} onChange={v=>setF("tipo",v)} options={TIPOS_SOCIO.map(t=>({value:t,label:`${t.charAt(0).toUpperCase()+t.slice(1)} — ${CUOTA_POR_TIPO[t]}€/año`}))}/>
        </div>
        <div style={{display:"flex",gap:20,marginBottom:16}}>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.gris,cursor:"pointer"}}>
            <input type="checkbox" checked={form.rgpd} onChange={e=>setF("rgpd",e.target.checked)}/> Consentimiento RGPD firmado
          </label>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.gris,cursor:"pointer"}}>
            <input type="checkbox" checked={form.fotoAut} onChange={e=>setF("fotoAut",e.target.checked)}/> Autoriza fotografías
          </label>
        </div>
        <div style={{background:C.oroLight,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#7a6000"}}>
          ℹ️ Se generará automáticamente el número de socio <strong>{nextNumero(socios)}</strong>. La cuota se calculará según la categoría detectada (nueva alta: <strong>30€</strong> / renovación: <strong>25€</strong> / infantil 0-3: <strong>gratis</strong>).
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardar} style={{flex:1}}>🐸 Dar de alta</Btn>
        </div>
      </Modal>

      {/* MODAL DETALLE — ahora con historial completo del socio */}
      <Modal open={!!detalle} onClose={()=>setDetalle(null)} title={detalle?`${detalle.nombre} ${detalle.apellidos}`:""} width={620}>
        {detalle&&<div>
          {/* Datos básicos */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["Número",detalle.numero],["DNI",detalle.dni||"—"],["Teléfono",detalle.telefono],["Email",detalle.email||"—"],["Municipio",detalle.municipio],["Fecha nac.",detalle.fechaNac||"—"],["Edad",`${edad(detalle.fechaNac)} años`],["Tipo",detalle.tipo],["Alta",detalle.fechaAlta],["Estado",detalle.estado]].map(([k,v])=>(
              <div key={k} style={{padding:"8px 12px",background:C.grisLight,borderRadius:8}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontWeight:600,fontSize:13,textTransform:"capitalize"}}>{v}</div>
              </div>
            ))}
          </div>
          {/* RGPD y foto */}
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{flex:1,padding:"10px 14px",borderRadius:10,background:detalle.rgpd?C.verdeLight:C.rojoLight,fontSize:13,fontWeight:600,color:detalle.rgpd?C.verde:C.rojo,textAlign:"center"}}>
              {detalle.rgpd?"✅ RGPD firmado":"❌ RGPD pendiente"}
            </div>
            <div style={{flex:1,padding:"10px 14px",borderRadius:10,background:detalle.fotoAut?C.verdeLight:C.rojoLight,fontSize:13,fontWeight:600,color:detalle.fotoAut?C.verde:C.rojo,textAlign:"center"}}>
              {detalle.fotoAut?"📸 Foto autorizada":"📵 Foto no autorizada"}
            </div>
          </div>
          {/* Cuotas del socio */}
          {cuotas.filter(c=>c.socioId===detalle.id).length>0&&<div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Cuotas</div>
            {cuotas.filter(c=>c.socioId===detalle.id).map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,marginBottom:4,background:c.pagado?C.verdeLight:C.oroLight}}>
                <span style={{fontSize:12,color:C.text}}>{c.temporada}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:c.pagado?C.verde:C.oro}}>{c.importe===0?"Gratis":fmt(c.importe)}</span>
                  <Pill text={c.pagado?"✓ Pagada":"⏳ Pendiente"} color={c.pagado?C.verde:C.oro} bg={c.pagado?C.verdeLight:C.oroLight}/>
                </div>
              </div>
            ))}
          </div>}
          {/* Actividades del socio */}
          {actividades.filter(a=>a.inscritos.includes(detalle.id)).length>0&&<div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Actividades ({actividades.filter(a=>a.inscritos.includes(detalle.id)).length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {actividades.filter(a=>a.inscritos.includes(detalle.id)).map(a=>(
                <Pill key={a.id} text={`${a.nombre.slice(0,20)}`} color={a.fecha>=hoy?C.azul:C.gris} bg={a.fecha>=hoy?C.azulLight:C.grisLight}/>
              ))}
            </div>
          </div>}
          {/* Lotería del socio */}
          {loteria.filter(l=>l.socioId===detalle.id).length>0&&<div>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Lotería</div>
            {loteria.filter(l=>l.socioId===detalle.id).map(l=>(
              <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,marginBottom:4,background:l.pagado?C.verdeLight:C.oroLight}}>
                <span style={{fontSize:12}}>{l.concepto}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontWeight:700,color:l.pagado?C.verde:C.oro,fontSize:13}}>{fmt(l.importeTotal)}</span>
                  <Pill text={l.pagado?"✓ Pagado":"⏳ Pendiente"} color={l.pagado?C.verde:C.oro} bg={l.pagado?C.verdeLight:C.oroLight}/>
                </div>
              </div>
            ))}
          </div>}
        </div>}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 3 — CUOTAS
// ══════════════════════════════════════════════════════════
function Cuotas({socios,cuotas,setCuotas,tarifas,setTarifas,socioFiltro,setSocioFiltro}){
  const [modal,setModal]=useState(false);
  const [vistaConfig,setVistaConfig]=useState(false);
  const [filtroPago,setFiltroPago]=useState("todos");
  const [filtroTemp,setFiltroTemp]=useState(TEMPORADA_ACTUAL);
  const [filtroSocioId,setFiltroSocioId]=useState(socioFiltro||"");
  const [tarifasEdit,setTarifasEdit]=useState(tarifas);
  const [form,setForm]=useState({socioId:socioFiltro||"",temporada:TEMPORADA_ACTUAL,categoria:"",importe:"",pagado:false,fechaPago:"",formaPago:"Bizum"});
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const getSocio=(id)=>socios.find(s=>s.id===Number(id));

  // Al elegir socio, detectar categoría automáticamente
  const elegirSocio=(id)=>{
    const s=getSocio(id);
    if(!s){setF("socioId",id);return;}
    const cat=detectarCategoria(s,cuotas);
    const imp=importeCuota(cat,tarifas);
    setForm(f=>({...f,socioId:id,categoria:cat,importe:imp!==null?imp:""}));
  };

  const filtradas=cuotas.filter(c=>{
    const pagOk=filtroPago==="todos"||(filtroPago==="pagadas"&&c.pagado)||(filtroPago==="pendientes"&&!c.pagado);
    const tempOk=filtroTemp==="todos"||c.temporada===filtroTemp;
    const socioOk=!filtroSocioId||c.socioId===Number(filtroSocioId);
    return pagOk&&tempOk&&socioOk;
  });

  const cobradas=filtradas.filter(c=>c.pagado).reduce((a,c)=>a+c.importe,0);
  const pendiente=filtradas.filter(c=>!c.pagado).reduce((a,c)=>a+c.importe,0);
  const morosos=cuotas.filter(c=>!c.pagado&&c.temporada===TEMPORADA_ACTUAL).length;

  const guardar=()=>{
    if(!form.socioId) return;
    setCuotas(p=>[...p,{...form,id:nextId(p),socioId:Number(form.socioId),importe:Number(form.importe)||0,fechaPago:form.pagado?form.fechaPago:null}]);
    setModal(false);
    setForm({socioId:"",temporada:TEMPORADA_ACTUAL,categoria:"",importe:"",pagado:false,fechaPago:"",formaPago:"Bizum"});
  };

  const marcarPagado=(id)=>setCuotas(p=>p.map(c=>c.id===id?{...c,pagado:true,fechaPago:hoy}:c));
  const desmarcar=(id)=>setCuotas(p=>p.map(c=>c.id===id?{...c,pagado:false,fechaPago:null}:c));

  const guardarTarifas=()=>{setTarifas(tarifasEdit);setVistaConfig(false);};

  const catInfo=(cat)=>tarifas[cat]||{label:cat,importe:"—"};
  const tempOptions=[...new Set(cuotas.map(c=>c.temporada))];

  // Vista configuración de tarifas
  if(vistaConfig) return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <Btn outline small onClick={()=>setVistaConfig(false)}>← Volver</Btn>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>⚙️ Configurar tarifas de cuota</h2>
      </div>
      <div style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#7a5c00"}}>
        ℹ️ Las tarifas son aprobadas en asamblea. Marca como "aprobada" solo las que hayan sido ratificadas. Las no aprobadas quedarán visibles como <strong>pendientes</strong> y no se aplicarán automáticamente.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
        {Object.entries(tarifasEdit).map(([key,t])=>(
          <Card key={key} style={{borderLeft:`4px solid ${t.aprobado?C.verde:C.oro}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:3}}>{t.label}</div>
                <div style={{fontSize:12,color:C.muted}}>{t.descripcion}</div>
              </div>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                <div>
                  <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600}}>Importe (€)</label>
                  <input type="number" value={t.importe??""} onChange={e=>setTarifasEdit(prev=>({...prev,[key]:{...prev[key],importe:e.target.value===""?null:Number(e.target.value)}}))}
                    placeholder="Sin fijar"
                    style={{width:100,padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:15,fontWeight:700,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600}}>Estado</label>
                  <div style={{display:"flex",gap:6}}>
                    {[{v:true,l:"✅ Aprobada",c:C.verde},{v:false,l:"⏳ Pendiente",c:C.oro}].map(opt=>(
                      <button key={String(opt.v)} onClick={()=>setTarifasEdit(prev=>({...prev,[key]:{...prev[key],aprobado:opt.v}}))}
                        style={{padding:"7px 12px",borderRadius:8,border:`2px solid ${t.aprobado===opt.v?opt.c:C.border}`,background:t.aprobado===opt.v?opt.c:"transparent",color:t.aprobado===opt.v?C.blanco:C.gris,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit"}}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn outline onClick={()=>setVistaConfig(false)} style={{flex:1}}>Cancelar</Btn>
        <Btn onClick={guardarTarifas} style={{flex:1}}>💾 Guardar tarifas</Btn>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>💶 Cuotas · {TEMPORADA_ACTUAL}</h2>
        <div style={{display:"flex",gap:10}}>
          <Btn outline small onClick={()=>setVistaConfig(true)}>⚙️ Configurar tarifas</Btn>
          <Btn onClick={()=>setModal(true)}>+ Registrar cuota</Btn>
        </div>
      </div>

      {/* TARJETAS TARIFAS VIGENTES */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {Object.entries(tarifas).map(([key,t])=>(
          <div key={key} style={{background:C.blanco,borderRadius:12,padding:"14px 18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`3px solid ${t.aprobado?C.granate:C.oro}`,minWidth:140,flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>{t.label}</div>
            {t.aprobado && t.importe!==null
              ? <div style={{fontSize:24,fontWeight:800,color:C.granate,fontFamily:"'Playfair Display',serif"}}>{t.importe===0?"Gratis":`${t.importe}€`}</div>
              : <div style={{fontSize:14,fontWeight:700,color:C.oro}}>⏳ Sin fijar</div>}
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>{t.aprobado?"Aprobada en asamblea":"Pendiente asamblea"}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <KPI label="Total cobrado" value={fmt(cobradas)} color={C.verde} icon="✅"/>
        <KPI label="Pendiente de cobro" value={fmt(pendiente)} color={C.oro} icon="⏳"/>
        <KPI label="Morosos temporada actual" value={morosos} color={C.rojo} icon="⚠️"/>
      </div>

      {/* FILTROS */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}>
          {["todos","pagadas","pendientes"].map(f=>(
            <button key={f} onClick={()=>setFiltroPago(f)} style={{padding:"7px 13px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtroPago===f?C.granate:"#f0f0f0",color:filtroPago===f?C.blanco:C.gris,fontFamily:"inherit"}}>
              {f==="todos"?"Todas":f==="pagadas"?"Pagadas":"Pendientes"}
            </button>
          ))}
        </div>
        <select value={filtroTemp} onChange={e=>setFiltroTemp(e.target.value)}
          style={{padding:"7px 12px",borderRadius:20,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",outline:"none",background:C.blanco,fontWeight:600,color:C.gris}}>
          <option value="todos">Todas las temporadas</option>
          {tempOptions.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <Card style={{padding:0}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Socio","Temporada","Categoría","Importe","Forma pago","Fecha pago","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {filtradas.map(c=>{
                const s=getSocio(c.socioId);
                const ci=catInfo(c.categoria);
                return <tr key={c.id}>
                  <TD style={{fontWeight:600}}>{s?`${s.nombre} ${s.apellidos}`:"—"}<br/><span style={{fontSize:11,color:C.muted}}>{s?.numero}</span></TD>
                  <TD><span style={{fontFamily:"monospace",fontSize:12,color:C.gris}}>{c.temporada}</span></TD>
                  <TD><Pill text={ci.label} color={C.azul} bg={C.azulLight}/></TD>
                  <TD style={{fontWeight:700,color:c.pagado?C.verde:C.oro,fontSize:15}}>{c.importe===0?"Gratis":fmt(c.importe)}</TD>
                  <TD>{c.formaPago||"—"}</TD>
                  <TD>{c.fechaPago||"—"}</TD>
                  <TD>{c.pagado?<Pill text="✓ Pagada" color={C.verde} bg={C.verdeLight}/>:<Pill text="⏳ Pendiente" color={C.oro} bg={C.oroLight}/>}</TD>
                  <TD>{c.importe===0?<Pill text="Gratuita" color={C.gris} bg={C.grisLight}/>:c.pagado
                    ?<Btn small outline color={C.gris} onClick={()=>desmarcar(c.id)}>Desmarcar</Btn>
                    :<Btn small color={C.verde} onClick={()=>marcarPagado(c.id)}>✓ Cobrada</Btn>}
                  </TD>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 16px",color:C.muted,fontSize:13,borderTop:`1px solid ${C.border}`}}>{filtradas.length} registros</div>
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar cuota">
        <Select label="Socio" value={form.socioId} onChange={elegirSocio} required
          options={[{value:"",label:"— Selecciona socio —"},...socios.filter(s=>s.estado==="activo").map(s=>({value:s.id,label:`${s.nombre} ${s.apellidos} (${s.numero})`}))]}/>

        {form.socioId&&(
          <div style={{background:C.azulLight,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:13,color:C.azul}}>
            <strong>Categoría detectada:</strong> {catInfo(form.categoria).label}
            {!tarifas[form.categoria]?.aprobado&&<span style={{color:C.oro,marginLeft:8}}>⚠️ Tarifa pendiente de asamblea</span>}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Select label="Temporada" value={form.temporada} onChange={v=>setF("temporada",v)}
            options={[TEMPORADA_ANTERIOR,TEMPORADA_ACTUAL].map(t=>({value:t,label:t}))}/>
          <Input label="Importe (€)" value={form.importe} onChange={v=>setF("importe",v)} type="number" placeholder={tarifas[form.categoria]?.aprobado===false?"Pendiente asamblea":"0"}/>
          <Select label="Forma de pago" value={form.formaPago} onChange={v=>setF("formaPago",v)} options={FORMAS_PAGO}/>
          <Input label="Fecha de pago" value={form.fechaPago} onChange={v=>setF("fechaPago",v)} type="date"/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:16,cursor:"pointer"}}>
          <input type="checkbox" checked={form.pagado} onChange={e=>setF("pagado",e.target.checked)}/> Marcar como ya pagada
        </label>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardar} style={{flex:1}}>Guardar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 4 — ACTIVIDADES
// ══════════════════════════════════════════════════════════
function Actividades({socios,actividades,setActividades}){
  const [modal,setModal]=useState(false);
  const [detalle,setDetalle]=useState(null);
  const [form,setForm]=useState({nombre:"",fecha:"",tipo:"autocar",coste:"",preciSocio:"",plazas:"",responsable:"",descripcion:"",inscritos:[]});

  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleInscrito=(id)=>setF("inscritos",form.inscritos.includes(id)?form.inscritos.filter(x=>x!==id):[...form.inscritos,id]);

  const guardar=()=>{
    if(!form.nombre||!form.fecha) return;
    setActividades(p=>[...p,{...form,id:nextId(actividades),coste:Number(form.coste)||0,preciSocio:Number(form.preciSocio)||0,plazas:Number(form.plazas)||50}]);
    setModal(false);
  };

  const tipoIcon={autocar:"🚌",cena:"🍽️",excursion:"🏔️",reunion:"📋",sorteo:"🎰",otro:"📌"};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>📅 Actividades</h2>
        <Btn onClick={()=>setModal(true)}>+ Nueva actividad</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {actividades.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(a=>{
          const pct=Math.min(100,Math.round((a.inscritos.length/a.plazas)*100));
          const pasado=a.fecha<hoy;
          return(
            <Card key={a.id} style={{borderTop:`4px solid ${pasado?C.gris:C.granate}`,cursor:"pointer"}} onClick={()=>setDetalle(a)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:24}}>{tipoIcon[a.tipo]||"📌"}</span>
                <Pill text={pasado?"Realizada":"Próxima"} color={pasado?C.gris:C.azul} bg={pasado?"#f0f0f0":C.azulLight}/>
              </div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:C.text,marginBottom:6}}>{a.nombre}</h3>
              <p style={{fontSize:12,color:C.muted,marginBottom:12}}>📅 {a.fecha} · 👤 {a.responsable}</p>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                  <span style={{color:C.gris}}>Inscritos</span>
                  <span style={{fontWeight:700,color:pct>=100?C.verde:C.azul}}>{a.inscritos.length}/{a.plazas}</span>
                </div>
                <div style={{background:C.border,borderRadius:6,height:7}}>
                  <div style={{width:`${pct}%`,background:pct>=100?C.verde:C.azul,height:7,borderRadius:6}}/>
                </div>
              </div>
              {a.coste>0&&<div style={{fontSize:12,color:C.muted}}>Coste peña: {fmt(a.coste)} · Precio socio: {fmt(a.preciSocio)}</div>}
            </Card>
          );
        })}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Nueva actividad" width={620}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Input label="Nombre de la actividad" value={form.nombre} onChange={v=>setF("nombre",v)} required/>
          <Input label="Fecha" value={form.fecha} onChange={v=>setF("fecha",v)} type="date" required/>
          <Select label="Tipo" value={form.tipo} onChange={v=>setF("tipo",v)} options={TIPOS_ACTIVIDAD.map(t=>({value:t,label:`${{autocar:"🚌",cena:"🍽️",excursion:"🏔️",reunion:"📋",sorteo:"🎰",otro:"📌"}[t]} ${t.charAt(0).toUpperCase()+t.slice(1)}`}))}/>
          <Input label="Responsable" value={form.responsable} onChange={v=>setF("responsable",v)}/>
          <Input label="Coste total (€)" value={form.coste} onChange={v=>setF("coste",v)} type="number"/>
          <Input label="Precio por socio (€)" value={form.preciSocio} onChange={v=>setF("preciSocio",v)} type="number"/>
          <Input label="Plazas máximas" value={form.plazas} onChange={v=>setF("plazas",v)} type="number"/>
        </div>
        <Input label="Descripción" value={form.descripcion} onChange={v=>setF("descripcion",v)}/>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:8}}>Inscritos ({form.inscritos.length})</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,maxHeight:140,overflowY:"auto",padding:4}}>
            {socios.filter(s=>s.estado==="activo").map(s=>(
              <label key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,border:`1.5px solid ${form.inscritos.includes(s.id)?C.granate:C.border}`,background:form.inscritos.includes(s.id)?C.granateLight:C.blanco,cursor:"pointer",fontSize:12,fontWeight:form.inscritos.includes(s.id)?700:400}}>
                <input type="checkbox" checked={form.inscritos.includes(s.id)} onChange={()=>toggleInscrito(s.id)} style={{display:"none"}}/>
                {s.nombre} {s.apellidos}
              </label>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardar} style={{flex:1}}>Guardar actividad</Btn>
        </div>
      </Modal>

      <Modal open={!!detalle} onClose={()=>setDetalle(null)} title={detalle?.nombre||""}>
        {detalle&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["Tipo",detalle.tipo],["Fecha",detalle.fecha],["Responsable",detalle.responsable],["Coste peña",fmt(detalle.coste)],["Precio socio",fmt(detalle.preciSocio)],["Plazas",detalle.plazas]].map(([k,v])=>(
              <div key={k} style={{padding:"8px 12px",background:C.grisLight,borderRadius:8}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontWeight:600,fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          <h4 style={{fontSize:13,fontWeight:700,color:C.gris,marginBottom:8}}>Inscritos ({detalle.inscritos.length})</h4>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {detalle.inscritos.map(id=>{const s=socios.find(x=>x.id===id);return s?<Pill key={id} text={`${s.nombre} ${s.apellidos}`} color={C.azul} bg={C.azulLight}/>:null;})}
          </div>
        </div>}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 5 — PARTICIPACIÓN
// ══════════════════════════════════════════════════════════
function Participacion({socios,actividades,setTab,setSocioFiltro}){
  const ranking=useMemo(()=>socios.filter(s=>s.estado==="activo").map(s=>{
    const count=actividades.filter(a=>a.inscritos.includes(s.id)).length;
    const total=actividades.length;
    const pct=total?Math.round((count/total)*100):0;
    return{...s,count,pct};
  }).sort((a,b)=>b.count-a.count),[socios,actividades]);

  const medals=["🥇","🥈","🥉"];
  const mediaGlobal=ranking.length?(ranking.reduce((a,s)=>a+s.count,0)/ranking.length).toFixed(1):0;

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>🏆 Participación y Fidelización</h2>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:22}}>
        <KPI label="Actividades organizadas" value={actividades.length} color={C.azul} icon="📅"/>
        <KPI label="Participación media" value={`${mediaGlobal} actos`} color={C.granate} icon="📊"/>
        <KPI label="Peñista más activo" value={ranking[0]?`${ranking[0].nombre} ${ranking[0].apellidos}`:"—"} color={C.oro} icon="🥇"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card style={{padding:0}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15}}>Ranking de participación</h3>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Pos.","Peñista","Actividades","Fidelización",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
              <tbody>
                {ranking.map((s,i)=>(
                  <tr key={s.id} style={{background:i<3?`${C.oroLight}`:C.blanco,cursor:"pointer"}} onClick={()=>{setSocioFiltro(s.id);setTab("peñistas");}}>
                    <TD style={{fontWeight:800,fontSize:16,textAlign:"center"}}>{medals[i]||i+1}</TD>
                    <TD style={{fontWeight:600}}>{s.nombre} {s.apellidos}<br/><span style={{fontSize:11,color:C.muted}}>{s.numero}</span></TD>
                    <TD style={{fontWeight:700,color:C.azul,textAlign:"center"}}>{s.count} / {actividades.length}</TD>
                    <TD>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,background:C.border,borderRadius:6,height:8}}>
                          <div style={{width:`${s.pct}%`,background:s.pct>=80?C.verde:s.pct>=50?C.oro:C.rojo,height:8,borderRadius:6}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:C.gris,minWidth:32}}>{s.pct}%</span>
                      </div>
                    </TD>
                    <TD>
                      <Pill
                        text={s.pct>=80?"⭐ Top":s.pct>=50?"👍 Regular":"💤 Baja"}
                        color={s.pct>=80?C.verde:s.pct>=50?C.oro:C.rojo}
                        bg={s.pct>=80?C.verdeLight:s.pct>=50?C.oroLight:C.rojoLight}
                      />
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15,marginBottom:14}}>Por actividad</h3>
          {actividades.sort((a,b)=>b.inscritos.length-a.inscritos.length).map(a=>(
            <div key={a.id} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                <span style={{color:C.text,fontWeight:600}}>{a.nombre.slice(0,22)}{a.nombre.length>22?"…":""}</span>
                <span style={{color:C.azul,fontWeight:700}}>{a.inscritos.length}</span>
              </div>
              <div style={{background:C.border,borderRadius:6,height:7}}>
                <div style={{width:`${(a.inscritos.length/Math.max(...actividades.map(x=>x.inscritos.length)))*100}%`,background:C.azul,height:7,borderRadius:6}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 6 — COMUNICACIÓN
// ══════════════════════════════════════════════════════════
function Comunicacion({socios,cuotas}){
  const [segmento,setSegmento]=useState("todos");
  const [asunto,setAsunto]=useState("");
  const [mensaje,setMensaje]=useState("");
  const [enviados,setEnviados]=useState([
    {id:1,asunto:"Bienvenida a la peña",segmento:"Todos",fecha:"2025-09-01",destinatarios:7},
    {id:2,asunto:"Cuota anual 2025-26",segmento:"Todos",fecha:"2025-09-05",destinatarios:7},
    {id:3,asunto:"Recuerda pagar tu cuota",segmento:"Morosos",fecha:"2025-10-01",destinatarios:2},
    {id:4,asunto:"Autocar vs Betis - plazas disponibles",segmento:"Todos",fecha:"2026-05-10",destinatarios:7},
  ]);

  const SEGMENTOS=[
    {id:"todos",label:"🌍 Todos los peñistas",fn:()=>socios.filter(s=>s.estado==="activo")},
    {id:"corriente",label:"✅ Socios al corriente",fn:()=>socios.filter(s=>s.estado==="activo"&&cuotas.some(c=>c.socioId===s.id&&c.pagado))},
    {id:"morosos",label:"⚠️ Cuota pendiente",fn:()=>socios.filter(s=>s.estado==="activo"&&cuotas.some(c=>c.socioId===s.id&&!c.pagado))},
    {id:"familias",label:"👨‍👩‍👧 Familias",fn:()=>socios.filter(s=>s.tipo==="familia"&&s.estado==="activo")},
    {id:"juvenil",label:"🧒 Juveniles",fn:()=>socios.filter(s=>s.tipo==="juvenil"&&s.estado==="activo")},
    {id:"nuevos",label:"✨ Nuevos socios (2026)",fn:()=>socios.filter(s=>s.fechaAlta?.startsWith("2026"))},
  ];

  const seg=SEGMENTOS.find(s=>s.id===segmento)||SEGMENTOS[0];
  const destinatarios=seg.fn();

  const enviar=()=>{
    if(!asunto||!mensaje) return;
    setEnviados(p=>[{id:nextId(p),asunto,segmento:seg.label,fecha:hoy,destinatarios:destinatarios.length},...p]);
    setAsunto("");setMensaje("");
  };

  return(
    <div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20,marginBottom:20}}>📣 Comunicación</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:15,marginBottom:14}}>Nuevo comunicado</h3>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:8}}>Segmento de destinatarios</label>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {SEGMENTOS.map(s=>(
                <button key={s.id} onClick={()=>setSegmento(s.id)} style={{padding:"9px 14px",borderRadius:8,border:`2px solid ${segmento===s.id?C.granate:C.border}`,background:segmento===s.id?C.granateLight:C.blanco,cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:segmento===s.id?700:400,color:segmento===s.id?C.granateDark:C.text,fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{s.label}</span>
                  <span style={{fontSize:12,color:segmento===s.id?C.granate:C.muted,fontWeight:600}}>{s.fn().length} p.</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>Asunto</label>
              <input value={asunto} onChange={e=>setAsunto(e.target.value)} placeholder="Ej: Autocar para el domingo..."
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:13,fontWeight:600,color:C.gris,display:"block",marginBottom:5}}>Mensaje</label>
              <textarea value={mensaje} onChange={e=>setMensaje(e.target.value)} rows={5} placeholder="Escribe el mensaje..."
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/>
            </div>
            <div style={{background:C.azulLight,borderRadius:8,padding:"9px 12px",marginBottom:12,fontSize:12,color:C.azul}}>
              📨 Se enviará a <strong>{destinatarios.length} peñistas</strong> del segmento «{seg.label}»
            </div>
            <Btn onClick={enviar} style={{width:"100%"}}>Enviar comunicado</Btn>
          </Card>
          <Card>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:14,marginBottom:12}}>Historial</h3>
            {enviados.map(e=>(
              <div key={e.id} style={{padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <div style={{fontWeight:600,color:C.text}}>{e.asunto}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{e.fecha} · {e.segmento} · {e.destinatarios} destinatarios</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 7 — LOTERÍA
// ══════════════════════════════════════════════════════════
function Loteria({socios,loteria,setLoteria,setTab,setSocioFiltro}){
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({socioId:"",decimosDe:"Navidad",unidades:1,precioUnd:20,pagado:false,fechaPago:""});
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const cobrado=loteria.filter(l=>l.pagado).reduce((a,l)=>a+l.importeTotal,0);
  const pendiente=loteria.filter(l=>!l.pagado).reduce((a,l)=>a+l.importeTotal,0);
  const decimosTotales=loteria.reduce((a,l)=>a+l.unidades,0);

  const guardar=()=>{
    if(!form.socioId) return;
    const imp=Number(form.unidades)*Number(form.precioUnd);
    const s=socios.find(x=>x.id===Number(form.socioId));
    setLoteria(p=>[...p,{...form,id:nextId(loteria),socioId:Number(form.socioId),unidades:Number(form.unidades),precioUnd:Number(form.precioUnd),importeTotal:imp,concepto:`${form.decimosDe} - ${form.unidades} décimo${form.unidades>1?"s":""}`,fechaPago:form.pagado?form.fechaPago:null}]);
    setModal(false);
  };

  const marcarPagado=(id)=>setLoteria(p=>p.map(l=>l.id===id?{...l,pagado:true,fechaPago:hoy}:l));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>🎟️ Lotería</h2>
        <Btn onClick={()=>setModal(true)}>+ Asignar décimos</Btn>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <KPI label="Décimos asignados" value={decimosTotales} color={C.azul} icon="🎟️"/>
        <KPI label="Recaudado" value={fmt(cobrado)} color={C.verde} icon="✅"/>
        <KPI label="Pendiente" value={fmt(pendiente)} color={C.oro} icon="⏳"/>
        <KPI label="Total" value={fmt(cobrado+pendiente)} color={C.granate} icon="💰"/>
      </div>
      <Card style={{padding:0}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Socio","Sorteo","Décimos","P/ud","Total","Fecha pago","Estado",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {loteria.map(l=>{
                const s=socios.find(x=>x.id===l.socioId);
                return <tr key={l.id}>
                  <TD style={{fontWeight:600,cursor:"pointer",color:C.azul,textDecoration:"underline"}} onClick={()=>{setSocioFiltro(l.socioId);setTab("peñistas");}}>{s?`${s.nombre} ${s.apellidos}`:"—"}</TD>
                  <TD>{l.decimosDe}</TD>
                  <TD style={{textAlign:"center",fontWeight:700}}>{l.unidades}</TD>
                  <TD>{fmt(l.precioUnd)}</TD>
                  <TD style={{fontWeight:700,color:l.pagado?C.verde:C.oro}}>{fmt(l.importeTotal)}</TD>
                  <TD>{l.fechaPago||"—"}</TD>
                  <TD>{l.pagado?<Pill text="✓ Pagado" color={C.verde} bg={C.verdeLight}/>:<Pill text="⏳ Pendiente" color={C.oro} bg={C.oroLight}/>}</TD>
                  <TD>{!l.pagado&&<Btn small color={C.verde} onClick={()=>marcarPagado(l.id)}>✓ Cobrado</Btn>}</TD>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title="Asignar décimos de lotería">
        <Select label="Socio" value={form.socioId} onChange={v=>setF("socioId",v)} required
          options={[{value:"",label:"— Selecciona socio —"},...socios.filter(s=>s.estado==="activo").map(s=>({value:s.id,label:`${s.nombre} ${s.apellidos}`}))]}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Input label="Sorteo (ej: Navidad 2025)" value={form.decimosDe} onChange={v=>setF("decimosDe",v)}/>
          <Input label="Nº de décimos" value={form.unidades} onChange={v=>setF("unidades",v)} type="number"/>
          <Input label="Precio por décimo (€)" value={form.precioUnd} onChange={v=>setF("precioUnd",v)} type="number"/>
          <div style={{padding:"9px 0",display:"flex",alignItems:"flex-end",marginBottom:14}}>
            <div style={{background:C.oroLight,borderRadius:8,padding:"10px 14px",width:"100%"}}>
              <div style={{fontSize:11,color:C.oro,fontWeight:700,marginBottom:2}}>TOTAL</div>
              <div style={{fontSize:20,fontWeight:800,color:C.oro}}>{fmt(Number(form.unidades||0)*Number(form.precioUnd||0))}</div>
            </div>
          </div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.pagado} onChange={e=>setF("pagado",e.target.checked)}/> Ya pagado
        </label>
        {form.pagado&&<Input label="Fecha de pago" value={form.fechaPago} onChange={v=>setF("fechaPago",v)} type="date"/>}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn outline onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn onClick={guardar} style={{flex:1}}>Guardar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO — TESORERÍA
// ══════════════════════════════════════════════════════════
function Tesoreria({ejercicios,setEjercicios,cuotas,loteria}){
  const [ejercicioId,setEjercicioId]=useState(ejercicios[ejercicios.length-1]?.id);
  const [vista,setVista]=useState("resumen"); // resumen | movimientos | nuevo_ejercicio
  const [tipoModal,setTipoModal]=useState(null); // "ingreso" | "gasto"
  const [form,setForm]=useState({concepto:"",categoria:"",importe:"",fecha:hoy,notas:""});
  const [nuevoEj,setNuevoEj]=useState({nombre:"",periodo:"",remanente:true});
  const [notif,setNotif]=useState(null);

  const ok=(msg)=>{setNotif({msg,ok:true});setTimeout(()=>setNotif(null),3000);};
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const ej=ejercicios.find(e=>e.id===ejercicioId)||ejercicios[0];
  if(!ej) return null;

  const totalIngresos=ej.ingresos.reduce((a,x)=>a+x.importe,0);
  const totalGastos=ej.gastos.reduce((a,x)=>a+x.importe,0);
  const resultado=totalIngresos-totalGastos;

  // Agrupa ingresos por categoría
  const ingCat={};
  ej.ingresos.forEach(x=>{ ingCat[x.categoria]=(ingCat[x.categoria]||0)+x.importe; });
  const gasCat={};
  ej.gastos.forEach(x=>{ gasCat[x.categoria]=(gasCat[x.categoria]||0)+x.importe; });

  const guardarMovimiento=()=>{
    if(!form.concepto||!form.importe||!form.categoria) return;
    const linea={id:Date.now(),concepto:form.concepto,categoria:form.categoria,importe:parseFloat(form.importe),fecha:form.fecha,notas:form.notas};
    setEjercicios(prev=>prev.map(e=>{
      if(e.id!==ejercicioId) return e;
      return tipoModal==="ingreso"
        ?{...e,ingresos:[...e.ingresos,linea]}
        :{...e,gastos:[...e.gastos,linea]};
    }));
    setTipoModal(null);
    setForm({concepto:"",categoria:"",importe:"",fecha:hoy,notas:""});
    ok(`✅ ${tipoModal==="ingreso"?"Ingreso":"Gasto"} registrado`);
  };

  const eliminar=(tipo,id)=>{
    setEjercicios(prev=>prev.map(e=>{
      if(e.id!==ejercicioId) return e;
      return tipo==="ingreso"
        ?{...e,ingresos:e.ingresos.filter(x=>x.id!==id)}
        :{...e,gastos:e.gastos.filter(x=>x.id!==id)};
    }));
  };

  const crearEjercicio=()=>{
    if(!nuevoEj.nombre||!nuevoEj.periodo) return;
    const remanente=nuevoEj.remanente?resultado:0;
    const nuevo={
      id:nextId(ejercicios),
      nombre:nuevoEj.nombre,
      periodo:nuevoEj.periodo,
      cerrado:false,
      ingresos:remanente>0?[{id:1,concepto:`Remanente ${ej.nombre}`,categoria:"Remanente ejercicio anterior",importe:remanente,fecha:hoy}]:[],
      gastos:[],
    };
    setEjercicios(prev=>prev.map(e=>e.id===ejercicioId?{...e,cerrado:true}:e).concat(nuevo));
    setEjercicioId(nuevo.id);
    setVista("resumen");
    ok(`✅ Ejercicio "${nuevo.nombre}" creado`);
  };

  const maxIng=Math.max(...Object.values(ingCat),1);
  const maxGas=Math.max(...Object.values(gasCat),1);

  return(
    <div>
      {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:300,background:C.verde,color:C.blanco,padding:"13px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{notif.msg}</div>}

      {/* CABECERA */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>📒 Tesorería</h2>
          <p style={{color:C.muted,fontSize:13,marginTop:3}}>Informe de cuentas por ejercicio · Peña La Rana Mecánica</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {!ej.cerrado&&<>
            <Btn small color={C.verde} onClick={()=>{setTipoModal("ingreso");setForm(f=>({...f,categoria:CAT_INGRESOS[0]}))}}>+ Ingreso</Btn>
            <Btn small color={C.rojo} onClick={()=>{setTipoModal("gasto");setForm(f=>({...f,categoria:CAT_GASTOS[0]}))}}>+ Gasto</Btn>
          </>}
          <Btn small outline onClick={()=>setVista("nuevo_ejercicio")}>📅 Nuevo ejercicio</Btn>
        </div>
      </div>

      {/* SELECTOR EJERCICIO */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {ejercicios.map(e=>(
          <button key={e.id} onClick={()=>{setEjercicioId(e.id);setVista("resumen");}} style={{
            padding:"9px 16px",borderRadius:10,border:`2px solid ${ejercicioId===e.id?C.granate:C.border}`,
            background:ejercicioId===e.id?C.granateLight:C.blanco,cursor:"pointer",
            fontWeight:700,fontSize:13,color:ejercicioId===e.id?C.granateDark:C.gris,fontFamily:"inherit",
          }}>
            {e.nombre} {e.cerrado&&<span style={{fontSize:10,color:C.muted}}>· Cerrado</span>}
          </button>
        ))}
      </div>

      {/* VISTAS */}
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {[{id:"resumen",l:"📊 Resumen"},{id:"movimientos",l:"📋 Movimientos"}].map(v=>(
          <button key={v.id} onClick={()=>setVista(v.id)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:vista===v.id?C.granate:"#f0f0f0",color:vista===v.id?C.blanco:C.gris,fontFamily:"inherit"}}>{v.l}</button>
        ))}
        <div style={{marginLeft:"auto"}}>
          <span style={{fontSize:12,color:C.muted}}>{ej.periodo}</span>
          {ej.cerrado&&<Pill text="🔒 Cerrado" color={C.gris} bg={C.grisLight} style={{marginLeft:8}}/>}
        </div>
      </div>

      {/* ── VISTA RESUMEN ── */}
      {vista==="resumen"&&(
        <div>
          {/* KPIs */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:22}}>
            <KPI label="Total ingresos" value={fmt(totalIngresos)} color={C.verde} icon="📈"/>
            <KPI label="Total gastos" value={fmt(totalGastos)} color={C.rojo} icon="📉"/>
            <KPI label={resultado>=0?"SUPERÁVIT":"DÉFICIT"} value={`${resultado>=0?"+":""}${fmt(resultado)}`} color={resultado>=0?C.verde:C.rojo} icon={resultado>=0?"✅":"⚠️"} sub={resultado>=0?"Resultado positivo":"Resultado negativo"}/>
            <KPI label="Cuotas cobradas (real)" value={fmt(cuotas.filter(c=>c.pagado).reduce((a,c)=>a+c.importe,0))} color={C.azul} icon="💶" sub="Todos los ejercicios"/>
          </div>

          {/* TABLA ESTILO INFORME ANUAL */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            {/* INGRESOS */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{background:C.verde,padding:"12px 18px"}}>
                <div style={{color:C.blanco,fontWeight:700,fontSize:14,fontFamily:"'Playfair Display',serif"}}>INGRESOS</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{ej.nombre}</div>
              </div>
              <div style={{padding:"6px 0"}}>
                {ej.ingresos.map(x=>(
                  <div key={x.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 18px",borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{x.concepto}</div>
                      <div style={{fontSize:10,color:C.muted}}>{x.categoria}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,color:C.verde,fontSize:14}}>{fmt(x.importe)}</span>
                      {!ej.cerrado&&<button onClick={()=>eliminar("ingreso",x.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14,lineHeight:1}}>✕</button>}
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"12px 18px",background:C.verdeLight}}>
                  <span style={{fontWeight:800,fontSize:14,color:C.verde}}>TOTAL INGRESOS</span>
                  <span style={{fontWeight:800,fontSize:16,color:C.verde}}>{fmt(totalIngresos)}</span>
                </div>
              </div>
            </Card>

            {/* GASTOS */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{background:C.rojo,padding:"12px 18px"}}>
                <div style={{color:C.blanco,fontWeight:700,fontSize:14,fontFamily:"'Playfair Display',serif"}}>GASTOS</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{ej.nombre}</div>
              </div>
              <div style={{padding:"6px 0"}}>
                {ej.gastos.map(x=>(
                  <div key={x.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 18px",borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{x.concepto}</div>
                      <div style={{fontSize:10,color:C.muted}}>{x.categoria}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,color:C.rojo,fontSize:14}}>{fmt(x.importe)}</span>
                      {!ej.cerrado&&<button onClick={()=>eliminar("gasto",x.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14,lineHeight:1}}>✕</button>}
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"12px 18px",background:C.rojoLight}}>
                  <span style={{fontWeight:800,fontSize:14,color:C.rojo}}>TOTAL GASTOS</span>
                  <span style={{fontWeight:800,fontSize:16,color:C.rojo}}>{fmt(totalGastos)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* RESULTADO FINAL */}
          <div style={{background:resultado>=0?C.verde:C.rojo,borderRadius:14,padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{color:C.blanco}}>
              <div style={{fontSize:13,fontWeight:600,opacity:0.8,textTransform:"uppercase",letterSpacing:1}}>{resultado>=0?"Superávit":"Déficit"} · {ej.nombre}</div>
              <div style={{fontSize:12,opacity:0.6,marginTop:2}}>{ej.periodo}</div>
            </div>
            <div style={{fontSize:36,fontWeight:900,color:C.blanco,fontFamily:"'Playfair Display',serif"}}>
              {resultado>=0?"+":""}{fmt(resultado)}
            </div>
          </div>

          {/* GRÁFICOS POR CATEGORÍA */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <Card>
              <h4 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:14,marginBottom:14}}>Ingresos por categoría</h4>
              {Object.entries(ingCat).sort((a,b)=>b[1]-a[1]).map(([cat,imp])=>(
                <div key={cat} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                    <span style={{color:C.text}}>{cat}</span>
                    <span style={{fontWeight:700,color:C.verde}}>{fmt(imp)}</span>
                  </div>
                  <div style={{background:C.border,borderRadius:6,height:7}}>
                    <div style={{width:`${(imp/maxIng)*100}%`,background:C.verde,height:7,borderRadius:6}}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <h4 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:14,marginBottom:14}}>Gastos por categoría</h4>
              {Object.entries(gasCat).sort((a,b)=>b[1]-a[1]).map(([cat,imp])=>(
                <div key={cat} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                    <span style={{color:C.text}}>{cat}</span>
                    <span style={{fontWeight:700,color:C.rojo}}>{fmt(imp)}</span>
                  </div>
                  <div style={{background:C.border,borderRadius:6,height:7}}>
                    <div style={{width:`${(imp/maxGas)*100}%`,background:C.rojo,height:7,borderRadius:6}}/>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── VISTA MOVIMIENTOS ── */}
      {vista==="movimientos"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[{tipo:"ingreso",lista:ej.ingresos,color:C.verde,titulo:"Ingresos"},{tipo:"gasto",lista:ej.gastos,color:C.rojo,titulo:"Gastos"}].map(({tipo,lista,color,titulo})=>(
              <Card key={tipo} style={{padding:0,overflow:"hidden"}}>
                <div style={{background:color,padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:C.blanco,fontWeight:700,fontSize:14}}>{titulo}</span>
                  {!ej.cerrado&&<button onClick={()=>{setTipoModal(tipo);setForm(f=>({...f,categoria:tipo==="ingreso"?CAT_INGRESOS[0]:CAT_GASTOS[0]}));}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"4px 10px",color:C.blanco,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit"}}>+ Añadir</button>}
                </div>
                {lista.length===0
                  ?<div style={{padding:"20px",textAlign:"center",color:C.muted,fontSize:13}}>Sin registros</div>
                  :lista.map(x=>(
                    <div key={x.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{x.concepto}</div>
                        <div style={{fontSize:11,color:C.muted}}>{x.categoria} · {x.fecha}</div>
                        {x.notas&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{x.notas}</div>}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontWeight:700,color,fontSize:14}}>{fmt(x.importe)}</span>
                        {!ej.cerrado&&<button onClick={()=>eliminar(tipo,x.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14}}>✕</button>}
                      </div>
                    </div>
                  ))
                }
                <div style={{padding:"10px 16px",background:`${color}12`,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontWeight:700,fontSize:13,color}}>Total</span>
                  <span style={{fontWeight:800,fontSize:14,color}}>{fmt(lista.reduce((a,x)=>a+x.importe,0))}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA NUEVO EJERCICIO ── */}
      {vista==="nuevo_ejercicio"&&(
        <Card style={{maxWidth:520}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:17,marginBottom:18}}>📅 Crear nuevo ejercicio</h3>
          <div style={{background:C.oroLight,borderRadius:10,padding:"11px 14px",marginBottom:16,fontSize:13,color:"#7a5c00"}}>
            Al crear un nuevo ejercicio, el actual ({ej.nombre}) quedará marcado como cerrado. El remanente de {fmt(resultado)} pasará como primer ingreso del nuevo ejercicio.
          </div>
          <Input label="Nombre del ejercicio" value={nuevoEj.nombre} onChange={v=>setNuevoEj(n=>({...n,nombre:v}))} placeholder="Ej: Ejercicio 2026-2027" required/>
          <Input label="Período" value={nuevoEj.periodo} onChange={v=>setNuevoEj(n=>({...n,periodo:v}))} placeholder="Ej: 1 Septiembre 2026 – 30 Junio 2027" required/>
          <label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,marginBottom:20,cursor:"pointer",padding:"12px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:nuevoEj.remanente?C.verdeLight:C.blanco}}>
            <input type="checkbox" checked={nuevoEj.remanente} onChange={e=>setNuevoEj(n=>({...n,remanente:e.target.checked}))} style={{accentColor:C.verde,width:16,height:16}}/>
            <div>
              <div style={{fontWeight:600,color:C.text}}>Trasladar remanente ({fmt(resultado)})</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Se añadirá como ingreso "Remanente {ej.nombre}"</div>
            </div>
          </label>
          <div style={{display:"flex",gap:10}}>
            <Btn outline onClick={()=>setVista("resumen")} style={{flex:1}}>Cancelar</Btn>
            <Btn onClick={crearEjercicio} style={{flex:1}}>✅ Crear ejercicio</Btn>
          </div>
        </Card>
      )}

      {/* MODAL INGRESO / GASTO */}
      <Modal open={!!tipoModal} onClose={()=>setTipoModal(null)} title={tipoModal==="ingreso"?"➕ Nuevo ingreso":"➖ Nuevo gasto"}>
        <Input label="Concepto" value={form.concepto} onChange={v=>setF("concepto",v)} placeholder={tipoModal==="ingreso"?"Ej: Cuotas Socios":"Ej: Camisetas"} required/>
        <Select label="Categoría" value={form.categoria} onChange={v=>setF("categoria",v)}
          options={(tipoModal==="ingreso"?CAT_INGRESOS:CAT_GASTOS).map(c=>({value:c,label:c}))} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Input label="Importe (€)" value={form.importe} onChange={v=>setF("importe",v)} type="number" placeholder="0.00" required/>
          <Input label="Fecha" value={form.fecha} onChange={v=>setF("fecha",v)} type="date"/>
        </div>
        <Input label="Notas (opcional)" value={form.notas} onChange={v=>setF("notas",v)} placeholder="Cualquier detalle adicional..."/>
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={()=>setTipoModal(null)} style={{flex:1}}>Cancelar</Btn>
          <Btn color={tipoModal==="ingreso"?C.verde:C.rojo} onClick={guardarMovimiento} style={{flex:1}}>
            {tipoModal==="ingreso"?"✅ Guardar ingreso":"🔻 Guardar gasto"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 8 — DOCUMENTACIÓN
// ══════════════════════════════════════════════════════════
function Documentacion({socios}){
  const DOCS_DEMO=[
    {id:1,socioId:1,tipo:"rgpd",nombre:"RGPD_Paco_Martinez.pdf",fecha:"2025-09-01",tamaño:"142 KB"},
    {id:2,socioId:1,tipo:"alta",nombre:"Solicitud_alta_LRM-0001.pdf",fecha:"2025-09-01",tamaño:"89 KB"},
    {id:3,socioId:2,tipo:"rgpd",nombre:"RGPD_Maria_Ferrer.pdf",fecha:"2025-09-10",tamaño:"142 KB"},
    {id:4,socioId:4,tipo:"justificante",nombre:"Pago_cuota_Amparo_Soler.pdf",fecha:"2025-09-22",tamaño:"56 KB"},
  ];
  const [filtroSocio,setFiltroSocio]=useState("");
  const [filtroTipo,setFiltroTipo]=useState("todos");

  const tipoInfo={rgpd:{label:"RGPD",color:C.azul,bg:C.azulLight,icon:"📋"},alta:{label:"Solicitud alta",color:C.verde,bg:C.verdeLight,icon:"✍️"},justificante:{label:"Justificante pago",color:C.oro,bg:C.oroLight,icon:"💶"},foto:{label:"Autorización foto",color:C.granate,bg:C.granateLight,icon:"📸"}};

  const rgpdFaltante=socios.filter(s=>s.estado==="activo"&&!s.rgpd);

  return(
    <div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20,marginBottom:20}}>📁 Documentación</h2>

      {rgpdFaltante.length>0&&(
        <div style={{background:C.rojoLight,border:`1px solid ${C.rojo}40`,borderRadius:12,padding:"14px 18px",marginBottom:18}}>
          <div style={{fontWeight:700,color:C.rojo,marginBottom:6,fontSize:14}}>⚠️ Consentimiento RGPD pendiente</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {rgpdFaltante.map(s=><Pill key={s.id} text={`${s.nombre} ${s.apellidos}`} color={C.rojo} bg="#fdecea"/>)}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <select value={filtroSocio} onChange={e=>setFiltroSocio(e.target.value)}
          style={{padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",flex:1,minWidth:180}}>
          <option value="">Todos los socios</option>
          {socios.map(s=><option key={s.id} value={s.id}>{s.nombre} {s.apellidos}</option>)}
        </select>
        {["todos","rgpd","alta","justificante","foto"].map(t=>(
          <button key={t} onClick={()=>setFiltroTipo(t)} style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:filtroTipo===t?C.granate:"#f0f0f0",color:filtroTipo===t?C.blanco:C.gris,fontFamily:"inherit"}}>
            {t==="todos"?"Todos":tipoInfo[t]?.label||t}
          </button>
        ))}
        <Btn>+ Subir documento</Btn>
      </div>

      <Card style={{padding:0}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Tipo","Nombre archivo","Socio","Fecha","Tamaño",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {DOCS_DEMO.filter(d=>{
                const matchSocio=!filtroSocio||d.socioId===Number(filtroSocio);
                const matchTipo=filtroTipo==="todos"||d.tipo===filtroTipo;
                return matchSocio&&matchTipo;
              }).map(d=>{
                const ti=tipoInfo[d.tipo]||{label:d.tipo,color:C.gris,bg:"#eee",icon:"📄"};
                const s=socios.find(x=>x.id===d.socioId);
                return <tr key={d.id}>
                  <TD><Pill text={`${ti.icon} ${ti.label}`} color={ti.color} bg={ti.bg}/></TD>
                  <TD style={{fontWeight:600}}>{d.nombre}</TD>
                  <TD>{s?`${s.nombre} ${s.apellidos}`:"—"}</TD>
                  <TD>{d.fecha}</TD>
                  <TD style={{color:C.muted}}>{d.tamaño}</TD>
                  <TD><div style={{display:"flex",gap:6}}><Btn small outline>Ver</Btn><Btn small outline color={C.rojo}>Eliminar</Btn></div></TD>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
        {socios.filter(s=>s.estado==="activo").map(s=>(
          <Card key={s.id} style={{padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:8}}>{s.nombre} {s.apellidos}</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span>📋 RGPD</span><span style={{color:s.rgpd?C.verde:C.rojo,fontWeight:700}}>{s.rgpd?"✅":"❌"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span>📸 Foto aut.</span><span style={{color:s.fotoAut?C.verde:C.rojo,fontWeight:700}}>{s.fotoAut?"✅":"❌"}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MÓDULO 9 — CONFIGURACIÓN
// ══════════════════════════════════════════════════════════
function Configuracion({tarifas,setTarifas,actividades,setActividades,config,setConfig}){
  const [seccion,setSeccion]=useState("cuotas");
  const [tarifasEdit,setTarifasEdit]=useState(()=>JSON.parse(JSON.stringify(tarifas)));
  const [configEdit,setConfigEdit]=useState(()=>JSON.parse(JSON.stringify(config)));
  const [notif,setNotif]=useState(null);
  const [actEdit,setActEdit]=useState(null); // actividad seleccionada para editar precio

  const ok=(msg)=>{setNotif({msg,tipo:"ok"});setTimeout(()=>setNotif(null),3000);};
  const err=(msg)=>{setNotif({msg,tipo:"err"});setTimeout(()=>setNotif(null),3000);};

  const guardarTarifas=()=>{
    // Validar que importes aprobados sean números
    for(const [k,t] of Object.entries(tarifasEdit)){
      if(t.aprobado && t.importe===null){
        err(`La tarifa "${t.label}" está marcada como aprobada pero no tiene importe`); return;
      }
    }
    setTarifas(tarifasEdit);
    ok("✅ Tarifas de cuotas guardadas correctamente");
  };

  const guardarConfig=()=>{
    setConfig(configEdit);
    ok("✅ Configuración general guardada");
  };

  const setT=(key,field,val)=>setTarifasEdit(prev=>({...prev,[key]:{...prev[key],[field]:val}}));
  const setC=(key,val)=>setConfigEdit(prev=>({...prev,[key]:val}));

  const guardarPrecioActividad=(actId, nuevoPrecio, nuevoCoste)=>{
    setActividades(prev=>prev.map(a=>a.id===actId
      ?{...a, preciSocio:parseFloat(nuevoPrecio)||0, coste:parseFloat(nuevoCoste)||0}
      :a
    ));
    setActEdit(null);
    ok("✅ Precios de actividad actualizados");
  };

  const SECCIONES=[
    {id:"cuotas",label:"💶 Tarifas de cuotas",desc:"Precios por categoría de socio"},
    {id:"actividades",label:"📅 Precios de actividades",desc:"Gestiona el precio de cada evento"},
    {id:"general",label:"🏠 Datos de la peña",desc:"Nombre, temporada, contacto"},
    {id:"infantil",label:"👶 Categoría infantil",desc:"Define los tramos de edad"},
  ];

  return(
    <div>
      {notif&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:300,background:notif.tipo==="ok"?C.verde:C.rojo,color:C.blanco,padding:"13px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",maxWidth:360}}>
          {notif.msg}
        </div>
      )}

      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:20}}>⚙️ Configuración</h2>
        <p style={{color:C.muted,fontSize:13,marginTop:4}}>Ajusta precios, tarifas y datos de la peña sin tocar el código</p>
      </div>

      {/* NAV SECCIONES */}
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {SECCIONES.map(s=>(
          <button key={s.id} onClick={()=>setSeccion(s.id)} style={{
            padding:"10px 16px",borderRadius:10,border:`2px solid ${seccion===s.id?C.granate:C.border}`,
            background:seccion===s.id?C.granateLight:C.blanco,cursor:"pointer",
            fontWeight:seccion===s.id?700:500,fontSize:13,color:seccion===s.id?C.granateDark:C.gris,
            fontFamily:"inherit",textAlign:"left",
          }}>
            <div>{s.label}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* ── SECCIÓN: TARIFAS CUOTAS ── */}
      {seccion==="cuotas"&&(
        <div>
          <div style={{background:C.oroLight,border:`1px solid ${C.oro}50`,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#7a5c00",display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>ℹ️</span>
            <div>Las tarifas marcadas como <strong>Pendiente asamblea</strong> no se aplican automáticamente. Una vez aprobadas en asamblea, márcalas como <strong>Aprobadas</strong> e introduce el importe.</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
            {Object.entries(tarifasEdit).map(([key,t])=>(
              <Card key={key} style={{borderLeft:`5px solid ${t.aprobado?C.verde:C.oro}`,padding:"20px 24px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:3}}>{t.label}</div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{t.descripcion}</div>
                    <div>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>Descripción interna</label>
                      <input value={t.descripcion} onChange={e=>setT(key,"descripcion",e.target.value)}
                        style={{width:"100%",padding:"7px 10px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:14,alignItems:"flex-end",flexWrap:"wrap"}}>
                    <div>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>Importe (€)</label>
                      <div style={{position:"relative"}}>
                        <input type="number" min="0" step="0.5"
                          value={t.importe??""} onChange={e=>setT(key,"importe",e.target.value===""?null:Number(e.target.value))}
                          placeholder="Sin fijar"
                          style={{width:110,padding:"10px 32px 10px 12px",borderRadius:9,border:`2px solid ${t.aprobado&&t.importe===null?C.rojo:C.border}`,fontSize:20,fontWeight:800,fontFamily:"inherit",outline:"none",textAlign:"center",color:C.granate}}/>
                        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.muted,fontWeight:700}}>€</span>
                      </div>
                      {t.importe===0&&<div style={{fontSize:11,color:C.verde,marginTop:3,fontWeight:600}}>✓ Cuota gratuita</div>}
                    </div>
                    <div>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>Estado asamblea</label>
                      <div style={{display:"flex",gap:6}}>
                        {[{v:true,l:"✅ Aprobada",c:C.verde,bg:C.verdeLight},{v:false,l:"⏳ Pendiente",c:C.oro,bg:C.oroLight}].map(opt=>(
                          <button key={String(opt.v)} onClick={()=>setT(key,"aprobado",opt.v)}
                            style={{padding:"8px 13px",borderRadius:8,border:`2px solid ${t.aprobado===opt.v?opt.c:C.border}`,
                              background:t.aprobado===opt.v?opt.bg:"transparent",
                              color:t.aprobado===opt.v?opt.c:C.gris,
                              cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit"}}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn outline onClick={()=>setTarifasEdit(JSON.parse(JSON.stringify(tarifas)))} style={{flex:1}}>↩ Descartar cambios</Btn>
            <Btn onClick={guardarTarifas} style={{flex:2}}>💾 Guardar tarifas de cuotas</Btn>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: PRECIOS ACTIVIDADES ── */}
      {seccion==="actividades"&&(
        <div>
          <div style={{background:C.azulLight,border:`1px solid ${C.azul}30`,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.azul,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>ℹ️</span>
            <div>Aquí puedes ajustar el <strong>coste real</strong> de la actividad para la peña y el <strong>precio que paga cada socio</strong>. La diferencia es lo que asume la peña como subvención al socio.</div>
          </div>

          <Card style={{padding:0,marginBottom:16}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Actividad","Fecha","Coste total peña","Precio socio","Subvención peña",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                <tbody>
                  {actividades.map((a,i)=>{
                    const sub=Math.max(0,(a.coste/Math.max(a.inscritos.length,1))-a.preciSocio);
                    return(
                      <tr key={a.id} style={{background:i%2===0?C.blanco:C.grisLight,borderBottom:`1px solid ${C.border}`}}>
                        <TD style={{fontWeight:600}}>{a.nombre}</TD>
                        <TD style={{color:C.muted}}>{a.fecha}</TD>
                        <TD>
                          <span style={{fontWeight:700,color:C.rojo,fontSize:15}}>{fmt(a.coste)}</span>
                        </TD>
                        <TD>
                          <span style={{fontWeight:700,color:C.azul,fontSize:15}}>{a.preciSocio===0?"Gratis":fmt(a.preciSocio)}</span>
                        </TD>
                        <TD>
                          {sub>0
                            ?<Pill text={`−${fmt(sub)}/pers.`} color={C.granate} bg={C.granateLight}/>
                            :<Pill text="Sin subv." color={C.gris} bg={C.grisLight}/>}
                        </TD>
                        <TD>
                          <Btn small onClick={()=>setActEdit({...a,nuevoCoste:a.coste,nuevoPrecio:a.preciSocio})}>✏️ Editar precios</Btn>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* MODAL editar precio actividad */}
          <Modal open={!!actEdit} onClose={()=>setActEdit(null)} title={actEdit?`✏️ Precios: ${actEdit.nombre}`:""}>
            {actEdit&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                  <div>
                    <label style={{fontSize:13,fontWeight:700,color:C.gris,display:"block",marginBottom:6}}>Coste total para la peña (€)</label>
                    <input type="number" min="0" step="1" value={actEdit.nuevoCoste}
                      onChange={e=>setActEdit(a=>({...a,nuevoCoste:e.target.value}))}
                      style={{width:"100%",padding:"12px",borderRadius:9,border:`2px solid ${C.border}`,fontSize:22,fontWeight:800,textAlign:"center",fontFamily:"inherit",outline:"none",color:C.rojo,boxSizing:"border-box"}}/>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>Lo que paga la peña en total por este evento</div>
                  </div>
                  <div>
                    <label style={{fontSize:13,fontWeight:700,color:C.gris,display:"block",marginBottom:6}}>Precio por socio (€)</label>
                    <input type="number" min="0" step="0.5" value={actEdit.nuevoPrecio}
                      onChange={e=>setActEdit(a=>({...a,nuevoPrecio:e.target.value}))}
                      style={{width:"100%",padding:"12px",borderRadius:9,border:`2px solid ${C.border}`,fontSize:22,fontWeight:800,textAlign:"center",fontFamily:"inherit",outline:"none",color:C.azul,boxSizing:"border-box"}}/>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>Lo que cobra la peña a cada participante</div>
                  </div>
                </div>

                {/* Resumen */}
                <div style={{background:C.grisLight,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}>Resumen económico</div>
                  {[
                    ["Inscritos actuales", `${actEdit.inscritos.length} personas`],
                    ["Ingreso estimado", fmt(actEdit.inscritos.length*(parseFloat(actEdit.nuevoPrecio)||0))],
                    ["Coste total", fmt(parseFloat(actEdit.nuevoCoste)||0)],
                    ["Resultado peña", fmt((actEdit.inscritos.length*(parseFloat(actEdit.nuevoPrecio)||0))-(parseFloat(actEdit.nuevoCoste)||0))],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                      <span style={{color:C.muted}}>{k}</span>
                      <span style={{fontWeight:700,color:C.text}}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",gap:10}}>
                  <Btn outline onClick={()=>setActEdit(null)} style={{flex:1}}>Cancelar</Btn>
                  <Btn onClick={()=>guardarPrecioActividad(actEdit.id,actEdit.nuevoPrecio,actEdit.nuevoCoste)} style={{flex:1}}>💾 Guardar precios</Btn>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {/* ── SECCIÓN: DATOS GENERALES ── */}
      {seccion==="general"&&(
        <div>
          <Card style={{marginBottom:16}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:16,marginBottom:18}}>🐸 Datos de la peña</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              {[
                {key:"nombrePena",label:"Nombre de la peña"},
                {key:"clubAfiliado",label:"Club afiliado"},
                {key:"municipio",label:"Municipio principal"},
                {key:"email",label:"Email de contacto",type:"email"},
                {key:"telefono",label:"Teléfono de contacto",type:"tel"},
                {key:"web",label:"Web / Instagram"},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:700,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>{f.label}</label>
                  <input type={f.type||"text"} value={configEdit[f.key]||""} onChange={e=>setC(f.key,e.target.value)}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{marginBottom:16}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:16,marginBottom:18}}>📅 Temporadas</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              {[
                {key:"temporadaActual",label:"Temporada actual"},
                {key:"temporadaAnterior",label:"Temporada anterior"},
                {key:"fechaInicioTemporada",label:"Inicio de temporada",type:"date"},
                {key:"fechaFinTemporada",label:"Fin de temporada",type:"date"},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:700,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>{f.label}</label>
                  <input type={f.type||"text"} value={configEdit[f.key]||""} onChange={e=>setC(f.key,e.target.value)}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{marginBottom:20}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:16,marginBottom:18}}>🏦 Datos bancarios (para domiciliaciones)</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              {[
                {key:"titular",label:"Titular de la cuenta"},
                {key:"iban",label:"IBAN"},
                {key:"banco",label:"Entidad bancaria"},
                {key:"bic",label:"BIC / SWIFT"},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:700,color:C.gris,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>{f.label}</label>
                  <input value={configEdit[f.key]||""} onChange={e=>setC(f.key,e.target.value)}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </Card>

          <div style={{display:"flex",gap:10}}>
            <Btn outline onClick={()=>setConfigEdit(JSON.parse(JSON.stringify(config)))} style={{flex:1}}>↩ Descartar</Btn>
            <Btn onClick={guardarConfig} style={{flex:2}}>💾 Guardar configuración</Btn>
          </div>
        </div>
      )}

      {/* ── SECCIÓN: CATEGORÍA INFANTIL ── */}
      {seccion==="infantil"&&(
        <div>
          <div style={{background:C.verdeLight,border:`1px solid ${C.verde}40`,borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.verde,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>ℹ️</span>
            <div>Define los tramos de edad para la categoría infantil. El sistema los usará para asignar automáticamente la tarifa correcta al registrar una cuota.</div>
          </div>

          <Card style={{marginBottom:16}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:C.granateDark,fontSize:16,marginBottom:20}}>👶 Tramos de edad infantil</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[
                {key:"edadInfantilGratis",label:"Hasta qué edad la cuota es GRATIS",color:C.verde,desc:"Actualmente: 0 a 3 años inclusive",icon:"🎁"},
                {key:"edadInfantilMax",label:"Hasta qué edad se considera INFANTIL",color:C.azul,desc:"Por encima de esta edad, pasan a cuota adulto",icon:"🧒"},
              ].map(f=>(
                <div key={f.key} style={{display:"flex",alignItems:"center",gap:20,padding:"18px 20px",borderRadius:12,border:`2px solid ${f.color}30`,background:`${f.color}08`}}>
                  <span style={{fontSize:28}}>{f.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:3}}>{f.label}</div>
                    <div style={{fontSize:12,color:C.muted}}>{f.desc}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="number" min="0" max="17" value={configEdit[f.key]||""}
                      onChange={e=>setC(f.key,Number(e.target.value))}
                      style={{width:72,padding:"10px",borderRadius:9,border:`2px solid ${f.color}`,fontSize:24,fontWeight:800,textAlign:"center",fontFamily:"inherit",outline:"none",color:f.color,boxSizing:"border-box"}}/>
                    <span style={{fontSize:14,color:C.muted,fontWeight:600}}>años</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista previa de tramos */}
            <div style={{marginTop:20,padding:"14px 16px",background:C.grisLight,borderRadius:10}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}>Vista previa de tramos</div>
              {[
                {rango:`0 – ${configEdit.edadInfantilGratis||3} años`,tarifa:"Gratis",color:C.verde},
                {rango:`${(configEdit.edadInfantilGratis||3)+1} – ${configEdit.edadInfantilMax||17} años`,tarifa:"Infantil +3 (tarifa pendiente asamblea)",color:C.oro},
                {rango:`+${(configEdit.edadInfantilMax||17)+1} años`,tarifa:"Cuota adulto estándar",color:C.azul},
              ].map(t=>(
                <div key={t.rango} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                  <span style={{fontWeight:600,color:C.text}}>{t.rango}</span>
                  <Pill text={t.tarifa} color={t.color}/>
                </div>
              ))}
            </div>
          </Card>

          <div style={{display:"flex",gap:10}}>
            <Btn outline onClick={()=>setConfigEdit(JSON.parse(JSON.stringify(config)))} style={{flex:1}}>↩ Descartar</Btn>
            <Btn onClick={guardarConfig} style={{flex:2}}>💾 Guardar tramos de edad</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [socios,setSocios]=useState(SOCIOS_INIT);
  const [cuotas,setCuotas]=useState(CUOTAS_INIT);
  const [actividades,setActividades]=useState(ACTIVIDADES_INIT);
  const [loteria,setLoteria]=useState(LOTERIA_INIT);
  const [tarifas,setTarifas]=useState(TARIFAS_INIT);
  const [ejercicios,setEjercicios]=useState(EJERCICIOS_INIT);
  const [socioFiltro,setSocioFiltro]=useState(null); // ID de socio para navegar con contexto
  const [config,setConfig]=useState({
    nombrePena:"La Rana Mecánica",
    clubAfiliado:"Levante UD",
    municipio:"Godella",
    email:"laranamecanica@gmail.com",
    telefono:"",
    web:"@laranamecanica",
    temporadaActual:TEMPORADA_ACTUAL,
    temporadaAnterior:TEMPORADA_ANTERIOR,
    fechaInicioTemporada:"2026-07-01",
    fechaFinTemporada:"2027-06-30",
    titular:"Peña La Rana Mecánica",
    iban:"ES00 0000 0000 0000 0000 0000",
    banco:"",
    bic:"",
    edadInfantilGratis:3,
    edadInfantilMax:17,
  });

  // ── BADGES DE ALERTA PARA EL SIDEBAR ──────────────────
  const badges = {
    cuotas: cuotas.filter(c=>!c.pagado&&c.temporada===TEMPORADA_ACTUAL).length,
    documentacion: socios.filter(s=>s.estado==="activo"&&!s.rgpd).length,
    loteria: loteria.filter(l=>!l.pagado).length,
  };

  const irA=(tabId)=>{ setSocioFiltro(null); setTab(tabId); };

  const renderTab=()=>{
    switch(tab){
      case "dashboard":    return <Dashboard socios={socios} cuotas={cuotas} actividades={actividades} loteria={loteria} ejercicios={ejercicios} setTab={setTab} setSocioFiltro={setSocioFiltro}/>;
      case "peñistas":     return <Peñistas socios={socios} setSocios={setSocios} cuotas={cuotas} setCuotas={setCuotas} tarifas={tarifas} actividades={actividades} loteria={loteria} socioFiltro={socioFiltro} setSocioFiltro={setSocioFiltro}/>;
      case "cuotas":       return <Cuotas socios={socios} cuotas={cuotas} setCuotas={setCuotas} tarifas={tarifas} setTarifas={setTarifas} socioFiltro={socioFiltro} setSocioFiltro={setSocioFiltro}/>;
      case "actividades":  return <Actividades socios={socios} actividades={actividades} setActividades={setActividades}/>;
      case "participacion":return <Participacion socios={socios} actividades={actividades} setTab={setTab} setSocioFiltro={setSocioFiltro}/>;
      case "comunicacion": return <Comunicacion socios={socios} cuotas={cuotas}/>;
      case "loteria":      return <Loteria socios={socios} loteria={loteria} setLoteria={setLoteria} setTab={setTab} setSocioFiltro={setSocioFiltro}/>;
      case "tesoreria":    return <Tesoreria ejercicios={ejercicios} setEjercicios={setEjercicios} cuotas={cuotas} loteria={loteria}/>;
      case "documentacion":return <Documentacion socios={socios}/>;
      case "configuracion":return <Configuracion tarifas={tarifas} setTarifas={setTarifas} actividades={actividades} setActividades={setActividades} config={config} setConfig={setConfig}/>;
      default: return null;
    }
  };

  return(
    <div style={{fontFamily:"'Crimson Pro',Georgia,serif",background:C.crema,minHeight:"100vh",display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Crimson+Pro:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        button,input,select,textarea{font-family:inherit;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#f0f0f0;}
        ::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px;}
      `}</style>

      {/* SIDEBAR */}
      <div style={{width:228,background:C.granateDark,minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"22px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:26,marginBottom:6}}>🐸</div>
          <div style={{color:C.blanco,fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,lineHeight:1.3}}>La Rana Mecánica</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:3}}>{TEMPORADA_ACTUAL} · Godella</div>
        </div>
        <nav style={{padding:"12px 10px",flex:1}}>
          {TABS.map(t=>{
            const badge=badges[t.id];
            return(
              <button key={t.id} onClick={()=>irA(t.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 12px",marginBottom:2,background:tab===t.id?"rgba(255,255,255,0.15)":"transparent",border:tab===t.id?"1px solid rgba(255,255,255,0.2)":"1px solid transparent",borderRadius:8,cursor:"pointer",color:tab===t.id?C.blanco:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,textAlign:"left",transition:"all 0.15s",fontFamily:"inherit"}}>
                <span style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:15}}>{t.icon}</span>{t.label}
                </span>
                {badge>0&&<span style={{background:C.oro,color:C.blanco,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800,minWidth:18,textAlign:"center"}}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{background:"rgba(201,150,58,0.18)",borderRadius:8,padding:"9px 11px"}}>
            <div style={{color:C.oro,fontSize:10,fontWeight:700,marginBottom:2}}>⚡ Listo para Supabase</div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:9,lineHeight:1.4}}>PostgreSQL · Auth · Storage · Realtime</div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{flex:1,padding:"28px 30px",overflowY:"auto",minWidth:0}}>
        <div style={{maxWidth:1080}}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
