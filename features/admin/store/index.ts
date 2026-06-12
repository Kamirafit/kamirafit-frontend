import { configureStore } from "@reduxjs/toolkit";
import adminCategoriesReducer from "./categoriesSlice";
import adminOrdersReducer from "./ordersSlice";
import adminProductsReducer from "./productsSlice";
import adminUsersReducer from "./usersSlice";
import authReducer from "../../auth/store/authSlice";

export const makeAdminStore = () =>
  configureStore({
    reducer: {
      adminProducts: adminProductsReducer,
      adminUsers: adminUsersReducer,
      adminCategories: adminCategoriesReducer,
      adminOrders: adminOrdersReducer,
      auth: authReducer,
    },
  });

export type AdminStore = ReturnType<typeof makeAdminStore>;
export type AdminRootState = ReturnType<AdminStore["getState"]>;
export type AdminDispatch = AdminStore["dispatch"];
