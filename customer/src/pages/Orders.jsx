import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useGetMyOrdersQuery } from "../store/api/orderApi";
import { formatCurrency, formatDate, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES } from "../utils/format";

const STATUS_FILTERS = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading, isFetching, error, refetch } = useGetMyOrdersQuery({
    page,
    limit: 10,
    sort: "-createdAt",
    ...(status ? { status } : {}),
  });

  if (isLoading) return <Spinner label="Loading your orders..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const orders = data?.data || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My orders</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium capitalize transition ${
              status === value
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {value || "All"}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={status ? `No ${status} orders` : "No orders yet"}
          description="When you place an order it will show up here."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      ) : (
        <>
          <ul className={`space-y-3 ${isFetching ? "opacity-60 transition" : ""}`}>
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
                >
                  <div className="min-w-40 flex-1">
                    <p className="font-mono text-xs text-slate-400">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        ORDER_STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        PAYMENT_STATUS_STYLES[order.paymentStatus] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-base font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>

          <Pagination pagination={data.pagination} onChange={setPage} />
        </>
      )}
    </div>
  );
}
