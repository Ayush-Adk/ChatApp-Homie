import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Phone, Video, Smile, Paperclip as PaperClip, Send, Search, UserPlus, Image, Mic, Camera } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import AddContactModal from '../components/AddContactModal';

export default function Chat() {
  const { currentChat, messages, sendMessage, loadMessages } = useChatStore();
  const { user } = useAuthStore();
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
    }
  }, [currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    setIsTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput, 'text');
      setMessageInput('');
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    const cursor = inputRef.current?.selectionStart || messageInput.length;
    const text = messageInput.slice(0, cursor) + emojiData.emoji + messageInput.slice(cursor);
    setMessageInput(text);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      const newCursor = cursor + emojiData.emoji.length;
      inputRef.current?.setSelectionRange(newCursor, newCursor);
      inputRef.current?.focus();
    }, 0);
  };

  const handleAttachment = (type: string) => {
    // Handle different attachment types
    setShowAttachMenu(false);
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Select a chat or start a new conversation</p>
        <button
          onClick={() => setShowAddContact(true)}
          className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Contact
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentChat.name || 'Chat'}
            </h3>
            {isTyping && (
              <span className="text-sm text-gray-500">typing...</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Smile className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <PaperClip className="h-5 w-5 text-gray-600" />
              </button>
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <button
                    type="button"
                    onClick={() => handleAttachment('image')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <Image className="h-5 w-5 text-gray-600" />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttachment('audio')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <Mic className="h-5 w-5 text-gray-600" />
                    <span>Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttachment('video')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <Camera className="h-5 w-5 text-gray-600" />
                    <span>Video</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative flex items-end space-x-2">
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <textarea
              ref={inputRef}
              rows={1}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px] max-h-[120px]"
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '120px'
              }}
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      <AddContactModal isOpen={showAddContact} onClose={() => setShowAddContact(false)} />
    </div>
  );
}