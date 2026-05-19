import { useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Notifications..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead} 
            className="text-sm font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You have no notifications at this time.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div key={n._id} className={`p-6 transition ${!n.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {!n.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></div>}
                      <h3 className="text-lg font-bold text-gray-800">{n.title}</h3>
                      {n.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-red-100 text-red-700">Urgent</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{n.message}</p>
                    
                    {(n.oldValue || n.newValue || n.actionDetails) && (
                      <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                        {n.actionDetails && <div className="font-semibold text-gray-700 mb-2">{n.actionDetails}</div>}
                        {(n.oldValue || n.newValue) && (
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            {n.oldValue && (
                              <div className="flex-1 w-full bg-red-50 text-red-700 p-2 rounded border border-red-100">
                                <span className="text-xs uppercase font-bold text-red-400 block mb-1">Previous</span>
                                {n.oldValue}
                              </div>
                            )}
                            {n.oldValue && n.newValue && <span className="text-gray-300 font-bold">➔</span>}
                            {n.newValue && (
                              <div className="flex-1 w-full bg-green-50 text-green-700 p-2 rounded border border-green-100">
                                <span className="text-xs uppercase font-bold text-green-400 block mb-1">Updated To</span>
                                {n.newValue}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.sender && <span>Action by: <span className="text-gray-700">{n.sender.name}</span></span>}
                      {n.project && <span>Project: <span className="text-blue-600">{n.project.title}</span></span>}
                      {n.task && <span>Task: <span className="text-purple-600">{n.task.title}</span></span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(n._id)}
                        className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded font-medium border border-blue-200 transition"
                      >
                        Mark Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(n._id)}
                      className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
