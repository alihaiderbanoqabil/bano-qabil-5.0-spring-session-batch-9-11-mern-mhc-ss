import { io } from "socket.io-client";

/**
 * Ek hi socket poore app ke liye.
 *
 * URL nahi dete — is liye client usi origin se judta hai jahan se page aaya,
 * aur vite dev server usay backend par proxy kar deta hai (`/socket.io`,
 * `ws: true`). Faida: cookie same-origin hoti hai, to auth khud chali aati hai.
 *
 * `autoConnect: false` — connect App ke andar hota hai, taake React ke bahar
 * import karte waqt hi connection na khul jaye.
 */
export const socket = io({
  withCredentials: true,
  autoConnect: false,
  // Auth cookie badal jaye (login/logout) to naye handshake ki zarorat hoti hai
  reconnectionDelay: 1000,
});
