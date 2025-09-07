import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Users, Plus, Car, Camera, Coffee, Mountain, Search, Filter } from 'lucide-react';
import AddPlanModal from './plannermodal';

export default function OutingPlannerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outings, setOutings] = useState([
    
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddOuting = (newOuting) => {
    const outing = {
      id: Date.now(),
      ...newOuting,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'planning'
    };
    setOutings(prev => [outing, ...prev]);
    setIsModalOpen(false);
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'beach': return 'bg-blue-500/20 text-blue-400';
      case 'adventure': return 'bg-emerald-500/20 text-emerald-400';
      case 'food': return 'bg-orange-500/20 text-orange-400';
      case 'culture': return 'bg-purple-500/20 text-purple-400';
      case 'nature': return 'bg-green-500/20 text-green-400';
      case 'nightlife': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'planning': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'beach': return <Camera className="w-4 h-4" />;
      case 'adventure': return <Mountain className="w-4 h-4" />;
      case 'food': return <Coffee className="w-4 h-4" />;
      case 'culture': return <Camera className="w-4 h-4" />;
      case 'nature': return <Mountain className="w-4 h-4" />;
      case 'nightlife': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredOutings = outings.filter(outing => {
    const matchesSearch = outing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || outing.category.toLowerCase() === filterCategory;
    const matchesStatus = filterStatus === 'all' || outing.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = outings.length;
    const completed = outings.filter(o => o.status === 'completed').length;
    const confirmed = outings.filter(o => o.status === 'confirmed').length;
    const planning = outings.filter(o => o.status === 'planning').length;
    
    return { total, completed, confirmed, planning };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Outing Planner</h1>
            <p className="text-sm text-slate-400 mt-1">
              Plan amazing outings with AI-powered suggestions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">AI Ready</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Total Outings</h3>
                <p className="text-sm text-slate-400">All planned</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
        </div>

        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Completed</h3>
                <p className="text-sm text-slate-400">Adventures done</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
        </div>

        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Confirmed</h3>
                <p className="text-sm text-slate-400">Ready to go</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.confirmed}</div>
        </div>

        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Planning</h3>
                <p className="text-sm text-slate-400">In progress</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.planning}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Plan New Outing</span>
        </button>

        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search outings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Categories</option>
            <option value="beach">Beach</option>
            <option value="adventure">Adventure</option>
            <option value="food">Food</option>
            <option value="culture">Culture</option>
            <option value="nature">Nature</option>
            <option value="nightlife">Nightlife</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Outings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOutings.map((outing) => (
          <div key={outing.id} className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(outing.category)}`}>
                  {getCategoryIcon(outing.category)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{outing.title}</h3>
                  <p className="text-sm text-slate-400">{outing.location}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(outing.status)}`}>
                {outing.status}
              </span>
            </div>

            <p className="text-slate-300 text-sm mb-4 line-clamp-2">{outing.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(outing.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{outing.time}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{outing.participants} people</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Car className="w-4 h-4" />
                  <span>{outing.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(outing.category)}`}>
                  {outing.category}
                </span>
                <span className="text-emerald-400 font-medium">{outing.budget}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex flex-wrap gap-2">
                {outing.activities.slice(0, 3).map((activity, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                    {activity}
                  </span>
                ))}
                {outing.activities.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                    +{outing.activities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOutings.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No outings found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filters, or create a new outing plan.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Plan Your First Outing</span>
          </button>
        </div>
      )}

      {/* Add Plan Modal */}
      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlan={handleAddOuting}
      />
    </div>
  );
}