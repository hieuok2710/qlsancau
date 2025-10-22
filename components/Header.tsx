import React from 'react';
import { ShuttlecockIcon, HistoryIcon, ChartBarIcon, CalendarIcon } from './IconComponents';

interface HeaderProps {
    onOpenHistory: () => void;
    onOpenStats: () => void;
    onOpenPastRevenue: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory, onOpenStats, onOpenPastRevenue }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <ShuttlecockIcon className="h-8 w-8 text-emerald-500 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wider">
              Quản lý sân cầu lông
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={onOpenPastRevenue}
                className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
                aria-label="View past revenue"
            >
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Doanh thu cũ</span>
            </button>
            <button
                onClick={onOpenStats}
                className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
                aria-label="View daily statistics"
            >
                <ChartBarIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Thống kê ngày</span>
            </button>
            <button
              onClick={onOpenHistory}
              className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
              aria-label="View session history"
            >
              <HistoryIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
