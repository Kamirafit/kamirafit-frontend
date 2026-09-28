import type { AuthState } from "../store/authSlice";

export type AuthSyncEvent = {
  type: "LOGIN" | "LOGOUT";
  target: "customer" | "admin";
  state?: AuthState | null;
  timestamp: number;
};

const AUTH_CHANNEL_NAME = "kamirafit_auth_channel";

let authChannel: BroadcastChannel | null = null;

function getAuthChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!authChannel) {
    try {
      authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    } catch {
      authChannel = null;
    }
  }
  return authChannel;
}

export function broadcastAuthEvent(event: AuthSyncEvent): void {
  try {
    const channel = getAuthChannel();
    if (channel) {
      channel.postMessage(event);
    }
  } catch (err) {
    console.warn("Failed to broadcast auth event", err);
  }
}

export function subscribeAuthSync(onEvent: (event: AuthSyncEvent) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let lastTimestamp = 0;
  const handleEvent = (event: AuthSyncEvent) => {
    if (event.timestamp && Math.abs(event.timestamp - lastTimestamp) < 50) {
      return;
    }
    lastTimestamp = event.timestamp || Date.now();
    onEvent(event);
  };

  const channel = getAuthChannel();
  const channelListener = (messageEvent: MessageEvent<AuthSyncEvent>) => {
    if (messageEvent.data && (messageEvent.data.type === "LOGIN" || messageEvent.data.type === "LOGOUT")) {
      handleEvent(messageEvent.data);
    }
  };

  if (channel) {
    channel.addEventListener("message", channelListener);
  }

  const storageListener = (storageEvent: StorageEvent) => {
    if (storageEvent.key === "kamira_auth_customer") {
      if (!storageEvent.newValue) {
        handleEvent({
          type: "LOGOUT",
          target: "customer",
          timestamp: Date.now(),
        });
      } else {
        try {
          const parsed = JSON.parse(storageEvent.newValue);
          handleEvent({
            type: "LOGIN",
            target: "customer",
            state: parsed,
            timestamp: Date.now(),
          });
        } catch {
          // ignore parse errors
        }
      }
    } else if (storageEvent.key === null) {
      handleEvent({
        type: "LOGOUT",
        target: "customer",
        timestamp: Date.now(),
      });
      handleEvent({
        type: "LOGOUT",
        target: "admin",
        timestamp: Date.now(),
      });
    }
  };

  window.addEventListener("storage", storageListener);

  return () => {
    if (channel) {
      channel.removeEventListener("message", channelListener);
    }
    window.removeEventListener("storage", storageListener);
  };
}

export const AuthStorage = {
  // Customer Auth (Stored in localStorage WITHOUT accessToken; authentication relies on HttpOnly cookies)
  getCustomerAuth(): AuthState | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("kamira_auth_customer");
    if (!data) return null;
    try {
      const parsed: AuthState = JSON.parse(data);
      if (parsed.accessToken) {
        delete parsed.accessToken;
        localStorage.setItem("kamira_auth_customer", JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  },
  setCustomerAuth(state: AuthState): void {
    if (typeof window === "undefined") return;
    // Strip accessToken so it is never exposed in browser localStorage (XSS hardening)
    const safeState = { ...state };
    delete safeState.accessToken;
    localStorage.setItem("kamira_auth_customer", JSON.stringify(safeState));
    broadcastAuthEvent({
      type: "LOGIN",
      target: "customer",
      state: safeState,
      timestamp: Date.now(),
    });
  },
  clearCustomerAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("kamira_auth_customer");
    localStorage.removeItem("kamirafit_cart_items");
    broadcastAuthEvent({
      type: "LOGOUT",
      target: "customer",
      timestamp: Date.now(),
    });
  },

  // Admin Auth (Stored in sessionStorage WITHOUT accessToken; authentication relies on HttpOnly cookies)
  getAdminAuth(): AuthState | null {
    if (typeof window === "undefined") return null;

    // Purge any legacy admin tokens accidentally left in localStorage
    if (localStorage.getItem("kamira_auth_admin")) {
      localStorage.removeItem("kamira_auth_admin");
    }

    const sessionData = sessionStorage.getItem("kamira_admin_session");
    if (!sessionData) return null;

    try {
      const parsed: AuthState = JSON.parse(sessionData);
      if (parsed.accessToken) {
        delete parsed.accessToken;
        sessionStorage.setItem("kamira_admin_session", JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  },

  setAdminAuth(state: AuthState): void {
    if (typeof window === "undefined") return;

    // Strip accessToken so it is never exposed in browser sessionStorage (XSS hardening)
    const safeState = { ...state };
    delete safeState.accessToken;

    sessionStorage.setItem("kamira_admin_session", JSON.stringify(safeState));
    localStorage.removeItem("kamira_auth_admin"); // Ensure localStorage is pristine

    broadcastAuthEvent({
      type: "LOGIN",
      target: "admin",
      state: safeState,
      timestamp: Date.now(),
    });
  },

  clearAdminAuth(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("kamira_admin_session");
      localStorage.removeItem("kamira_auth_admin");
    }
    broadcastAuthEvent({
      type: "LOGOUT",
      target: "admin",
      timestamp: Date.now(),
    });
  },

  clearAll(): void {
    this.clearCustomerAuth();
    this.clearAdminAuth();
  },
};
