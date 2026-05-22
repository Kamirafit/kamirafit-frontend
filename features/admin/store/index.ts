import { configureStore } from "@reduxjs/toolkit";
import adminCategoriesReducer from "./categoriesSlice";
import adminOrdersReducer from "./ordersSlice";
import adminProductsReducer from "./productsSlice";
import adminUsersReducer from "./usersSlice";

export const makeAdminStore = () =>
  configureStore({
    reducer: {
      adminProducts: adminProductsReducer,
      adminUsers: adminUsersReducer,
      adminCategories: adminCategoriesReducer,
      adminOrders: adminOrdersReducer,
    },
  });

export type AdminStore = ReturnType<typeof makeAdminStore>;
export type AdminRootState = ReturnType<AdminStore["getState"]>;
export type AdminDispatch = AdminStore["dispatch"];
