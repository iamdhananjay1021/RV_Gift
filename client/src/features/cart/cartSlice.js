import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const exist = state.items.find(p => p._id === item._id);
            if (exist) {
                exist.quantity += 1;
            } else {
                state.items.push({ ...item, quantity: 1 });
            }
        },

        // 🔥 YE MISSING THA (REDUCER)
        buyNowSingle: (state, action) => {
            // Overwrite cart for immediate checkout
            state.items = [{ ...action.payload, quantity: 1 }];
        },

        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(i => i._id === id);
            if (item && quantity >= 1) {
                item.quantity = quantity;
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(i => i._id !== action.payload);
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

// 🔥 YE BHI MISSING THA (EXPORT)
export const {
    addToCart,
    buyNowSingle, // <--- Isse export list mein zaroor rakhein
    updateQuantity,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;