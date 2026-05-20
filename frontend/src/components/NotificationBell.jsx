import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isInitialLoad = useRef(true);
  // Track IDs of notifications already shown as toasts so they never repeat
  const shownToastIds = useRef(new Set());

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { count } = await notificationService.getNotificationCount();
      const unreadList = await notificationService.getUnreadNotifications();

      if (!isInitialLoad.current) {
        // Show toasts only for truly new notifications not yet shown
        unreadList.forEach(n => {
          if (!shownToastIds.current.has(n._id)) {
            shownToastIds.current.add(n._id);
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="ml-1 flex-1">
                      <p className="text-sm font-bold text-gray-900">{n.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{n.message}</p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => { toast.dismiss(t.id); handleMarkAsRead(n._id); }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {/* X icon instead of Close text */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ), { duration: Infinity, id: n._id });
          }
        });
      } else {
        // On initial load: seed the shownToastIds so existing unread never pop up
        unreadList.forEach(n => shownToastIds.current.add(n._id));
        isInitialLoad.current = false;
      }

      setUnreadCount(count);
      setNotifications(unreadList.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    // Optimistic: remove instantly from UI
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(); // sync with server in background
    } catch (err) {
      console.error(err);
      fetchNotifications(); // revert on error
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic: clear all instantly from UI
    setNotifications([]);
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(); // sync in background
    } catch (err) {
      console.error(err);
      fetchNotifications(); // revert on error
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) await handleMarkAsRead(notif._id);
    setIsOpen(false);
    if (notif.type?.startsWith('task')) navigate('/tasks');
    else if (notif.type?.startsWith('project')) navigate('/projects');
    else if (notif.type?.startsWith('announcement')) navigate('/announcements');
    else navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop dropdown — hidden on mobile (mobile uses /notifications page) */}
      {isOpen && (
        <div className="hidden lg:block absolute right-0 mt-2 w-96 bg-white border border-gray-100 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="bg-blue-50 p-3 border-b flex justify-between items-center">
            <h3 className="font-bold text-blue-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline font-semibold">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm">You're all caught up!</span>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`p-4 border-b hover:bg-gray-50 flex flex-col gap-1 transition cursor-pointer ${n.priority === 'high' ? 'bg-red-50' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      {n.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      {n.title}
                    </h4>
                    {!n.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.sender && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">By {n.sender.name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 p-3 text-center border-t">
            <button
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Mobile: full-screen slide-down notification panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex flex-col" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full shadow-2xl rounded-b-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto no-scrollbar flex-1">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-medium">You're all caught up!</span>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    className={`px-5 py-4 border-b border-gray-100 active:bg-gray-50 transition cursor-pointer ${n.priority === 'high' ? 'bg-red-50/60' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        {n.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
                        {n.title}
                      </h4>
                      {!n.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{n.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.sender && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">By {n.sender.name}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 safe-area-bottom">
              <button
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full text-sm font-bold text-blue-600 bg-blue-50 py-3 rounded-xl hover:bg-blue-100 transition"
              >
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
