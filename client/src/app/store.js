import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/orders/orderSlice";
import productReducer from "../features/products/productSlice";

const rootReducer = combineReducers({
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
});

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["cart"], // ✅ Sirf cart persist karo
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: import.meta.env.DEV, // ✅ Production mein band, dev mein on
});

export const persistor = persistStore(store);