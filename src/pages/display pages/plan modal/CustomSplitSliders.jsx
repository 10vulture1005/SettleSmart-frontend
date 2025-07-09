import React, { useState, useEffect } from "react";
import { Calculator, Percent, DollarSign } from "lucide-react";

/**
 * CustomSplitSliders Component
 * 
 * This component allows users to create custom splits for expenses among participants.
 * It stores data as an array of objects with participant names and their respective amounts.
 * 
 * Data Structure:
 * customSplit = [
 *   { name: "John", amount: 250.00, percentage: 25.0 },
 *   { name: "Jane", amount: 150.00, percentage: 15.0 },
 *   { name: "You", amount: 600.00, percentage: 60.0 }
 * ]
 * 
 * @param {Array} participants - Array of participant names
 * @param {Array} customSplit - Array of split objects with name, amount, and percentage
 * @param {Function} onChange - Callback function to update the split data
 * @param {number} totalAmount - Total amount to be split
 */
export default function CustomSplitSliders({ participants, customSplit, onChange, totalAmount = 0 }) {
  const [inputMode, setInputMode] = useState("percentage"); // "percentage" or "amount"
  const [amountInputs, setAmountInputs] = useState({}); // Track amount inputs separately

  /**
   * Initialize or update the customSplit array when participants change
   * Ensures we have an entry for each participant
   */
  useEffect(() => {
    if (!customSplit || customSplit.length === 0) {
      // Initialize with equal split for all participants
      const equalPercentage = 100 / participants.length;
      const equalAmount = totalAmount > 0 ? totalAmount / participants.length : 0;
      
      const initialSplit = participants.map(name => ({
        email: name,
        amount: equalAmount,
        percentage: equalPercentage
      }));
      
      onChange(initialSplit);
    } else if (customSplit.length !== participants.length) {
      // Update if participants list changed
      const updatedSplit = participants.map((name, index) => {
        const existingEntry = customSplit.find(split => split.name === name);
        if (existingEntry) {
          return existingEntry;
        } else {
          // New participant - initialize with 0
          return {
            name: name,
            amount: 0,
            percentage: 0
          };
        }
      });
      
      onChange(updatedSplit);
    }
  }, [participants, customSplit, totalAmount, onChange]);

  /**
   * Handle slider percentage changes
   * @param {number} index - Index of the participant
   * @param {number} percentage - New percentage value
   */
  const handleSliderChange = (index, percentage) => {
    const updated = [...(customSplit || [])];
    const numericPercentage = parseFloat(percentage) || 0;
    const calculatedAmount = totalAmount > 0 ? (numericPercentage / 100) * totalAmount : 0;
    
    updated[index] = {
      ...updated[index],
      percentage: numericPercentage,
      amount: calculatedAmount
    };
    
    onChange(updated);
    // Clear the amount input for this participant to avoid conflicts
    setAmountInputs(prev => ({ ...prev, [index]: '' }));
  };

  /**
   * Handle direct percentage input changes
   * @param {number} index - Index of the participant
   * @param {number} percentage - New percentage value
   */
  const handlePercentageChange = (index, percentage) => {
    const updated = [...(customSplit || [])];
    const numericPercentage = parseFloat(percentage) || 0;
    const calculatedAmount = totalAmount > 0 ? (numericPercentage / 100) * totalAmount : 0;
    
    updated[index] = {
      ...updated[index],
      percentage: numericPercentage,
      amount: calculatedAmount
    };
    
    onChange(updated);
    // Clear the amount input for this participant to avoid conflicts
    setAmountInputs(prev => ({ ...prev, [index]: '' }));
  };

  /**
   * Handle direct amount input changes
   * @param {number} index - Index of the participant
   * @param {number} amount - New amount value
   */
  const handleAmountChange = (index, amount) => {
    if (totalAmount <= 0) return;
    
    // Update the amount input state for display
    setAmountInputs(prev => ({ ...prev, [index]: amount }));
    
    const updated = [...(customSplit || [])];
    const numericAmount = parseFloat(amount) || 0;
    const calculatedPercentage = totalAmount > 0 ? (numericAmount / totalAmount) * 100 : 0;
    
    updated[index] = {
      ...updated[index],
      amount: numericAmount,
      percentage: Math.min(100, Math.max(0, calculatedPercentage))
    };
    
    onChange(updated);
  };

  /**
   * Calculate total percentage from all participants
   */
  const getTotalPercentage = () => {
    if (!customSplit || customSplit.length === 0) return 0;
    return customSplit.reduce((sum, split) => sum + (split.percentage || 0), 0);
  };

  /**
   * Calculate total amount from all participants
   */
  const getTotalAmount = () => {
    if (!customSplit || customSplit.length === 0) return 0;
    return customSplit.reduce((sum, split) => sum + (split.amount || 0), 0);
  };

  /**
   * Reset all participants to equal split
   */
  const resetToEqual = () => {
    const equalPercentage = 100 / participants.length;
    const equalAmount = totalAmount > 0 ? totalAmount / participants.length : 0;
    
    const updated = participants.map(name => ({
      name: name,
      amount: equalAmount,
      percentage: equalPercentage
    }));
    
    onChange(updated);
    // Clear all amount inputs
    setAmountInputs({});
  };

  /**
   * Auto-balance remaining percentage among participants with 0%
   */
  const autoBalance = () => {
    const totalPercentage = getTotalPercentage();
    if (totalPercentage >= 100) return;
    
    const remaining = 100 - totalPercentage;
    const updated = [...(customSplit || [])];
    const zeroIndices = updated.map((split, index) => 
      (split.percentage || 0) === 0 ? index : -1
    ).filter(i => i !== -1);
    
    if (zeroIndices.length > 0) {
      const perZero = remaining / zeroIndices.length;
      const amountPerZero = totalAmount > 0 ? (perZero / 100) * totalAmount : 0;
      
      zeroIndices.forEach(index => {
        updated[index] = {
          ...updated[index],
          percentage: perZero,
          amount: amountPerZero
        };
      });
      
      onChange(updated);
      // Clear amount inputs for auto-balanced participants
      setAmountInputs(prev => {
        const newInputs = { ...prev };
        zeroIndices.forEach(index => {
          delete newInputs[index];
        });
        return newInputs;
      });
    }
  };

  // Calculate totals for display
  const totalPercentage = getTotalPercentage();
  const totalAmountUsed = getTotalAmount();

  // Safety check for customSplit
  if (!customSplit || customSplit.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h4 className="card-title">Custom Split</h4>
          <div className="flex items-center gap-2">
            {/* Percentage Badge */}
            <span className={`status-badge ${
              totalPercentage === 100 ? 'bg-green-500' : 
              totalPercentage > 100 ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              {totalPercentage.toFixed(1)}%
            </span>
            {/* Amount Badge */}
            {totalAmount > 0 && (
              <span className="status-badge">
                ₹{totalAmountUsed.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-content">
        {/* Input Mode Toggle */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setInputMode("percentage")}
              className={`flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm ${
                inputMode === "percentage" ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: inputMode === "percentage" ? 'var(--primary)' : 'var(--input)',
                borderColor: 'var(--border)',
                color: inputMode === "percentage" ? 'var(--primary-foreground)' : 'var(--foreground)',
                '--tw-ring-color': 'var(--ring)'
              }}
            >
              <Percent className="w-4 h-4" />
              Percentage
            </button>
            <button
              type="button"
              onClick={() => setInputMode("amount")}
              disabled={totalAmount <= 0}
              className={`flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${
                inputMode === "amount" ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: inputMode === "amount" ? 'var(--primary)' : 'var(--input)',
                borderColor: 'var(--border)',
                color: inputMode === "amount" ? 'var(--primary-foreground)' : 'var(--foreground)',
                '--tw-ring-color': 'var(--ring)'
              }}
            >
              <DollarSign className="w-4 h-4" />
              Amount
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetToEqual}
              className="px-3 py-1 text-xs rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={autoBalance}
              disabled={totalPercentage >= 100}
              className="px-3 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Auto Balance
            </button>
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-4">
          {participants.map((name, index) => {
            const splitData = customSplit[index] || { name, amount: 0, percentage: 0 };
            const participantAmount = splitData.amount || 0;
            const participantPercentage = splitData.percentage || 0;
            
            // Use the amount input state if available, otherwise use stored amount
            const displayAmount = amountInputs[index] !== undefined ? 
              amountInputs[index] : participantAmount.toFixed(2);

            return (
              <div key={index} className="space-y-3">
                {/* Participant Header */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {name}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                      {participantPercentage.toFixed(1)}%
                    </span>
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      ₹{participantAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={participantPercentage}
                    onChange={(e) => handleSliderChange(index, e.target.value)}
                    className="slider percentage-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${participantPercentage}%, var(--muted) ${participantPercentage}%, var(--muted) 100%)`
                    }}
                  />
                </div>
                
                {/* Progress bar visual */}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${participantPercentage}%`,
                      background: `linear-gradient(90deg, var(--primary), var(--chart-2))`
                    }}
                  />
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Percentage Input */}
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={participantPercentage.toFixed(1)}
                      onChange={(e) => handlePercentageChange(index, e.target.value)}
                      className="w-full p-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                        '--tw-ring-color': 'var(--ring)'
                      }}
                    />
                  </div>
                  
                  {/* Amount Input */}
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={displayAmount}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      disabled={totalAmount <= 0}
                      className="w-full p-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                        '--tw-ring-color': 'var(--ring)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Section */}
        <div className="mt-6 p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--accent)', 
          borderColor: 'var(--border)' 
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Split Summary
            </span>
          </div>
          
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div style={{ color: 'var(--muted-foreground)' }}>Total Percentage:</div>
              <div className={`font-semibold ${
                totalPercentage === 100 ? 'text-green-600' : 
                totalPercentage > 100 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {totalPercentage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--muted-foreground)' }}>Total Amount:</div>
              <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                ₹{totalAmountUsed.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Validation Messages */}
          {totalPercentage !== 100 && (
            <div className="mt-3 p-2 rounded text-sm" style={{ 
              backgroundColor: totalPercentage > 100 ? 'var(--destructive)' : 'var(--secondary)',
              color: totalPercentage > 100 ? 'var(--destructive-foreground)' : 'var(--secondary-foreground)'
            }}>
              {totalPercentage > 100 
                ? `⚠️ Total exceeds 100% by ${(totalPercentage - 100).toFixed(1)}%` 
                : `💡 Remaining: ${(100 - totalPercentage).toFixed(1)}%`}
              {totalAmount > 0 && (
                <span> (₹{((100 - totalPercentage) / 100 * totalAmount).toFixed(2)})</span>
              )}
            </div>
          )}

          {/* Debug Information (can be removed in production) */}
          <div className="mt-3 p-2 rounded text-xs" style={{ 
            backgroundColor: 'var(--muted)', 
            color: 'var(--muted-foreground)',
            fontFamily: 'monospace'
          }}>
            <div className="font-semibold mb-1">Split Data:</div>
            {customSplit.map((split, index) => (
              <div key={index}>
                {split.name}: ₹{split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}