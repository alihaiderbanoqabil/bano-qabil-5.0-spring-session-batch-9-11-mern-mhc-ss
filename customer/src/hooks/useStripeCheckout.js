import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateCheckoutSessionMutation } from "../store/api/paymentApi";
import { getApiError } from "../store/api/baseApi";

/**
 * Order ke liye Stripe Checkout session banata hai aur browser ko wahan bhej
 * deta hai. `true` wapis kare to redirect ho gaya (caller ko aage kuch nahi
 * karna), `false` ka matlab masla hua aur toast dikha diya gaya hai.
 *
 * window.location use karte hain (navigate nahi) — Stripe ka page hamare app
 * se bahar hai, is liye ye poora page navigation hai.
 */
export function useCreatePaymentSessionForOrder() {
  const [createSession] = useCreateCheckoutSessionMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const startPayment = async (orderId) => {
    setIsRedirecting(true);

    try {
      const { url } = await createSession({ orderId }).unwrap();
      if (!url) throw new Error("No checkout URL returned");

      window.location.href = url;
      return true;
    } catch (error) {
      setIsRedirecting(false);
      toast.error(getApiError(error, "Could not start the payment"));
      return false;
    }
  };

  return { startPayment, isRedirecting };
}
