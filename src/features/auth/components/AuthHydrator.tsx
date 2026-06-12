"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthHydrated, AuthState } from "../store/authSlice";

export default function AuthHydrator({
  children,
  storageKey = "kamira_auth_customer",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const dispatch = useDispatch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(storageKey);
      if (storedAuth) {
        const authData: AuthState = JSON.parse(storedAuth);
        dispatch(setAuthHydrated(authData));
      }
    } catch (error) {
      console.error("Failed to parse auth state from local storage", error);
    } finally {
      setHydrated(true);
    }
  }, [dispatch, storageKey]);

  // Optionally avoid rendering children until hydrated so we don't get flashes of logged out state
  // But for better UX, we'll render right away and handle it gracefully
  if (!hydrated) return null;

  return <>{children}</>;
}
