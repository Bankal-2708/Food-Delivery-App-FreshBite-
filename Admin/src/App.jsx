import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import AdminNavbar from "./Components/AdminNavbar";
import AdminBody from "./Components/AdminBody";

const API_BASE = import.meta.env.VITE_API_URL || "https://food-backend-rouge.vercel.app/api";
const CATEGORIES = ["Pizza", "Dosa", "Momos", "Paneer Roll", "Biryani", "Burger", "Paratha", "Pasta", "Rabri", "Chicken"];
const initialForm = { name: "", description: "", price: "", category: CATEGORIES[0], imageUrl: "" };

export default function App() {
  const [tab, setTab] = useState("dishes");
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        // This is a staff-only panel: block anyone whose account isn't admin/restaurantManager,
        // even though their email+password were correct. Otherwise a plain customer account
        // would "log in" here and then silently hit 403s on every orders/food action.
        const allowedRoles = ["admin", "restaurantManager"];
        if (!allowedRoles.includes(data.user?.role)) {
          showToast("This account doesn't have admin/manager access.", "error");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        setToken(data.token);
        setRole(data.user.role);
        setLoginForm({ email: "", password: "" });
        showToast("Logged in successfully!");
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch (err) {
      showToast("Login error: " + err.message, "error");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("");
    setTab("dishes");
    showToast("Logged out!");
  };

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    "token": token,
  }), [token]);

  const fetchFoods = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/food`);
      const data = await res.json();
      if (data.success) setFoods(data.data);
      else setFoods([]);
    } catch {
      showToast("Failed to load dishes", "error");
    }
  }, [showToast]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/all`, { headers });
      const data = await res.json();
      if (data.success) setOrders(data.data);
      else setOrders([]);
    } catch {
      showToast("Failed to load orders", "error");
    }
  }, [headers, showToast]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    if (tab === "orders" && token) {
      fetchOrders();
    }
  }, [tab, fetchOrders, token]);

  const handleSubmit = async () => {
    if (!form.name || !form.price) return showToast("Name and price are required", "error");
    setLoading(true);
    try {
      const url = editId ? `${API_BASE}/food/update/${editId}` : `${API_BASE}/food/add`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editId ? "Dish updated!" : "Dish added!");
        setForm(initialForm);
        setEditId(null);
        setImagePreview(null);
        fetchFoods();
        setTab("dishes");
      } else showToast(data.message || "Error", "error");
    } catch {
      showToast("Request failed", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this dish?")) return;
    try {
      const res = await fetch(`${API_BASE}/food/remove/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (data.success) { showToast("Dish removed"); fetchFoods(); }
      else showToast(data.message || "Error", "error");
    } catch { showToast("Request failed", "error"); }
  };

  const handleEdit = (food) => {
    setEditId(food._id);
    setForm({ 
      name: food.name, 
      description: food.description || "", 
      price: food.price, 
      category: food.category, 
      imageUrl: food.imageUrl || "" 
    });
    if (food.imageUrl) setImagePreview(`https://food-backend-rouge.vercel.app${food.imageUrl}`);
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/food/upload`, {
        method: "POST",
        headers: { "token": token },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
        showToast("Image uploaded successfully!");
      } else {
        showToast(data.message || "Upload failed", "error");
        setImagePreview(null);
      }
    } catch (error) {
      showToast("Upload failed: " + error.message, "error");
      setImagePreview(null);
    }
    setUploading(false);
  };

  const handleOrderAction = async (id, action) => {
    const methods = { confirm: "PUT", deliver: "PUT", cancel: "DELETE" };
    try {
      const res = await fetch(`${API_BASE}/orders/${action}/${id}`, { method: methods[action], headers });
      const data = await res.json();
      if (data.success) { showToast(`Order ${action}ed!`); fetchOrders(); }
      else showToast(data.message || "Error", "error");
    } catch { showToast("Request failed", "error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#e5e5e5", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {!token ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "2rem", width: "90%", maxWidth: 400 }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🔐</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Admin Login</h2>
            </div>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                style={{ padding: "12px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                style={{ padding: "12px 14px", background: "#252525", border: "1px solid #333", borderRadius: 8, color: "#e5e5e5", fontSize: 14, outline: "none" }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ padding: "12px", background: loading ? "#555" : "#ff6b35", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer", fontSize: 15 }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <AdminNavbar 
            tab={tab} 
            setTab={setTab} 
            setEditId={setEditId} 
            setForm={setForm} 
            setImagePreview={setImagePreview} 
            initialForm={initialForm} 
            handleLogout={handleLogout} 
            role={role}
          />
          
          {toast && (
            <div style={{
              position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 20px", borderRadius: 10,
              background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", fontWeight: 600, fontSize: 14,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
            }}>
              {toast.msg}
            </div>
          )}

          <AdminBody 
            tab={tab}
            setTab={setTab}
            foods={foods}
            orders={orders}
            form={form}
            setForm={setForm}
            editId={editId}
            setEditId={setEditId}
            loading={loading}
            uploading={uploading}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            initialForm={initialForm}
            CATEGORIES={CATEGORIES}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            handleImageUpload={handleImageUpload}
            handleOrderAction={handleOrderAction}
            fetchOrders={fetchOrders}
            role={role}
          />
        </div>
      )}
    </div>
  );
}