import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
export default function Dashboard() {
  const [dashboarddata, setDashboarddata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/data`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        console.log('API Response:', data);
        
        if (data.success) {
          setDashboarddata(data.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-slate-100">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-red-400">Error: {error}</h1>
        </div>
      </div>
    );
  }

  if (!dashboarddata) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-semibold text-slate-300">No data available</h1>
        </div>
      </div>
    );
  }

  const totalToGet = dashboarddata.summary?.totalToReceive || 0;
  const totalToGive = dashboarddata.summary?.totalToPay || 0;
  const netBalance = dashboarddata.summary?.netBalance || dashboarddata.totalBalance || 0;

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Financial Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Last updated: {formatDate(new Date())}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">Live</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Amount to Receive */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-emerald-400 text-xl">↗️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">To Receive</h3>
                <p className="text-sm text-slate-400">
                  {dashboarddata.toget?.length || 0} pending
                </p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
              Incoming
            </span>
          </div>
          <div className="mb-4">
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {formatCurrency(totalToGet)}
            </div>
            <div className="text-sm text-slate-400">Expected income</div>
          </div>
        </div>

        {/* Amount to Pay */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 text-xl">↙️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">To Pay</h3>
                <p className="text-sm text-slate-400">
                  {dashboarddata.togive?.length || 0} pending
                </p>
              </div>
            </div>
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
              Outgoing
            </span>
          </div>
          <div className="mb-4">
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {formatCurrency(totalToGive)}
            </div>
            <div className="text-sm text-slate-400">Pending payments</div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                netBalance >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
              }`}>
                <span className={`text-xl ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {netBalance >= 0 ? '💰' : '📉'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Net Balance</h3>
                <p className="text-sm text-slate-400">Overall position</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              netBalance >= 0 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {netBalance >= 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
          <div className="mb-4">
            <div className={`text-2xl font-bold mb-1 ${
              netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {formatCurrency(netBalance)}
            </div>
            <div className="text-sm text-slate-400">Net expected balance</div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Activity</h3>
                <p className="text-sm text-slate-400">Recent transactions</p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {dashboarddata.activities || 0}
            </div>
            <div className="text-sm text-slate-400">Total activities</div>
          </div>
          <div className="text-sm text-slate-400 mt-2">
            <div>Settlements: {(dashboarddata.toget?.length || 0) + (dashboarddata.togive?.length || 0)}</div>
            <div>Total Expense: {formatCurrency(dashboarddata.totalExpense || 0)}</div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Amount to Receive Details */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-100">
              Amount to Receive ({dashboarddata.toget?.length || 0})
            </h3>
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
          </div>
          <div className="space-y-4">
            {dashboarddata.toget && dashboarddata.toget.length > 0 ? (
              dashboarddata.toget.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center">
                      <span className="text-emerald-300 font-semibold text-sm">
                        {getInitials(item.usertogetfrom)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{item.usertogetfrom}</div>
                      <div className="text-sm text-slate-400">
                        Plan ID: {item.planId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">📭</div>
                <div>No pending amounts to receive</div>
              </div>
            )}
          </div>
        </div>

        {/* Amount to Pay Details */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-100">
              Amount to Pay ({dashboarddata.togive?.length || 0})
            </h3>
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          </div>
          <div className="space-y-4">
            {dashboarddata.togive && dashboarddata.togive.length > 0 ? (
              dashboarddata.togive.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                      <span className="text-red-300 font-semibold text-sm">
                        {getInitials(item.usertogive)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{item.usertogive}</div>
                      <div className="text-sm text-slate-400">
                        Plan ID: {item.planId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-400">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">✅</div>
                <div>No pending amounts to pay</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
{dashboarddata.expense && dashboarddata.expense.length > 0 && (
  <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-slate-100">Expense Trend</h3>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
        <span className="text-sm text-slate-300">Your Expenses</span>
      </div>
    </div>
    
    {/* Line Chart */}
    <div className="bg-slate-700/30 rounded-lg p-4">
      <LineChart
        height={300}
        
        series={[
          { 
            data: dashboarddata.expense, 
            label: 'Expenses',
            color: '#b0d7d2' // orange-400 color
          }
        ]}
        xAxis={[{ 
          scaleType: 'point', 
          data: dashboarddata.expense.map((_, index) => `Expense ${index + 1}`)
        }]}
        yAxis={[{ 
          width: 60,
          valueFormatter: (value) => formatCurrency(value)
        }]}
        margin={{ left: 80, right: 30, top: 30, bottom: 30 }}
        grid={{ vertical: true, horizontal: true }}
        sx={{
          '.MuiLineElement-root': {
            stroke: '#fb923c',
            strokeWidth: 2
          },
          '.MuiAreaElement-root': {
            fill: 'url(#orange-gradient)'
          },
'.MuiChartsAxis-tickLabel': {
  fill: '#ffffff' // white text for axis
},
'.MuiChartsLegend-label': {
  fill: '#ffffff' // white text for legend
},

          '.MuiChartsAxis-line': {
            stroke: '#475569'
          },
          '.MuiChartsGrid-line': {
            stroke: '#475569',
            strokeDasharray: '3 3'
          },
          '.MuiChartsLegend-label': {
            fill: '#e2e8f0'
          }
        }}
      />
    </div>
    
    {/* Total Expenses Summary */}
    <div className="mt-4 pt-4 border-t border-slate-700">
      <div className="flex justify-between items-center">
        <span className="text-slate-300">Total Expenses:</span>
        <span className="text-xl font-bold text-orange-400">
          {formatCurrency(dashboarddata.totalExpense || 0)}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-slate-300">Average Expense:</span>
        <span className="text-lg font-semibold text-orange-300">
          {formatCurrency(dashboarddata.expense.reduce((sum, exp) => sum + exp, 0) / dashboarddata.expense.length)}
        </span>
      </div>
    </div>
  </div>
)}
    </div>
  );
}