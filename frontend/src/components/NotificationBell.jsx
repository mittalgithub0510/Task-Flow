import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { count } = await notificationService.getNotificationCount();
      const unreadList = await notificationService.getUnreadNotifications();
      setUnreadCount(count);
      setNotifications(unreadList.slice(0, 5)); // Show top 5 unread in dropdown
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    setIsOpen(false);
    
    // Navigate based on type
    if (notif.type.startsWith('task')) navigate('/tasks');
    else if (notif.type.startsWith('project')) navigate('/projects');
    else if (notif.type.startsWith('announcement')) navigate('/announcements');
    else navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-100 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="bg-blue-50 p-3 border-b flex justify-between items-center">
            <h3 className="font-bold text-blue-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline font-semibold">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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
                      {n.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      {n.title}
                    </h4>
                    {!n.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  
                  {(n.oldValue || n.newValue) && (
                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded flex flex-col gap-1">
                      {n.oldValue && <div className="text-gray-500"><span className="line-through">{n.oldValue}</span></div>}
                      {n.newValue && <div className="text-green-600 font-medium">{n.newValue}</div>}
                    </div>
                  )}

                  {n.actionDetails && (
                    <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-1.5 rounded inline-block">
                      {n.actionDetails}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
    </div>
  );
};

export default NotificationBell;
