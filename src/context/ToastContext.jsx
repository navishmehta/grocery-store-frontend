import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Date.now();
        // Clear previous toasts to ensure only one is visible at a time
        setToasts([{ id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);


    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item toast-item--${toast.type}`}>
                        <div className="toast-item__content">
                            <span className="toast-item__icon">
                                {toast.type === "success" && "✅"}
                                {toast.type === "danger" && "❌"}
                                {toast.type === "warning" && "⚠️"}
                                {toast.type === "info" && "ℹ️"}
                            </span>
                            <p className="toast-item__msg">{toast.message}</p>
                        </div>
                        <button 
                            className="toast-item__close" 
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                .toast-container {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .toast-item {
                    pointer-events: auto;
                    min-width: 300px;
                    max-width: 450px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border-left: 6px solid #ccc;
                }
                @keyframes toast-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .toast-item--success { border-left-color: #10b981; }
                .toast-item--danger { border-left-color: #ef4444; }
                .toast-item--warning { border-left-color: #f59e0b; }
                .toast-item--info { border-left-color: #3b82f6; }

                .toast-item__content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .toast-item__icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .toast-item__msg {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                    font-family: 'Inter', sans-serif;
                }
                .toast-item__close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                    transition: color 0.2s;
                }
                .toast-item__close:hover {
                    color: #4b5563;
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
}
