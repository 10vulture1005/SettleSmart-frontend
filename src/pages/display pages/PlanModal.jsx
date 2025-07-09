import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  Check,
  UserPlus,
  Edit3,
  Calculator,
} from "lucide-react";

export default function PlanModal({ isOpen, onClose, plan, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    dueDate: "",
    category: "dining",
    priority: "medium",
    participants: [],
    activities: [],
  });

  const [remainingAmount, setRemainingAmount] = useState(0);

  const [currentStep, setCurrentStep] = useState(1);
  const [friendSearch, setFriendSearch] = useState("");
  const [activityForm, setActivityForm] = useState({
    name: "",
    amount: "",
    splitType: "equal",
    customSplits: {}, // Add this new field for storing custom split amounts
  });
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock friends data
  const [availableFriends] = useState([
    { id: 1, name: "John Doe", avatar: "JD", email: "john@example.com" },
    { id: 2, name: "Jane Smith", avatar: "JS", email: "jane@example.com" },
    { id: 3, name: "Mike Johnson", avatar: "MJ", email: "mike@example.com" },
    { id: 4, name: "Sarah Wilson", avatar: "SW", email: "sarah@example.com" },
    { id: 5, name: "Emma Brown", avatar: "EB", email: "emma@example.com" },
    { id: 6, name: "Alex Lee", avatar: "AL", email: "alex@example.com" },
    { id: 7, name: "Lisa Chen", avatar: "LC", email: "lisa@example.com" },
  ]);

  useEffect(() => {
    if (plan) {
      setFormData({
        title: plan.title || "",
        description: plan.description || "",
        location: plan.location || "",
        dueDate: plan.dueDate || "",
        category: plan.category || "dining",
        priority: plan.priority || "medium",
        participants: plan.participants || [],
        activities: plan.activities || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        dueDate: "",
        category: "dining",
        priority: "medium",
        participants: [],
        activities: [],
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [plan, isOpen]);

  const categories = [
    { id: "dining", name: "Dining", icon: "🍽️" },
    { id: "travel", name: "Travel", icon: "✈️" },
    { id: "celebration", name: "Celebration", icon: "🎉" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "other", name: "Other", icon: "📋" },
  ];

  const priorities = [
    { id: "low", name: "Low", color: "text-emerald-400" },
    { id: "medium", name: "Medium", color: "text-yellow-400" },
    { id: "high", name: "High", color: "text-red-400" },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    } else if (step === 2) {
      if (formData.participants.length === 0)
        newErrors.participants = "At least one participant is required";
    } else if (step === 3) {
      if (formData.activities.length === 0)
        newErrors.activities = "At least one activity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const addParticipant = (friend) => {
    if (!formData.participants.find((p) => p.id === friend.id)) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, { ...friend, status: "pending" }],
      }));
    }
    setFriendSearch("");
  };

  const removeParticipant = (participantId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== participantId),
    }));
  };

  const calculateTotalCost = () => {
    return formData.activities.reduce(
      (total, activity) => total + activity.totalAmount,
      0
    );
  };

  const calculatePerPersonCost = () => {
    const totalCost = calculateTotalCost();
    return formData.participants.length > 0
      ? totalCost / formData.participants.length
      : 0;
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsCalculating(true);

    try {
      const planData = {
        ...formData,
        id: plan?.id || Date.now(),
        createdAt: plan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalCost: calculateTotalCost(),
        perPersonCost: calculatePerPersonCost(),
        status: "active",
      };

      await onSave(planData);
      onClose();
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setIsCalculating(false);
    }
  };
const [currentUser] = useState({
  id: 'current_user',
  name: 'You',
  avatar: 'ME',
  email: 'your@email.com'
});

const addActivity = () => {
  // Basic validation
  if (!activityForm.name.trim() || !activityForm.amount) {
    setErrors(prev => ({
      ...prev,
      activities: 'Please fill in both activity name and amount'
    }));
    return;
  }

  const amount = parseFloat(activityForm.amount);
  const participantCount = formData.participants.length;
  const totalPeople = participantCount + 1; // +1 for yourself
  
  // Check if participants exist
  if (participantCount === 0) {
    setErrors(prev => ({
      ...prev,
      activities: 'Please add participants first'
    }));
    return;
  }

  // Validate amount
  if (amount <= 0) {
    setErrors(prev => ({
      ...prev,
      activities: 'Amount must be greater than 0'
    }));
    return;
  }

  let allParticipants; // This will include you + other participants
  
  if (activityForm.splitType === 'equal') {
    // Equal split logic - include yourself
    const perPerson = amount / totalPeople;
    allParticipants = [
      // Add yourself first
      {
        id: currentUser.id,
        name: currentUser.name,
        amount: perPerson,
        status: 'confirmed' // You're automatically confirmed
      },
      // Then add other participants
      ...formData.participants.map(p => ({
        id: p.id,
        name: p.name,
        amount: perPerson,
        status: 'pending'
      }))
    ];
  } else {
    // Custom split logic - include yourself
    const customSplitValues = Object.values(activityForm.customSplits);
    const totalCustomAmount = customSplitValues.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    // Validate custom splits (including yourself)
    const allParticipantsWithSelf = [currentUser, ...formData.participants];
    
    if (customSplitValues.length === 0) {
      setErrors(prev => ({
        ...prev,
        activities: 'Please set custom split amounts for all participants including yourself'
      }));
      return;
    }
    
    // Check if all participants (including you) have splits assigned
    const missingParticipants = allParticipantsWithSelf.filter(p => 
      !activityForm.customSplits[p.id] || parseFloat(activityForm.customSplits[p.id]) === 0
    );
    
    if (missingParticipants.length > 0) {
      setErrors(prev => ({
        ...prev,
        activities: `Please set amounts for: ${missingParticipants.map(p => p.name).join(', ')}`
      }));
      return;
    }
    
    // Check if total matches (allow small floating point differences)
    if (Math.abs(totalCustomAmount - amount) > 0.01) {
      setErrors(prev => ({
        ...prev,
        activities: `Custom split total (₹${totalCustomAmount.toFixed(2)}) must equal activity amount (₹${amount.toFixed(2)})`
      }));
      return;
    }
    
    allParticipants = [
      // Add yourself first
      {
        id: currentUser.id,
        name: currentUser.name,
        amount: parseFloat(activityForm.customSplits[currentUser.id] || 0),
        status: 'confirmed'
      },
      // Then add other participants
      ...formData.participants.map(p => ({
        id: p.id,
        name: p.name,
        amount: parseFloat(activityForm.customSplits[p.id] || 0),
        status: 'pending'
      }))
    ];
  }
  
  // Create new activity
  const newActivity = {
    id: Date.now(),
    name: activityForm.name,
    totalAmount: amount,
    splitType: activityForm.splitType,
    perPerson: activityForm.splitType === 'equal' ? amount / totalPeople : 0,
    participants: allParticipants, // Now includes yourself
    createdAt: new Date().toISOString()
  };

  // Add to activities list
  setFormData(prev => ({
    ...prev,
    activities: [...prev.activities, newActivity]
  }));

  // Reset form
  setActivityForm({
    name: '',
    amount: '',
    splitType: 'equal',
    customSplits: {}
  });
  
  setRemainingAmount(0);
  if (errors.activities) {
    setErrors(prev => ({
      ...prev,
      activities: ''
    }));
  }

  console.log('Activity added with self-inclusion:', newActivity);
};

const CustomSplitSliders = () => {
  const totalAmount = parseFloat(activityForm.amount) || 0;
  const allParticipantsWithSelf = [currentUser, ...formData.participants]; // Include yourself
  
  if (totalAmount === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Enter an amount first to set custom splits</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h4 className="text-white font-medium">Custom Split</h4>
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <span className="text-gray-400">Remaining: </span>
            <span className={`font-medium ${remainingAmount === 0 ? 'text-green-400' : remainingAmount < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              ₹{Math.abs(remainingAmount).toFixed(2)}
            </span>
          </div>
          <button
            onClick={autoDistributeRemaining}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
            title="Split equally among all participants"
          >
            Equal
          </button>
          <button
            onClick={distributeRemainingProportionally}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
            title="Distribute proportionally based on current amounts"
          >
            Prop
          </button>
          <button
            onClick={clearCustomSplits}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Participant sliders - NOW INCLUDING YOURSELF */}
      {allParticipantsWithSelf.map((participant) => {
        const currentAmount = parseFloat(activityForm.customSplits[participant.id] || 0);
        const percentage = getParticipantPercentage(participant.id);
        const isCurrentUser = participant.id === currentUser.id;
        
        return (
          <div key={participant.id} className={`p-4 rounded-lg border ${
            isCurrentUser 
              ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30' 
              : 'bg-gray-800 border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {participant.avatar}
                </div>
                <div>
                  <span className="text-white font-medium">{participant.name}</span>
                  {isCurrentUser && (
                    <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Your Share
                    </span>
                  )}
                </div>
              </div>
              
              {/* Amount and Percentage inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={currentAmount || ''}
                    onChange={(e) => handleCustomSplitChange(participant.id, e.target.value, 'amount')}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right"
                    placeholder="0"
                    min="0"
                    max={totalAmount}
                    step="0.01"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={percentage.toFixed(1)}
                    onChange={(e) => handleCustomSplitChange(participant.id, e.target.value, 'percentage')}
                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Custom styled slider */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={currentAmount || 0}
                  onChange={(e) => handleCustomSplitChange(participant.id, e.target.value, 'amount')}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${isCurrentUser ? '#10b981' : '#3b82f6'} 0%, ${isCurrentUser ? '#10b981' : '#3b82f6'} ${percentage}%, #374151 ${percentage}%, #374151 100%)`
                  }}
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-lg pointer-events-none ${
                    isCurrentUser ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>₹0 (0%)</span>
                <span className={`font-medium ${isCurrentUser ? 'text-green-400' : 'text-blue-400'}`}>
                  ₹{currentAmount.toFixed(2)} ({percentage.toFixed(1)}%)
                </span>
                <span>₹{totalAmount.toFixed(2)} (100%)</span>
              </div>
            </div>
          </div>
        );
      })}
      
    </div>
  );
};


{activityForm.splitType === 'equal' && activityForm.amount && formData.participants.length > 0 && (
  <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
    <div className="flex justify-between items-center">
      <span className="text-gray-400">Equal split:</span>
      <span className="text-white font-medium">
        ₹{(parseFloat(activityForm.amount) / (formData.participants.length + 1)).toFixed(2)} per person (including you)
      </span>
    </div>
  </div>
)}

  // Updated Step 3 content (replace the existing Step 3 section)
  {
    currentStep === 3 && (
      <div className="space-y-6">
        {/* Add Activity Form */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Add Activity
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={activityForm.name}
              onChange={(e) =>
                setActivityForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Activity name..."
            />
            <input
              type="number"
              value={activityForm.amount}
              onChange={(e) => {
                setActivityForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }));
                // Reset custom splits when amount changes
                if (activityForm.splitType === "custom") {
                  setActivityForm((prev) => ({ ...prev, customSplits: {} }));
                }
              }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amount (₹)..."
              min="0"
              step="0.01"
            />
          </div>

          {/* Split type selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() =>
                setActivityForm((prev) => ({
                  ...prev,
                  splitType: "equal",
                  customSplits: {},
                }))
              }
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activityForm.splitType === "equal"
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Split Equally
            </button>
            <button
              onClick={() =>
                setActivityForm((prev) => ({ ...prev, splitType: "custom" }))
              }
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activityForm.splitType === "custom"
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Custom Split
            </button>
          </div>

          {/* Show custom split sliders when custom is selected */}
          {activityForm.splitType === "custom" &&
            formData.participants.length > 0 && (
              <div className="mb-4">
                <CustomSplitSliders />
              </div>
            )}

          {/* Equal split preview */}
          {activityForm.splitType === "equal" &&
            activityForm.amount &&
            formData.participants.length > 0 && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Equal split:</span>
                  <span className="text-white font-medium">
                    ₹
                    {(
                      parseFloat(activityForm.amount) /
                      formData.participants.length
                    ).toFixed(2)}{" "}
                    per person
                  </span>
                </div>
              </div>
            )}

          {/* Error display */}
          {errors.activities && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.activities}
              </p>
            </div>
          )}

          <button
            onClick={addActivity}
            disabled={
              !activityForm.name.trim() ||
              !activityForm.amount ||
              (activityForm.splitType === "custom" && remainingAmount !== 0)
            }
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Add Activity
          </button>
        </div>

        {/* Activities List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Activities ({formData.activities.length})
          </h3>

          {formData.activities.length > 0 ? (
            <div className="space-y-3">
              {formData.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">
                          {activity.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            activity.splitType === "equal"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {activity.splitType === "equal"
                            ? "Equal Split"
                            : "Custom Split"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span>Total: ₹{activity.totalAmount.toFixed(2)}</span>
                        {activity.splitType === "equal" && (
                          <span>
                            ₹{activity.perPerson.toFixed(2)} per person
                          </span>
                        )}
                      </div>

                      {/* Participants breakdown */}
                      <div className="grid grid-cols-2 gap-2">
                        {activity.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-2 bg-gray-700 rounded"
                          >
                            <span className="text-gray-300 text-sm">
                              {participant.name}
                            </span>
                            <span className="text-white font-medium">
                              ₹{participant.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => removeActivity(activity.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-3"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activities added yet</p>
              <p className="text-sm">Add your first activity to get started</p>
            </div>
          )}
        </div>

        {/* Budget Summary */}
        {formData.activities.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              Budget Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ₹{calculateTotalCost().toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  ₹{calculatePerPersonCost().toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Average per Person</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Also fix the currency in Step 4 review
  {
    currentStep === 4 && (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Review Your Plan
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-400">Title:</span>{" "}
                  <span className="text-white">{formData.title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>{" "}
                  <span className="text-white">{formData.location}</span>
                </div>
                <div>
                  <span className="text-gray-400">Due Date:</span>{" "}
                  <span className="text-white">
                    {new Date(formData.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>{" "}
                  <span className="text-white">
                    {categories.find((c) => c.id === formData.category)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-2">
                Participants ({formData.participants.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full"
                  >
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      {participant.avatar.charAt(0)}
                    </div>
                    <span className="text-white text-sm">
                      {participant.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-2">
                Activities ({formData.activities.length})
              </h4>
              {formData.activities.map((activity) => (
                <div key={activity.id} className="mb-2 p-2 bg-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-white">{activity.name}</span>
                    <span className="text-blue-400 font-medium">
                      ₹{activity.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-2">Budget Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Total Cost:</span>
                  <div className="text-lg font-bold text-white">
                    ₹{calculateTotalCost().toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">
                    Average per Person:
                  </span>
                  <div className="text-lg font-bold text-blue-400">
                    ₹{calculatePerPersonCost().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const removeActivity = (activityId) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== activityId),
    }));
  };



  // Clear all custom splits
  const clearCustomSplits = () => {
    setActivityForm((prev) => ({
      ...prev,
      customSplits: {},
    }));
    setRemainingAmount(parseFloat(activityForm.amount) || 0);
  };

  // Add this useEffect after your existing useEffect
  useEffect(() => {
    if (activityForm.splitType === "custom" && activityForm.amount) {
      const totalAmount = parseFloat(activityForm.amount) || 0;
      const allocatedAmount = Object.values(activityForm.customSplits).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      setRemainingAmount(totalAmount - allocatedAmount);
    } else {
      setRemainingAmount(0);
    }
  }, [activityForm.amount, activityForm.customSplits, activityForm.splitType]);

  const filteredFriends = availableFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(friendSearch.toLowerCase()) &&
      !formData.participants.find((p) => p.id === friend.id)
  );

  if (!isOpen) return null;

  // Add this helper function to handle custom split changes
  // Enhanced handler for custom split changes (both amount and percentage)
  const handleCustomSplitChange = (participantId, value, type = "amount") => {
    const totalAmount = parseFloat(activityForm.amount) || 0;
    let newAmount;

    if (type === "amount") {
      newAmount = parseFloat(value) || 0;
    } else if (type === "percentage") {
      const percentage = parseFloat(value) || 0;
      newAmount = (percentage / 100) * totalAmount;
    }

    const newCustomSplits = {
      ...activityForm.customSplits,
      [participantId]: newAmount.toFixed(2),
    };

    setActivityForm((prev) => ({
      ...prev,
      customSplits: newCustomSplits,
    }));

    // Calculate remaining amount
    const allocatedAmount = Object.values(newCustomSplits).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
    setRemainingAmount(totalAmount - allocatedAmount);
  };

  // Helper function to calculate percentage for a participant
  const getParticipantPercentage = (participantId) => {
    const totalAmount = parseFloat(activityForm.amount) || 0;
    const participantAmount = parseFloat(
      activityForm.customSplits[participantId] || 0
    );
    return totalAmount > 0 ? (participantAmount / totalAmount) * 100 : 0;
  };

  // Auto-distribute remaining amount equally (updated)
  const autoDistributeRemaining = () => {
    const totalAmount = parseFloat(activityForm.amount) || 0;
    const participantCount = formData.participants.length;
    const equalAmount = totalAmount / participantCount;

    const newCustomSplits = {};
    formData.participants.forEach((participant) => {
      newCustomSplits[participant.id] = equalAmount.toFixed(2);
    });

    setActivityForm((prev) => ({
      ...prev,
      customSplits: newCustomSplits,
    }));
    setRemainingAmount(0);
  };

  // Distribute remaining amount proportionally
  const distributeRemainingProportionally = () => {
    const totalAmount = parseFloat(activityForm.amount) || 0;
    const currentTotal = Object.values(activityForm.customSplits).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

    if (currentTotal === 0) {
      autoDistributeRemaining();
      return;
    }

    const newCustomSplits = {};
    formData.participants.forEach((participant) => {
      const currentAmount = parseFloat(
        activityForm.customSplits[participant.id] || 0
      );
      const proportion = currentAmount / currentTotal;
      const newAmount = proportion * totalAmount;
      newCustomSplits[participant.id] = newAmount.toFixed(2);
    });

    setActivityForm((prev) => ({
      ...prev,
      customSplits: newCustomSplits,
    }));
    setRemainingAmount(0);
  };

 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {plan ? "Edit Plan" : "Create New Plan"}
              </h2>
              <p className="text-gray-400 text-sm">Step {currentStep} of 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  step <= currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plan title..."
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your plan..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location..."
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.dueDate && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleInputChange("category", category.id)}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.category === category.id
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="text-lg mb-1">{category.icon}</div>
                      <div className="text-sm">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.id}
                      onClick={() => handleInputChange("priority", priority.id)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        formData.priority === priority.id
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      }`}
                    >
                      <span className={priority.color}>{priority.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Add Participants
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search friends..."
                  />
                  {friendSearch && (
                    <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto z-10">
                      {filteredFriends.map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => addParticipant(friend)}
                          className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {friend.avatar}
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
                        </button>
                      ))}
                      {filteredFriends.length === 0 && (
                        <div className="p-3 text-gray-400 text-center">
                          No friends found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Selected Participants ({formData.participants.length})
                </h3>
                {formData.participants.length > 0 ? (
                  <div className="space-y-2">
                    {formData.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {participant.avatar}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {participant.name}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {participant.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No participants added yet</p>
                  </div>
                )}
                {errors.participants && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.participants}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Activities & Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Add Activity
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={activityForm.name}
                    onChange={(e) =>
                      setActivityForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Activity name..."
                  />
                  <input
                    type="number"
                    value={activityForm.amount}
                    onChange={(e) => {
                      setActivityForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }));
                      // Reset custom splits when amount changes
                      if (activityForm.splitType === "custom") {
                        setActivityForm((prev) => ({
                          ...prev,
                          customSplits: {},
                        }));
                      }
                    }}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount (₹)..."
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Split type selection */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() =>
                      setActivityForm((prev) => ({
                        ...prev,
                        splitType: "equal",
                        customSplits: {},
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      activityForm.splitType === "equal"
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Split Equally
                  </button>
                  <button
                    onClick={() =>
                      setActivityForm((prev) => ({
                        ...prev,
                        splitType: "custom",
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      activityForm.splitType === "custom"
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Custom Split
                  </button>
                </div>

                {/* Show custom split sliders when custom is selected */}
                {activityForm.splitType === "custom" &&
                  formData.participants.length > 0 && (
                    <div className="mb-4">
                      <CustomSplitSliders />
                    </div>
                  )}

                {/* Equal split preview */}
                {activityForm.splitType === "equal" &&
                  activityForm.amount &&
                  formData.participants.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Equal split:</span>
                        <span className="text-white font-medium">
                          ₹
                          {(
                            parseFloat(activityForm.amount) /
                            formData.participants.length
                          ).toFixed(2)}{" "}
                          per person
                        </span>
                      </div>
                    </div>
                  )}

                <button
                  onClick={addActivity}
                  disabled={
                    !activityForm.name.trim() ||
                    !activityForm.amount ||
                    (activityForm.splitType === "custom" &&
                      remainingAmount !== 0)
                  }
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Add Activity
                </button>
              </div>

              {/* Rest of your existing activities list and budget summary... */}
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Review Your Plan
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2">
                      Basic Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-400">Title:</span>{" "}
                        <span className="text-white">{formData.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>{" "}
                        <span className="text-white">{formData.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Due Date:</span>{" "}
                        <span className="text-white">
                          {new Date(formData.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Category:</span>{" "}
                        <span className="text-white">
                          {
                            categories.find((c) => c.id === formData.category)
                              ?.name
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2">
                      Participants ({formData.participants.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full"
                        >
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                            {participant.avatar.charAt(0)}
                          </div>
                          <span className="text-white text-sm">
                            {participant.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2">
                      Budget Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">
                          Total Cost:
                        </span>
                        <div className="text-lg font-bold text-white">
                          ${calculateTotalCost().toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">
                          Per Person:
                        </span>
                        <div className="text-lg font-bold text-blue-400">
                          ${calculatePerPersonCost().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isCalculating}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {plan ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
