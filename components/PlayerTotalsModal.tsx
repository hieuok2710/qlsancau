
import React from 'react';
import { PlayerDetails } from '../types';
import { CloseIcon, ClipboardListIcon, UserIcon, CheckCircleIcon } from './IconComponents';
import { COURT_FEE, DRINKS } from '../constants';

interface PlayerTotalsModalProps {
  onClose: () => void;
  playerDetailsList: PlayerDetails[];
  formatCurrency: (amount: number) => string;
}

const PlayerTotalsModal: React.FC<PlayerTotalsModalProps> = ({ onClose, playerDetailsList, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <ClipboardListIcon className="w-6 h-6 mr-3" />
            Chi tiết thanh toán cá nhân
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {playerDetailsList.length > 0 ? (
            playerDetailsList.map((details) => (
              <div key={details.id} className={`p-4 rounded-lg border ${details.isPaid ? 'bg-green-50/70 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {details.isPaid ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-emerald-500" />
                    )}
                    <span className="font-bold text-lg text-gray-900">{details.name}</span>
                  </div>
                  {details.losses > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                      Thua {details.losses}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm pl-9 text-gray-600">
                    <div className="flex justify-between"><span>Tiền sân:</span> <span className="text-gray-800">{formatCurrency(COURT_FEE * (details.quantity || 1))}</span></div>
                    {details.drinksCost > 0 && (
                      <div>
                        <div className="flex justify-between">
                            <span>Tiền nước:</span>
                            <span className="text-gray-800">{formatCurrency(details.drinksCost)}</span>
                        </div>
                        <div className="pl-4 text-xs text-gray-500">
                            {Object.entries(details.consumedDrinks).map(([drinkId, quantity]) => {
                                const drink = DRINKS.find(d => d.id === drinkId);
                                return drink ? (
                                    <div key={drinkId} className="flex justify-between">
                                        <span>- {drink.name} x{quantity}</span>
                                        {/* FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. Ensure quantity is a number for calculation. */}
                                        <span>{formatCurrency(drink.price * Number(quantity))}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between"><span>Phí cầu:</span> <span className="text-gray-800">{formatCurrency(details.shuttlecockCost)}</span></div>
                    {details.adjustment?.amount !== 0 && details.adjustment?.amount && (
                      <div>
                        <div className={`flex justify-between font-semibold ${details.adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Điều chỉnh:</span> 
                            <span>{formatCurrency(details.adjustment.amount)}</span>
                        </div>
                        {details.adjustment.reason && (
                           <p className="text-xs text-gray-400 italic pl-2">- {details.adjustment.reason}</p>
                        )}
                      </div>
                    )}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-2 pl-9 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Tổng cộng:</span>
                    <span className={`font-bold text-xl ${details.isPaid ? 'text-gray-500 line-through' : 'text-emerald-600'}`}>{formatCurrency(details.totalCost)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Không có người chơi nào để tính toán.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PlayerTotalsModal;
