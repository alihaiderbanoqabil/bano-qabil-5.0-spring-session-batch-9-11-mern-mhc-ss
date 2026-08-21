import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Ek hi RTK Query API slice, jis mein baqi files apne endpoints
 * `injectEndpoints` se add karti hain. Faida: ek shared cache, ek shared
 * tag system — is liye `invalidatesTags` kisi bhi file ke query ko refetch
 * kara sakta hai.
 *
 * credentials: "include" zaroori hai — auth token httpOnly cookie mein aata
 * hai, aur uske bagair browser wo cookie request ke sath bhejta hi nahi.
 * baseUrl "/api" hai (poora localhost:5000 nahi) kyunke vite dev server isay
 * backend par proxy karta hai, jis se sab kuch same-origin ban jata hai.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Auth", "Product", "Category", "Order", "Comment"],
  endpoints: () => ({}),
});

// Backend har error ko { message } shape mein bhejta hai — components ko
// hamesha wahi string chahiye hoti hai, is liye ek jagah nikaal lete hain.
export const getApiError = (error, fallback = "Something went wrong") =>
  error?.data?.message || error?.error || fallback;
