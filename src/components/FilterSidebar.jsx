import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useLoading } from "../context/LoadingContext";
import "../responsive.css";

const EMOJI = {
    "All":                    "🛒",
    "Fruits & Vegetables":    "🥦",
    "Dairy & Bakery":         "🥛",
    "Staples":                "🌾",
    "Snacks & Branded Foods": "🍿",
    "Beverages":              "🧃",
    "Personal Care":          "🧴",
    "Home Care":              "🧹",
    "Meat & Seafood":         "🍖",
};

export default function FilterSidebar({ currentCategory, onSelect }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        const load = async () => {
            startLoading();
            try {
                const res = await API.get("/products/categories");
                setCategories(["All", ...res.data.categories]);
            } catch (err) {
                console.error(err);
            } finally {
                stopLoading();
            }
        };
        load();
    }, []);

    const handleFilter = (category) => {
        if (category === "All") {
            navigate("/");
        } else {
            navigate(`/?category=${encodeURIComponent(category)}`);
        }
        onSelect?.();
    };

    return (
        <div className="filter-sidebar">
            <h3 className="filter-sidebar__heading">Shop By Category</h3>
            <div className="filter-sidebar__list">
                {categories.map((cat, i) => {
                    const isSelected = (cat === "All" && !currentCategory) || cat === currentCategory;
                    return (
                        <button
                            key={i}
                            className={`filter-btn${isSelected ? " filter-btn--active" : ""}`}
                            onClick={() => handleFilter(cat)}
                        >
                            <span className="filter-btn__emoji">{EMOJI[cat] || "🏷️"}</span>
                            <span className="filter-btn__label">{cat}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}