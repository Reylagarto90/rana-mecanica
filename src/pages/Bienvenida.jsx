import { useNavigate } from "react-router-dom";

const LOGO = "/rana-mecanica/logo.jpg";

const C = {
  granate: "#8B0A3A", granateDark: "#5a0020",
  oro: "#C9963A", text: "#1e293b", muted: "#64748b", blanco: "#fff", border: "#f0e4d8",
};

const TARJETAS = [
  { icon: "🔐", titulo: "Entrar a Mi Zona", desc: "Cuotas, actividades, noticias, documentos...", ruta: "/mi-zona" },
  { icon: "🆕", titulo: "Quiero hacerme peñista", desc: "Rellena el formulario de alta", ruta: "/alta" },
  { icon: "✏️", titulo: "Ya soy socio, verificar mis datos", desc: "Revisa o corrige tu información", ruta: "/verificar" },
];

export default function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.granate} 0%, ${C.granateDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        <img src={LOGO} alt="Peña Levantinista La Rana Mecánica" style={{
          width: 110, height: 110, borderRadius: "50%", objectFit: "cover",
          display: "block", margin: "0 auto 20px", border: "3px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }} />

        <h1 style={{ color: C.blanco, textAlign: "center", fontSize: 24, margin: "0 0 6px", fontFamily: "Georgia, serif" }}>
          Peña Levantinista La Rana Mecánica
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", fontSize: 14, margin: "0 0 32px" }}>
          Godella-Rocafort · Temporada 2026/2027
        </p>

        {TARJETAS.map((t) => (
          <div key={t.ruta} onClick={() => navigate(t.ruta)} style={{
            background: C.blanco, borderRadius: 16, padding: "20px 22px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 3px", fontSize: 16, color: C.text }}>{t.titulo}</h3>
              <p style={{ margin: 0, fontSize: 13, color: C.muted }}>{t.desc}</p>
            </div>
            <span style={{ color: C.granate, fontSize: 20 }}>→</span>
          </div>
        ))}

        <div onClick={() => navigate("/junta/login")} style={{
          background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
          borderRadius: 12, padding: "12px 18px", marginTop: 6, marginBottom: 28,
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        }}>
          <span style={{ fontSize: 18 }}>🏛️</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>Soy de la Junta Directiva</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginLeft: "auto" }}>→</span>
        </div>

        <div style={{
          textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 14,
          padding: "18px 20px", color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.7,
        }}>
          ¿Tienes dudas? Escríbenos a<br/>
          <a href="mailto:penyaranamecanica@gmail.com" style={{ color: C.oro, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
            penyaranamecanica@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}
