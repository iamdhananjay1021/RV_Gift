import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async ({ search = '', category = '' }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);

        const response = await api.get(`/products?${params}`);
        return response.data;
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        status: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.items = action.payload;
            state.status = 'success';
        });
    },
});

export default productSlice.reducer;
