import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';
import { CloseIcon, TrashIcon, PencilIcon, PlusIcon, UserIcon, SaveIcon, UsersIcon, UploadIcon, DownloadIcon } from './IconComponents';
import ImportPlayersModal from './ImportPlayersModal';

interface EditablePlayerRowProps {
  player: Player;
  onUpdate: (id: string, newName: string, newPhone: string) => void;
  onRemove: (id: string) => void;
}

const EditablePlayerRow: React.FC<EditablePlayerRowProps> = ({ player, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [phone, setPhone] = useState(player.phone || '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && (name.trim() !== player.name || phone.trim() !== (player.phone || ''))) {
      onUpdate(player.id, name.trim(), phone.trim());
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(player.name);
    setPhone(player.phone || '');
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        {isEditing ? (
          <div className="flex-1 grid grid-cols-2 gap-2" onKeyDown={handleKeyDown}>
            <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="SĐT/Zalo" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <span className="text-gray-900 truncate" title={player.name}>{player.name}</span>
            <span className="text-gray-500 truncate" title={player.phone}>{player.phone || 'Chưa có SĐT'}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-2 text-emerald-500 hover:text-emerald-400" title="Lưu"><SaveIcon className="w-5 h-5" /></button>
            <button onClick={handleCancel} className="p-2 text-gray-500 hover:text-gray-800" title="Hủy"><CloseIcon className="w-5 h-5" /></button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-gray-800" title="Sửa"><PencilIcon className="w-5 h-5" /></button>
            <button onClick={() => onRemove(player.id)} className="p-2 text-gray-500 hover:text-red-500" title="Xóa"><TrashIcon className="w-5 h-5" /></button>
          </>
        )}
      </div>
    </div>
  );
};


interface PlayerManagementModalProps {
  onClose: () => void;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayerInfo: (id: string, newName: string, newPhone: string) => void;
  onImportPlayers: (players: { name: string; phone?: string }[]) => void;
}

const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  onClose,
  players,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerInfo,
  onImportPlayers,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleAddClick = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleExport = () => {
    if (players.length === 0) {
      alert("Không có người chơi nào để xuất file.");
      return;
    }
    
    const escapeCsvValue = (value: string | undefined | null): string => {
        if (value === null || value === undefined) {
            return '""';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
             return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return `"${stringValue}"`;
    };

    const csvHeader = "Họ và tên,SDT/zalo\n";
    const csvRows = players.map(p => 
        [escapeCsvValue(p.name), escapeCsvValue(p.phone)].join(',')
    ).join("\n");
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "danh-sach-nguoi-choi.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = (newPlayers: { name: string; phone?: string }[]) => {
      onImportPlayers(newPlayers);
      setIsImportModalOpen(false);
      onClose();
  };

  return (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center text-xl font-semibold text-emerald-600">
                <UsersIcon className="w-6 h-6 mr-3" />
                Quản lý danh sách người chơi
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsImportModalOpen(true)} className="p-2 text-gray-500 hover:text-gray-800 transition-colors" title="Nhập danh sách (CSV)">
                    <UploadIcon className="w-5 h-5" />
                </button>
                <button onClick={handleExport} className="p-2 text-gray-500 hover:text-gray-800 transition-colors" title="Xuất danh sách (CSV)">
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between px-2 text-sm font-bold text-gray-500">
                <div className="flex-1 grid grid-cols-2 gap-2 ml-10">
                    <span>Họ và tên</span>
                    <span>SĐT/Zalo</span>
                </div>
                <div className="w-20 text-center">Thao tác</div>
            </div>
            {players.length > 0 ? (
                players.map(player => (
                <EditablePlayerRow
                    key={player.id}
                    player={player}
                    onUpdate={onUpdatePlayerInfo}
                    onRemove={onRemovePlayer}
                />
                ))
            ) : (
                <p className="text-center text-gray-500 py-4">Chưa có người chơi nào.</p>
            )}
            </main>

            <footer className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
                <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={handleAddKeyDown}
                placeholder="Nhập tên người chơi mới..."
                className="flex-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                onClick={handleAddClick}
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                <PlusIcon className="w-5 h-5 mr-1" />
                Thêm
                </button>
            </div>
            </footer>
        </div>
        </div>
        {isImportModalOpen && (
            <ImportPlayersModal 
                onClose={() => setIsImportModalOpen(false)}
                onConfirmImport={handleConfirmImport}
            />
        )}
    </>
  );
};

export default PlayerManagementModal;