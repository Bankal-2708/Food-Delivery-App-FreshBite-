    import React from "react";

export default function AdminNavbar({ tab, setTab, setEditId, setForm, setImagePreview, initialForm, handleLogout }) {
  return (
    <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#ff6b35,#f7c59f)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold" }}>🍽</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Food Admin</div>
          <div style={{ fontSize: 12, color: "#666" }}>Management Panel</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["dishes", "add", "orders"].map((t) => (
          <button key={t}
            onClick={() => { 
              setTab(t); 
              if (t !== "add") { 
                setEditId(null); 
                setForm(initialForm); 
                setImagePreview(null); 
              } 
            }}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid", fontFamily: "inherit", fontSize: 14, cursor: "pointer",
              fontWeight: tab === t ? 600 : 400, background: tab === t ? "#ff6b35" : "transparent",
              borderColor: tab === t ? "#ff6b35" : "#333", color: tab === t ? "#fff" : "#aaa", transition: "all 0.2s"
            }}>
            {t === "dishes" ? "🍽 Dishes" : t === "add" ? "➕ Add" : "📦 Orders"}
          </button>
        ))}
        <button onClick={handleLogout}
          style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}