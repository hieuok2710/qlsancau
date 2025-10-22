import React, { useState } from 'react';
import { PlayerDetails } from '../types';
import { MinusIcon, PlusIcon, UserIcon, ShuttlecockIcon, UsersIcon, AdjustmentsIcon, CheckCircleIcon, CashIcon } from './IconComponents';
import { DRINKS } from '../constants';

interface PlayerCardProps {
  playerDetails: PlayerDetails;
  onUpdateDrink: (id: string, drinkId: string, amount: number) => void;
  onUpdateQuantity: (id: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
  isAssigned: boolean;
  onOpenAdjustmentModal: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

const DrinkManager: React.FC<{
  playerDetails: PlayerDetails;
  onUpdateDrink: (id: string, drinkId: string, amount: number) => void;
  isPaid: boolean;
}> = ({ playerDetails, onUpdateDrink, isPaid }) => {
  const [selectedDrinkId, setSelectedDrinkId] = useState(DRINKS[0]?.id || '');

  const handleAddDrink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDrinkId) {
      onUpdateDrink(playerDetails.id, selectedDrinkId, 1);
    }
  };

  const consumedDrinksEntries = Object.entries(playerDetails.consumedDrinks);

  return (
    <div className="w-full" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
            <select
              id={`drink-select-${playerDetails.id}`}
              value={selectedDrinkId}
              onChange={(e) => setSelectedDrinkId(e.target.value)}
              disabled={isPaid}
              className="w-full appearance-none bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition"
            >
              {DRINKS.map(drink => (
                <option key={drink.id} value={drink.id}>{drink.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
        <button
          onClick={handleAddDrink}
          disabled={isPaid || !selectedDrinkId}
          className="flex-shrink-0 flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 p-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
          title="Thêm nước"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {consumedDrinksEntries.length > 0 && (
        <div className="space-y-2 text-sm mt-3">
          {consumedDrinksEntries.map(([drinkId, quantity]) => {
            const drink = DRINKS.find(d => d.id === drinkId);
            if (!drink) return null;
            return (
              <div key={drinkId} className="flex items-center justify-between bg-slate-100/80 p-1.5 pl-3 rounded-md">
                <span className="text-slate-600 font-medium">{drink.name}</span>
                <div className="flex items-center bg-white rounded-full border border-slate-200">
                  <button onClick={() => onUpdateDrink(playerDetails.id, drinkId, -1)} disabled={isPaid} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500"><MinusIcon className="w-4 h-4" /></button>
                  <span className="px-2.5 font-semibold text-center w-8">{quantity}</span>
                  <button onClick={() => onUpdateDrink(playerDetails.id, drinkId, 1)} disabled={isPaid} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500"><PlusIcon className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PlayerCard: React.FC<PlayerCardProps> = ({ playerDetails, onUpdateDrink, onUpdateQuantity, formatCurrency, isAssigned, onOpenAdjustmentModal, onTogglePaid }) => {
  const { isPaid = false, isGuest = false } = playerDetails;

  const baseClasses = "group relative p-5 rounded-xl shadow-sm transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6 overflow-hidden border";
  const stateClasses = isPaid 
    ? 'bg-emerald-50/70 border-emerald-200' 
    : isAssigned 
    ? 'opacity-60 bg-slate-50 border-slate-200' 
    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:scale-[1.01]';
  const guestClasses = !isPaid && isGuest ? 'bg-blue-50/70 border-blue-200' : '';

  const PayButton = () => (
    isPaid ? (
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePaid(playerDetails.id); }}
        className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-200 rounded-lg transition-colors hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
      >
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        Đã thanh toán
      </button>
    ) : (
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePaid(playerDetails.id); }}
        className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg transition-colors hover:bg-emerald-600 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
      >
        <CashIcon className="w-5 h-5 mr-2" />
        Thanh toán
      </button>
    )
  );

  return (
    <div className={`${baseClasses} ${stateClasses} ${guestClasses}`}>
      {isAssigned && !isPaid && (
        <div className="absolute top-2.5 left-2.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full z-10 border border-slate-200">
          Đã xếp sân
        </div>
      )}
      {isPaid && (
        <div className="absolute top-2.5 right-2.5 flex items-center bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full z-10 border border-emerald-200">
          <CheckCircleIcon className="w-4 h-4 mr-1.5" />
          ĐÃ THANH TOÁN
        </div>
      )}
      
      {/* Player Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-3.5 rounded-full border ${
            isPaid ? 'bg-emerald-100 border-emerald-200' 
            : isGuest ? 'bg-blue-100 border-blue-200' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          {isGuest ? (
            <UsersIcon className={`w-6 h-6 ${isPaid ? 'text-emerald-500' : 'text-blue-500'}`} />
          ) : (
            <UserIcon className={`w-6 h-6 ${isPaid ? 'text-emerald-500' : 'text-emerald-600'}`} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-bold text-lg ${isPaid ? 'text-slate-600' : 'text-slate-800'}`}>{playerDetails.name}</p>
            {!isGuest && playerDetails.losses > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                Thua {playerDetails.losses}
              </span>
            )}
          </div>
          
          {isGuest ? (
            <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
                <span className="font-medium text-slate-600 text-sm">Số lượng:</span>
                <div className="flex items-center bg-white rounded-full border border-slate-200">
                    <button onClick={() => onUpdateQuantity(playerDetails.id, -1)} disabled={isPaid} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500"><MinusIcon className="w-4 h-4" /></button>
                    <span className="px-3 text-base font-semibold w-8 text-center">{playerDetails.quantity}</span>
                    <button onClick={() => onUpdateQuantity(playerDetails.id, 1)} disabled={isPaid} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500"><PlusIcon className="w-4 h-4" /></button>
                </div>
            </div>
          ) : (
            playerDetails.shuttlecockCost > 0 && (
              <div className="flex items-center gap-1.5 text-sm animate-in fade-in duration-300 mt-1">
                <ShuttlecockIcon className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-slate-500">Phí cầu:</span>
                <span className="font-semibold text-amber-700">{formatCurrency(playerDetails.shuttlecockCost)}</span>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Drink Manager */}
      <div className="w-full md:w-60 flex-shrink-0">
        <DrinkManager playerDetails={playerDetails} onUpdateDrink={onUpdateDrink} isPaid={isPaid} />
      </div>

      {/* Cost & Payment */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 flex-wrap md:ml-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAdjustmentModal(playerDetails.id); }}
            disabled={isPaid}
            className="p-2 text-slate-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-500 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Điều chỉnh chi phí"
          >
            <AdjustmentsIcon className="w-5 h-5" />
          </button>
          <div className="text-right">
            <span className="font-semibold text-slate-500 text-sm">Tổng</span>
            <span className={`block font-bold text-3xl tracking-tight ${
                isPaid ? 'text-slate-500 line-through' 
                : isGuest ? 'text-blue-600' 
                : 'text-emerald-600'
            }`}>
                {formatCurrency(playerDetails.totalCost)}
            </span>
            {playerDetails.adjustment?.amount !== 0 && (
              <p className={`text-xs font-semibold ${playerDetails.adjustment?.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Đ/c: {formatCurrency(playerDetails.adjustment.amount || 0)}
              </p>
            )}
          </div>
        </div>
        <div className="w-full md:w-auto" onClick={e => e.stopPropagation()}>
            <PayButton />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
