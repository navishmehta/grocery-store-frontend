import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import ProductList from "../components/ProductList";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [params] = useSearchParams();

    const category = params.get("category");

    useEffect(() => {
        API.get(`/products${category ? `?category=${category}` : ""}`)
            .then(res => setProducts(res.data.products || []))
            .catch(err => {
                console.error(err);
                setProducts([]);
            });
    }, [category]);

    return (
        <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header style={{
                backgroundColor: "white",
                padding: "20px 40px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 100
            }}>
                <h1 style={{ margin: 0, fontSize: "26px", color: "#111827", fontWeight: "900", letterSpacing: "-0.5px" }}>
                    <span style={{ color: "#10b981" }}>Ramesh Karayana Store</span>
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ fontSize: "16px", color: "#4b5563", fontWeight: "600", cursor: "pointer" }}>My Account</span>
                    <div style={{
                        width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e5e7eb",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#6b7280",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        R
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ display: "flex", maxWidth: "1500px", margin: "0 auto", padding: "40px", gap: "50px" }}>
                <div style={{ flex: "0 0 260px" }}>
                    <FilterSidebar currentCategory={category} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{ margin: 0, fontSize: "32px", color: "#111827", fontWeight: "800" }}>
                            {category ? category : "All Groceries"}
                        </h2>
                        <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "16px", fontWeight: "500" }}>
                            Showing {products.length} {products.length === 1 ? 'result' : 'results'} ready to buy
                        </p>
                    </div>
                    <ProductList products={products} />
                </div>
            </div>
        </div>
    );
}