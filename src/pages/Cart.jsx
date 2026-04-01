import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Pencil } from "lucide-react";
import { useToast } from "../context/ToastContext";
import ProductSearchBar from "../components/ProductSearchBar";
import { filterProducts } from "../utils/filterUtils";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

    const [pdfUrl, setPdfUrl] = useState(null);

    const updateLocalStorage = (updatedCart) => {
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const updateQty = (id, delta) => {
        const updated = cart.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.cartQty + delta);
                return { ...item, cartQty: newQty };
            }
            return item;
        });
        updateLocalStorage(updated);
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item._id !== id);
        updateLocalStorage(updated);
    };

    const preparePDF = async () => {
        try {
            const itemIds = cart.map(item => item._id);
            const res = await API.post("/products/validate-cart", { itemIds });
            const unavailableIds = res.data.unavailableIds;

            if (unavailableIds.length > 0) {
                const updatedCart = cart.filter(item => !unavailableIds.includes(item._id));
                updateLocalStorage(updatedCart);
                showToast("Some items are now Out of Stock and have been removed.", "warning");
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Grocery Estimate", 14, 20);

            const tableRows = cart.map(item => [
                item.name.en,
                item.unitInfo,
                item.cartQty,
                `Rs. ${item.price}`,
                `Rs. ${item.price * item.cartQty}`
            ]);

            autoTable(doc, {
                startY: 30,
                head: [['Product', 'Unit', 'Qty', 'Rate', 'Subtotal']],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129] }
            });

            const total = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
            doc.setFontSize(14);
            doc.text(`Estimated Total: Rs. ${total}`, 14, doc.lastAutoTable.finalY + 15);

            return doc;

        } catch (error) {
            console.error("PDF Generation failed", error);
        }
    }

    const handleDownload = async () => {
        const doc = await preparePDF();
        if (doc) doc.save("My_Grocery_List.pdf");
    };

    const handleView = async () => {
        const doc = await preparePDF();
        if (doc) {
            const blobUrl = doc.output('bloburl');
            setPdfUrl(blobUrl);
        }
    };

    const displayed = filterProducts(cart, search);
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);

    if (pdfUrl) {
        return (
            <div className="pdf-viewer-container">
                <div className="pdf-viewer-header">
                    <button className="pdf-viewer-back" onClick={() => setPdfUrl(null)}>
                        ← Back to Cart
                    </button>
                    <h2>Estimate Preview</h2>
                    <a href={pdfUrl} download="My_Grocery_List.pdf" className="pdf-viewer-download">
                        Download PDF
                    </a>
                </div>
                <iframe 
                    src={pdfUrl} 
                    title="PDF Preview"
                    className="pdf-viewer-frame"
                />
            </div>
        );
    }

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#f8fafc" }}>
            <div className="cart-page-header">
                <div className="cart-page-header__content">
                    <button className="back-to-shop" onClick={() => navigate("/")}>
                        ← Back to Shop
                    </button>
                    <h1>Shopping Cart</h1>
                    <p>{cart.length} {cart.length === 1 ? "item" : "items"} in your list</p>
                </div>
            </div>

            <div className="cart-layout-container">
                {cart.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <ProductSearchBar 
                            search={search} 
                            setSearch={setSearch} 
                            placeholder="Search in your list..." 
                        />
                    </div>
                )}

                {cart.length === 0 ? (
                    <div className="cart-empty-state">
                        <div className="cart-empty-state__icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button className="btn-primary" onClick={() => navigate("/")}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Cart Items List */}
                        <div className="cart-items-section">
                            {displayed.length === 0 ? (
                                <div className="cart-empty-state" style={{ padding: '60px' }}>
                                    <div className="cart-empty-state__icon">🔍</div>
                                    <h2 style={{ fontSize: '20px' }}>No items match your search</h2>
                                    <p>Try searching for something else in your list.</p>
                                </div>
                            ) : (
                                displayed.map(item => (
                                    <div key={item._id} className="cart-item-row">
                                        <div className="cart-item-row__info">
                                            <div className="cart-item-row__names">
                                                <h3>{item.name?.en}</h3>
                                                <span className="pa-name">{item.name?.pa}</span>
                                                <span className="unit-tag">{item.unitInfo}</span>
                                            </div>
                                        </div>

                                        <div className="cart-item-row__actions">
                                            <div className="qty-controls">
                                                <button onClick={() => updateQty(item._id, -1)}>−</button>
                                                <span className="qty-val">{item.cartQty}</span>
                                                <button onClick={() => updateQty(item._id, 1)}>+</button>
                                            </div>

                                            <div className="price-info">
                                                <span className="unit-price">₹{item.price} each</span>
                                                <span className="subtotal">₹{item.price * item.cartQty}</span>
                                            </div>

                                            <button className="remove-btn" onClick={() => removeItem(item._id)} title="Remove item">
                                                🗑️ delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Sidebar */}
                        <aside className="cart-summary-section">
                            <div className="summary-card">
                                <h3>Order Summary</h3>
                                <div className="summary-line">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="summary-line">
                                    <span>Estimated GST</span>
                                    <span>Included</span>
                                </div>
                                <div className="summary-total">
                                    <span>Total Amount</span>
                                    <span>₹{total}</span>
                                </div>

                                <div className="summary-actions">
                                    <button className="btn-view-est" onClick={handleView}>
                                        👁️ View Estimate (PDF)
                                    </button>
                                    <button className="btn-download-est" onClick={handleDownload}>
                                        📄 Download Estimate
                                    </button>
                                    <p className="summary-disclaimer">
                                        * Prices are estimated and subject to market availability at the store.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}