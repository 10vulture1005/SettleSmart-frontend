import React, { useState } from 'react'
import { ArrowRight, DollarSign, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

// Create axios instance for settlement API
const settlementApiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
settlementApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function Settlement({ plandata }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [settledData, setSettledData] = useState(null); // Store the settled data from backend

  const settlemap = new Map();
  
  // Build settlement map
  plandata.activities.forEach((activity) => {
    activity.customSplit.forEach((participant) => {
      if (!settlemap.has(participant.name)) {
        settlemap.set(participant.name, {});
      }
    });
  });

  plandata.activities.forEach((activity) => {
    const payer = activity.payee;
    const payerMap = settlemap.get(payer);

    if (!payerMap) return;

    activity.customSplit.forEach((participant) => {
      if (participant.name === payer) return;

      if (!payerMap[participant.name]) {
        payerMap[participant.name] = 0;
      }
      
      payerMap[participant.name] += Number(participant.amount) || 0;
    });
  });

  // Convert map to array for rendering
  const settlements = Array.from(settlemap.entries()).map(([receiver, debts]) => ({
    receiver,
    debts: Object.entries(debts).filter(([, amount]) => amount > 0)
  })).filter(settlement => settlement.debts.length > 0);

  // Function to send settlement data to server
  const handleSendSettlement = async () => {
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      setErrorMessage('');
      setSettledData(null);

      // Convert settlemap to a plain object for JSON serialization
      const settlementData = Object.fromEntries(
        Array.from(settlemap.entries()).map(([key, value]) => [key, value])
      );

      console.log('settlementData:', settlementData);
      

      const planId = plandata._id; // Assuming plandata has an _id field
      console.log('Plan ID:', planId);
      const response = await settlementApiClient.post('/settle', {settlementData,planId});
      
      console.log('Settlement response:', response.data);
      setSubmitStatus('success');
      setSettledData(response.data.data); // Store the settled data
      
      // Auto-hide success message after 5 seconds (increased time to read the data)
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);

    } catch (error) {
      console.error('Error sending settlement data:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Failed to send settlement data'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" absolute right-0 mt-1 w-72 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-20">
      <div className="p-4">
        <div className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          ₹ Settlement Summary
        </div>
        
        {settlements.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            No settlements required
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {settlements.map(({ receiver, debts }) => (
                <div key={receiver} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="space-y-1">
                    {debts.map(([debtor, amount]) => (
                      <div key={debtor} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{debtor}</span>
                          <ArrowRight size={12} className="text-slate-500" />
                          <span className="text-slate-300">{receiver}</span>
                        </div>
                        <span className="font-semibold text-emerald-400">
₹{amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          

            {/* Display Settled Data */}
            {settledData && settledData.length > 0 && (
              <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="text-sm font-semibold text-blue-400 mb-2">
                  Optimized Settlement:
                </div>
                <div className="space-y-1">
                  {settledData.map((settlement, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{settlement[0]}</span>
                        <ArrowRight size={12} className="text-slate-500" />
                        <span className="text-slate-300">{settlement[1]}</span>
                      </div>
                      <span className="font-semibold text-blue-400">
                        ₹{settlement[2].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Settlement Button */}
            <button
              onClick={handleSendSettlement}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isSubmitting
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white text-sm font-medium`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Settlement
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}