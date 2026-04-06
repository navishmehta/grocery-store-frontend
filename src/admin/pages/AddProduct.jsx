import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import "../../responsive.css";

const CATEGORIES = [
    "Fruits & Vegetables", "Dairy & Bakery", "Staples",
    "Snacks & Branded Foods", "Beverages", "Personal Care",
    "Home Care", "Meat & Seafood",
];

const UNITS = ["kg", "g", "ml", "l", "pcs", "packet"];

export default function AddProduct() {
    // Initialize with nested structure to match schema
    const [form, setForm] = useState({
        name: { en: "", pa: "" },
        quantity: { value: "", unit: "kg" },
        price: "",
        category: "",
        hasDiscount: false,
        discountPrice: "",
        isOutOfStock: false
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const e = {};
        if (!form.name.en?.trim()) e.nameEn = "English name is required";
        if (!form.name.pa?.trim()) e.namePa = "Punjabi name is required";
        if (!form.price || form.price <= 0) e.price = "Valid price is required";
        if (!form.quantity.value) e.qtyValue = "Quantity value is required";
        if (!form.category) e.category = "Category is required";

        if (form.hasDiscount && (!form.discountPrice || Number(form.discountPrice) >= Number(form.price))) {
            e.discount = "Discount price must be lower than original price";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        
        startLoading(); // Activate global loader
        try {
            const formData = new FormData();

            // Map flat property names for backend consistency
            formData.append("nameEn", form.name.en);
            formData.append("namePa", form.name.pa);
            formData.append("qtyValue", form.quantity.value);
            formData.append("qtyUnit", form.quantity.unit);

            formData.append("price", form.price);
            formData.append("category", form.category);
            formData.append("hasDiscount", form.hasDiscount);
            formData.append("discountPrice", form.discountPrice);
            formData.append("isOutOfStock", form.isOutOfStock);

            if (image) formData.append("image", image);

            const res = await API.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Product added successfully", res);
            navigate("/admin/products");
        } catch (error) {
            console.error("Error adding product:", error);
            alert(error.response?.data?.message || "An error occurred while adding the product");
        } finally {
            stopLoading(); // Ensure loader is ALWAYS stopped
        }
    };

    // Helper to update nested state
    const updateNested = (parent, child, val) => {
        setForm(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [child]: val }
        }));
    };

    return (
        <div className="page-wrapper">
            <div className="admin-back-header">
                <button className="admin-back-header__back-btn" onClick={() => navigate("/admin/products")}>←</button>
                <div>
                    <h1 className="admin-back-header__title">➕ Add New Product</h1>
                </div>
            </div>

            <div className="form-outer">
                <div className="form-card">
                    {/* Image Section */}
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
                                <span className="image-preview__placeholder">🖼️</span>
                            )}
                        </div>
                        <label className="btn-upload">
                            📷 {image ? "Change" : "Upload"}
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        </label>
                    </div>

                    <div className="form-card__fields">
                        {/* Multilingual Names */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Name (English) <span className="star-red">*</span> </label>
                                <input className="field-input" value={form.name.en} onChange={e => updateNested("name", "en", e.target.value)} />
                                {errors.nameEn && <span className="field-error">{errors.nameEn}</span>}
                            </div>
                            <div className="field-group">
                                <label className="field-label">Name (ਪੰਜਾਬੀ) <span className="star-red">*</span> </label>
                                <input className="field-input" value={form.name.pa} onChange={e => updateNested("name", "pa", e.target.value)} />
                                {errors.namePa && <span className="field-error">{errors.namePa}</span>}
                            </div>
                        </div>

                        {/* Price & Discount Logic */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Price (₹) <span className="star-red">*</span></label>
                                <input className="field-input" type="number" onChange={e => setForm({ ...form, price: e.target.value })} />
                                {errors.price && <span className="field-error">{errors.price}</span>}
                            </div>
                            <div className="field-group">
                                <label className="field-label">Discount?</label>
                                <div className="toggle-container">
                                    <input type="checkbox" checked={form.hasDiscount} onChange={e => setForm({ ...form, hasDiscount: e.target.checked })} />
                                    <span>Apply Sale</span>
                                </div>
                            </div>
                        </div>

                        {form.hasDiscount && (
                            <div className="field-group">
                                <label className="field-label">Discounted Price (₹)</label>
                                <input className="field-input" type="number" onChange={e => setForm({ ...form, discountPrice: e.target.value })} />
                                {errors.discount && <span className="field-error">{errors.discount}</span>}
                            </div>
                        )}

                        {/* Quantity Value & Unit */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Quantity Value <span className="star-red">*</span> </label>
                                <input className="field-input" type="number" onChange={e => updateNested("quantity", "value", e.target.value)} />
                                {errors.qtyValue && <span className="field-error">{errors.qtyValue}</span>}
                            </div>
                            <div className="field-group">
                                <label className="field-label">Unit</label>
                                <select className="field-select" value={form.quantity.unit} onChange={e => updateNested("quantity", "unit", e.target.value)}>
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Category & Stock Status */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Category <span className="star-red">*</span></label>
                                <select className="field-select" onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="">Select</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="field-group">
                                <label className="field-label">Stock Status</label>
                                <select className="field-select" onChange={e => setForm({ ...form, isOutOfStock: e.target.value === "true" })}>
                                    <option value="false">In Stock</option>
                                    <option value="true">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-card__actions">
                            <button className="btn-cancel" onClick={() => navigate("/admin/products")}>Cancel</button>
                            <button className="btn-save" onClick={handleSubmit}>💾 Save Product</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}