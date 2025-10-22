import React, { useState, useEffect } from 'react';
import { PlayerDetails } from '../types';
import { CloseIcon, AdjustmentsIcon, SaveIcon } from './IconComponents';

interface CostAdjustmentModalProps {
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  player: PlayerDetails | null;
  formatCurrency: (amount: number) => string;
}

const CostAdjustmentModal: React.FC<CostAdjustmentModalProps> = ({ onClose, onConfirm, player, formatCurrency }) => {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (player) {
      setAmount(player.adjustment?.amount || 0);
      setReason(player.adjustment?.reason || '');
    }
  }, [player]);

  if (!player) return null;

  const handleConfirm = () => {
    onConfirm(amount, reason);
    onClose();
  };

  const calculatedCost = player.totalCost - (player.adjustment?.amount || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <AdjustmentsIcon className="w-6 h-6 mr-3" />
            Điều chỉnh chi phí
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4">
            <div className="text-center mb-4">
                <p className="text-gray-500">Người chơi</p>
                <p className="font-bold text-2xl text-gray-900">{player.name}</p>
                <p className="text-sm text-gray-500 mt-1">Chi phí đã tính: {formatCurrency(calculatedCost)}</p>
            </div>

            <div>
                <label htmlFor="adjustment-amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền điều chỉnh (VNĐ)</label>
                <input
                    id="adjustment-amount"
                    type="number"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="VD: 5000 hoặc -5000"
                    className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1">Nhập số dương để cộng thêm, số âm để giảm trừ.</p>
            </div>
             <div>
                <label htmlFor="adjustment-reason" className="block text-sm font-medium text-gray-700 mb-1">Lý do điều chỉnh</label>
                <textarea
                    id="adjustment-reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="VD: Trả nợ, mua thêm cầu..."
                    className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-500">Tổng chi phí mới</p>
                <p className="text-3xl font-bold text-emerald-600 tracking-tight">{formatCurrency(calculatedCost + amount)}</p>
            </div>
        </main>

        <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex gap-3">
             <button 
                onClick={onClose} 
                className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                Hủy
            </button>
            <button 
                onClick={handleConfirm} 
                className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <SaveIcon className="w-5 h-5 mr-2" />
                Lưu thay đổi
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CostAdjustmentModal;