import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = useCallback(() => setLoadingCount(c => c + 1), []);
    const stopLoading  = useCallback(() => setLoadingCount(c => Math.max(0, c - 1)), []);

    const isLoading = loadingCount > 0;

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            {isLoading && <GlobalLoader />}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error("useLoading must be used within a LoadingProvider");
    return ctx;
}

function GlobalLoader() {
    return (
        <>
            <style>{`
                @keyframes __gs { to { transform: rotate(360deg); } }
                .__gl-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.72);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                }
                .__gl-spinner {
                    width: 52px; height: 52px;
                    border-radius: 50%;
                    border: 4px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    animation: __gs 0.72s linear infinite;
                }
                .__gl-text {
                    margin-top: 16px;
                    font-size: 14px; font-weight: 700;
                    color: #4f46e5;
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.03em;
                }
            `}</style>
            <div className="__gl-overlay">
                <div className="__gl-spinner" />
                <p className="__gl-text">Please wait…</p>
            </div>
        </>
    );
}
