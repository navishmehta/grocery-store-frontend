import "../responsive.css";

const EMOJI = {
    "All": "🛒",
    "Fruits & Vegetables": "🥦",
    "Dairy & Bakery": "🥛",
    "Staples": "🌾",
    "Snacks & Branded Foods": "🍿",
    "Beverages": "🧃",
    "Personal Care": "🧴",
    "Home Care": "🧹",
    "Meat & Seafood": "🍖",
};

export default function FilterSidebar({ categories = [], currentCategory, onSelect }) {
    const allCategories = ["All", ...categories];

    return (
        <div className="filter-sidebar">
            <h3 className="filter-sidebar__heading">Filter by Category</h3>
            <div className="filter-sidebar__list">
                {allCategories.map((cat) => {
                    const isSelected =
                        (cat === "All" && !currentCategory) ||
                        cat === currentCategory;

                    return (
                        <button
                            key={cat}
                            className={`filter-btn${isSelected ? " filter-btn--active" : ""}`}
                            onClick={() => onSelect?.(cat)}
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