import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Server batata hai ke Stripe ki keys lagi hui hain ya nahi — uske hisab
    // se checkout par card option enable/disable karte hain
    getPaymentConfig: builder.query({
      query: () => "/payments/config",
    }),

    // Stripe ka hosted checkout page banata hai; wapis sirf uska URL aata hai
    createCheckoutSession: builder.mutation({
      query: (body) => ({ url: "/payments/checkout-session", method: "POST", body }),
    }),
  }),
});

export const { useGetPaymentConfigQuery, useCreateCheckoutSessionMutation } = paymentApi;
