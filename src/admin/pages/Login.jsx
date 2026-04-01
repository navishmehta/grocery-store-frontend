import { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import "../../responsive.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        if (localStorage.getItem("adminToken")) {
            navigate("/admin/products");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        startLoading();

        try {
            const res = await API.post("/auth/login", { email, password });
            localStorage.setItem("adminToken", res.data.token);
            stopLoading();
            navigate("/admin/products");
        } catch (err) {
            stopLoading();
            setError(err.response?.data?.message || "Invalid Email or Password");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-card__header">
                    <span className="login-card__logo">🛒</span>
                    <h1 className="login-card__title">Admin Login</h1>
                    <p className="login-card__sub">Enter your credentials to manage inventory</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error-msg">{error}</div>}

                    <div className="field-group">
                        <label className="field-label">Email Address</label>
                        <input
                            type="email"
                            className="field-input"
                            placeholder="admin@grocery.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Password</label>
                        <input
                            type="password"
                            className="field-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-save" style={{ width: "100%", marginTop: "1rem" }}>
                        🔓 Login to Dashboard
                    </button>
                </form>

                <button className="btn-cancel" onClick={() => navigate("/")} style={{ width: "100%", marginTop: "10px" }}>
                    Back to Shop
                </button>
            </div>
        </div>
    );
}