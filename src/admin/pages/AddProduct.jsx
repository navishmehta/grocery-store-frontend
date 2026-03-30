import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
    const [form, setForm] = useState({});
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (image) {
                formData.append("image", image);
            }

            await API.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            navigate("/admin/products");
        } catch (error) {
            alert(error.response?.data?.message || "An error occurred while saving the product");
            console.error(error);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 15px",
        margin: "8px 0 20px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        fontSize: "16px",
        fontFamily: "'Inter', sans-serif",
        transition: "border-color 0.3s, box-shadow 0.3s",
        outline: "none"
    };

    const labelStyle = {
        fontWeight: "600",
        color: "#444",
        fontSize: "14px",
        display: "block",
        marginBottom: "5px"
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", backgroundColor: "#f9fafb", padding: "20px" }}>
            <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", width: "100%", maxWidth: "550px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#111827", fontSize: "28px" }}>Add New Product</h2>
                    <button
                        onClick={() => navigate("/admin/products")}
                        style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
                    >
                        ✕ Cancel
                    </button>
                </div>

                <label style={labelStyle}>Product Name</label>
                <input
                    style={inputStyle}
                    placeholder="Enter Product Name"
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Price (₹)</label>
                        <input
                            style={inputStyle}
                            placeholder="0.00"
                            type="number"
                            onChange={e => setForm({ ...form, price: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Stock</label>
                        <input
                            style={inputStyle}
                            placeholder="100"
                            type="number"
                            onChange={e => setForm({ ...form, stock: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Quantity Info</label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. 1kg or 500g"
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Category</label>
                        <select
                            style={{ ...inputStyle, cursor: "pointer", backgroundColor: "#fff" }}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            defaultValue=""
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                            <option value="Dairy & Bakery">Dairy & Bakery</option>
                            <option value="Staples">Staples</option>
                            <option value="Snacks & Branded Foods">Snacks & Branded Foods</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Personal Care">Personal Care</option>
                            <option value="Home Care">Home Care</option>
                            <option value="Meat & Seafood">Meat & Seafood</option>
                        </select>
                    </div>
                </div>

                <label style={labelStyle}>Product Image</label>
                <input
                    style={{ ...inputStyle, padding: "9px 15px", backgroundColor: "#f3f4f6" }}
                    type="file"
                    onChange={e => setImage(e.target.files[0])}
                    accept="image/*"
                />

                <button
                    onClick={handleSubmit}
                    style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginTop: "10px",
                        boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#4338ca"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#4f46e5"}
                >
                    Save Product
                </button>
            </div>
        </div>
    );
}