import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AdminDispatch, AdminRootState } from "../store";

export const useAdminDispatch = () => useDispatch<AdminDispatch>();
export const useAdminSelector: TypedUseSelectorHook<AdminRootState> = useSelector;
