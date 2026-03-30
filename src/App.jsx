import { BrowserRouter, Routes, Route } from "react-router-dom";

import ShopPage from "./pages/ShopPage";
import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShopPage />} />

        {/* Admin */}
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;