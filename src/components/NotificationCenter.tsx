import React, { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Notification } from '../types';
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    // Load notifications from localStorage or create defaults
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    } else {
      // Default notifications
      const defaults: Notification[] = [{
        id: '1',
        title: 'Welcome to FinGenius',
        message: 'Start by setting up your profile and goals.',
        type: 'info',
        date: new Date().toISOString(),
        read: false
      }, {
        id: '2',
        title: 'Log Expenses',
        message: "Don't forget to log your daily expenses for better tracking.",
        type: 'warning',
        date: new Date().toISOString(),
        read: false
      }];
      setNotifications(defaults);
      setUnreadCount(defaults.length);
      localStorage.setItem('notifications', JSON.stringify(defaults));
    }
  }, []);
  const toggleOpen = () => setIsOpen(!isOpen);
  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => n.id === id ? {
      ...n,
      read: true
    } : n);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  const markAllRead = () => {
    const updated = notifications.map((n) => ({
      ...n,
      read: true
    }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  return <div className="relative">
      <button onClick={toggleOpen} className="p-2.5 text-charcoal-600 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-all duration-300 relative group">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {isOpen && <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-warm-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-charcoal font-serif">
              Notifications
            </h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-coral hover:text-coral-600 font-medium">
                Mark all read
              </button>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? <div className="p-8 text-center text-charcoal-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications</p>
              </div> : <div className="divide-y divide-gray-50">
                {notifications.map((notification) => <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-coral-50/10' : ''}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-coral"></span>}
                          <h4 className={`text-sm font-semibold ${!notification.read ? 'text-charcoal' : 'text-charcoal-600'}`}>
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-xs text-charcoal-500 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-charcoal-400 mt-2">
                          {new Date(notification.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={(e) => dismissNotification(notification.id, e)} className="text-charcoal-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>}
    </div>;
}