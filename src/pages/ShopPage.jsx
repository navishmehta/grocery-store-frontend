import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import ProductList from "../components/ProductList";
import { useLoading } from "../context/LoadingContext";
import "../responsive.css";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [params, setParams] = useSearchParams();
    const { startLoading, stopLoading } = useLoading();

    const category = params.get("category") || null;

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await API.get("/products/categories");
                setCategories(res.data.categories || []);
            } catch {
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            startLoading();
            try {
                const url = category
                    ? `/products?category=${encodeURIComponent(category)}`
                    : "/products";
                const res = await API.get(url);
                const data = res.data.products || [];
                setProducts(data);

                if (categories.length === 0) {
                    const unique = [...new Set(data.map(p => p.category).filter(Boolean))];
                    setCategories(unique);
                }
            } catch (err) {
                console.error(err);
                setProducts([]);
            } finally {
                stopLoading();
            }
        };
        fetchProducts();
    }, [category]);

    const selectCategory = (cat) => {
        if (cat === "All" || !cat) {
            setParams({});
        } else {
            setParams({ category: cat });
        }
        setDrawerOpen(false);
    };

    return (
        <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* ── Info Bar ── */}
            <div style={{
                backgroundColor: "#10b981",
                padding: "7px clamp(12px, 4vw, 40px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "4px",
            }}>
                <span style={{ color: "white", fontSize: "clamp(11px, 1.2vw, 13px)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    📍 Noordi Bazar, Near Dr. Lauka, Tarn Taran
                </span>
                <a href="tel:9815262920" style={{ color: "white", fontSize: "clamp(11px, 1.2vw, 13px)", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    📞 98152 62920
                </a>
            </div>

            {/* ── Main Header ── */}
            <header className="shop-header">
                <h1 className="shop-header__logo">
                    <span>Ramesh</span> Karayana <span>Store</span>
                </h1>
                <div className="shop-header__right">
                    <button
                        className="shop-header__filter-toggle"
                        onClick={() => setDrawerOpen(true)}
                    >
                        🎯 Filters
                    </button>
                    <span className="shop-header__account">My Account</span>
                    <div className="shop-header__avatar">R</div>
                </div>
            </header>

            {/* ── Mobile Overlay ── */}
            {drawerOpen && (
                <div
                    className="sidebar-overlay"
                    style={{ display: "block" }}
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── Mobile Drawer ── */}
            <div className={`sidebar-drawer${drawerOpen ? " sidebar-drawer--open" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <span style={{ fontWeight: "800", fontSize: "17px", color: "#111827" }}>Categories</span>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280", lineHeight: 1 }}
                    >
                        ✕
                    </button>
                </div>
                <FilterSidebar
                    categories={categories}
                    currentCategory={category}
                    onSelect={selectCategory}
                />
            </div>

            {/* ── Main Layout ── */}
            <div className="shop-layout">
                {/* Desktop Sidebar */}
                <aside className="shop-sidebar">
                    <FilterSidebar
                        categories={categories}
                        currentCategory={category}
                        onSelect={selectCategory}
                    />
                </aside>

                {/* Products */}
                <main className="shop-main">
                    <h2 className="shop-main__heading">
                        {category ? category : "All Groceries"}
                    </h2>
                    <p className="shop-main__count">
                        Showing {products.length} {products.length === 1 ? "result" : "results"} ready to buy
                    </p>
                    <ProductList products={products} />
                </main>
            </div>
        </div>
    );
}