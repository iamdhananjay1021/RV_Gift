// // src/routes/AppRoutes.jsx
// import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
// import { useEffect } from "react";
// // import { useAuth } from "../contexts/useAuth";

// /* ===== PAGES ===== */
// import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import Cart from "../pages/Cart";
// import Checkout from "../pages/Checkout";
// import MyOrders from "../pages/MyOrders";
// import OrderDetails from "../pages/OrderDetails";
// import OrderSuccess from "../pages/OrderSuccess";
// import ProductDetails from "../components/ProductDetails";

// /* ===== SCROLL RESET ===== */
// const ScrollToTop = () => {
//     const { pathname } = useLocation();
//     useEffect(() => {
//         window.scrollTo(0, 0);
//     }, [pathname]);
//     return null;
// };

// /* ===== PROTECTED ROUTE ===== */
// const ProtectedRoute = () => {
//     const { isAuthenticated, loading } = useAuth();

//     // ✅ Session restore hone tak wait karo — warna refresh pe logout ho jaata
//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
//             </div>
//         );
//     }

//     return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
// };

// /* ===== ROUTES ===== */
// const AppRoutes = () => {
//     return (
//         <>
//             <ScrollToTop />

//             <Routes>
//                 {/* ===== PUBLIC ROUTES ===== */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/products/:id" element={<ProductDetails />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />

//                 {/* ===== PROTECTED ROUTES ===== */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route path="/cart" element={<Cart />} />
//                     <Route path="/checkout" element={<Checkout />} />
//                     <Route path="/orders" element={<MyOrders />} />
//                     <Route path="/orders/:id" element={<OrderDetails />} />
//                     <Route path="/order-success/:id" element={<OrderSuccess />} />
//                 </Route>

//                 {/* ===== FALLBACK ===== */}
//                 <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//         </>
//     );
// };

// export default AppRoutes;


// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

/* ===== ROUTES ===== */
import ProtectedRoute from "../components/ProtectedRoute";

/* ===== PAGES ===== */
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";
import OrderDetails from "../pages/OrderDetails";
import OrderSuccess from "../pages/OrderSuccess";
import ProductDetails from "../components/ProductDetails";

/* ===== SCROLL RESET ===== */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />

            <Routes>
                {/* ===== PUBLIC ===== */}
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ===== PROTECTED ===== */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/order-success/:id" element={<OrderSuccess />} />
                </Route>

                {/* ===== FALLBACK ===== */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default AppRoutes;