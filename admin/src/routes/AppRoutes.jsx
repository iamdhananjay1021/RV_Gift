import { Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import AdminLogin from "../pages/AdminLogin";

/* ADMIN LAYOUT */
import Admin from "../pages/Admin";

/* ADMIN PAGES */
import AdminDashboard from "../pages/AdminDashboard";
import AdminProducts from "../pages/AdminProducts";
import AdminAddProduct from "../pages/AdminAddProduct";
import AdminEditProduct from "../pages/AdminEditProduct";
import AdminOrders from "../pages/AdminOrders";

/* PROTECTED */
import AdminRoute from "./AdminRoute";

const AppRoutes = () => {
    return (
        <Routes>
            {/* LOGIN */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* PROTECTED ADMIN PANEL */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminAddProduct />} />
                    <Route path="products/:id/edit" element={<AdminEditProduct />} /> {/* ✅ FIXED */}
                    <Route path="orders" element={<AdminOrders />} />
                </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;