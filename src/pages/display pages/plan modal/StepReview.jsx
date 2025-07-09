import React from "react";

export default function StepReview({ formData }) {
  // Helper function to get participant display name
  const getParticipantDisplay = (participant) => {
    if (typeof participant === 'string') {
      return participant;
    }
    if (participant && typeof participant === 'object') {
      if (participant.name && participant.email) {
        return `${participant.name} (${participant.email})`;
      }
      return participant.name || participant.email || 'Unknown';
    }
    return 'Unknown';
  };

  // Helper function to calculate actual amount for activities
  const getActualAmount = (activity) => {
    if (activity.amountType === "percentage") {
      const totalBudget = (formData.activities || [])
        .filter(act => act.amountType === "fixed")
        .reduce((sum, act) => sum + act.totalAmount, 0);
      return (activity.percentage / 100) * totalBudget;
    }
    return activity.totalAmount || 0;
  };

  // Calculate totals
  const getTotalBudget = () => {
    return (formData.activities || [])
      .filter(act => act.amountType === "fixed")
      .reduce((sum, activity) => sum + activity.totalAmount, 0);
  };

  const getGrandTotal = () => {
    const fixedTotal = getTotalBudget();
    const percentageTotal = (formData.activities || [])
      .filter(act => act.amountType === "percentage")
      .reduce((sum, activity) => sum + getActualAmount(activity), 0);
    return fixedTotal + percentageTotal;
  };

  const totalParticipants = (formData.participants || []).length;

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-white text-lg font-semibold mb-3">Plan Overview</h4>
        <div className="space-y-2">
          <p className="text-gray-300"><span className="font-medium">Title:</span> {formData.title}</p>
          <p className="text-gray-300"><span className="font-medium">Location:</span> {formData.location}</p>
          <p className="text-gray-300"><span className="font-medium">Due:</span> {formData.dueDate}</p>
          <p className="text-gray-300"><span className="font-medium">Priority:</span> {formData.priority}</p>
          <p className="text-gray-300"><span className="font-medium">Category:</span> {formData.category}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-white text-lg font-semibold mb-3">
          Participants ({totalParticipants} total)
        </h4>
        <div className="space-y-2">
          
          
          {/* Show other participants */}
          {(formData.participants || []).map((participant, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {participant.avatar || participant.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-white font-medium">
                  {getParticipantDisplay(participant)}
                </div>
                {participant.email && participant.name && (
                  <div className="text-gray-400 text-sm">{participant.email}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {(formData.participants || []).length === 0 && (
          <p className="text-gray-400 text-center py-4">No participants added yet</p>
        )}
      </div>

      {/* Activities */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white text-lg font-semibold">Activities</h4>
          {(formData.activities || []).length > 0 && (
            <div className="text-green-400 font-semibold">
              Total: ₹{getGrandTotal().toFixed(2)}
            </div>
          )}
        </div>
        
        {(formData.activities || []).length > 0 ? (
          <div className="space-y-3">
            {(formData.activities || []).map((activity, i) => {
              const actualAmount = getActualAmount(activity);
              const perPersonAmount = activity.splitMethod === "equal" 
                ? actualAmount / totalParticipants 
                : null;
              
              return (
                <div key={i} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-white">{activity.title}</div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        {activity.splitMethod}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded">
                        {activity.amountType === 'fixed' ? 'Fixed' : 'Percentage'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {activity.amountType === 'fixed' ? (
                      <div className="text-gray-300">
                        <span className="font-medium">Total:</span> ₹{activity.totalAmount.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-gray-300">
                        <span className="font-medium">Percentage:</span> {activity.percentage}% = ₹{actualAmount.toFixed(2)}
                      </div>
                    )}
                    
                    <div className="text-gray-300">
                      <span className="font-medium">Per Person:</span> {
                        perPersonAmount 
                          ? `₹${perPersonAmount.toFixed(2)}` 
                          : 'Custom split'
                      }
                    </div>
                    
                    {activity.splitMethod === "custom" && activity.customSplit && (
                      <div className="text-gray-400 text-xs mt-2">
                        Custom split configured
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No activities added yet</p>
        )}
      </div>

      {/* Summary */}
      {(formData.activities || []).length > 0 && (
        <div className="bg-gradient-to-r from-blue-800 to-purple-800 p-4 rounded-lg border border-gray-700">
          <h4 className="text-white text-lg font-semibold mb-3">Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-300">Total Participants:</div>
              <div className="text-white font-semibold">{totalParticipants}</div>
            </div>
            <div>
              <div className="text-gray-300">Total Activities:</div>
              <div className="text-white font-semibold">{(formData.activities || []).length}</div>
            </div>
            <div>
              <div className="text-gray-300">Grand Total:</div>
              <div className="text-white font-semibold text-lg">₹{getGrandTotal().toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-300">Average per Person:</div>
              <div className="text-white font-semibold text-lg">₹{(getGrandTotal() / totalParticipants).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}