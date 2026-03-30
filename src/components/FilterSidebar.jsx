import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function FilterSidebar({ currentCategory }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        API.get("/products/categories")
            .then(res => {
                setCategories(["All", ...res.data.categories]);
            })
            .catch(err => console.error(err));
    }, []);

    const handleFilter = (category) => {
        if (category === "All") {
            navigate("/"); // Reset filter
        } else {
            navigate(`/?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: "20px", 
            padding: "30px 25px", 
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)",
            position: "sticky",
            top: "120px",
            border: "1px solid #f3f4f6"
        }}>
            <h3 style={{ textTransform: "uppercase", fontSize: "12px", color: "#9ca3af", letterSpacing: "1.5px", margin: "0 0 25px 5px", fontWeight: "800" }}>
                Shop By Category
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {categories.map((cat, index) => {
                    const isSelected = (cat === "All" && !currentCategory) || cat === currentCategory;
                    
                    return (
                        <button 
                            key={index} 
                            onClick={() => handleFilter(cat)}
                            style={{
                                textAlign: "left",
                                padding: "14px 18px",
                                backgroundColor: isSelected ? "#ecfdf5" : "transparent",
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: isSelected ? "700" : "500",
                                color: isSelected ? "#059669" : "#4b5563",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseOver={e => { 
                                if (!isSelected) {
                                    e.target.style.backgroundColor = "#f9fafb"; 
                                    e.target.style.color = "#111827"; 
                                }
                            }}
                            onMouseOut={e => { 
                                if (!isSelected) {
                                    e.target.style.backgroundColor = "transparent"; 
                                    e.target.style.color = "#4b5563"; 
                                }
                            }}
                        >
                            {cat}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}