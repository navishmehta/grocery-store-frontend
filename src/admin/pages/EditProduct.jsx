import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useLoading } from "../../context/LoadingContext";
import "../../responsive.css";

const CATEGORIES = [
    "Fruits & Vegetables", "Dairy & Bakery", "Staples",
    "Snacks & Branded Foods", "Beverages", "Personal Care",
    "Home Care", "Meat & Seafood",
];

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    // Initialize state with the structure your inputs expect
    const [form, setForm] = useState({
        nameEn: "",
        namePa: "",
        price: "",
        stock: "",
        qtyValue: "",
        qtyUnit: "",
        category: ""
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            startLoading();
            try {
                const res = await API.get(`/products/${id}`);
                const p = res.data.product; // Backend returns { success: true, product: {...} }

                // Map nested object data to flat form state
                setForm({
                    nameEn: p.name?.en || "",
                    namePa: p.name?.pa || "",
                    price: p.price || "",
                    stock: p.stock || 0,
                    qtyValue: p.quantity?.value || "",
                    qtyUnit: p.quantity?.unit || "",
                    category: p.category || ""
                });

                if (p.image) setPreview(p.image);
            } catch (err) {
                console.error("Error loading product:", err);
            } finally {
                stopLoading();
            }
        };
        load();
    }, [id]);

    const handleUpdate = async () => {
        // Validation logic would go here
        startLoading();
        try {
            const formData = new FormData();

            // Reconstruct the nested objects for the backend
            formData.append("name[en]", form.nameEn);
            formData.append("name[pa]", form.namePa);
            formData.append("price", form.price);
            formData.append("stock", form.stock);
            formData.append("quantity[value]", form.qtyValue);
            formData.append("quantity[unit]", form.qtyUnit);
            formData.append("category", form.category);

            if (image) formData.append("image", image);

            await API.put(`/products/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            stopLoading();
            navigate("/admin/products");
        } catch (error) {
            alert("Error updating product");
            stopLoading();
        }
    };

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
    };

    return (
        <div className="page-wrapper">
            <div className="admin-back-header">
                <button className="admin-back-header__back-btn" onClick={() => navigate("/admin/products")}>←</button>
                <div>
                    <h1 className="admin-back-header__title">✏️ Edit Product</h1>
                </div>
            </div>

            <div className="form-outer">
                <div className="form-card">
                    <div className="form-card__image-zone">
                        <div className="image-preview">
                            {preview ? (
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = "https://images.unsplash.com/photo-1506617424156-76ba6e9c93a2?q=80&w=800&auto=format&fit=crop";
                                    }}
                                />
                            ) : (
                                <span>🖼️</span>
                            )}
                        </div>
                        <label className="btn-upload">
                            📷 Change Image
                            <input type="file" onChange={(e) => {
                                const file = e.target.files[0];
                                setImage(file);
                                setPreview(URL.createObjectURL(file));
                            }} style={{ display: "none" }} />
                        </label>
                    </div>

                    <div className="form-card__fields">
                        <div className="field-group">
                            <label>Product Name (English)</label>
                            <input className="field-input" value={form.nameEn} onChange={e => set("nameEn", e.target.value)} />
                        </div>
                        <div className="field-group">
                            <label>Product Name (ਪੰਜਾਬੀ)</label>
                            <input className="field-input" value={form.namePa} onChange={e => set("namePa", e.target.value)} />
                        </div>

                        <div className="field-row">
                            <div className="field-group">
                                <label>Price (₹)</label>
                                <input type="number" className="field-input" value={form.price} onChange={e => set("price", e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>Stock</label>
                                <input type="number" className="field-input" value={form.stock} onChange={e => set("stock", e.target.value)} />
                            </div>
                        </div>

                        <div className="field-row">
                            <div className="field-group">
                                <label>Qty Value (e.g. 500)</label>
                                <input className="field-input" value={form.qtyValue} onChange={e => set("qtyValue", e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>Unit (e.g. g, kg, ml)</label>
                                <input className="field-input" value={form.qtyUnit} onChange={e => set("qtyUnit", e.target.value)} />
                            </div>
                        </div>

                        <div className="field-group">
                            <label>Category</label>
                            <select className="field-select" value={form.category} onChange={e => set("category", e.target.value)}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="form-card__actions">
                            <button className="btn-cancel" onClick={() => navigate("/admin/products")}>Cancel</button>
                            <button className="btn-save" onClick={handleUpdate}>💾 Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}