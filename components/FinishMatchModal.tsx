import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { CloseIcon, FlagIcon } from './IconComponents';

interface FinishMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gameType: 'singles' | 'doubles', loserIds: string[]) => void;
  players: Player[];
}

const FinishMatchModal: React.FC<FinishMatchModalProps> = ({ isOpen, onClose, onConfirm, players }) => {
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('doubles');
  const [losers, setLosers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setGameType('doubles');
      setLosers([]);
    }
  }, [isOpen]);

  const handleLoserChange = (index: number, newLoserId: string) => {
    setLosers(prev => {
      const newLosers = [...prev];
      newLosers[index] = newLoserId;
      return newLosers;
    });
  };

  const handleSubmit = () => {
    const validLosers = losers.filter(Boolean);
    if ((gameType === 'singles' && validLosers.length === 1) || (gameType === 'doubles' && validLosers.length === 2)) {
      onConfirm(gameType, validLosers);
    } else {
      alert(`Vui lòng chọn đủ ${gameType === 'singles' ? '1' : '2'} người thua.`);
    }
  };
  
  const numLosers = gameType === 'singles' ? 1 : 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center text-xl font-semibold text-emerald-400">
            <FlagIcon className="w-6 h-6 mr-3" />
            Kết thúc trận đấu
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Người chơi trong trận:</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                {players.map(p => (
                    <div key={p.id} className="bg-gray-700 p-2 rounded-md text-white font-medium">{p.name}</div>
                ))}
              </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Loại trận đấu:</h3>
                <div className="flex flex-col space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="finishGameType" value="doubles" checked={gameType === 'doubles'} onChange={() => { setGameType('doubles'); setLosers([]); }} className="form-radio h-5 w-5 text-emerald-500 bg-gray-700 border-gray-600 focus:ring-emerald-500"/>
                        <span>Đôi (2 người thua)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="finishGameType" value="singles" checked={gameType === 'singles'} onChange={() => { setGameType('singles'); setLosers([]); }} className="form-radio h-5 w-5 text-emerald-500 bg-gray-700 border-gray-600 focus:ring-emerald-500"/>
                        <span>Đơn (1 người thua)</span>
                    </label>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Chọn người thua:</h3>
                <div className="space-y-3">
                    {Array.from({ length: numLosers }).map((_, index) => (
                        <select 
                            key={index}
                            value={losers[index] || ''} 
                            onChange={(e) => handleLoserChange(index, e.target.value)} 
                            className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">-- Chọn người thua {index + 1} --</option>
                            {players
                                .filter(p => !losers.includes(p.id) || losers[index] === p.id)
                                .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    ))}
                </div>
            </div>
        </main>
        <footer className="p-4 border-t border-gray-700">
            <button onClick={handleSubmit} className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Xác nhận kết quả
            </button>
        </footer>
      </div>
    </div>
  );
};

export default FinishMatchModal;