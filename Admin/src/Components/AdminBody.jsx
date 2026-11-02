import React from "react";

export default function AdminBody({
  tab,
  setTab,
  foods,
  orders,
  form,
  setForm,
  editId,
  setEditId,
  loading,
  uploading,
  imagePreview,
  setImagePreview,
  initialForm,
  CATEGORIES,
  handleEdit,
  handleDelete,
  handleSubmit,
  handleImageUpload,
  handleOrderAction,
  fetchOrders,
  role,
}) {
  const statusColor = { pending: "#f59e0b", confirmed: "#10b981", delivered: "#6366f1", cancelled: "#ef4444" };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {tab === "dishes" && (
        <div>
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              All Dishes <span style={{ color: "#666", fontWeight: 400, fontSize: 16 }}>({foods.length})</span>
            </h2>
            <button onClick={() => setTab("add")}
              style={{ background: "#ff6b35", border: "none", color: "#fff", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              + Add New Dish
            </button>
          </div>
          {foods.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>No dishes yet. Add your first one!</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {foods.map((food) => (
                <div key={food._id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden", transition: "all 0.3s" }}>
                  <div style={{ width: "100%", height: 160, background: "#252525", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {food.imageUrl ? (
                      <img src={`https://food-backend-git-main-bankal2708s-projects.vercel.app${food.imageUrl}`} alt={food.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ fontSize: 48 }}>🍽</div>
                    )}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{food.name}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{food.category}</div>
                    {food.description && (
                      <div style={{ fontSize: 12, color: "#555", marginTop: 6, height: 32, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {food.description}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#ff6b35", marginTop: 8 }}>₹{food.price}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => handleEdit(food)} style={{ flex: 1, padding: "8px", background: "#252525", border: "1px solid #333", color: "#ccc", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(food._id)} style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div>
          <h2 style={{ margin: "0 0 1.5rem", fontSize: 24, fontWeight: 700 }}>{editId ? "Edit Dish" : "Add New Dish"}</h2>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "2rem", maxWidth: 600 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#888", marginBottom: 10, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Dish Image</label>
              <div style={{ position: "relative", width: "100%", height: 200, background: "#252525", borderRadius: 10, border: "2px dashed #333", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontSize: 12, color: "#666" }}>Click to upload image</div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading}
                  style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
              </div>
              {uploading && <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>Uploading...</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Dish Name *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Margherita Pizza"
                  style={{ width: "100%", padding: "10px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Price (₹) *</label>
                <input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 299"
                  style={{ width: "100%", padding: "10px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block", fontWeight: 600, textTransform: "uppercase" }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4} placeholder="Describe the dish..."
                style={{ width: "100%", padding: "10px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} disabled={loading || uploading}
                style={{ flex: 1, padding: "12px", background: loading || uploading ? "#555" : "#ff6b35", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading || uploading ? "default" : "pointer" }}>
                {loading ? "Saving..." : editId ? "Update Dish" : "Add Dish"}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm(initialForm); setImagePreview(null); setTab("dishes"); }}
                  style={{ padding: "12px 22px", background: "#252525", border: "1px solid #333", borderRadius: 9, color: "#aaa", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div>
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              Orders <span style={{ color: "#666", fontWeight: 400, fontSize: 16 }}>({orders.length})</span>
            </h2>
            <button onClick={fetchOrders}
              style={{ background: "transparent", border: "1px solid #333", color: "#aaa", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
              ↻ Refresh
            </button>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>No orders yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((order) => (
                <div key={order._id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifycontent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{order.customerName}</div>
                      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{order.address}</div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{new Date(order.placedAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#ff6b35" }}>₹{order.totalAmount}</div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                        background: statusColor[order.status] + "33", color: statusColor[order.status],
                        marginTop: 8, display: "inline-block", textTransform: "uppercase", letterSpacing: "0.05em"
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: "#151515", borderRadius: 8, padding: "12px", marginBottom: 12, fontSize: 13, color: "#888" }}>
                    {(order.items || []).map((item, i) => (
                      <span key={i}>{item.name} ×{item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {order.status === "pending" && (
                      <button onClick={() => handleOrderAction(order._id, "confirm")}
                        style={{ padding: "8px 16px", background: "#10b981", border: "none", color: "#fff", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        ✓ Confirm
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button onClick={() => handleOrderAction(order._id, "deliver")}
                        style={{ padding: "8px 16px", background: "#6366f1", border: "none", color: "#fff", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        🚚 Mark Delivered
                      </button>
                    )}
                    {role === "admin" && order.status !== "delivered" && order.status !== "cancelled" && (
                      <button onClick={() => handleOrderAction(order._id, "cancel")}
                        style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}