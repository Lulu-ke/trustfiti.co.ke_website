import React from 'react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { MessageSquare, Star, Flag, Bell } from 'lucide-react';
import type { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
}

const iconMap: Record<string, React.ReactNode> = {
  review_reply: <MessageSquare className="h-4 w-4" />,
  review_featured: <Star className="h-4 w-4" />,
  review_flagged: <Flag className="h-4 w-4" />,
};

export default function NotificationList({ notifications }: NotificationListProps) {
  return (
    <ul className="divide-y divide-gray-50">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <button
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
              !notification.isRead && 'bg-emerald-50/50'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                !notification.isRead
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {iconMap[notification.type] || <Bell className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm truncate',
                  !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                )}
              >
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {notification.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
            </div>

            {/* Unread dot */}
            {!notification.isRead && (
              <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
