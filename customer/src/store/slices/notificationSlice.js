import { createSlice } from "@reduxjs/toolkit";

// Notifications sirf is session ke liye (server par store nahi hoti). List ko
// cap karte hain, warna lambi session mein memory barhti rehti hai.
const MAX_ITEMS = 20;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unread: 0 },
  reducers: {
    pushNotification: (state, action) => {
      state.items.unshift({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        read: false,
        ...action.payload,
      });
      state.items = state.items.slice(0, MAX_ITEMS);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unread = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unread = 0;
    },
  },
});

export const { pushNotification, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unread;
