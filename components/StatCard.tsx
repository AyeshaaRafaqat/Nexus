import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && <p className="text-xs text-green-500 mt-2 font-medium">{trend}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
