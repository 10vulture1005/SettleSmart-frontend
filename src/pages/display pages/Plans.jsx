import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ChevronDown,
  Plus,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Share2,
  CreditCard,
  MapPin,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Mail,
  Check,
  X,
} from "lucide-react";
import PlanModals from "./plan modal/planmod";
import Settlement from "./settlement";

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      // Redirect to login or show auth error
    }
    return Promise.reject(error);
  }
);

// API Service Functions
const apiService = {
  // Fetch all plans for the current user
  getPlans: async () => {
    try {
      const response = await apiClient.get("/plan");
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch plans: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  },

  // Create a new plan
  createPlan: async (planData) => {
    try {
      const response = await apiClient.post("/plan/create", planData);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create plan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  },

  // Update an existing plan
  updatePlan: async (selectedIdx, planData) => {
    console.log(planData._id);
    
    try {
      const response = await apiClient.put(
        `plan/update/${selectedIdx}`,
        planData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update plan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  },

  // Delete a plan
  deletePlan: async (planId) => {
    try {
      const response = await apiClient.delete(`/plan/delete/${planId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete plan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  },

  // Share a plan
  sharePlan: async (planId, shareData) => {
    try {
      const response = await apiClient.post(
        `/api/plans/${planId}/share`,
        shareData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to share plan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  },
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [settleDropdowns, setSettleDropdowns] = useState({});

  // Add this function to toggle settle dropdown
  const toggleSettleDropdown = (planIndex) => {
    setSettleDropdowns((prev) => ({
      ...prev,
      [planIndex]: !prev[planIndex],
    }));
  };

  // Separate function to fetch plans data
  const fetchPlansData = async () => {
    try {
      setLoading(true);
      setError(null);

      const plansData = await apiService.getPlans();

      console.log(plansData);
      
      setPlans(plansData);

    } catch (error) {
      console.error("Error fetching plans:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPlansData();
  }, []);

  const handleModalSave = async (planData) => {
    try {
      setError(null);
      console.log(selectedPlan);

      if (selectedPlan) {
        // Editing existing plan
        await apiService.updatePlan(planData._id, planData);
        console.log("Plan updated successfully");
      } else {
        // Creating new plan
        console.log("Creating new plan with data:", planData);
        await apiService.createPlan(planData);
        console.log("Plan created successfully");
      }

      // Close modal first
      setIsModalOpen(false);
      setSelectedPlan(null);

      // Refetch all plans data from database to get the latest state
      await fetchPlansData();
    } catch (error) {
      console.error("Error saving plan:", error);
      setError(error.message);
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "travel":
        return "✈️";
      case "celebration":
        return "🎉";
      case "dining":
        return "🍽️";
      case "entertainment":
        return "🎬";
      default:
        return "📋";
    }
  };

  const togglePlanExpansion = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const filteredPlans = plans.plans ? plans.plans : [];



  const handleCreatePlan = () => {
    console.log("Creating new plan");
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

const handleEditPlan = async (index) => {
  try {
    setError(null);
    
    // Make a fresh API call to get the latest plans data
    console.log("Fetching latest plans data before editing...");
    const latestPlansData = await apiService.getPlans();
    const latestFilteredPlans = latestPlansData.plans ? latestPlansData.plans : [];
    
    // Get the specific plan we want to edit
    const planToEdit = latestFilteredPlans[index];
    
    if (!planToEdit) {
      setError("Plan not found. It may have been deleted or the index has changed.");
      return;
    }
    
    console.log("Editing plan with latest data:", planToEdit);
    
    // Update the local state with fresh data
    setPlans(latestPlansData);
    
    // Set the selected plan and index
    setSelectedIdx(index);
    setSelectedPlan(planToEdit);
    setIsModalOpen(true);
    
  } catch (error) {
    console.error("Error fetching latest plan data:", error);
    setError(`Failed to load latest plan data: ${error.message}`);
  }
};
  const handleDeletePlan = async (planId) => {
    try {
      setError(null);
      await apiService.deletePlan(planId);
      console.log("Plan deleted successfully");

      // Refetch plans data after deletion
      await fetchPlansData();
    } catch (error) {
      console.error("Error deleting plan:", error);
      setError(error.message);
    }
  };

  const handleSharePlan = async (index) => {
    try {
      setError(null);
      const plan = filteredPlans[index];
      
      
      const shareData = await apiService.sharePlan(plan.id, {
        shareMethod: "link",
      });

      // Copy share link to clipboard
      navigator.clipboard.writeText(shareData.shareLink);
      console.log("Plan shared successfully");
    } catch (error) {
      console.error("Error sharing plan:", error);
      setError(error.message);
      // Fallback to simple text copy
      navigator.clipboard.writeText(`Check out this plan: ${plans.title}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Loading Plans...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-2">
            Error Loading Plans
          </h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchPlansData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-4xl">📋</span>
              My Plans
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Organize and split expenses with friends
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-300">
                {filteredPlans.length} Total Plans
              </span>
            </div>
            <button
              onClick={handleCreatePlan}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus size={20} />
              Create Plan
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-red-400">⚠️</div>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((plan, index) => (
          <div
            key={index}
            className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:shadow-xl transition-all duration-300 hover:border-emerald-500/50 overflow-hidden group"
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getCategoryIcon(plan.category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {plan.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      plan.status
                    )}`}
                  >
                    {plan.status}
                  </span>

                  {/* Settle Button with Dropdown */}
                  <div className="relative p-1">
                    <button
                      onClick={() => toggleSettleDropdown(index)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      ₹
                      Settle
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          settleDropdowns[index] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {settleDropdowns[index] && <Settlement  plandata={plan} />}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => togglePlanExpansion(index)}
                      className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${
                          expandedPlans[index] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹ {plan.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">Total Amount</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {plan.participants?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400">Participants</div>
                </div>
              </div>

              {/* Participants Preview */}
              {plan.participants && plan.participants.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {plan.participants.slice(0, 4).map((participant) => (
                      <div
                        key={participant.id}
                        className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-semibold text-emerald-300 border-2 border-slate-800"
                        title={participant.name}
                      >
                        {participant.avatar}
                      </div>
                    ))}
                    {plan.participants.length > 4 && (
                      <div
                        key={`overflow-${index}`}
                        className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-semibold text-slate-300 border-2 border-slate-800"
                      >
                        +{plan.participants.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {
                      plan.participants.filter((p) => p.status === "confirmed")
                        .length
                    }{" "}
                    confirmed
                  </div>
                </div>
              )}

              {/* Plan Info */}
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {plan.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(plan.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            {expandedPlans[index] && (
              <div className="p-6 bg-slate-900/50 border-t border-slate-700">
                {/* Activities */}
                {plan.activities && plan.activities.length > 0 && (
                  <>
                    <h4 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                      <TrendingUp size={18} />
                      Activities ({plan.activities.length})
                    </h4>
                    <div className="space-y-3 mb-4">
                      {plan.activities.map((activity) => (
                        <div
                          key={activity.title}
                          className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-slate-100">
                              {activity.title}
                            </h5>
                            <span className="text-emerald-400 font-semibold">
                              ₹{activity.totalAmount}
                            </span>
                          </div>

                          {/* Payee Information */}
                          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard size={16} className="text-blue-400" />
                              <span className="text-slate-300 font-medium">
                                Paid by:
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-300">
                                {activity.payee?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-blue-200 font-medium">
                                {activity.payee}
                              </span>
                            </div>
                          </div>

                          {/* Custom Split Details */}
                          {activity.customSplit &&
                            activity.customSplit.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <DollarSign
                                    size={16}
                                    className="text-emerald-400"
                                  />
                                  <span className="text-slate-300 font-medium">
                                    Split Details:
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {activity.customSplit.map(
                                    (split, splitIndex) => (
                                      <div
                                        key={splitIndex}
                                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-semibold text-emerald-300">
                                            {split.name
                                              ?.charAt(0)
                                              .toUpperCase()}
                                          </div>
                                          <span className="text-slate-200 font-medium">
                                            {split.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-emerald-400 font-semibold">
                                            ₹{split.amount}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Activity Summary */}
                          <div className="text-sm text-slate-400 pt-2 border-t border-slate-600/50">
                            <div className="flex items-center justify-between">
                              <span>Split Method: {activity.splitMethod}</span>
                              <span>
                                Total Participants: {activity.totalParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Participants Details */}
                {plan.participants && plan.participants.length > 0 && (
                  <>
                    <h4 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                      <Users size={18} />
                      Participants
                    </h4>
                    <div className="space-y-2">
                      {plan.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center text-sm font-semibold text-emerald-300">
                              {participant.avatar}
                            </div>
                            <span className="text-slate-100">
                              {participant.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                participant.status === "confirmed"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {participant.status}
                            </span>
                            <span className="text-sm text-slate-400">
                              ₹
                              {(
                                plan.totalAmount / plan.participants.length
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4  bg-[#161a1d] rounded-b-xl ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(
                      plan.priority
                    )}`}
                  ></div>
                  <span className="text-xs text-slate-400 capitalize">
                    {plan.priority} priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  
                  <button
                    onClick={() => handleEditPlan(index)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                    title="Edit Plan"
                  >
                    <Edit
                      size={16}
                      className="text-slate-400 group-hover:text-emerald-400"
                    />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(index)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                    title="Delete Plan"
                  >
                    <Trash2
                      size={16}
                      className="text-slate-400 group-hover:text-red-400"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {filter === "all" ? "No plans yet" : `No ${filter} plans`}
          </h3>
          <p className="text-slate-400 mb-6">
            Create your first plan to start splitting expenses with friends!
          </p>
          <button
            onClick={handleCreatePlan}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105"
          >
            <Plus size={20} />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#272d32] rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Award className="text-emerald-400" size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-100">
                {filteredPlans.length}
              </div>
              <div className="text-sm text-slate-400">Plans</div>
            </div>
          </div>
        </div>

        <div className="bg-[#272d32] rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Heart className="text-purple-400" size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-100">
                {formatCurrency(
                  filteredPlans.reduce((sum, plan) => sum + plan.totalAmount, 0)
                )}
              </div>
              <div className="text-sm text-slate-400">Total Planned</div>
            </div>
          </div>
        </div>
      </div>

      <PlanModals
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onSave={handleModalSave}
      />
    </div>
  );
}
