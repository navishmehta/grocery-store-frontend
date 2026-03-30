import "../responsive.css";

export default function ProductList({ products }) {
    if (products.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">🥦</div>
                <h3 className="empty-state__title">No fresh finds here</h3>
                <p className="empty-state__text">
                    Try selecting a different category or check back later when we restock!
                </p>
            </div>
        );
    }

    return (
        <div className="shop-products-grid">
            {products.map(p => <ShopCard key={p._id} p={p} />)}
        </div>
    );
}

function ShopCard({ p }) {
    return (
        <div className="shop-card">
            {/* Image */}
            <div className="shop-card__img-wrap">
                {p.image ? (
                    <img src={p.image} alt={p.name} className="shop-card__img" />
                ) : (
                    <div style={{ textAlign: "center", color: "#cbd5e1" }}>
                        <div style={{ fontSize: "36px", marginBottom: "6px", opacity: 0.4 }}>🛒</div>
                        <div style={{ fontSize: "12px", fontWeight: "700" }}>No Image Available</div>
                    </div>
                )}
                {p.category && (
                    <span className="shop-card__cat-badge">{p.category}</span>
                )}
            </div>

            {/* Body */}
            <div className="shop-card__body">
                <h4 className="shop-card__name">{p.name}</h4>
                <p className="shop-card__qty">{p.quantity || "1 item"}</p>

                <div className="shop-card__footer">
                    <span className="shop-card__price">₹{p.price}</span>
                    <button className="btn-add-cart" aria-label="Add to cart">+</button>
                </div>
            </div>
        </div>
    );
}