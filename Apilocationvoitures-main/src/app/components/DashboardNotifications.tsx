import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { ApiService } from "../services/api";
import { NotificationItem } from "../types";

export function DashboardNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    ApiService.getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Mes notifications</h2>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          {notifications.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Aucune notification active.</div>
        ) : notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={async () => {
              await ApiService.markNotificationRead(notification.id);
              setNotifications((current) => current.filter((item) => item.id !== notification.id));
            }}
            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">{notification.title}</p>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
