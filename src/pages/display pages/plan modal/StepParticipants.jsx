import React, { useState, useEffect } from "react";
import { Search, UserPlus, X, Users, Crown } from "lucide-react";
import axios from "axios";
import { use } from "react";

function deduplicateParticipants(participants) {
  return participants.reduce((acc, participant) => {
    const id = participant.id || participant._id;
    if (!acc.some((p) => (p.id || p._id) === id)) {
      acc.push(participant);
    }
    return acc;
  }, []);
}

export default function StepParticipants({ formData, setFormData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [friends, setFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const apiCall = async (url, options = {}) => {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : undefined;

    const config = {
      url,
      method,
      data: body,
      headers: options.headers || {},
    };

    const res = await axiosInstance(config);
    return res.data;
  };

  // Fetch current user data from cookies/token
  const fetchCurrentUser = async () => {
    try {
      const data = await apiCall(`${API_BASE_URL}/user/data`); // Adjust endpoint as needed

      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching current user:", err);
      // If API call fails, try to get user info from local storage or another method
      // For now, we'll create a fallback
      const fallbackUser = {
        id: "current-user",
        name: "You",
        email: "your-email@example.com",
        avatar: "Y",
      };
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      // Fetch current user first
      const user = await fetchCurrentUser(); // Wait for the user to be fetched

      // Add current user to participants if not already added
      if (
        formData.participants.length === 0 &&
        user &&
        !formData.participants.some(
          (p) => p.id === user.id || p.id === user._id
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          participants: [
            {
              id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar || user.name.charAt(0).toUpperCase(),
              isCurrentUser: true, // Fixed: should be true for current user
              status: "confirmed",
            },
            
          ],
        }));
      }

      // Fetch friends
      const fetchFriends = async () => {
        try {
          const data = await apiCall(`${API_BASE_URL}/friend/friends`);
          setFriends(data || []);
        } catch (err) {
          console.error("Error fetching friends:", err);
          setError("Failed to fetch friends");
        }
      };

      fetchFriends();
    };

    initializeComponent();
        setFormData((prev) => ({
      ...prev,
      participants: deduplicateParticipants(prev.participants),
    }));

    
  }, []); // Remove formData dependency to avoid infinite loops



  // Mock API function - replace with your actual API endpoint
  const searchFriends = async (query) => {
    const mockFriends = friends;
    console.log(searchQuery);

    return mockFriends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(query.toLowerCase()) ||
        friend.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim() && searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchFriends(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, friends]); // Add friends dependency

  const handleAddParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          id: `temp-${Date.now()}`,
          name: "",
          email: "",
          avatar: "",
          isCurrentUser: false,
          status: "confirmed",
        },
      ],
    }));
  };

  const handleAddFriend = (friend) => {
    // Check if friend is already in participants
    if (
      !formData.participants.some(
        (p) => p.id === friend.id || p.id === friend._id
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: friend._id || friend.id,
            name: friend.name,
            email: friend.email,
            avatar: friend.avatar || friend.name.charAt(0).toUpperCase(),
            isCurrentUser: false,
            status: "confirmed",
          },
        ],
      }));
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...formData.participants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, participants: updated }));
  };

  const handleRemove = (index) => {
    // Don't allow removing the current user
    if (formData.participants[index].isCurrentUser) {
      return;
    }

    const updated = formData.participants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, participants: updated }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({formData.participants.length})
        </h3>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
            Search Friends
          </button>
          <button
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1 transition-colors"
            onClick={handleAddParticipant}
          >
            <UserPlus className="w-4 h-4" />
            Add Manual
          </button>
        </div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search friends by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-3 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((friend) => (
                <div
                  key={friend.id || friend._id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => handleAddFriend(friend)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {friend.avatar || friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {friend.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {friend.email}
                      </div>
                    </div>
                  </div>
                  <UserPlus className="w-4 h-4 text-green-400" />
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="mt-3 text-center text-gray-400">
                No friends found matching "{searchQuery}"
              </div>
            )}
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-2">
        {formData.participants.map((participant, index) => (
          <div
            key={participant.id || index}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center gap-3 flex-1 p-2 bg-gray-800 rounded border border-gray-700">
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  participant.isCurrentUser ? "bg-yellow-600" : "bg-blue-600"
                }`}
              >
                {participant.avatar ||
                  participant.name.charAt(0).toUpperCase() ||
                  "?"}
              </div>

              {/* Participant Info */}
              <div className="flex-1">
                {participant.isCurrentUser ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {participant.name} (You)
                    </span>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      className="flex-1 p-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      value={participant.name}
                      onChange={(e) =>
                        handleParticipantChange(index, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                    <input
                      className="flex-1 p-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      value={participant.email}
                      onChange={(e) =>
                        handleParticipantChange(index, "email", e.target.value)
                      }
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      participant.status === "confirmed"
                        ? "bg-green-500"
                        : participant.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-400 capitalize">
                    {participant.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Remove button - disabled for current user */}
            <button
              onClick={() => handleRemove(index)}
              className={`p-1 rounded transition-colors ${
                participant.isCurrentUser
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-red-500 hover:text-red-400 hover:bg-red-500/10"
              }`}
              disabled={participant.isCurrentUser}
              title={
                participant.isCurrentUser
                  ? "Cannot remove yourself"
                  : "Remove participant"
              }
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {formData.participants.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No participants added yet</p>
          <p className="text-sm">Use the buttons above to add participants</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Participants:</span>
          <span className="text-white font-medium">
            {formData.participants.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-400">Including You:</span>
          <span className="text-green-400">
            {formData.participants.some((p) => p.isCurrentUser) ? "✓" : "✗"}
          </span>
        </div>
      </div>
    </div>
  );
}
