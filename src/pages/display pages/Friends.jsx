import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Check, X, Users, Clock, Send, MessageCircle } from 'lucide-react';
import _ from 'lodash';

export default function FriendsPage({ friendRequests, setFriendRequests, setHasNewRequests }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMessage = () => {
    console.log('Message clicked');
  };

  // Base API URL - adjust this to match your backend
  const API_BASE_URL = `${import.meta.env.VITE_BASE_URI}`;

  // Helper function for API calls
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include',
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API call error:', err);
      throw err;
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const data = await apiCall(`${API_BASE_URL}/friend/requests/pending`);
      setPendingRequests(data || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to fetch pending requests');
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async () => {
    try {
      const data = await apiCall(`${API_BASE_URL}/friend/requests/sent`);
      setSentRequests(data || []);
    } catch (err) {
      console.error('Error fetching sent requests:', err);
      setError('Failed to fetch sent requests');
    }
  };

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const data = await apiCall(`${API_BASE_URL}/friend/friends`);
      setFriends(data || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to fetch friends');
    }
  };

  // Search users
  const fetchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await apiCall(`${API_BASE_URL}/user/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data || []);
      setError('');
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetchUsers = useCallback(_.debounce(fetchUsers, 500), []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetchUsers(value);
  };

  // Send friend request
  const handleSendRequest = async (user) => {
    try {
      await apiCall(`${API_BASE_URL}/friend/requests`, {
        method: 'POST',
        body: {
          receiverId: user.id
        }
      });
      
      // Remove user from search results
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
      
      // Refresh sent requests
      await fetchSentRequests();
      
      setError('');
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err.message || 'Failed to send friend request');
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (request) => {
    try {
      await apiCall(`${API_BASE_URL}/friend/accept`, {
        method: 'POST',
        body: {
          senderId: request.id
        }
      });
      
      // Refresh all lists
      await Promise.all([
        fetchPendingRequests(),
        fetchFriends()
      ]);
      
      setError('');
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request');
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (senderId) => {
    try {
      await apiCall(`${API_BASE_URL}/friend/decline`, {
        method: 'POST',
        body: {
          senderId: senderId
        }
      });
      
      // Refresh pending requests
      await fetchPendingRequests();
      
      setError('');
    } catch (err) {
      console.error('Error declining friend request:', err);
      setError('Failed to decline friend request');
    }
  };

  // Cancel sent request
  const handleCancelRequest = async (requestId) => {
    try {
      await apiCall(`${API_BASE_URL}/friend/cancel`, {
        method: 'POST',
        body: {
          receiverId: requestId
        }
      });
      
      // Refresh sent requests
      await fetchSentRequests();
      
      setError('');
    } catch (err) {
      console.error('Error cancelling friend request:', err);
      setError('Failed to cancel friend request');
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchPendingRequests();
    fetchSentRequests();
    fetchFriends();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#161A1D]">
      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-600/20 border border-red-600 text-red-400 rounded-lg text-sm">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-300 hover:text-red-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Friends</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your connections and friend requests
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              {friends.length} Friends
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid grid-cols-4 gap-1 bg-[#384148] p-1 rounded-lg border border-[#384148]">
          {[
            { id: 'search', label: 'Search', icon: Search },
            { id: 'requests', label: 'Requests', icon: Clock, count: pendingRequests.length },
            { id: 'sent', label: 'Sent', icon: Send, count: sentRequests.length },
            { id: 'friends', label: 'Friends', icon: Users, count: friends.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 px-2 py-3 sm:py-2 rounded-md transition-all min-h-[60px] sm:min-h-0 ${
                activeTab === tab.id
                  ? 'bg-[#2d3339] text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center space-x-1">
                <tab.icon className="w-4 h-4" />
                {tab.count > 0 && (
                  <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center sm:text-left">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search friends by username"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-[#2d3339] border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div key={user.id} className="bg-[#2d3339] rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-slate-300 font-semibold text-sm">
                              {getInitials(user.name || user.username)}
                            </span>
                          </div>
                          {user.status && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#2d3339] ${getStatusColor(user.status)}`}></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-100 text-sm truncate">{user.name || user.username}</h3>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user)}
                        className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ml-3 flex-shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">Add</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>Start typing to search for friends</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
                Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} className="bg-[#2d3339] rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-slate-300 font-semibold text-sm">
                          {getInitials(request.name || request.username)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 text-sm truncate">{request.name || request.username}</h3>
                      <p className="text-xs text-slate-400 truncate">{request.email}</p>
                      <p className="text-xs text-slate-500 mt-1">{request.timestamp || request.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => handleAcceptRequest(request)}
                      className="flex items-center justify-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex-1 sm:flex-none"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Accept</span>
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="flex items-center justify-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-1 sm:flex-none"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Decline</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No pending friend requests</p>
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
                Sent Requests ({sentRequests.length})
              </h2>
            </div>
            {sentRequests.length > 0 ? (
              sentRequests.map(request => (
                <div key={request.id} className="bg-[#2d3339] rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-slate-300 font-semibold text-sm">
                          {getInitials(request.name || request.username)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 text-sm truncate">{request.name || request.username}</h3>
                      <p className="text-xs text-slate-400 truncate">{request.email}</p>
                      <p className="text-xs text-slate-500 mt-1">Sent {request.timestamp || request.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      Pending
                    </span>
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Send className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No sent friend requests</p>
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
                Friends ({friends.length})
              </h2>
            </div>
            {friends.length > 0 ? (
              friends.map(friend => (
                <div key={friend.id} className="bg-[#2d3339] rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-slate-300 font-semibold text-sm">
                          {getInitials(friend.name || friend.username)}
                        </span>
                      </div>
                      {friend.status && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#2d3339] ${getStatusColor(friend.status)}`}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 text-sm truncate">{friend.name || friend.username}</h3>
                      <p className="text-xs text-slate-400 truncate">{friend.email}</p>
                      {friend.status && (
                        <p className="text-xs text-slate-500 capitalize mt-1">
                          {friend.status} · Last seen {friend.lastSeen || 'recently'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <button 
                      className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex items-center justify-center space-x-2" 
                      onClick={handleMessage}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Message</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No friends yet</p>
                <p className="text-sm mt-1">Start by searching for people to connect with</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}