import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Products() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = () => {
        API.get("/products")
            .then(res => setProducts(res.data.products || []))
            .catch(err => {
                console.error(err);
                setProducts([]);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteProduct = async (id) => {
        await API.delete(`/products/${id}`);
        fetchProducts();
    };

    return (
        <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            {/* Header Section */}
            <div style={{ 
                backgroundColor: "white", 
                padding: "24px 40px", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
            }}>
                <div>
                    <h2 style={{ margin: 0, color: "#111827", fontSize: "28px", fontWeight: "700" }}>Inventory Management</h2>
                    <p style={{ margin: "6px 0 0 0", color: "#6b7280", fontSize: "15px" }}>Track and manage your store's product catalogue</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/add-product")}
                    style={{ 
                        padding: "12px 24px", 
                        backgroundColor: "#4f46e5", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "8px", 
                        fontSize: "15px", 
                        fontWeight: "600", 
                        cursor: "pointer",
                        boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
                        transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#4338ca"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#4f46e5"}
                >
                    + Add New Product
                </button>
            </div>

            {/* Grid Section */}
            <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
                {products.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280", backgroundColor: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
                        <h3 style={{ fontSize: "22px", color: "#374151", margin: "0 0 10px" }}>No products found</h3>
                        <p style={{ margin: "0 0 24px", fontSize: "16px" }}>Get started by adding your first product to the inventory.</p>
                        <button 
                            onClick={() => navigate("/admin/add-product")}
                            style={{ padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                        >
                            Add Product
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
                        {products.map(p => (
                            <div key={p._id} style={{
                                border: "1px solid #f3f4f6",
                                borderRadius: "16px",
                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#fff",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 20px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)"; }}>
                                
                                {p.image ? (
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                        />
                                        {p.category && (
                                            <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(255,255,255,0.95)", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#374151", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                                {p.category}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ width: "100%", height: "200px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", position: "relative" }}>
                                        <span style={{ fontWeight: "500" }}>No Image</span>
                                        {p.category && (
                                            <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(255,255,255,0.95)", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#374151", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                                {p.category}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                    <h4 style={{ margin: "0 0 10px 0", fontSize: "19px", color: "#111827", fontWeight: "700" }}>{p.name}</h4>
                                    
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <span style={{ fontSize: "22px", color: "#059669", fontWeight: "800" }}>₹{p.price}</span>
                                        {p.stock !== undefined && (
                                            <span style={{ fontSize: "14px", color: p.stock > 10 ? "#6b7280" : "#ef4444", fontWeight: "600", backgroundColor: p.stock > 10 ? "#f3f4f6" : "#fee2e2", padding: "4px 8px", borderRadius: "6px" }}>
                                                {p.stock} in stock
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                                        <button
                                            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                                            style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s ease" }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#f9fafb"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "white"}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(p._id)}
                                            style={{ flex: 1, padding: "10px", border: "none", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s ease" }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#fecaca"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}