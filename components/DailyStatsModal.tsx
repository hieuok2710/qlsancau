import React from 'react';
import { CloseIcon, ChartBarIcon, UsersIcon, BillIcon } from './IconComponents';

interface DailyStatsModalProps {
  onClose: () => void;
  stats: {
    totalRevenue: number;
    uniquePlayers: number;
  };
  formatCurrency: (amount: number) => string;
}

const DailyStatsModal: React.FC<DailyStatsModalProps> = ({ onClose, stats, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <ChartBarIcon className="w-6 h-6 mr-3" />
            Thống kê hôm nay
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                <div className="flex items-center">
                    <BillIcon className="w-8 h-8 text-emerald-500 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-blue-500 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500">Tổng số người chơi</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.uniquePlayers}</p>
                    </div>
                </div>
            </div>
             <p className="text-xs text-center text-gray-400 pt-2">
                *Thống kê được tính dựa trên các buổi chơi đã được lưu trong ngày.
            </p>
        </main>
      </div>
    </div>
  );
};

export default DailyStatsModal;