import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import ProductList from "../components/ProductList";
import { useLoading } from "../context/LoadingContext";
import "../responsive.css";

export default function ShopPage() {
    const [products, setProducts]       = useState([]);
    const [drawerOpen, setDrawerOpen]   = useState(false);
    const [params] = useSearchParams();
    const { startLoading, stopLoading } = useLoading();

    const category = params.get("category");

    useEffect(() => {
        const fetchProducts = async () => {
            startLoading();
            try {
                const res = await API.get(`/products${category ? `?category=${category}` : ""}`);
                setProducts(res.data.products || []);
            } catch (err) {
                console.error(err);
                setProducts([]);
            } finally {
                stopLoading();
            }
        };
        fetchProducts();
    }, [category]);

    return (
        <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* ── Header ── */}
            <header className="shop-header">
                <h1 className="shop-header__logo">
                    <span>Ramesh</span> Karayana
                </h1>
                <div className="shop-header__right">
                    {/* Mobile filter toggle */}
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

            {/* ── Mobile Sidebar Overlay + Drawer ── */}
            {drawerOpen && (
                <div
                    className="sidebar-overlay"
                    style={{ display: "block" }}
                    onClick={() => setDrawerOpen(false)}
                />
            )}
            <div className={`sidebar-drawer${drawerOpen ? " sidebar-drawer--open" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: "800", fontSize: "16px", color: "#111827" }}>Categories</span>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" }}
                    >
                        ✕
                    </button>
                </div>
                <FilterSidebar currentCategory={category} onSelect={() => setDrawerOpen(false)} />
            </div>

            {/* ── Main Layout ── */}
            <div className="shop-layout">
                {/* Desktop Sidebar */}
                <aside className="shop-sidebar">
                    <FilterSidebar currentCategory={category} />
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