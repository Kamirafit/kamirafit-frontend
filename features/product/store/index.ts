import { configureStore } from "@reduxjs/toolkit";
import adminCategoriesReducer from "@/features/admin/store/categoriesSlice";
import adminProductsReducer from "@/features/admin/store/productsSlice";
import adminUsersReducer from "@/features/admin/store/usersSlice";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
      adminProducts: adminProductsReducer,
      adminUsers: adminUsersReducer,
      adminCategories: adminCategoriesReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
