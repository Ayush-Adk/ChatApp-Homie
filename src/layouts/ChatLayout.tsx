import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { MessageSquare, Search, Settings, LogOut } from 'lucide-react';

export default function ChatLayout() {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const { chats, loadChats, setCurrentChat, currentChat } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-gray-200">
        {/* User profile section */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user.email}
              </span>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p>No chats yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChat(chat)}
                  className={`w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 ${
                    currentChat?.id === chat.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {chat.name || 'Chat'}
                      </span>
                      {chat.last_message_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(chat.last_message_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="border-t border-gray-200 p-4">
          <button 
            onClick={() => navigate('/chat/settings')}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}