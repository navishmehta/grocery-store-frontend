import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext";

import ShopPage from "./pages/ShopPage";
import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import Login from "./admin/pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<ShopPage />} />

          {/* Login Route (Must be public) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-product" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-product/:id" element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;