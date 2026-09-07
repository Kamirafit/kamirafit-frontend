import type { AuthState } from "../store/authSlice";

export type AuthSyncEvent = {
  type: "LOGIN" | "LOGOUT";
  target: "customer" | "admin";
  state?: AuthState | null;
  timestamp: number;
};

const AUTH_CHANNEL_NAME = "kamirafit_auth_channel";

let authChannel: BroadcastChannel | null = null;

// In-memory store for administrator access token (Never written to disk/localStorage)
let inMemoryAdminAccessToken: string | null = null;

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
  // Customer Auth (Stored in localStorage)
  getCustomerAuth(): AuthState | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("kamira_auth_customer");
    return data ? JSON.parse(data) : null;
  },
  setCustomerAuth(state: AuthState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("kamira_auth_customer", JSON.stringify(state));
    broadcastAuthEvent({
      type: "LOGIN",
      target: "customer",
      state,
      timestamp: Date.now(),
    });
  },
  clearCustomerAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("kamira_auth_customer");
    broadcastAuthEvent({
      type: "LOGOUT",
      target: "customer",
      timestamp: Date.now(),
    });
  },

  // Admin Auth: Bearer tokens are NEVER persisted into localStorage.
  // We keep the bearer token in memory and user profile metadata in sessionStorage.
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
      return {
        ...parsed,
        accessToken: inMemoryAdminAccessToken || "",
      };
    } catch {
      return null;
    }
  },

  setAdminAuth(state: AuthState): void {
    if (typeof window === "undefined") return;

    // Retain token strictly in memory
    inMemoryAdminAccessToken = state.accessToken || null;

    // Scrub token from session storage payload
    const safeSessionState: AuthState = {
      ...state,
      accessToken: "",
    };

    sessionStorage.setItem("kamira_admin_session", JSON.stringify(safeSessionState));
    localStorage.removeItem("kamira_auth_admin"); // Ensure localStorage is pristine

    broadcastAuthEvent({
      type: "LOGIN",
      target: "admin",
      state: safeSessionState,
      timestamp: Date.now(),
    });
  },

  clearAdminAuth(): void {
    inMemoryAdminAccessToken = null;
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
