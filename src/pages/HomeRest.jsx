import React from 'react';
import { Calculator, Shield, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function HomeRest() {
  const features = [
    {
      icon: Calculator,
      title: "Automated Split Calculation",
      description: "Our intelligent algorithm automatically calculates fair splits based on contribution ratios, expenses, and predefined rules. No more manual calculations or disputes over who owes what.",
      position: "left",
      visualization: "calculator"
    },
 
    {
      icon: Zap,
      title: "Instant Settlement Processing",
      description: "Execute settlements in real-time with our lightning-fast processing engine. Multi-party transactions are completed in seconds, not days.",
      position: "right",
      visualization: "speed"
    },
    {
      icon: Users,
      title: "Multi-Party Management",
      description: "Seamlessly manage complex splits involving multiple parties, different contribution types, and varying settlement schedules all from one unified dashboard.",
      position: "left",
      visualization: "users"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track settlement patterns, monitor cash flows, and generate detailed reports. Make data-driven decisions with comprehensive financial analytics.",
      position: "right",
      visualization: "analytics"
    },
    {
      icon: CheckCircle,
      title: "Compliance & Audit Trail",
      description: "Maintain complete transaction history with regulatory compliance features. Every settlement is logged, timestamped, and audit-ready for complete transparency.",
      position: "left",
      visualization: "compliance"
    }
  ];

  const renderVisualization = (type) => {
    switch(type) {
      case 'calculator':
        return (
          <div className="grid grid-cols-3 gap-2">
            {['$', '÷', '=', '1', '2', '3', '+', '-', '×'].map((symbol, i) => (
              <div 
                key={i}
                className="w-6 h-6 bg-slate-600/50 rounded border border-slate-500/30 flex items-center justify-center text-xs text-slate-300 font-mono"
              >
                {symbol}
              </div>
            ))}
          </div>
        );

      
      case 'speed':
        return (
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-600/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
            <div className="absolute inset-6 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div>
          </div>
        );
      
      case 'users':
        return (
          <div className="flex items-center justify-center space-x-1">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="w-6 h-6 bg-gradient-to-br from-blue-400/60 to-cyan-400/60 rounded-full border-2 border-slate-500/50 flex items-center justify-center"
                style={{ transform: `translateY(${i % 2 === 0 ? '0' : '-2px'})` }}
              >
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
            ))}
          </div>
        );
      
      case 'analytics':
        return (
          <div className="w-full max-w-20 space-y-1">
            {[80, 60, 90, 45, 70].map((width, i) => (
              <div 
                key={i}
                className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                style={{ width: `${width}%` }}
              ></div>
            ))}
          </div>
        );
      
      case 'compliance':
        return (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-6 bg-slate-600/50 rounded border border-slate-500/30 flex items-center justify-center"
              >
                <CheckCircle size={12} className="text-green-400" />
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-20 px-6" style={{background: 'linear-gradient(to bottom, #0C0B0E, #0A151B)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Our Features
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto"></div>
        </div>

        {/* Features Grid */}
        <div className="space-y-32">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isLeft = feature.position === "left";
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-16 ${isLeft ? 'flex-row' : 'flex-row-reverse'} max-lg:flex-col max-lg:text-center`}
              >
                {/* Image Section */}
                <div className="flex-1 relative">
                  <div className="relative">
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl transform rotate-3"></div>
                    
                    {/* Main container */}
                    <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 h-80 group hover:scale-105 transition-all duration-500 overflow-hidden">
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/30 to-transparent"></div>
                        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-full blur-3xl"></div>
                      </div>
                      
                      {/* Generated Image Content */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-500/30 flex flex-col items-center justify-center space-y-4">
                          {/* Icon */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50 scale-150"></div>
                            <IconComponent 
                              size={48} 
                              className="relative text-blue-400 drop-shadow-lg"
                            />
                          </div>
                          
                          {/* Feature-specific visualizations */}
                          {renderVisualization(feature.visualization)}
                        </div>
                      </div>
                      
                      {/* Animated particles */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-8 left-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                      <div className="absolute top-1/3 left-6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6">
                  <h3 className="text-4xl font-bold text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Feature highlight bar */}
                  
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-32 text-center">
          
          <p className="text-slate-400 mt-6 text-lg">
            Made By Vaidik Saxena (IIIT Lucknow CS '28)
          </p>
        </div>
      </div>
    </div>
  );
}