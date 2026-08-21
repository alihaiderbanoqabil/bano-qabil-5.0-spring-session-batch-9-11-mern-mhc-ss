import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, PackagePlus, Truck, CreditCard, Check } from "lucide-react";
import {
  markAllRead,
  clearNotifications,
  selectNotifications,
  selectUnreadCount,
} from "../store/slices/notificationSlice";

const ICONS = {
  product: PackagePlus,
  order: Truck,
  payment: CreditCard,
};

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const items = useSelector(selectNotifications);
  const unread = useSelector(selectUnreadCount);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Bahar click karne par dropdown band
  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const toggle = () => {
    setOpen((value) => {
      // Kholte waqt sab padha hua mark kar dete hain
      if (!value && unread) dispatch(markAllRead());
      return !value;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
      >
        <Bell size={20} />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {items.length ? (
              <button
                type="button"
                onClick={() => dispatch(clearNotifications())}
                className="text-xs font-medium text-slate-500 transition hover:text-rose-600"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Check className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">You are all caught up</p>
              <p className="mt-1 text-xs text-slate-400">
                New products and order updates show up here instantly
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {items.map((item) => {
                const Icon = ICONS[item.kind] || Bell;

                return (
                  <li key={item.id}>
                    <Link
                      to={item.link || "#"}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <span className="mt-0.5 rounded-lg bg-brand-50 p-1.5">
                        <Icon className="h-4 w-4 text-brand-600" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800">{item.title}</span>
                        {item.body ? (
                          <span className="block truncate text-xs text-slate-500">{item.body}</span>
                        ) : null}
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
