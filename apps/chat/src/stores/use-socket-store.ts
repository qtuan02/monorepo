import { Client } from "@stomp/stompjs";
import { create } from "zustand";

import { env } from "~/env";
import { subscribeToOnlineUsers } from "~/libs/socket";
import { useAuthStore } from "~/stores/use-auth-store";

interface SocketStore {
  client: Client | null;
  isConnected: boolean;
  onlineUsers: string[];
  connect: () => void;
  disconnect: () => void;
}

/**
 * App-wide Presence + connection state. Deliberately NOT persisted — a
 * `Client` cannot survive a reload anyway, and `onlineUsers` is only ever
 * correct as a snapshot from a live connection (see CONTEXT.md, "Presence").
 *
 * `connect` reads the token lazily via `useAuthStore.getState()` rather than
 * importing it as a prop, so `~/libs/socket.ts` stays free of any `~/stores`
 * import while this store — one layer above it — is where the two meet (see
 * .agents/rules/architecture-circular-dependencies.md).
 */
export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,
  isConnected: false,
  onlineUsers: [],

  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token || get().client) return;

    const client = new Client({
      brokerURL: env.PUBLIC_CHAT_SOCKET_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    set({ client });

    const resetConnectionState = () => {
      set({ isConnected: false, onlineUsers: [] });
    };

    client.onConnect = () => {
      set({ isConnected: true, onlineUsers: [] });
      subscribeToOnlineUsers(client, (onlineUsers) => set({ onlineUsers }));
    };
    client.onStompError = resetConnectionState;
    client.onDisconnect = resetConnectionState;
    client.onWebSocketClose = resetConnectionState;

    client.activate();
  },

  disconnect: () => {
    const client = get().client;
    if (!client) return;

    void client.deactivate();
    set({ client: null, isConnected: false, onlineUsers: [] });
  },
}));
