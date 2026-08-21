import { io } from "socket.io-client";

/**
 * Ek hi socket poore admin portal ke liye. URL nahi dete — vite dev server
 * `/socket.io` ko backend par proxy karta hai (`ws: true`), is liye auth cookie
 * same-origin ki tarah chali jati hai aur handshake par server hamein "admins"
 * room mein daal deta hai.
 */
export const socket = io({
  withCredentials: true,
  autoConnect: false,
});
