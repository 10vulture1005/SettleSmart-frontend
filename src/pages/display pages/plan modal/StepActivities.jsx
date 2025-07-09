import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, DollarSign, Percent } from "lucide-react";
import CustomSplitSliders from "./CustomSplitSliders";
import axios from "axios";
/**
 * StepActivities Component
 * 
 * This component handles the activities/expenses step of a trip planning form.
 * It allows users to:
 * - Add activities with either fixed amounts or percentage-based amounts
 * - Choose between equal split or custom split methods
 * - View all added activities with their cost breakdowns
 * - Remove activities
 * - See total budget calculations
 * 
 * @param {Object} formData - The main form data object containing all trip information
 * @param {Function} setFormData - Function to update the main form data
 */
export default function StepActivities({ formData, setFormData }) {

  const [curuser,setCurrentuser] = useState({});


  useEffect(() => {
    // Fetch current user data (e.g., from API or context)
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/data`,{withCredentials: true});
        setCurrentuser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // State for the current activity being added
  const [activity, setActivity] = useState({
    title: "",              // Activity name (e.g., "Dinner at restaurant")
    totalAmount: 0,         // Fixed amount in rupees
    amountType: "fixed",    // "fixed" for specific amount, "percentage" for % of total budget
    percentage: 0,          // Percentage value (0-100)
    splitMethod: "custom",   // "equal" for equal split, "custom" for custom amounts
    perPerson: 0,          // Amount per person (calculated for equal split)
    customSplit: []        // Array of custom split amounts for each participant
  });

  // Calculate total participants: all friends + the user (me)
  const totalParticipants = (formData.participants || []).length + 1; // +1 for me
  
  /**
   * Calculate the actual amount for an activity based on its type
   * @param {Object} activityItem - The activity object
   * @returns {number} - The actual amount in rupees
   */
  const getActualAmount = (activityItem) => {
    if (activityItem.amountType === "percentage") {
      // For percentage-based activities, calculate based on total fixed budget
      const totalBudget = getTotalBudget();
      return (activityItem.percentage / 100) * totalBudget;
    }
    // For fixed activities, return the direct amount
    return activityItem.totalAmount;
  };

  /**
   * Calculate the actual amount for the current activity being added
   * @returns {number} - The actual amount in rupees
   */
  const getCurrentActivityAmount = () => {
    if (activity.amountType === "percentage") {
      const totalBudget = getTotalBudget();
      return (activity.percentage / 100) * totalBudget;
    }
    return activity.totalAmount;
  };

  // Get the current activity amount and calculate equal split
  const currentActivityAmount = getCurrentActivityAmount();
  const equalSplitAmount = currentActivityAmount / totalParticipants;

  /**
   * Add a new activity to the form data
   * Validates input and creates a new activity object
   */
  const addActivity = () => {
    // Validation: Check if title exists and amount is valid
    if (!activity.title || (activity.amountType === "fixed" && activity.totalAmount <= 0) || 
        (activity.amountType === "percentage" && activity.percentage <= 0)) return;
    
    // Handle custom split initialization
    // If split method is custom and customSplit array exists, use it
    // Otherwise, initialize empty array for non-custom splits
    let customSplit = [];
    if (activity.splitMethod === "custom") {
      // If custom split exists and has valid data, use it
      if (activity.customSplit && activity.customSplit.length > 0) {
        customSplit = activity.customSplit;
      } else {
        // Initialize custom split with equal amounts for all participants
        const equalAmount = currentActivityAmount / totalParticipants;
        customSplit = Array(totalParticipants).fill(equalAmount);
      }
    }

    console.log(formData);
    
    // Create new activity object with all necessary properties
    const newActivity = {
      ...activity,
      customSplit: customSplit,
      payee: curuser.email,
      payee_id: curuser._id, // Use current user's ID as payee
      // For equal split, calculate and store per person amount
      totalParticipants: totalParticipants
    };

    // Add the new activity to the form data
    const updated = [...(formData.activities || []), newActivity];
setFormData((prev) => {
  const updatedFormData = { ...prev, activities: updated };
  console.log("Updated formData:", updatedFormData);
  return updatedFormData;
});

    
    // Reset the activity form to default state
    setActivity({ 
      title: "", 
      totalAmount: 0, 
      amountType: "fixed",
      percentage: 0,
      splitMethod: "custom", 
      payee: curuser.email || "", // Default to first participant's email
      payee_id: curuser._id || "",
      customSplit: [] 
    });
  };

  /**
   * Remove an activity from the list
   * @param {number} index - Index of the activity to remove
   */
  const removeActivity = (index) => {
    const updated = (formData.activities || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, activities: updated }));
  };

  /**
   * Calculate total budget from all fixed-amount activities
   * This is used as the base for percentage calculations
   * @returns {number} - Total budget in rupees
   */
  const getTotalBudget = () => {
    return (formData.activities || [])
      .filter(act => act.amountType === "fixed")
      .reduce((sum, activity) => sum + activity.totalAmount, 0);
  };

  /**
   * Calculate total percentage from all percentage-based activities
   * @returns {number} - Total percentage
   */
  const getTotalPercentage = () => {
    return (formData.activities || [])
      .filter(act => act.amountType === "percentage")
      .reduce((sum, activity) => sum + activity.percentage, 0);
  };

  /**
   * Calculate grand total of all activities (fixed + percentage-based)
   * @returns {number} - Grand total in rupees
   */
  const getGrandTotal = () => {
    const fixedTotal = getTotalBudget();
    const percentageTotal = (formData.activities || [])
      .filter(act => act.amountType === "percentage")
      .reduce((sum, activity) => sum + getActualAmount(activity), 0);
    return fixedTotal + percentageTotal;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)' }}>
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="card-title text-lg">Add Activities & Expenses</h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Add activities and split costs among participants
          </p>
        </div>
      </div>

      {/* Activity Form Card */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">New Activity</h4>
        </div>
        <div className="card-content space-y-4">
          
          {/* Activity Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Activity Title
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--ring)'
              }}
              placeholder="e.g., Dinner at restaurant, Movie tickets"
              value={activity.title}
              onChange={(e) => setActivity({ ...activity, title: e.target.value })}
            />
          </div>

          {/* Amount Type Selection (Fixed vs Percentage) */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Amount Type
            </label>
            <div className="flex gap-2">
              {/* Fixed Amount Button */}
              <button
                type="button"
                onClick={() => setActivity({ ...activity, amountType: "fixed" })}
                className={`flex-1 p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                  activity.amountType === "fixed" ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: activity.amountType === "fixed" ? 'var(--primary)' : 'var(--input)',
                  borderColor: 'var(--border)',
                  color: activity.amountType === "fixed" ? 'var(--primary-foreground)' : 'var(--foreground)',
                  '--tw-ring-color': 'var(--ring)'
                }}
              >
                <DollarSign className="w-4 h-4" />
                Fixed Amount
              </button>
              
              {/* Percentage Button */}
              <button
                type="button"
                onClick={() => setActivity({ ...activity, amountType: "percentage" })}
                className={`flex-1 p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                  activity.amountType === "percentage" ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: activity.amountType === "percentage" ? 'var(--primary)' : 'var(--input)',
                  borderColor: 'var(--border)',
                  color: activity.amountType === "percentage" ? 'var(--primary-foreground)' : 'var(--foreground)',
                  '--tw-ring-color': 'var(--ring)'
                }}
              >
                <Percent className="w-4 h-4" />
                Percentage
              </button>
            </div>
          </div>

          {/* Amount Input - Changes based on selected type */}
          {activity.amountType === "fixed" ? (
            // Fixed Amount Input
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Total Amount (₹)
              </label>
              <input
                type="number"
                className="w-full p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--input)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--ring)'
                }}
                placeholder="0.00"
                value={activity.totalAmount || ''}
                onChange={(e) => setActivity({ ...activity, totalAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ) : (
            // Percentage Input
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Percentage of Total Budget (%)
              </label>
              <input
                type="number"
                className="w-full p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--input)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--ring)'
                }}
                placeholder="0"
                min="0"
                max="100"
                value={activity.percentage || ''}
                onChange={(e) => setActivity({ ...activity, percentage: parseFloat(e.target.value) || 0 })}
              />
              {/* Show calculated amount for percentage-based activities */}
              {activity.percentage > 0 && getTotalBudget() > 0 && (
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Amount: ₹{currentActivityAmount.toFixed(2)} 
                  ({activity.percentage}% of ₹{getTotalBudget().toFixed(2)})
                </div>
              )}
            </div>
          )}

          {/* Split Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Split Method
            </label>
            <select
              className="w-full p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--ring)'
              }}
              value={activity.splitMethod}
              onChange={(e) => setActivity({ ...activity, splitMethod: e.target.value })}
            >
              <option value="custom">Custom Split</option>
            </select>
          </div>

          {/* Split Preview - Shows calculation preview */}
          {currentActivityAmount > 0 && (
            <div className="p-4 rounded-lg border" style={{ 
              backgroundColor: 'var(--muted)', 
              borderColor: 'var(--border)' 
            }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Split Preview
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Total participants: {totalParticipants} (You + {(formData.participants || []).length} friends)
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Total for this activity: ₹{currentActivityAmount.toFixed(2)}
              </div>
              {/* Show per person amount for equal split */}
              {activity.splitMethod === "equal" && (
                <div className="text-lg font-semibold mt-2" style={{ color: 'var(--primary)' }}>
                  ₹{equalSplitAmount.toFixed(2)} per person
                </div>
              )}
            </div>
          )}

          {/* Custom Split Component - Only shown for custom split method */}
          {activity.splitMethod === "custom" && (formData.participants || []).length > 0 && (
            <CustomSplitSliders
              participants={[ ...(formData.participants || []).map(p => {
                // Handle different participant data formats
                if (typeof p === 'string') return p.email;
                if (p && typeof p === 'object' && p.email) 
                  return p.email;
                return 'Unknown';
              })]}
              customSplit={activity.customSplit || []} // Handle undefined customSplit
              totalAmount={currentActivityAmount}
              onChange={(customSplit) => setActivity({ ...activity, customSplit })}
            />
          )}

          {/* Add Activity Button */}
          <button
            onClick={addActivity}
            disabled={!activity.title || 
              (activity.amountType === "fixed" && activity.totalAmount <= 0) ||
              (activity.amountType === "percentage" && activity.percentage <= 0)}
            className="w-full p-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>
      </div>

      {/* Activities List - Shows all added activities */}
      {(formData.activities || []).length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h4 className="card-title">Added Activities</h4>
              {/* Budget Summary Badges */}
              <div className="flex gap-2">
                <div className="status-badge">
                  Fixed: ₹{getTotalBudget().toFixed(2)}
                </div>
                <div className="status-badge">
                  Percentage: {getTotalPercentage().toFixed(1)}%
                </div>
                <div className="status-badge">
                  Total: ₹{getGrandTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {/* Map through all activities and display them */}
              {(formData.activities || []).map((activityItem, index) => {
                const actualAmount = getActualAmount(activityItem);
                return (
                  <div key={index} className="p-4 rounded-lg border flex justify-between items-center"
                       style={{ 
                         backgroundColor: 'var(--accent)', 
                         borderColor: 'var(--border)' 
                       }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {/* Activity Title */}
                        <h5 className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {activityItem.title}
                        </h5>
                        
                        {/* Split Method Badge */}
                        <span className="text-sm px-2 py-1 rounded" 
                              style={{ 
                                backgroundColor: 'var(--primary)', 
                                color: 'var(--primary-foreground)' 
                              }}>
                          {activityItem.splitMethod}
                        </span>
                        
                        {/* Amount Type Badge */}
                        <span className="text-sm px-2 py-1 rounded" 
                              style={{ 
                                backgroundColor: activityItem.amountType === 'fixed' ? 'var(--secondary)' : 'var(--accent)', 
                                color: activityItem.amountType === 'fixed' ? 'var(--secondary-foreground)' : 'var(--accent-foreground)',
                                border: activityItem.amountType === 'percentage' ? '1px solid var(--border)' : 'none'
                              }}>
                          {activityItem.amountType === 'fixed' ? '₹' : '%'}
                        </span>
                      </div>
                      
                      {/* Activity Details */}
                      <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {activityItem.amountType === 'fixed' ? (
                          <>Total: ₹{activityItem.totalAmount.toFixed(2)}</>
                        ) : (
                          <>
                            {activityItem.percentage}% = ₹{Number(actualAmount).toFixed(2)}
                          </>
                        )}
                        {/* Show per person amount for equal split */}
                        {activityItem.splitMethod === "equal" && (
                          <span> • ₹{(actualAmount / totalParticipants).toFixed(2)} per person</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove Activity Button */}
                    <button
                      onClick={() => removeActivity(index)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                      style={{ color: 'var(--destructive)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Shown when no activities are added */}
      {(formData.activities || []).length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ backgroundColor: 'var(--muted)' }}>
            <DollarSign className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            No activities added yet
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Add your first activity to start planning expenses
          </p>
        </div>
      )}
    </div>
  );
}