import { createSlice } from "@reduxjs/toolkit";

// Sirf is session ke liye — server par notifications store nahi hoti
const MAX_ITEMS = 20;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unread: 0 },
  reducers: {
    pushNotification: (state, action) => {
      state.items.unshift({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...action.payload,
      });
      state.items = state.items.slice(0, MAX_ITEMS);
      state.unread += 1;
    },
    markAllRead: (state) => {
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
