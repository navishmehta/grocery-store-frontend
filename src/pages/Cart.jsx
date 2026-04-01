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

    const [showPreview, setShowPreview] = useState(false);

    const handleView = async () => {
        // Instead of generating a PDF blob, we just show our internal HTML preview
        setShowPreview(true);
    };

    const displayed = filterProducts(cart, search);
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);


    if (showPreview) {
        return (
            <div className="pdf-viewer-container">
                <div className="pdf-viewer-header">
                    <button className="pdf-viewer-back" onClick={() => setShowPreview(false)}>
                        ← Back to Cart
                    </button>
                    <h2>Estimate Preview</h2>
                    <button onClick={handleDownload} className="pdf-viewer-download">
                        Download PDF
                    </button>
                </div>
                
                <div className="estimate-html-preview">
                   <div className="estimate-card">
                       <div className="estimate-card__header">
                           <div className="store-info">
                               <h1 className="shop-header__logo"><span>Ramesh</span> Karayana <span>Store</span></h1>
                               <p>📍 Noordi Bazar, Tarn Taran</p>
                               <p>📞 98152 62920</p>
                           </div>
                           <div className="estimate-badge">Grocery Estimate</div>
                       </div>
                       
                       <div className="estimate-date">Date: {new Date().toLocaleDateString()}</div>
                       
                       <div className="estimate-table-wrap">
                           <table className="estimate-table">
                               <thead>
                                   <tr>
                                       <th>Product</th>
                                       <th>Unit</th>
                                       <th>Qty</th>
                                       <th>Rate</th>
                                       <th>Subtotal</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {cart.map((item, idx) => (
                                       <tr key={idx}>
                                           <td>
                                               <div className="item-name">{item.name?.en}</div>
                                               <div className="item-pa">{item.name?.pa}</div>
                                           </td>
                                           <td>{item.unitInfo}</td>
                                           <td>{item.cartQty}</td>
                                           <td>₹{item.price}</td>
                                           <td>₹{item.price * item.cartQty}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                       
                       <div className="estimate-total-section">
                           <div className="total-line">
                               <span>Subtotal</span>
                               <span>₹{total}</span>
                           </div>
                           <div className="total-line main-total">
                               <span>Estimated Total</span>
                               <span>₹{total}</span>
                           </div>
                       </div>
                       
                       <div className="estimate-footer">
                           <p>* Prices are subject to market availability.</p>
                           <p>Thank you for shopping with us!</p>
                       </div>
                   </div>
                </div>
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
                                                🗑️
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