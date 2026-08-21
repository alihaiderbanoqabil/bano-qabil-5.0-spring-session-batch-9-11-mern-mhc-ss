import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Ek hi RTK Query API slice — baqi files `injectEndpoints` se apne endpoints
 * yahan add karti hain, taake cache aur tags share hon.
 *
 * credentials: "include" zaroori hai — admin ka token httpOnly cookie mein
 * aata hai, aur uske bagair browser wo cookie request ke sath bhejta hi nahi.
 * baseUrl "/api" hai kyunke vite dev server isay backend par proxy karta hai.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Auth", "Product", "Category", "Order", "User", "Comment", "Stats"],
  endpoints: () => ({}),
});

// Backend har error ko { message } shape mein bhejta hai
export const getApiError = (error, fallback = "Something went wrong") =>
  error?.data?.message || error?.error || fallback;
