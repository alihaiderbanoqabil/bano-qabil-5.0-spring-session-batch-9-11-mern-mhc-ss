import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { PackagePlus, Truck, CreditCard } from "lucide-react";
import { socket } from "../socket";
import { baseApi } from "../store/api/baseApi";
import { pushNotification } from "../store/slices/notificationSlice";
import { useGetMeQuery } from "../store/api/authApi";
import { formatCurrency } from "../utils/format";

const STATUS_TEXT = {
  processing: "is being prepared",
  shipped: "has shipped",
  delivered: "was delivered",
  cancelled: "was cancelled",
  pending: "is pending",
};

/**
 * Socket.IO listener — UI nahi rakhta, sirf events ko toast + notification
 * list + RTK Query cache invalidation mein badalta hai.
 *
 * App ke andar ek hi jagah mount hota hai. `user` change hone par socket
 * dobara connect karte hain, kyunke room membership (user:<id>, admins)
 * handshake ke waqt cookie se tay hoti hai — login/logout ke baad purana
 * connection galat rooms mein hota hai.
 */
export default function RealtimeListener() {
  const dispatch = useDispatch();
  const { data: user } = useGetMeQuery();

  useEffect(() => {
    // Session badla to naya handshake
    if (socket.connected) socket.disconnect();
    socket.connect();

    const onProductNew = (payload) => {
      dispatch(
        pushNotification({
          kind: "product",
          title: "New product added",
          body: `${payload.name} — ${formatCurrency(payload.price)}`,
          link: `/products/${payload.productId}`,
          createdAt: payload.createdAt,
        })
      );

      toast.custom(
        (t) => (
          <Link
            to={`/products/${payload.productId}`}
            onClick={() => toast.dismiss(t.id)}
            className="flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition hover:border-brand-300"
          >
            <span className="rounded-lg bg-brand-50 p-2">
              <PackagePlus className="h-5 w-5 text-brand-600" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">New product added</span>
              <span className="block truncate text-xs text-slate-500">
                {payload.name} — {formatCurrency(payload.price)}
              </span>
            </span>
          </Link>
        ),
        { duration: 6000 }
      );

      // List par naya product dikhe, is liye product list ka cache stale karo
      dispatch(baseApi.util.invalidateTags([{ type: "Product", id: "LIST" }]));
    };

    const onOrderStatus = (payload) => {
      const short = `#${String(payload.orderId).slice(-8).toUpperCase()}`;
      const text = STATUS_TEXT[payload.status] || `is now ${payload.status}`;

      dispatch(
        pushNotification({
          kind: "order",
          title: `Order ${short} ${text}`,
          body: formatCurrency(payload.totalAmount),
          link: `/orders/${payload.orderId}`,
          createdAt: payload.createdAt,
        })
      );

      toast.custom(
        (t) => (
          <Link
            to={`/orders/${payload.orderId}`}
            onClick={() => toast.dismiss(t.id)}
            className="flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition hover:border-brand-300"
          >
            <span className="rounded-lg bg-emerald-50 p-2">
              <Truck className="h-5 w-5 text-emerald-600" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">
                Order {short} {text}
              </span>
              <span className="block text-xs text-slate-500">Tap to see the details</span>
            </span>
          </Link>
        ),
        { duration: 6000 }
      );

      dispatch(
        baseApi.util.invalidateTags([
          { type: "Order", id: payload.orderId },
          { type: "Order", id: "LIST" },
        ])
      );
    };

    const onOrderPayment = (payload) => {
      const short = `#${String(payload.orderId).slice(-8).toUpperCase()}`;
      const paid = payload.paymentStatus === "paid";

      dispatch(
        pushNotification({
          kind: "payment",
          title: paid ? `Payment received for ${short}` : `Payment ${payload.paymentStatus} for ${short}`,
          body: formatCurrency(payload.totalAmount),
          link: `/orders/${payload.orderId}`,
          createdAt: payload.createdAt,
        })
      );

      toast[paid ? "success" : "error"](
        paid ? `Payment received for order ${short}` : `Payment ${payload.paymentStatus} for order ${short}`,
        { icon: paid ? undefined : <CreditCard className="h-4 w-4" /> }
      );

      dispatch(
        baseApi.util.invalidateTags([
          { type: "Order", id: payload.orderId },
          { type: "Order", id: "LIST" },
        ])
      );
    };

    socket.on("product:new", onProductNew);
    socket.on("order:status", onOrderStatus);
    socket.on("order:payment", onOrderPayment);

    return () => {
      socket.off("product:new", onProductNew);
      socket.off("order:status", onOrderStatus);
      socket.off("order:payment", onOrderPayment);
    };
  }, [dispatch, user?._id]);

  return null;
}
