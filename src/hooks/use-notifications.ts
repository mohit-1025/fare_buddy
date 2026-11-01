import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
  type AppNotification,
} from '@/lib/notifications';

export function useNotifications() {
  const { profile, user } = useAuth();
  const userId = user?.id ?? profile?.id ?? null;
  const [items, setItems] = React.useState<AppNotification[]>([]);

  React.useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    setItems(loadNotifications(userId));
    return subscribeNotifications(userId, () => setItems(loadNotifications(userId)));
  }, [userId]);

  const markRead = React.useCallback(
    (id: string) => {
      if (userId) markNotificationRead(userId, id);
    },
    [userId],
  );

  const markAllRead = React.useCallback(() => {
    if (userId) markAllNotificationsRead(userId);
  }, [userId]);

  return {
    items,
    unreadCount: items.filter((notification) => !notification.read).length,
    markRead,
    markAllRead,
  };
}
