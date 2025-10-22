
import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { HistoryIcon, CloseIcon, TrashIcon, ChevronDownIcon, CheckCircleIcon } from './IconComponents';
import { DRINKS } from '../constants';

interface HistoryModalProps {
  onClose: () => void;
  sessions: Session[];
  onClearHistory: () => void;
  formatCurrency: (amount: number) => string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, sessions, onClearHistory, formatCurrency }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleSession = (id: string) => {
    setExpandedSessionId(prevId => (prevId === id ? null : id));
  };

  const getGameTypeLabel = (type: 'practice' | 'singles' | 'doubles') => {
    switch (type) {
        case 'practice': return 'Giao hữu';
        case 'singles': return 'Đơn';
        case 'doubles': return 'Đôi';
    }
  };

  const groupedByDate = useMemo(() => {
    const groups: Record<string, { dateObj: Date, sessions: Session[], totalRevenue: number }> = {};
    
    sessions.forEach(session => {
        try {
            const sessionDate = new Date(session.date);
            if (isNaN(sessionDate.getTime())) {
                console.warn(`Invalid date found for session ${session.id}: ${session.date}`);
                return; // Skip this session
            }

            const dateKey = `${sessionDate.getFullYear()}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}-${sessionDate.getDate().toString().padStart(2, '0')}`;
            
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    dateObj: sessionDate,
                    sessions: [],
                    totalRevenue: 0
                };
            }
            
            groups[dateKey].sessions.push(session);
            groups[dateKey].totalRevenue += session.summary.grandTotal;
        } catch (e) {
            console.error(`Failed to process session ${session.id}`, e);
        }
    });
    
    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [sessions]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <HistoryIcon className="w-6 h-6 mr-3" />
            Lịch sử các buổi chơi
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {groupedByDate.length > 0 ? (
            groupedByDate.map(group => (
              <div key={group.dateObj.toISOString()} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-emerald-700">
                        {group.dateObj.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="font-bold text-emerald-600">{formatCurrency(group.totalRevenue)}</p>
                    </div>
                </div>
                <div className="space-y-3">
                  {group.sessions.map(session => (
                    <div key={session.id} className="bg-white rounded-lg transition-shadow hover:shadow-md border border-gray-200">
                      <button onClick={() => toggleSession(session.id)} className="w-full flex items-center justify-between p-4 text-left">
                        <div>
                          <p className="font-semibold text-gray-800">{new Date(session.date).toLocaleTimeString('vi-VN')}</p>
                          <p className="text-sm text-gray-500">{session.players.length} người chơi - {getGameTypeLabel(session.gameType)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="font-bold text-lg text-emerald-600">{formatCurrency(session.summary.grandTotal)}</span>
                           <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedSessionId === session.id ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expandedSessionId === session.id && (
                        <div className="px-4 pb-4 border-t border-gray-200 animate-in fade-in duration-300">
                          <h4 className="text-md font-semibold mt-3 mb-2 text-emerald-700">Chi tiết người chơi:</h4>
                          <div className="space-y-2">
                              {session.players.map(player => {
                                return (
                                  <div key={player.id} className="flex justify-between items-center p-2 rounded bg-gray-100">
                                      <div className="flex items-center gap-2">
                                        {player.isPaid && <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" title="Đã thanh toán" />}
                                        <div>
                                            <p className="font-medium text-gray-800">{player.name}
                                              {player.losses > 0 && <span className="ml-2 text-xs text-red-600">({player.losses} lần thua)</span>}
                                            </p>
                                             <div className="text-xs text-gray-500">
                                                {Object.entries(player.consumedDrinks).map(([drinkId, quantity]) => {
                                                    const drink = DRINKS.find(d => d.id === drinkId);
                                                    return drink ? <span key={drinkId} className="mr-3">{drink.name} (x{quantity})</span> : null;
                                                })}
                                                {player.adjustment?.amount !== 0 && player.adjustment?.amount && (
                                                  <span className={`font-semibold ${player.adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    Đ/c: {formatCurrency(player.adjustment.amount)}
                                                    {player.adjustment.reason && ` (${player.adjustment.reason})`}
                                                  </span>
                                                )}
                                            </div>
                                        </div>
                                      </div>
                                      <span className="font-semibold text-gray-700">{formatCurrency(player.totalCost)}</span>
                                  </div>
                                )
                              })}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-200 text-sm space-y-1 text-gray-600">
                              <p className="flex justify-between"><span>Tiền sân:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalCourtFee)}</span></p>
                              <p className="flex justify-between"><span>Tiền nước:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalDrinksCost)}</span></p>
                              <p className="flex justify-between"><span>Phí cầu:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalShuttlecockCost)}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Không có lịch sử nào được lưu.</p>
            </div>
          )}
        </main>

        <footer className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            {sessions.length > 0 && (
                 <button onClick={onClearHistory} className="w-full flex items-center justify-center bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-bold py-2 px-4 rounded-lg transition duration-300">
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Xóa toàn bộ lịch sử
                </button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default HistoryModal;
