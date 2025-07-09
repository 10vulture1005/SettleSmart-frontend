import React, { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import StepBasicInfo from "./StepBasicInfo";
import StepParticipants from "./StepParticipants";
import StepActivities from "./StepActivities";
import StepReview from "./StepReview";
import Cookies from 'js-cookie';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function PlanModals({ isOpen, onClose, plan, onSave }) {

  const [formData, setFormData] = useState({ ...defaultForm });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);



  
  useEffect(() => {
    
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({ ...defaultForm });
    }
    setErrors({});  
    setCurrentStep(1);
  }, [plan, isOpen]);

  const handleNext = () => {
    // validate currentStep
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => setCurrentStep((prev) => prev - 1);

  const handleSave = async () => {
    try {
      setIsCalculating(true);
      console.log('Saving form data:', formData);
      
      // Make sure we're passing the correct data structure
      const planToSave = { 
        ...formData, 
        updatedAt: new Date().toISOString(),
        id: plan?.id || Date.now().toString() // Add ID if editing, or generate new one
      };
      
      
      await onSave(planToSave);
      onClose();
    } catch (err) {
      console.error("Save error", err);
      // You might want to show an error message to the user here
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50"
         style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="card-header border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)' }}>
                <Plus className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="card-title text-xl">
                  {plan ? "Edit Plan" : "Create New Plan"}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Step {currentStep} of 4
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-700"
            >
              <X className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step 
                    ? 'text-white' 
                    : 'border-2 text-gray-400'
                }`}
                style={{
                  backgroundColor: currentStep >= step ? 'var(--primary)' : 'transparent',
                  borderColor: currentStep >= step ? 'var(--primary)' : 'var(--border)'
                }}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className="w-16 h-1 mx-2 rounded-full"
                       style={{ 
                         backgroundColor: currentStep > step ? 'var(--primary)' : 'var(--muted)'
                       }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span>Basic Info</span>
            <span>Participants</span>
            <span>Activities</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="card-content overflow-y-auto max-h-[calc(90vh-280px)]">
          {currentStep === 1 && <StepBasicInfo formData={formData} setFormData={setFormData} errors={errors} />}
          {currentStep === 2 && <StepParticipants formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <StepActivities formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && <StepReview formData={formData} />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              border: '1px solid var(--border)'
            }}
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isCalculating}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: 'var(--chart-2)',
                color: 'var(--primary-foreground)'
              }}
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Save Plan
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const defaultForm = {
  title: "title",
  description: "des",
  location: "loc",
  dueDate: "2025-01-01",
  category: "dining",
  priority: "medium",
  participants: [


  ],
  activities: [],
};