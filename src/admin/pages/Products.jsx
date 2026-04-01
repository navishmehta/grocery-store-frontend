import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import ProductSearchBar, { CategoryFilter } from "../../components/ProductSearchBar";
import { filterProducts } from "../../utils/filterUtils";
import "../../responsive.css";

/* ─── Helpers ───────────────────────────────────────── */
const CATEGORY_COLORS = {
    "Fruits & Vegetables": { bg: "#dcfce7", text: "#16a34a" },
    "Dairy & Bakery": { bg: "#fef9c3", text: "#ca8a04" },
    "Staples": { bg: "#fce7f3", text: "#db2777" },
    "Snacks & Branded Foods": { bg: "#ffedd5", text: "#ea580c" },
    "Beverages": { bg: "#dbeafe", text: "#2563eb" },
    "Personal Care": { bg: "#ede9fe", text: "#7c3aed" },
    "Home Care": { bg: "#e0f2fe", text: "#0284c7" },
    "Meat & Seafood": { bg: "#fee2e2", text: "#dc2626" },
};
const getCategoryStyle = (cat) => CATEGORY_COLORS[cat] || { bg: "#f3f4f6", text: "#374151" };

const getStockBadge = (isOutOfStock) => {
    if (isOutOfStock) return { label: "Out of Stock", bg: "#fee2e2", color: "#dc2626" };
    return { label: "In Stock", bg: "#f0fdf4", color: "#16a34a" };
};

/* ─── StatsBar ───────────────────────────────────────── */
function StatsBar({ products }) {
    const total = products.length;
    const outStock = products.filter(p => p.isOutOfStock).length;
    const discounted = products.filter(p => p.hasDiscount).length;
    const categories = new Set(products.map(p => p.category).filter(Boolean)).size;

    const stats = [
        { label: "Total Items", value: total, icon: "📦", color: "#4f46e5", bg: "#f5f3ff" },
        { label: "Categories", value: categories, icon: "🏷️", color: "#0284c7", bg: "#e0f2fe" },
        { label: "On Sale", value: discounted, icon: "🏷️", color: "#ea580c", bg: "#fff7ed" },
        { label: "Out of Stock", value: outStock, icon: "🚫", color: "#dc2626", bg: "#fee2e2" },
    ];

    return (
        <div className="stats-grid">
            {stats.map(s => (
                <div key={s.label} className="stat-card">
                    <div className="stat-card__icon" style={{ backgroundColor: s.bg }}>{s.icon}</div>
                    <div>
                        <div className="stat-card__value">{s.value}</div>
                        <div className="stat-card__label">{s.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Confirm Modal ─────────────────────────────────── */
function ConfirmModal({ product, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-box__danger-ring">🗑️</div>
                <h3 className="modal-box__title">Delete Product?</h3>
                <p className="modal-box__body">
                    You're about to permanently delete{" "}
                    <span className="modal-box__product-name">{product?.nameEn || "Unknown"}</span>.<br />
                    This action cannot be undone.
                </p>
                <div className="modal-box__actions">
                    <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="modal-btn-delete" onClick={onConfirm}>Yes, Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ─── ProductCard ────────────────────────────────────── */
function ProductCard({ p, onEdit, onDelete }) {
    const catStyle = getCategoryStyle(p.category);
    const stock = getStockBadge(p.isOutOfStock);

    return (
        <div className="product-card">
            <div className="product-card__image-wrap">
                {p.image ? (
                    <img
                        src={p.image}
                        alt={p.nameEn || "Product"}
                        className="product-card__image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1506617424156-76ba6e9c93a2?q=80&w=800&auto=format&fit=crop";
                        }}
                    />
                ) : (
                    <div className="product-card__no-image">🛒</div>
                )}
                {p.category && (
                    <span className="product-card__cat-badge" style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                        {p.category}
                    </span>
                )}
            </div>

            <div className="product-card__body">
                <div>
                    <h4 className="product-card__name">{p.nameEn || "Untitled"}</h4>
                    <p className="product-card__pa-name">{p.namePa || ""}</p>
                    {p.qtyValue && (
                        <p className="product-card__qty">{p.qtyValue} {p.qtyUnit}</p>
                    )}
                </div>

                <div className="product-card__meta">
                    <div className="shop-card__price-box">
                        {p.hasDiscount ? (
                            <>
                                <span className="shop-card__price">₹{p.discountPrice}</span>
                                <span className="shop-card__old-price">₹{p.price}</span>
                            </>
                        ) : (
                            <span className="shop-card__price">₹{p.price}</span>
                        )}
                    </div>
                    <span className="stock-badge" style={{ backgroundColor: stock.bg, color: stock.color }}>
                        {stock.label}
                    </span>
                </div>

                <div className="product-card__actions">
                    <button className="btn-edit" onClick={() => onEdit(p._id)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => onDelete(p)}>🗑 Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const [pendingDelete, setPendingDelete] = useState(null);
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    const fetchProducts = async () => {
        startLoading();
        try {
            const res = await API.get("/products");
            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await API.delete(`/products/${pendingDelete._id}`);
            setPendingDelete(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const allCategories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    const displayed = filterProducts(products, search, filterCat);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
        <div className="page-wrapper">
            <div className="admin-header">
                <div>
                    <h1 className="admin-header__title">🛍️ Inventory Management</h1>
                    <p className="admin-header__subtitle">Manage bilingual products and stock levels</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-header__btn" onClick={() => navigate("/admin/add-product")}>+ Add Product</button>
                    <button className="btn-cancel" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="admin-body">
                {products.length > 0 && <StatsBar products={products} />}

                <div className="toolbar">
                    <ProductSearchBar search={search} setSearch={setSearch} />
                    <CategoryFilter 
                        categories={allCategories} 
                        filterCat={filterCat} 
                        setFilterCat={setFilterCat} 
                    />
                </div>

                {displayed.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">📭</div>
                        <h3>No matching products</h3>
                    </div>
                ) : (
                    <div className="products-grid">
                        {displayed.map(p => (
                            <ProductCard
                                key={p._id}
                                p={p}
                                onEdit={id => navigate(`/admin/edit-product/${id}`)}
                                onDelete={setPendingDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {pendingDelete && (
                <ConfirmModal
                    product={pendingDelete}
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </div>
    );
}