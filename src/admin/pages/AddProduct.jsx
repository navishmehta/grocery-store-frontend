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

export default function AddProduct() {
    const [form, setForm]       = useState({});
    const [image, setImage]     = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors]   = useState({});
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
        if (!form.name?.trim()) e.name     = "Product name is required";
        if (!form.price)        e.price    = "Price is required";
        if (!form.category)     e.category = "Category is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        startLoading();
        try {
            const formData = new FormData();
            Object.keys(form).forEach(k => formData.append(k, form[k]));
            if (image) formData.append("image", image);
            await API.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            stopLoading();
            navigate("/admin/products");
        } catch (error) {
            alert(error.response?.data?.message || "An error occurred while saving the product");
            stopLoading();
        }
    };

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: "" }));
    };

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="admin-back-header">
                <button className="admin-back-header__back-btn" onClick={() => navigate("/admin/products")}>←</button>
                <div>
                    <h1 className="admin-back-header__title">➕ Add New Product</h1>
                    <p className="admin-back-header__sub">Fill in the details to list a new product</p>
                </div>
            </div>

            {/* Form */}
            <div className="form-outer">
                <div className="form-card">
                    {/* Image */}
                    <div className="form-card__image-zone">
                        <div className="image-preview">
                            {preview
                                ? <img src={preview} alt="Preview" />
                                : <span className="image-preview__placeholder">🖼️</span>
                            }
                        </div>
                        <label className="btn-upload">
                            📷 {image ? "Change Image" : "Upload Image"}
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        </label>
                        {image && <p className="image-chosen-label">Selected: {image.name}</p>}
                    </div>

                    {/* Fields */}
                    <div className="form-card__fields">
                        {/* Name */}
                        <div className="field-group">
                            <label className="field-label">Product Name *</label>
                            <input
                                className={`field-input${errors.name ? " field-input--error" : ""}`}
                                placeholder="e.g. Organic Apples"
                                onChange={e => set("name", e.target.value)}
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                        </div>

                        {/* Price & Stock */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Price (₹) *</label>
                                <input
                                    className={`field-input${errors.price ? " field-input--error" : ""}`}
                                    type="number" placeholder="0.00"
                                    onChange={e => set("price", e.target.value)}
                                />
                                {errors.price && <span className="field-error">{errors.price}</span>}
                            </div>
                            <div className="field-group">
                                <label className="field-label">Stock Quantity</label>
                                <input
                                    className="field-input" type="number" placeholder="100"
                                    onChange={e => set("stock", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Qty Info & Category */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Quantity Info</label>
                                <input
                                    className="field-input" placeholder="e.g. 1kg or 500g"
                                    onChange={e => set("quantity", e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Category *</label>
                                <select
                                    className={`field-select${errors.category ? " field-select--error" : ""}`}
                                    defaultValue=""
                                    onChange={e => set("category", e.target.value)}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <span className="field-error">{errors.category}</span>}
                            </div>
                        </div>

                        {/* Actions */}
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