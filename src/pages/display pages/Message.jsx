import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2, Clock } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatModal = ({ isOpen, onClose, friend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
const [currentUserId,setUser] = useState('me');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Socket.IO connection
  useEffect(() => {
          axios.get('http://localhost:8080/user/data',{withCredentials:true})
        .then((response) => {
          setUser(response.data._id);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
        console.log(currentUserId);
        
    if (!isOpen || !friend || currentUserId==='me') return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:8080/', {
      auth: {
        userId: currentUserId
      }
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Join the chat room
      socket.emit('joinChat', {
        userId: currentUserId,
        friendId: friend.id
      });

      // Send any pending messages
      if (pendingMessages.length > 0) {
        pendingMessages.forEach(messageData => {
          socket.emit('sendMessage', messageData);
        });
        setPendingMessages([]);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Message event handlers
    socket.on('messageReceived', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Remove from pending messages if it was sent successfully
      setPendingMessages(prev => prev.filter(pending => 
        pending.timestamp !== message.timestamp || pending.message !== message.message
      ));
    });

    socket.on('messageHistory', (history) => {
      setMessages(history);
      setLoading(false);
    });

    // Typing indicators
    socket.on('userTyping', ({ userId, isTyping }) => {
      if (userId === friend.id) {
        setIsTyping(isTyping);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Load chat history
    setLoading(true);
    socket.emit('getChatHistory', {
      userId: currentUserId,
      friendId: friend.id
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [isOpen, friend, currentUserId, pendingMessages]);

  // Send message (works offline too)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: friend.id,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random() // Temporary ID for tracking
    };

    // Add to local messages immediately for instant feedback
    const localMessage = {
      ...messageData,
      status: isConnected ? 'sending' : 'pending'
    };

    setMessages(prev => [...prev, localMessage]);
    setNewMessage('');

    if (socketRef.current && isConnected) {
      // Send immediately if connected
      socketRef.current.emit('sendMessage', messageData);
    } else {
      // Queue for later if not connected
      setPendingMessages(prev => [...prev, messageData]);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socketRef.current || !isConnected) return;

    // Emit typing event
    socketRef.current.emit('typing', {
      userId: currentUserId,
      friendId: friend.id,
      isTyping: true
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', {
        userId: currentUserId,
        friendId: friend.id,
        isTyping: false
      });
    }, 2000);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get message status indicator
  const getMessageStatus = (message) => {
    if (message.status === 'pending') {
      return <Clock className="w-3 h-3 text-yellow-400 ml-1" />;
    }
    if (message.status === 'sending') {
      return <Loader2 className="w-3 h-3 text-blue-400 ml-1 animate-spin" />;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d3339] rounded-lg w-full max-w-md h-[600px] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-slate-300 font-semibold text-sm">
                {getInitials(friend.name || friend.username)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                {friend.name || friend.username}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-slate-400">
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
                {pendingMessages.length > 0 && (
                  <span className="text-xs text-yellow-400">
                    ({pendingMessages.length} pending)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div
                  key={message.id || index}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <div className={`flex items-center justify-between text-xs mt-1 ${
                      isOwn ? 'text-emerald-200' : 'text-slate-400'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isOwn && getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-slate-400 ml-2">typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-700">
          {!isConnected && (
            <div className="mb-2 text-xs text-yellow-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Messages will be sent when connection is restored
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder={isConnected ? "Type a message..." : "Type a message (will send when connected)..."}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;