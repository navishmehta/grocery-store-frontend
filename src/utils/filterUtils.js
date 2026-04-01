/**
 * Filters a list of products by category and search string across English and Punjabi names.
 * Supports both { nameEn, namePa } and { name: { en, pa } } structures.
 */
export function filterProducts(products, search, filterCat = "All") {
    if (!products) return [];
    
    const searchStr = search.toLowerCase();
    
    return products.filter(p => {
        // Category filtering (optional, only if filterCat is not "All")
        const matchCat = filterCat === "All" || p.category === filterCat;
        if (!matchCat) return false;

        // Search filtering
        if (!searchStr) return true;

        // Extract names handling both structures
        const nameEn = p.nameEn || p.name?.en || "";
        const namePa = p.namePa || p.name?.pa || "";

        return (
            nameEn.toLowerCase().includes(searchStr) ||
            namePa.toLowerCase().includes(searchStr)
        );
    });
}
