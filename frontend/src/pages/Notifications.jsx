import { useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

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
    try { await notificationService.markAsRead(id); fetchNotifications(); } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllAsRead(); fetchNotifications(); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await notificationService.deleteNotification(id); fetchNotifications(); } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner text="Loading Notifications..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs lg:text-sm font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white border border-solid border-black rounded-xl p-10 text-center text-gray-500 text-sm">You have no notifications.</div>
        ) : (
          notifications.map(n => (
            <div key={n._id} className={`border border-solid border-black rounded-xl p-4 lg:p-5 transition ${!n.isRead ? 'bg-blue-50/40' : 'bg-white'}`}>
              <div className="flex flex-col gap-3">
                {/* Title row */}
                <div className="flex items-start gap-2">
                  {!n.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-gray-800 break-words">{n.title}</h3>
                      {n.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700 shrink-0">Urgent</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{n.message}</p>
                  </div>
                </div>

                {/* Details block */}
                {(n.oldValue || n.newValue || n.actionDetails) && (
                  <div className="text-xs">
                    {n.actionDetails && <div className="font-semibold text-gray-500 mb-1.5 text-[11px] uppercase tracking-wide">{n.actionDetails}</div>}
                    {(n.oldValue || n.newValue) && (
                      n.oldValue && n.newValue ? (
                        /* Both exist — side by side */
                        <div className="flex gap-2">
                          <div className="flex-1 bg-red-50 text-red-700 px-3 py-2.5 rounded-lg border border-red-100 text-center">
                            <span className="font-bold text-red-400 text-[10px] uppercase tracking-wide block mb-1">Previous</span>
                            <span className="font-semibold">{n.oldValue}</span>
                          </div>
                          <div className="flex-1 bg-green-50 text-green-700 px-3 py-2.5 rounded-lg border border-green-100 text-center">
                            <span className="font-bold text-green-400 text-[10px] uppercase tracking-wide block mb-1">Updated To</span>
                            <span className="font-semibold">{n.newValue}</span>
                          </div>
                        </div>
                      ) : n.newValue ? (
                        /* Only newValue — full width highlight */
                        <div className="w-full bg-green-50 text-green-800 px-4 py-3 rounded-lg border border-green-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-green-500 text-[10px] uppercase tracking-wide block mb-0.5">New</span>
                            <span className="font-bold text-base">{n.newValue}</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        /* Only oldValue */
                        <div className="w-full bg-red-50 text-red-700 px-3 py-2.5 rounded-lg border border-red-100 text-center">
                          <span className="font-bold text-red-400 text-[10px] uppercase tracking-wide block mb-1">Previous</span>
                          <span className="font-semibold">{n.oldValue}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-gray-400">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.sender && <span>By: <span className="text-gray-600">{n.sender.name}</span></span>}
                  {n.project && <span>Project: <span className="text-blue-500">{n.project.title}</span></span>}
                  {n.task && <span>Task: <span className="text-purple-500">{n.task.title}</span></span>}
                </div>

                {/* Action buttons — always right-aligned */}
                <div className="flex items-center justify-end gap-3">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold border border-blue-200 transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
