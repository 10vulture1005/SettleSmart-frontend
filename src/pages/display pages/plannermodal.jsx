// src/components/AddPlanModal.js
import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Clock, Users, DollarSign, Send, Loader, Lightbulb, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

export default function AddPlanModal({ isOpen, onClose, onAddPlan }) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    duration: '',
    participants: '',
    category: 'adventure',
    budget: '',
    preferences: ''
  });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [promptFocus, setPromptFocus] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  // Sample prompts for inspiration
  const samplePrompts = [
    "Plan a romantic sunset picnic for two with local delicacies under $80 total",
    "Adventure-packed hiking day with scenic viewpoints and photography spots",
    "Family-friendly beach day with water activities and BBQ lunch for 6 people",
    "Cultural city exploration with museums, local markets, and authentic dining",
    "Cozy indoor activities for a rainy day with friends - games, movies, and comfort food"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const useSamplePrompt = (prompt) => {
    setFormData(prev => ({
      ...prev,
      preferences: prompt
    }));
  };

  // Enhanced auto-fill function
  const parseAIResponse = (response) => {
    const lines = response.split('\n');
    let title = '';
    let location = '';
    let duration = '';
    let budget = '';
    let participants = '';

    // Extract title (usually first non-empty line)
    for (let line of lines) {
      const cleanLine = line.replace(/^[#\s]*/, '').trim();
      if (cleanLine && !title) {
        title = cleanLine;
        break;
      }
    }

    // Look for location mentions
    const locationKeywords = ['location:', 'where:', 'venue:', 'place:'];
    for (let line of lines) {
      const lowerLine = line.toLowerCase();
      for (let keyword of locationKeywords) {
        if (lowerLine.includes(keyword)) {
          location = line.split(':')[1]?.trim() || '';
          break;
        }
      }
      if (location) break;
    }

    // Look for duration mentions
    const durationRegex = /(\d+)\s*(hour|hr|day|minute|min)/i;
    for (let line of lines) {
      const match = line.match(durationRegex);
      if (match) {
        duration = match[0];
        break;
      }
    }

    // Look for budget mentions
    const budgetRegex = /\$(\d+)/;
    for (let line of lines) {
      const match = line.match(budgetRegex);
      if (match) {
        budget = `$${match[1]} per person`;
        break;
      }
    }

    // Look for participant mentions
    const participantRegex = /(\d+)\s*(people|person|participant|guest)/i;
    for (let line of lines) {
      const match = line.match(participantRegex);
      if (match) {
        participants = match[1];
        break;
      }
    }

    return { title, location, duration, budget, participants };
  };

  const generateAIPlan = async () => {
    if (!formData.preferences.trim()) {
      alert('Please describe what kind of outing you want to plan!');
      return;
    }

    setIsGenerating(true);
    setShowAiResult(false);

    try {
        const prompt = `You are an expert trip planner. Create a comprehensive outing plan based on these details:

  **User Preferences:** "${formData.preferences}"
  ${formData.location ? `**Location:** ${formData.location}` : ''}
  ${formData.participants ? `**Group Size:** ${formData.participants} people` : ''}
  ${formData.category ? `**Activity Category:** ${formData.category}` : ''}

  Present the information in a clean, mobile-friendly format with clear sections. Use simple formatting without tables or complex layouts:

  🎯 OUTING TITLE
  [Create an engaging, descriptive title]

  📝 OVERVIEW
  [Brief 2-3 sentence summary with main highlights]

  ⏰ DETAILED ITINERARY
  Format each activity as:
  🕒 [Time] - [Activity Name]
  📍 Location: [Specific location]
  ⌚ Duration: [How long]
  💰 Cost: Rs. [total estimated amount] 
  ℹ️ Notes: [Special instructions or tips]


  
  Total per person: Rs. [total]
  Group total (${formData.participants || 'X'} people): Rs. [group total]

  💡 Cost-saving tips: [Free alternatives]

  🎒 PACKING ESSENTIALS
  Must bring:
  • [Essential item 1]
  • [Essential item 2]
  • [Essential item 3]
  
  Weather gear:
  • [Weather item 1]
  • [Weather item 2]
  
  Optional extras:
  • [Optional item 1]
  • [Optional item 2]

  ☔ BACKUP PLAN
  If weather is poor:
  • [Indoor alternative 1]
  • [Indoor alternative 2]
  • [Modified plan]

  🌟 PRO TIPS
  • Best time to visit: [timing advice]
  • Avoid crowds: [crowd tips]
  • Photography: [photo spots]
  • Local secrets: [insider knowledge]
  • Food recommendations: [dining suggestions]

  📋 BOOKING & PREP
  1 week before:
  • [Advance booking item]
  • [Preparation task]
  
  1 day before:
  • [Final preparations]
  • [Weather check]
  
  Day of trip:
  • [Morning tasks]

  Use emojis and clear formatting. Keep each section concise and actionable. Avoid tables or complex layouts that don't display well on mobile devices.`;

      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/ai/generate-plan`, {
        prompt
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok.');
      }

      const aiResponse = response.data.plan;
      setAiSuggestion(aiResponse);
      setShowAiResult(true);

      // Enhanced auto-fill with better parsing
      const parsed = parseAIResponse(aiResponse);
      
      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title || 'AI-Generated Outing',
        location: parsed.location || prev.location,
        duration: parsed.duration || prev.duration || 'Full Day',
        budget: parsed.budget || prev.budget,
        participants: parsed.participants || prev.participants
      }));

      // Show form on mobile after generation
      if (window.innerWidth < 768) {
        setShowMobileForm(true);
      }

    } catch (error) {
      console.error('Error generating AI plan:', error);
      alert('Sorry, there was an error generating your plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.date) {
      alert('Please fill in all required fields!');
      return;
    }

    const newPlan = {
      ...formData,
      description: aiSuggestion || formData.preferences,
      activities: [],
      participants: parseInt(formData.participants) || 1
    };

    onAddPlan(newPlan);
    
    // Reset form
    setFormData({
      title: '',
      location: '',
      date: '',
      time: '',
      duration: '',
      participants: '',
      category: 'adventure',
      budget: '',
      preferences: ''
    });
    setAiSuggestion('');
    setShowAiResult(false);
    setShowMobileForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* FULL SCREEN MODAL - Updated dimensions */}
      <div className="bg-slate-800 rounded-none sm:rounded-xl shadow-2xl border border-slate-700 w-full h-full sm:w-[98vw] sm:h-[98vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-b border-slate-700">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-100 mb-1">AI-Powered Outing Planner</h2>
                <p className="text-slate-300 text-xs sm:text-sm">Describe your perfect day and let AI create a detailed itinerary</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700/50 hover:bg-slate-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout - Full height */}
        <div className="hidden md:flex h-[calc(98vh-6rem)]">
          {/* Form Section */}
          <div className="w-1/2 overflow-y-auto">
            {/* Prominent AI Prompt Section */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">Tell AI About Your Dream Outing</h3>
              </div>
              
              <div className="relative">
                <textarea
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  onFocus={() => setPromptFocus(true)}
                  onBlur={() => setPromptFocus(false)}
                  placeholder="Be specific! The more details you provide, the better your AI-generated plan will be. Include activities you enjoy, atmosphere you want, dietary preferences, accessibility needs, etc."
                  rows={5}
                  className={`w-full px-4 py-3 bg-slate-700/50 border-2 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none resize-none transition-all duration-200 ${
                    promptFocus 
                      ? 'border-emerald-400/50 bg-slate-700/70 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-600/50 hover:border-slate-500'
                  }`}
                  required
                />
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Need inspiration? Try these:</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {samplePrompts.slice(0, 3).map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => useSamplePrompt(prompt)}
                      className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-emerald-500/30 rounded-lg text-sm text-slate-300 hover:text-slate-200 transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        <span className="leading-relaxed">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Generate Button */}
              <button
                type="button"
                onClick={generateAIPlan}
                disabled={isGenerating || !formData.preferences.trim()}
                className={`mt-6 w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 text-lg ${
                  isGenerating || !formData.preferences.trim()
                    ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform hover:scale-[1.02]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>AI is Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate My Perfect Plan</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </>
                )}
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Beach Day Adventure"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Santa Monica Beach"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    People
                  </label>
                  <input
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    placeholder="4"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                  >
                    <option value="adventure">Adventure</option>
                    <option value="relaxation">Relaxation</option>
                    <option value="cultural">Cultural</option>
                    <option value="food">Food & Dining</option>
                    <option value="nature">Nature</option>
                    <option value="social">Social</option>
                    <option value="sports">Sports</option>
                    <option value="shopping">Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Rs. 500"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-xl hover:shadow-emerald-500/25 transform hover:scale-[1.02]"
                >
                  <Send className="w-5 h-5" />
                  <span>Create My Outing Plan</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Results Display - Full height */}
          <div className="w-1/2 bg-slate-750 border-l border-slate-700 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-slate-800 to-slate-750 p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-slate-100 flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                AI Generated Itinerary
              </h3>
              <p className="text-slate-400">
                Your personalized plan will appear here with detailed timeline and suggestions
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!showAiResult && !isGenerating && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-3">Ready to Plan Something Amazing?</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Describe your ideal outing in detail, then click the generate button to receive a comprehensive, personalized itinerary created just for you.
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Loader className="w-10 h-10 text-emerald-400 animate-spin" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-200 mb-3">AI is Crafting Your Perfect Day</h4>
                    <p className="text-slate-400 mb-4">
                      Analyzing your preferences and creating a detailed itinerary...
                    </p>
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              {showAiResult && aiSuggestion && (
                <div className="p-6 space-y-4">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">AI GENERATED PLAN</span>
                      </div>
                      <span className="text-xs text-slate-400">Just now</span>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                      <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap space-y-4">
                        {aiSuggestion.split('\n\n').map((section, index) => (
                          <div key={index} className="space-y-2">
                            {section.split('\n').map((line, lineIndex) => (
                              <div key={lineIndex} className={`
                                ${line.match(/^\d+\./) ? 'font-bold text-emerald-300 text-base mt-4 mb-2' : ''}
                                ${line.startsWith('-') ? 'ml-4 text-slate-300' : ''}
                                ${line.includes('Time:') || line.includes('Activity:') || line.includes('Location:') ? 'font-medium text-blue-300' : ''}
                                ${line.includes('Cost:') ? 'font-medium text-yellow-300' : ''}
                              `}>
                                {line}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center text-emerald-400 mb-2">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm font-semibold">Smart Auto-Fill Applied</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your form has been automatically populated with key details from the AI plan. Review and adjust as needed before creating your outing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Full screen height */}
        <div className="md:hidden h-[calc(100vh-4rem)] overflow-y-auto">
          {/* AI Prompt Section */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Tell AI About Your Dream Outing</h3>
            </div>
            
            <div className="relative">
              <textarea
                name="preferences"
                value={formData.preferences}
                onChange={handleInputChange}
                placeholder="Be specific! Include activities, atmosphere, budget, dietary preferences, accessibility needs, etc."
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400/50 resize-none text-sm"
                required
              />
            </div>

            {/* Sample Prompts - Collapsible on mobile */}
            <div className="mt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-slate-300">Try these examples:</span>
              </div>
              <div className="space-y-2">
                {samplePrompts.slice(0, 2).map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => useSamplePrompt(prompt)}
                    className="w-full text-left p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-xs text-slate-300 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={generateAIPlan}
              disabled={isGenerating || !formData.preferences.trim()}
              className={`mt-4 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                isGenerating || !formData.preferences.trim()
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>AI is Planning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My Plan</span>
                </>
              )}
            </button>
          </div>

          {/* AI Results - Mobile */}
          {showAiResult && aiSuggestion && (
            <div className="p-4 bg-slate-750 border-b border-slate-700">
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">AI GENERATED PLAN</span>
                  </div>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3 max-h-80 overflow-y-auto">
                  <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap space-y-3">
                    {aiSuggestion.split('\n\n').map((section, index) => (
                      <div key={index} className="space-y-1">
                        {section.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex} className={`
                            ${line.match(/^\d+\./) ? 'font-bold text-emerald-300 text-sm mt-3 mb-1' : ''}
                            ${line.startsWith('-') ? 'ml-3 text-slate-300' : ''}
                            ${line.includes('Time:') || line.includes('Activity:') || line.includes('Location:') ? 'font-medium text-blue-300' : ''}
                            ${line.includes('Cost:') ? 'font-medium text-yellow-300' : ''}
                          `}>
                            {line}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="flex items-center text-emerald-400 mb-1">
                    <Zap className="w-3 h-3 mr-2" />
                    <span className="text-xs font-semibold">Auto-Fill Applied</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Form fields updated with AI suggestions. Review below before creating.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Toggle for Mobile */}
          {showAiResult && (
            <div className="p-4 border-b border-slate-700">
              <button
                type="button"
                onClick={() => setShowMobileForm(!showMobileForm)}
                className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg text-slate-200 hover:bg-slate-700/50 transition-colors"
              >
                <span className="font-medium">Review & Complete Form</span>
                {showMobileForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Mobile Form */}
          {(showMobileForm || !showAiResult) && (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Beach Day Adventure"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Santa Monica Beach"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      People
                    </label>
                    <input
                      type="number"
                      name="participants"
                      value={formData.participants}
                      onChange={handleInputChange}
                      placeholder="4"
                      min="1"
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Budget
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="$100 pp"
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    >
                      <option value="adventure">Adventure</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="cultural">Cultural</option>
                      <option value="food">Food & Dining</option>
                      <option value="nature">Nature</option>
                      <option value="social">Social</option>
                      <option value="sports">Sports</option>
                      <option value="shopping">Shopping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="4 hours"
                      className="w-full px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Create My Outing Plan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}