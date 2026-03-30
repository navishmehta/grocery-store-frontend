export default function ProductList({ products }) {
    if (products.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px", backgroundColor: "white", borderRadius: "24px", border: "2px dashed #e5e7eb" }}>
                <h3 style={{ fontSize: "24px", color: "#374151", margin: "0 0 12px", fontWeight: "800" }}>No fresh finds here</h3>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>Try selecting a different category or check back later when we restock!</p>
            </div>
        )
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
            {products.map(p => (
                <div key={p._id} style={{
                    border: "1px solid #f3f4f6",
                    borderRadius: "24px",
                    backgroundColor: "white",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
                }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-10px)";
                        e.currentTarget.style.boxShadow = "0 25px 30px -5px rgba(0,0,0,0.1), 0 10px 15px -6px rgba(0,0,0,0.05)";
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.03)";
                    }}>

                    <div style={{ position: "relative", height: "240px", padding: "20px", backgroundColor: "#f8fafc", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {p.image ? (
                            <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply", transition: "transform 0.3s" }}
                                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                            />
                        ) : (
                            <div style={{ color: "#cbd5e1", fontWeight: "700", fontSize: "15px" }}>No Image Available</div>
                        )}
                        {/* Status badge for premium feel */}
                        <span style={{ position: "absolute", top: "20px", left: "20px", backgroundColor: "white", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", color: "#10b981", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            {p.category}
                        </span>
                    </div>

                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#111827" }}>{p.name}</h4>
                        </div>

                        <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "15px", fontWeight: "500" }}>{p.quantity || "1 item"}</p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "24px", fontWeight: "900", color: "#111827" }}>₹{p.price}</span>
                            </div>

                            <button
                                style={{
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "14px",
                                    width: "48px",
                                    height: "48px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    fontSize: "26px",
                                    fontWeight: "300",
                                    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                                    transition: "background-color 0.2s, transform 0.1s"
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = "#059669"}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = "#10b981"}
                                onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
                                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}