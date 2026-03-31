import "../responsive.css";

export default function ProductList({ products }) {
    if (products.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">📭</div>
                <h3 className="empty-state__title">No products found</h3>
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
        <div className={`shop-card ${p.isOutOfStock ? "shop-card--muted" : ""}`}>
            {/* Image Section */}
            <div className="shop-card__img-wrap">
                {p.image ? (
                    <img 
                        src={p.image} 
                        alt={p.name.en} 
                        className="shop-card__img" 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://images.unsplash.com/photo-1506617424156-76ba6e9c93a2?q=80&w=800&auto=format&fit=crop";
                        }}
                    />
                ) : (
                    <div className="shop-card__no-img">
                        <span>🛒</span>
                        <p>No Image</p>
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {p.isOutOfStock && (
                    <div className="shop-card__out-overlay">
                        <span>Sold Out</span>
                    </div>
                )}

                {/* Category Badge */}
                {p.category && (
                    <span className="shop-card__cat-badge">{p.category}</span>
                )}

                {/* Sale Badge */}
                {p.hasDiscount && !p.isOutOfStock && (
                    <span className="shop-card__sale-badge">SALE</span>
                )}
            </div>

            {/* Body Section */}
            <div className="product-card__body">
                {/* Dual Language Names */}
                <h2 className="shop-card__pa-name">{p.name.pa}</h2>
                <p className="shop-card__name">{p.name.en}</p>

                {/* Quantity Object */}
                <p className="shop-card__qty">
                    {p.quantity ? `${p.quantity.value} ${p.quantity.unit}` : "1 item"}
                </p>

                <div className="shop-card__footer">
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

                    <button
                        className="shop-card__add-btn"
                        disabled={p.isOutOfStock}
                    >
                        {p.isOutOfStock ? "🚫" : "Add +"}
                    </button>
                </div>
            </div>
        </div>
    );
}