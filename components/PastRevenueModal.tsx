import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { CloseIcon, CalendarIcon, BillIcon, ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface PastRevenueModalProps {
  onClose: () => void;
  sessions: Session[];
  formatCurrency: (amount: number) => string;
}

const PastRevenueModal: React.FC<PastRevenueModalProps> = ({ onClose, sessions, formatCurrency }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const revenueByDate = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach(session => {
      try {
        const date = new Date(session.date);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date found for session ${session.id}: ${session.date}`);
          return; // Skip invalid dates
        }

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const currentRevenue = map.get(dateKey) || 0;
        map.set(dateKey, currentRevenue + session.summary.grandTotal);
      } catch (e) {
          console.error(`Failed to process session for revenue calendar: ${session.id}`, e);
      }
    });
    return map;
  }, [sessions]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`pad-${i}`} className="w-full h-16"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const revenue = revenueByDate.get(dateKey);

      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      const cellClasses = [
        "w-full h-16 text-center rounded-lg transition-all duration-200 flex flex-col items-center justify-center p-1 border",
        revenue ? "cursor-pointer hover:bg-gray-100" : "text-gray-400 border-transparent",
        isSelected ? "bg-emerald-600 text-white ring-2 ring-offset-2 ring-offset-white ring-emerald-400 border-transparent" : "border-gray-200",
        !isSelected && isToday ? "bg-gray-100 font-bold border-gray-300" : "",
        !isSelected && revenue ? "bg-white" : "",
        !revenue && !isSelected ? "bg-transparent" : ""
      ].join(" ");

      cells.push(
        <button
          key={day}
          disabled={!revenue}
          onClick={() => handleDayClick(day)}
          className={cellClasses}
        >
          <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{day}</span>
          {revenue && (
            <span className={`text-xs mt-1 font-semibold ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
              {formatCurrency(revenue/1000).replace(/\s*₫|,00/g, '')}K
            </span>
          )}
        </button>
      );
    }
    return cells;
  };
  
  const selectedRevenue = selectedDate ? revenueByDate.get(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`) : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <CalendarIcon className="w-6 h-6 mr-3" />
            Lịch sử doanh thu
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h3 className="text-lg font-bold text-gray-900 tracking-wide">
                    {currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRightIcon className="w-6 h-6"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-bold mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>
        </main>
        
        <footer className="p-4 bg-gray-50 border-t border-gray-200 mt-auto min-h-[90px] rounded-b-lg">
          {selectedDate ? (
            <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between animate-in fade-in duration-300 border border-gray-200">
                <div className="flex items-center">
                    <BillIcon className="w-6 h-6 text-blue-500 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500">
                            {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedRevenue || 0)}</p>
                    </div>
                </div>
              </div>
          ) : (
             <div className="text-center text-gray-500 pt-3">
                Chọn một ngày trên lịch để xem chi tiết doanh thu.
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default PastRevenueModal;