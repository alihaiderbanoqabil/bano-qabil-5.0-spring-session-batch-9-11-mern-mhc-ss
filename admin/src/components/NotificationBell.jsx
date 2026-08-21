import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Button, Dropdown, Empty, List, Typography } from "antd";
import { BellOutlined, ShoppingCartOutlined, DollarOutlined } from "@ant-design/icons";
import {
  markAllRead,
  clearNotifications,
  selectNotifications,
  selectUnreadCount,
} from "../store/slices/notificationSlice";

const ICONS = {
  order: <ShoppingCartOutlined style={{ color: "#4f46e5" }} />,
  payment: <DollarOutlined style={{ color: "#16a34a" }} />,
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

  const panel = (
    <div style={{ width: 340, background: "#fff", borderRadius: 8, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography.Text strong>Notifications</Typography.Text>
        {items.length ? (
          <Button type="link" size="small" danger onClick={() => dispatch(clearNotifications())}>
            Clear all
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="New orders and payments appear here instantly"
          style={{ padding: "24px 16px" }}
        />
      ) : (
        <List
          size="small"
          style={{ maxHeight: 320, overflowY: "auto" }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item style={{ padding: "10px 16px" }}>
              <List.Item.Meta
                avatar={ICONS[item.kind] || <BellOutlined />}
                title={
                  item.link ? (
                    <Link to={item.link} style={{ fontSize: 13 }}>
                      {item.title}
                    </Link>
                  ) : (
                    <span style={{ fontSize: 13 }}>{item.title}</span>
                  )
                }
                description={
                  <span style={{ fontSize: 12 }}>
                    {item.body} · <span style={{ color: "#9ca3af" }}>{timeAgo(item.createdAt)}</span>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => panel}
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => {
        if (open && unread) dispatch(markAllRead());
      }}
    >
      <Badge count={unread} size="small" offset={[-4, 4]}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} style={{ height: 44 }} />
      </Badge>
    </Dropdown>
  );
}
