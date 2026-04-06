import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Pencil } from "lucide-react";
import { useToast } from "../context/ToastContext";
import ProductSearchBar from "../components/ProductSearchBar";
import { filterProducts } from "../utils/filterUtils";
import LocationPicker from "../components/LocationPicker";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

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

            // Store Title
            doc.setFontSize(22);
            doc.setTextColor(16, 185, 129); // Green color
            doc.setFont("helvetica", "bold");
            doc.text("Ramesh Karayana Store", 14, 22);

            // Store Address & Phone
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.setFont("helvetica", "normal");
            doc.text("Noordi Bazar, Tarn Taran | Phone: 98152 62920", 14, 30);

            // User & Date
            doc.setFontSize(10);
            doc.setTextColor(0);
            const dateStr = `Date: ${new Date().toLocaleDateString()}`;
            const preparedByStr = customerName ? `Created By: ${customerName}` : "";
            const customerAddressStr = customerAddress ? `Customer Address: ${customerAddress}` : "";
            doc.text(dateStr, 196, 22, { align: 'right' });
            if (preparedByStr) {
                doc.text(preparedByStr, 196, 30, { align: 'right' });
            }
            if (customerAddressStr) {
                doc.text(customerAddressStr, 196, 38, { align: 'right' });
            }

            // Separator line
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 35, 196, 35);

            // Estimate Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Grocery Bill", 14, 45);

            const tableRows = cart.map(item => [
                item.name.en,
                item.unitInfo,
                item.cartQty,
                `Rs. ${item.price}`,
                `Rs. ${item.price * item.cartQty}`
            ]);

            autoTable(doc, {
                startY: 52,
                head: [['Product', 'Unit', 'Qty', 'Rate', 'Subtotal']],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129] },
                styles: { fontSize: 10 }
            });

            const subtotalOriginal = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.cartQty), 0);
            const totalFinal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
            const discountAmt = subtotalOriginal - totalFinal;

            let currentY = doc.lastAutoTable.finalY + 15;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Subtotal (Actual Price): Rs. ${subtotalOriginal}`, 14, currentY);

            if (discountAmt > 0) {
                currentY += 7;
                doc.setTextColor(16, 185, 129); // Green color for savings
                doc.text(`Discount / Savings: -Rs. ${discountAmt}`, 14, currentY);
            }

            currentY += 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.text(`Total Amount: Rs. ${totalFinal}`, 14, currentY);


            return doc;

        } catch (error) {
            console.error("PDF Generation failed", error);
        }
    }

    const handleDownload = async () => {
        if (!customerName.trim() && !customerAddress.trim()) {
            showToast("Please enter a Customer Name and Address before downloading.", "danger");
            return;
        }
        else if (!customerName.trim()) {
            showToast("Please enter a Customer Name before downloading.", "danger");
            return;
        }
        else if (!customerAddress.trim()) {
            showToast("Please enter a Customer Address before downloading.", "danger");
            return;
        }
        const doc = await preparePDF();
        if (doc) doc.save(`${customerName.replace(/\s+/g, '_')}_Estimate.pdf`);
    };

    const [showPreview, setShowPreview] = useState(false);

    const handleView = async () => {
        if (!customerName.trim() && !customerAddress.trim()) {
            showToast("Please enter a Customer Name and Address before viewing the estimate.", "danger");
            return;
        }
        else if (!customerName.trim()) {
            showToast("Please enter a Customer Name before viewing the estimate.", "danger");
            return;
        }
        else if (!customerAddress.trim()) {
            showToast("Please enter a Customer Address before viewing the estimate.", "danger");
            return;
        }
        setShowPreview(true);
    };

    const displayed = filterProducts(cart, search);
    const subtotalOriginal = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.cartQty), 0);
    const totalFinal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
    const discountAmount = subtotalOriginal - totalFinal;

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

                        <div className="estimate-meta-row">
                            <div className="prepared-by">
                                {customerName && <span><strong>Prepared By:</strong> {customerName}</span>}
                                {customerAddress && <span><strong>Customer Address:</strong> {customerAddress}</span>}
                            </div>
                            <div className="estimate-date">Date: {new Date().toLocaleDateString()}</div>
                        </div>

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
                                <span>Actual Price (Subtotal)</span>
                                <span>₹{subtotalOriginal}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="total-line">
                                    <span>Discount / Savings</span>
                                    <span style={{ color: '#16a34a', fontWeight: '700' }}>- ₹{discountAmount}</span>
                                </div>
                            )}
                            <div className="total-line main-total">
                                <span>Final Estimated Total</span>
                                <span>₹{totalFinal}</span>
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

                                {/* Customer Info Input */}
                                <div className="customer-info-box">
                                    <div className="">
                                        {/* <label>Customer/Person Name</label> */}
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Customer Name"
                                            className="customer-input"
                                        />
                                    </div>
                                    <div className="address-input-wrapper">
                                        <input
                                            type="text"
                                            value={customerAddress}
                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                            placeholder="Customer Address"
                                            className="customer-input"
                                        />
                                        <LocationPicker onAddressFetched={(addr) => setCustomerAddress(addr)} />
                                    </div>
                                </div>


                                <div className="summary-line">
                                    <span>Subtotal (Actual Price)</span>
                                    <span className="price-span">₹{subtotalOriginal}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="summary-line savings-line">
                                        <span>Discount</span>
                                        <span style={{ color: '#16a34a', fontWeight: '700' }}>- ₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="summary-total">
                                    <span>Total Amount</span>
                                    <span>₹{totalFinal}</span>
                                </div>

                                <div className="summary-actions">
                                    <button className="btn-view-est" onClick={handleView}>
                                        👁️ Check Your Bill
                                    </button>
                                    <button className="btn-download-est" onClick={handleDownload}>
                                        📄 Download Bill PDF
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