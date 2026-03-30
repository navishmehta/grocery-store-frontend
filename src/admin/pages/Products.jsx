import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import "../../responsive.css";

/* ─── Helpers ───────────────────────────────────────── */
const CATEGORY_COLORS = {
    "Fruits & Vegetables":    { bg: "#dcfce7", text: "#16a34a" },
    "Dairy & Bakery":         { bg: "#fef9c3", text: "#ca8a04" },
    "Staples":                { bg: "#fce7f3", text: "#db2777" },
    "Snacks & Branded Foods": { bg: "#ffedd5", text: "#ea580c" },
    "Beverages":              { bg: "#dbeafe", text: "#2563eb" },
    "Personal Care":          { bg: "#ede9fe", text: "#7c3aed" },
    "Home Care":              { bg: "#e0f2fe", text: "#0284c7" },
    "Meat & Seafood":         { bg: "#fee2e2", text: "#dc2626" },
};
const getCategoryStyle = (cat) => CATEGORY_COLORS[cat] || { bg: "#f3f4f6", text: "#374151" };

const stockStatus = (stock) => {
    if (stock === undefined) return null;
    if (stock === 0)   return { label: "Out of stock", bg: "#fee2e2", color: "#dc2626" };
    if (stock <= 10)   return { label: `${stock} left`,    bg: "#fff7ed", color: "#ea580c" };
    return                    { label: `${stock} in stock`, bg: "#f0fdf4", color: "#16a34a" };
};

/* ─── StatsBar ───────────────────────────────────────── */
function StatsBar({ products }) {
    const total      = products.length;
    const outStock   = products.filter(p => p.stock === 0).length;
    const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const categories = new Set(products.map(p => p.category).filter(Boolean)).size;

    const stats = [
        { label: "Total Products", value: total,      icon: "📦", color: "#4f46e5", bg: "#f5f3ff" },
        { label: "Categories",     value: categories,  icon: "🏷️",  color: "#0284c7", bg: "#e0f2fe" },
        { label: "Low Stock",      value: lowStock,    icon: "⚠️",  color: "#ea580c", bg: "#fff7ed" },
        { label: "Out of Stock",   value: outStock,    icon: "🚫", color: "#dc2626", bg: "#fee2e2" },
    ];

    return (
        <div className="stats-grid">
            {stats.map(s => (
                <div key={s.label} className="stat-card">
                    <div className="stat-card__icon" style={{ backgroundColor: s.bg }}>
                        {s.icon}
                    </div>
                    <div>
                        <div className="stat-card__value">{s.value}</div>
                        <div className="stat-card__label">{s.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── ProductCard ────────────────────────────────────── */
function ProductCard({ p, onEdit, onDelete }) {
    const catStyle = getCategoryStyle(p.category);
    const stock    = stockStatus(p.stock);

    return (
        <div className="product-card">
            {/* Image */}
            <div className="product-card__image-wrap">
                {p.image ? (
                    <img src={p.image} alt={p.name} className="product-card__image" />
                ) : (
                    <div className="product-card__no-image">
                        <div className="product-card__no-image-icon">🛒</div>
                        <div className="product-card__no-image-text">No Image</div>
                    </div>
                )}
                {p.category && (
                    <span
                        className="product-card__cat-badge"
                        style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                    >
                        {p.category}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="product-card__body">
                <div>
                    <h4 className="product-card__name">{p.name}</h4>
                    {p.quantity && <p className="product-card__qty">{p.quantity}</p>}
                </div>

                <div className="product-card__meta">
                    <span className="product-card__price">₹{p.price}</span>
                    {stock && (
                        <span
                            className="stock-badge"
                            style={{ backgroundColor: stock.bg, color: stock.color }}
                        >
                            {stock.label}
                        </span>
                    )}
                </div>

                <div className="product-card__actions">
                    <button className="btn-edit" onClick={() => onEdit(p._id)}>
                        ✏️ Edit
                    </button>
                    <button className="btn-delete" onClick={() => onDelete(p._id)}>
                        🗑 Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Products() {
    const [products, setProducts]   = useState([]);
    const [search, setSearch]       = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    const fetchProducts = async () => {
        startLoading();
        try {
            const res = await API.get("/products");
            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
            setProducts([]);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        startLoading();
        try {
            await API.delete(`/products/${id}`);
            await fetchProducts();
        } catch (err) {
            console.error(err);
            stopLoading();
        }
    };

    const allCategories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    const displayed = products.filter(p => {
        const matchCat    = filterCat === "All" || p.category === filterCat;
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-header__title">🛍️ Inventory Management</h1>
                    <p className="admin-header__subtitle">Track and manage your store's product catalogue</p>
                </div>
                <button className="admin-header__btn" onClick={() => navigate("/admin/add-product")}>
                    + Add New Product
                </button>
            </div>

            {/* Body */}
            <div className="admin-body">
                {products.length > 0 && <StatsBar products={products} />}

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="toolbar__search-wrap">
                        <span className="toolbar__search-icon">🔍</span>
                        <input
                            className="toolbar__search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products…"
                        />
                    </div>
                    <div className="toolbar__filters">
                        {allCategories.slice(0, 6).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCat(cat)}
                                className={`filter-pill${filterCat === cat ? " filter-pill--active" : ""}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="toolbar__count">
                        {displayed.length} / {products.length}
                    </div>
                </div>

                {/* Content */}
                {displayed.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">📭</div>
                        <h3 className="empty-state__title">
                            {search || filterCat !== "All" ? "No matching products" : "No products yet"}
                        </h3>
                        <p className="empty-state__text">
                            {search || filterCat !== "All"
                                ? "Try clearing your filters or searching for something else."
                                : "Get started by adding your first product to the inventory."}
                        </p>
                        {!search && filterCat === "All" && (
                            <button className="btn-primary" onClick={() => navigate("/admin/add-product")}>
                                + Add First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="products-grid">
                        {displayed.map(p => (
                            <ProductCard
                                key={p._id}
                                p={p}
                                onEdit={id => navigate(`/admin/edit-product/${id}`)}
                                onDelete={deleteProduct}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}