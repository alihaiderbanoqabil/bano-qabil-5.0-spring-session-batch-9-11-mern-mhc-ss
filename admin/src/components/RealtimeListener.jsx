import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { App } from "antd";
import { socket } from "../socket";
import { baseApi } from "../store/api/baseApi";
import { pushNotification } from "../store/slices/notificationSlice";
import { useGetMeQuery } from "../store/api/authApi";
import { formatCurrency } from "../utils/format";

/**
 * Socket.IO listener — UI nahi rakhta. Events ko antd notification, bell ki
 * list, aur RTK Query cache invalidation mein badalta hai (dashboard aur
 * orders table khud refresh ho jate hain).
 *
 * Server handshake par cookie dekh kar hamein "admins" room mein daalta hai,
 * is liye yahan sirf sunna hai — koi subscribe message bhejne ki zarorat nahi.
 */
export default function RealtimeListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { data: user } = useGetMeQuery();

  useEffect(() => {
    // Sirf logged-in admin ke liye — guest socket ko admins room nahi milta
    if (!user || user.role !== "admin") return;

    if (socket.connected) socket.disconnect();
    socket.connect();

    const onOrderNew = (payload) => {
      const short = `#${String(payload.orderId).slice(-8).toUpperCase()}`;

      dispatch(
        pushNotification({
          kind: "order",
          title: `New order ${short}`,
          body: `${payload.itemCount} item${payload.itemCount === 1 ? "" : "s"} · ${formatCurrency(payload.totalAmount)}`,
          link: `/orders?order=${payload.orderId}`,
          createdAt: payload.createdAt,
        })
      );

      notification.info({
        message: `New order ${short}`,
        description: `${payload.itemCount} item${payload.itemCount === 1 ? "" : "s"} · ${formatCurrency(payload.totalAmount)}`,
        placement: "bottomRight",
        onClick: () => navigate(`/orders?order=${payload.orderId}`),
        style: { cursor: "pointer" },
      });

      // Dashboard ke numbers aur orders table dono stale ho gaye
      dispatch(baseApi.util.invalidateTags(["Stats", { type: "Order", id: "LIST" }]));
    };

    const onOrderPayment = (payload) => {
      const short = `#${String(payload.orderId).slice(-8).toUpperCase()}`;
      const paid = payload.paymentStatus === "paid";

      dispatch(
        pushNotification({
          kind: "payment",
          title: paid ? `Payment received ${short}` : `Payment ${payload.paymentStatus} ${short}`,
          body: formatCurrency(payload.totalAmount),
          link: `/orders?order=${payload.orderId}`,
          createdAt: payload.createdAt,
        })
      );

      notification[paid ? "success" : "warning"]({
        message: paid ? `Payment received ${short}` : `Payment ${payload.paymentStatus} ${short}`,
        description: formatCurrency(payload.totalAmount),
        placement: "bottomRight",
      });

      dispatch(
        baseApi.util.invalidateTags([
          "Stats",
          { type: "Order", id: payload.orderId },
          { type: "Order", id: "LIST" },
        ])
      );
    };

    socket.on("order:new", onOrderNew);
    socket.on("order:payment", onOrderPayment);

    return () => {
      socket.off("order:new", onOrderNew);
      socket.off("order:payment", onOrderPayment);
    };
  }, [dispatch, navigate, notification, user]);

  return null;
}
