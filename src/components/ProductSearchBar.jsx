import "../responsive.css";

/**
 * A reusable search input component that fits with the application's design system.
 * Takes current search value, a setter function, and an optional placeholder.
 */
export default function ProductSearchBar({ search, setSearch, placeholder }) {
    return (
        <div className="toolbar__search-wrap">
            <span className="toolbar__search-icon">🔍</span>
            <input
                className="toolbar__search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                placeholder={placeholder || "Search in English or ਪੰਜਾਬੀ..."}
            />
        </div>
    );
}

/**
 * A reusable category filter component.
 * Takes current category, setter function, and list of all available categories.
 */
export function CategoryFilter({ categories, filterCat, setFilterCat }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="toolbar__filters">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`filter-pill${filterCat === cat ? " filter-pill--active" : ""}`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
