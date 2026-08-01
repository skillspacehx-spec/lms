'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  receiver: {
    _id: string;
    name: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  lastMessage: Message;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessagingSystemProps {
  recipientId?: string;
  recipientName?: string;
}

export default function MessagingSystem({ recipientId }: MessagingSystemProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If recipientId is provided, create/select conversation
  useEffect(() => {
    if (recipientId && isOpen) {
      const existingConv = conversations.find(
        c => c.otherUser._id === recipientId
      );
      if (existingConv) {
        setSelectedConversation(existingConv._id);
      }
    }
  }, [recipientId, conversations, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/${conversationId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const selectedConv = conversations.find(c => c._id === selectedConversation);
    if (!selectedConv && !recipientId) return;

    const receiverId = selectedConv?.otherUser._id || recipientId;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          receiverId,
          content: newMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvData = conversations.find(c => c._id === selectedConversation);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#7AC2F9] text-white rounded-full p-4 shadow-lg hover:bg-[#5AA3D9] transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
        {conversations.filter(c => c.unreadCount > 0).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-[#7AC2F9] text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations List */}
            {!selectedConversation && (
              <div className="flex-1 flex flex-col">
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                      <MessageCircle className="w-12 h-12 mb-2" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start chatting with a tutor!</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv._id)}
                        className="w-full p-4 hover:bg-gray-50 border-b flex items-start gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#7AC2F9] flex items-center justify-center text-white font-semibold shrink-0">
                          {conv.otherUser.avatar ? (
                            <img
                              src={conv.otherUser.avatar}
                              alt={conv.otherUser.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            conv.otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {conv.otherUser.name}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="bg-[#7AC2F9] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Message Thread */}
            {selectedConversation && selectedConvData && (
              <div className="flex-1 flex flex-col">
                {/* Thread Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ←
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#7AC2F9] flex items-center justify-center text-white text-sm font-semibold">
                    {selectedConvData.otherUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">
                      {selectedConvData.otherUser.name}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {selectedConvData.otherUser.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7AC2F9]"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender._id === user?.id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg p-3 ${
                              isOwnMessage
                                ? 'bg-[#7AC2F9] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#7AC2F9] text-white p-2 rounded-lg hover:bg-[#5AA3D9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
