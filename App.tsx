
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Player, Session, PlayerDetails } from './types';
import { COURT_FEE, SHUTTLECOCK_FEE_PER_MATCH, GUEST_PLAYER_ID, GUEST_PLAYER_NAME, DRINKS } from './constants';
import Header from './components/Header';
import PlayerCard from './components/PlayerCard';
import Summary from './components/Summary';
import HistoryModal from './components/HistoryModal';
import DailyStatsModal from './components/DailyStatsModal';
import { UsersIcon, SaveIcon, ClipboardListIcon, BillIcon, CloseIcon, CourtIcon, FlagIcon, SparklesIcon, ChevronDownIcon, CheckCircleIcon } from './components/IconComponents';
import CourtAssignment from './components/CourtAssignment';
import PlayerTotalsModal from './components/PlayerTotalsModal';
import PastRevenueModal from './components/PastRevenueModal';
import PlayerManagementModal from './components/PlayerManagementModal';
import CostAdjustmentModal from './components/CostAdjustmentModal';

interface SaveConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  savedRevenueToday: number;
  formatCurrency: (amount: number) => string;
}

const SaveConfirmModal: React.FC<SaveConfirmModalProps> = ({ onClose, onConfirm, savedRevenueToday, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <SaveIcon className="w-6 h-6 mr-3" />
            Xác nhận lưu buổi chơi
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4">
            <p className="text-gray-600 text-center">
                Bạn có chắc chắn muốn kết thúc buổi chơi hiện tại, lưu kết quả và bắt đầu một buổi mới không?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                <div className="flex items-center">
                    <BillIcon className="w-8 h-8 text-blue-500 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500">Doanh thu đã lưu hôm nay</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(savedRevenueToday)}</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-gray-400">
                *Doanh thu của buổi chơi hiện tại sẽ được cộng vào sau khi lưu.
            </p>
        </main>

        <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex gap-3">
            <button 
                onClick={onClose} 
                className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                Hủy
            </button>
            <button 
                onClick={onConfirm} 
                className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <SaveIcon className="w-5 h-5 mr-2" />
                Xác nhận và Lưu
            </button>
        </footer>
      </div>
    </div>
  );
};

const createInitialPlayers = (): Player[] => {
    const guestPlayer: Player = {
        id: GUEST_PLAYER_ID,
        name: GUEST_PLAYER_NAME,
        consumedDrinks: {},
        isGuest: true,
        quantity: 1,
        adjustment: { amount: 0, reason: '' },
        isPaid: false,
    };

    try {
        const storedPlayers = localStorage.getItem('badmintonPlayers');
        if (storedPlayers) {
            const parsed = JSON.parse(storedPlayers) as { id: string, name: string, phone?: string }[];
            const regularPlayers = parsed.filter(p => p.id !== GUEST_PLAYER_ID).map(p => ({ ...p, consumedDrinks: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false }));
            return [guestPlayer, ...regularPlayers];
        }
    } catch (e) {
        console.error("Failed to load players from localStorage", e);
    }
    
    const defaultPlayers = [
        { id: crypto.randomUUID(), name: 'Người chơi 1', phone: '', consumedDrinks: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false },
        { id: crypto.randomUUID(), name: 'Người chơi 2', phone: '', consumedDrinks: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false },
    ];
    
    return [guestPlayer, ...defaultPlayers];
};

const savePlayersToStorage = (playersToSave: Player[]) => {
    try {
        const storablePlayers = playersToSave
            .filter(p => !p.isGuest)
            .map(({ id, name, phone }) => ({ id, name, phone }));
        localStorage.setItem('badmintonPlayers', JSON.stringify(storablePlayers));
    } catch (e) {
        console.error("Failed to save players to localStorage", e);
    }
};

const createInitialCourtGameTypes = (): Record<number, 'singles' | 'doubles'> => {
  const initialTypes: Record<number, 'singles' | 'doubles'> = {};
  for (let i = 0; i < 7; i++) {
    initialTypes[i] = 'doubles';
  }
  return initialTypes;
};


const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPlayerTotalsModalOpen, setIsPlayerTotalsModalOpen] = useState(false);
  const [isPlayerManagementModalOpen, setIsPlayerManagementModalOpen] = useState(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [isPastRevenueModalOpen, setIsPastRevenueModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [playerToAdjustId, setPlayerToAdjustId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [playerLosses, setPlayerLosses] = useState<Record<string, number>>({});
  const [playerShuttlecockFees, setPlayerShuttlecockFees] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [courtGameTypes, setCourtGameTypes] = useState<Record<number, 'singles' | 'doubles'>>(createInitialCourtGameTypes());
  const [courtColors, setCourtColors] = useState<Record<number, string>>({});
  const [isPlayerListVisible, setIsPlayerListVisible] = useState(true);
  
  useEffect(() => {
    setPlayers(createInitialPlayers());
    try {
      const storedSessions = localStorage.getItem('badmintonHistory');
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed)) {
          setSessions(parsed as Session[]);
        } else {
          setSessions([]);
        }
      }
      const storedColors = localStorage.getItem('badmintonCourtColors');
      if (storedColors) {
        setCourtColors(JSON.parse(storedColors));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setSessions([]); 
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const assignedPlayerIds = useMemo(() => {
    return new Set(Object.values(assignments).filter((id): id is string => id !== null));
  }, [assignments]);

  const unassignedPlayers = useMemo(() => {
    return players.filter(p => !assignedPlayerIds.has(p.id) && !p.isGuest);
  }, [players, assignedPlayerIds]);

  const handleAssignPlayer = useCallback((playerId: string, slotId: string) => {
    setAssignments(prev => {
        const newAssignments = { ...prev };
        const oldSlot = Object.keys(prev).find(key => prev[key] === playerId);
        if (oldSlot) {
            newAssignments[oldSlot] = null;
        }
        newAssignments[slotId] = playerId;
        return newAssignments;
    });
  }, []);

  const handleUnassign = useCallback((slotId: string) => {
    setAssignments(prev => {
        const newAssignments = { ...prev };
        newAssignments[slotId] = null;
        return newAssignments;
    });
  }, []);
  
  const handleAutoAssign = useCallback(() => {
    const availablePlayers = [...unassignedPlayers];
    const newAssignments = { ...assignments };

    if (availablePlayers.length === 0) {
      setNotification("Không có người chơi nào để xếp sân.");
      return;
    }

    for (let i = 0; i < 7; i++) { // Loop through courts
      if (availablePlayers.length === 0) break;

      const gameType = courtGameTypes[i] || 'doubles';
      const slotsToCheck = gameType === 'singles'
        ? [`court-${i}-A-0`, `court-${i}-B-0`]
        : [`court-${i}-A-0`, `court-${i}-A-1`, `court-${i}-B-0`, `court-${i}-B-1`];

      for (const slotId of slotsToCheck) {
        if (availablePlayers.length === 0) break;

        if (newAssignments[slotId] === null || newAssignments[slotId] === undefined) {
          const playerToAssign = availablePlayers.shift();
          if (playerToAssign) {
            newAssignments[slotId] = playerToAssign.id;
          }
        }
      }
    }
    
    setAssignments(newAssignments);
    setNotification("Đã tự động xếp người chơi vào sân.");
  }, [unassignedPlayers, assignments, courtGameTypes]);

  const handleAddPlayer = useCallback((name: string) => {
    if (!name.trim()) return;
    const newPlayer = { id: crypto.randomUUID(), name: name.trim(), phone: '', consumedDrinks: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayersToStorage(updatedPlayers);
  }, [players]);

  const handleRemovePlayer = useCallback((id: string) => {
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    savePlayersToStorage(updatedPlayers);
    setPlayerLosses(prev => {
        const newLosses = {...prev};
        delete newLosses[id];
        return newLosses;
    });
    setPlayerShuttlecockFees(prev => {
        const newFees = {...prev};
        delete newFees[id];
        return newFees;
    });
    setAssignments(prev => {
        const newAssignments = { ...prev };
        Object.keys(newAssignments).forEach(key => {
            if (newAssignments[key] === id) {
                newAssignments[key] = null;
            }
        });
        return newAssignments;
    });
  }, [players]);
  
  const handleUpdatePlayerInfo = useCallback((id: string, newName: string, newPhone: string) => {
    const updatedPlayers = players.map(p => p.id === id ? { ...p, name: newName, phone: newPhone } : p);
    setPlayers(updatedPlayers);
    savePlayersToStorage(updatedPlayers);
  }, [players]);

  const handleImportPlayers = useCallback((importedPlayers: { name: string; phone?: string }[]) => {
      const guestPlayer = players.find(p => p.isGuest);
      const newPlayerList: Player[] = importedPlayers.map(p => ({
          id: crypto.randomUUID(),
          name: p.name,
          phone: p.phone || '',
          consumedDrinks: {},
          quantity: 1,
          adjustment: { amount: 0, reason: '' },
          isPaid: false,
      }));
      
      const finalPlayers = guestPlayer ? [guestPlayer, ...newPlayerList] : newPlayerList;
      
      setAssignments({});
      setPlayerLosses({});
      setPlayerShuttlecockFees({});
      
      setPlayers(finalPlayers);
      savePlayersToStorage(finalPlayers);
      setNotification(`${newPlayerList.length} người chơi đã được nhập thành công.`);
  }, [players]);


  const handleUpdateDrink = useCallback((id: string, drinkId: string, amount: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const newDrinks = { ...p.consumedDrinks };
        const currentQuantity = newDrinks[drinkId] || 0;
        const newQuantity = Math.max(0, currentQuantity + amount);

        if (newQuantity === 0) {
          delete newDrinks[drinkId];
        } else {
          newDrinks[drinkId] = newQuantity;
        }
        
        return { ...p, consumedDrinks: newDrinks };
      }
      return p;
    }));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, amount: number) => {
    setPlayers(prev => prev.map(p =>
        p.id === id && p.isGuest ? { ...p, quantity: Math.max(1, (p.quantity || 1) + amount) } : p
    ));
  }, []);

  const handleOpenAdjustmentModal = useCallback((playerId: string) => {
    setPlayerToAdjustId(playerId);
    setIsAdjustmentModalOpen(true);
  }, []);

  const handleCloseAdjustmentModal = useCallback(() => {
    setPlayerToAdjustId(null);
    setIsAdjustmentModalOpen(false);
  }, []);

  const handleUpdatePlayerAdjustment = useCallback((playerId: string, amount: number, reason: string) => {
    setPlayers(prev => prev.map(p => 
        p.id === playerId 
        ? { ...p, adjustment: { amount, reason } }
        : p
    ));
  }, []);

  const handleTogglePaid = useCallback((id: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, isPaid: !p.isPaid } : p));
  }, []);

  const handleMarkAllPaid = useCallback(() => {
    setPlayers(prev => prev.map(p => ({ ...p, isPaid: true })));
  }, []);

  const handleSetCourtGameType = useCallback((courtIndex: number, gameType: 'singles' | 'doubles') => {
    setCourtGameTypes(prev => ({ ...prev, [courtIndex]: gameType }));

    if (gameType === 'singles') {
        setAssignments(prev => {
            const newAssignments = { ...prev };
            const slotA1 = `court-${courtIndex}-A-1`;
            const slotB1 = `court-${courtIndex}-B-1`;
            if (newAssignments[slotA1]) newAssignments[slotA1] = null;
            if (newAssignments[slotB1]) newAssignments[slotB1] = null;
            return newAssignments;
        });
    }
  }, []);
  
  const handleSetCourtColor = useCallback((courtIndex: number, color: string) => {
    setCourtColors(prev => {
        const newColors = { ...prev, [courtIndex]: color };
        try {
            localStorage.setItem('badmintonCourtColors', JSON.stringify(newColors));
        } catch (e) {
            console.error("Failed to save court colors to localStorage", e);
        }
        return newColors;
    });
  }, []);

  const handleEndMatch = useCallback((courtIndex: number, losingTeam: 'A' | 'B') => {
    const gameType = courtGameTypes[courtIndex] || 'doubles';

    const losingTeamSlots: string[] = gameType === 'singles'
        ? [`court-${courtIndex}-${losingTeam}-0`]
        : [`court-${courtIndex}-${losingTeam}-0`, `court-${courtIndex}-${losingTeam}-1`];
    
    const loserIds = losingTeamSlots
        .map(slotId => assignments[slotId])
        .filter((id): id is string => id !== null);

    if (loserIds.length === 0) return;

    const feePerLoser = SHUTTLECOCK_FEE_PER_MATCH / loserIds.length;

    setMatchesPlayed(prev => prev + 1);
    
    setPlayerLosses(prev => {
        const newLosses = { ...prev };
        loserIds.forEach(id => {
            newLosses[id] = (newLosses[id] || 0) + 1;
        });
        return newLosses;
    });

    setPlayerShuttlecockFees(prev => {
        const newFees = { ...prev };
        loserIds.forEach(id => {
            newFees[id] = (newFees[id] || 0) + feePerLoser;
        });
        return newFees;
    });

    const allPlayerSlotsOnCourt: string[] = gameType === 'singles'
      ? [`court-${courtIndex}-A-0`, `court-${courtIndex}-B-0`]
      : [
          `court-${courtIndex}-A-0`, `court-${courtIndex}-A-1`,
          `court-${courtIndex}-B-0`, `court-${courtIndex}-B-1`
        ];

    setAssignments(prev => {
        const newAssignments = { ...prev };
        allPlayerSlotsOnCourt.forEach(slotId => {
            newAssignments[slotId] = null;
        });
        return newAssignments;
    });
    
    const losersNames = loserIds.map(id => players.find(p => p.id === id)?.name).filter(Boolean).join(' & ');
    setNotification(`Trận ${matchesPlayed + 1} kết thúc! Đội thua: ${losersNames}.`);
  }, [assignments, players, matchesPlayed, courtGameTypes]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const { totalCourtFee, totalDrinksCost, totalShuttlecockCost, grandTotal, playerCount, totalPaid } = useMemo(() => {
    // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. Ensure player quantity is a number for calculation.
    const playerCount = players.reduce((sum, p) => sum + Number(p.quantity || 1), 0);
    // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. Ensure player quantity is a number for calculation.
    const totalCourtFee = players.reduce((sum, p) => sum + Number(p.quantity || 1) * COURT_FEE, 0);
    
    const totalDrinksCost = players.reduce((playerSum, p) => {
      const playerDrinksCost = Object.entries(p.consumedDrinks).reduce((drinkSum, [drinkId, quantity]) => {
        const drink = DRINKS.find(d => d.id === drinkId);
        // FIX: Ensure drink quantity is a number for calculation.
        return drinkSum + (drink ? drink.price * Number(quantity) : 0);
      }, 0);
      return playerSum + playerDrinksCost;
    }, 0);

    const totalShuttlecockCost = Object.values(playerShuttlecockFees).reduce((sum: number, fee) => sum + (Number(fee) || 0), 0);
    // FIX: Ensure adjustment amount is a number for calculation.
    const totalAdjustments = players.reduce((sum, p) => sum + (Number(p.adjustment?.amount) || 0), 0);
    const grandTotal = totalCourtFee + totalDrinksCost + totalShuttlecockCost + totalAdjustments;

    const totalPaid = players.filter(p => p.isPaid).reduce((sum, p) => {
      const drinksCost = Object.entries(p.consumedDrinks).reduce((drinkSum, [drinkId, quantity]) => {
        const drink = DRINKS.find(d => d.id === drinkId);
        // FIX: Ensure drink quantity is a number for calculation.
        return drinkSum + (drink ? drink.price * Number(quantity) : 0);
      }, 0);
      const shuttlecockCost = playerShuttlecockFees[p.id] || 0;
      // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. Ensure player quantity is a number for calculation.
      const courtFee = Number(p.quantity || 1) * COURT_FEE;
      // FIX: Ensure adjustment amount is a number for calculation.
      const adjustmentAmount = Number(p.adjustment?.amount) || 0;
      return sum + courtFee + drinksCost + shuttlecockCost + adjustmentAmount;
    }, 0);
    
    return { totalCourtFee, totalDrinksCost, totalShuttlecockCost, grandTotal, playerCount, totalPaid };
  }, [players, playerShuttlecockFees]);

  const playerDetailsList = useMemo((): PlayerDetails[] => {
    return players.map(p => {
        const drinksCost = Object.entries(p.consumedDrinks).reduce((drinkSum, [drinkId, quantity]) => {
            const drink = DRINKS.find(d => d.id === drinkId);
            // FIX: Ensure drink quantity is a number for calculation.
            return drinkSum + (drink ? drink.price * Number(quantity) : 0);
        }, 0);
        const losses = playerLosses[p.id] || 0;
        const shuttlecockCost = playerShuttlecockFees[p.id] || 0;
        // FIX: Ensure player quantity is a number for calculation.
        const courtFee = Number(p.quantity || 1) * COURT_FEE;
        // FIX: Ensure adjustment amount is a number for calculation.
        const adjustmentAmount = Number(p.adjustment?.amount) || 0;
        const totalCost = courtFee + drinksCost + shuttlecockCost + adjustmentAmount;
        return { ...p, totalCost, losses, drinksCost, shuttlecockCost };
    });
  }, [players, playerLosses, playerShuttlecockFees]);

  const dailyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(s => {
        try {
            const sessionDate = new Date(s.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        } catch (e) {
            return false;
        }
    });

    const savedSessionsRevenue = todaySessions.reduce((sum, s) => sum + s.summary.grandTotal, 0);
    const totalRevenue = savedSessionsRevenue + grandTotal;

    const playerNames = new Set<string>();
    todaySessions.forEach(s => {
        s.players.forEach(p => playerNames.add(p.name));
    });
    players.forEach(p => playerNames.add(p.name));
    
    const uniquePlayers = playerNames.size;

    return { totalRevenue, uniquePlayers, savedSessionsRevenue };
  }, [sessions, players, grandTotal]);

  const handleResetSession = useCallback(() => {
      setPlayers(createInitialPlayers());
      setAssignments({});
      setMatchesPlayed(0);
      setPlayerLosses({});
      setPlayerShuttlecockFees({});
      setCourtGameTypes(createInitialCourtGameTypes());
  }, []);

  const confirmAndSaveSession = useCallback(() => {
    if (players.length === 0) return;

    const newSession: Session = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        players: playerDetailsList,
        gameType: 'doubles',
        summary: { totalCourtFee, totalDrinksCost, totalShuttlecockCost, grandTotal },
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('badmintonHistory', JSON.stringify(updatedSessions));
    handleResetSession();
    setIsSaveConfirmModalOpen(false);
  }, [playerDetailsList, totalCourtFee, totalDrinksCost, totalShuttlecockCost, grandTotal, sessions, handleResetSession, players.length]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
        setSessions([]);
        localStorage.removeItem('badmintonHistory');
    }
  }, []);

  return (
    <div className="min-h-screen text-gray-800 font-sans">
      <Header 
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenPastRevenue={() => setIsPastRevenueModalOpen(true)}
      />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-emerald-600 flex items-center shrink-0">
                            <CourtIcon className="w-8 h-8 mr-3"/>
                            Sơ đồ sân
                        </h2>
                        <button
                            onClick={handleAutoAssign}
                            disabled={unassignedPlayers.length === 0}
                            className="flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-3 rounded-lg transition duration-300 border border-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            title={unassignedPlayers.length === 0 ? "Không có người chơi nào đang chờ" : "Tự động xếp người chơi vào sân trống"}
                        >
                            <SparklesIcon className="w-5 h-5 mr-2"/>
                            <span>Xếp nhanh</span>
                        </button>
                    </div>
                    
                    {notification && (
                        <div className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg animate-in fade-in duration-300 flex items-center gap-2 border border-emerald-200 shrink-0">
                            <FlagIcon className="w-5 h-5" />
                            <span>{notification}</span>
                        </div>
                    )}
                </div>

                <CourtAssignment
                    players={players}
                    assignments={assignments}
                    unassignedPlayers={unassignedPlayers}
                    onAssign={handleAssignPlayer}
                    onUnassign={handleUnassign}
                    onEndMatch={handleEndMatch}
                    courtGameTypes={courtGameTypes}
                    onSetGameType={handleSetCourtGameType}
                    courtColors={courtColors}
                    onSetCourtColor={handleSetCourtColor}
                />
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setIsPlayerListVisible(prev => !prev)}
                    className="flex items-center text-2xl font-bold text-emerald-600 cursor-pointer transition-colors hover:text-emerald-500"
                    aria-expanded={isPlayerListVisible}
                >
                    <UsersIcon className="w-8 h-8 mr-3" />
                    Danh sách người chơi
                    <ChevronDownIcon className={`w-7 h-7 ml-2 transition-transform duration-300 ${isPlayerListVisible ? '' : 'rotate-180'}`} />
                </button>
                <button
                  onClick={() => setIsPlayerManagementModalOpen(true)}
                  className='flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 border border-gray-300'
                >
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Quản lý
                </button>
              </div>
              
              {isPlayerListVisible && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {playerDetailsList.length > 0 ? (
                     playerDetailsList.map((playerDetails) => (
                      <PlayerCard
                        key={playerDetails.id}
                        playerDetails={playerDetails}
                        onUpdateDrink={handleUpdateDrink}
                        onUpdateQuantity={handleUpdateQuantity}
                        formatCurrency={formatCurrency}
                        isAssigned={assignedPlayerIds.has(playerDetails.id)}
                        onOpenAdjustmentModal={handleOpenAdjustmentModal}
                        onTogglePaid={handleTogglePaid}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">Chưa có người chơi nào. Hãy quản lý danh sách để thêm người chơi!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-28">
                <Summary
                  totalCourtFee={totalCourtFee}
                  totalDrinksCost={totalDrinksCost}
                  totalShuttlecockCost={totalShuttlecockCost}
                  grandTotal={grandTotal}
                  totalPaid={totalPaid}
                  formatCurrency={formatCurrency}
                  playerCount={playerCount}
                />
                 <div className="mt-4 space-y-3">
                    <button
                        onClick={handleMarkAllPaid}
                        disabled={players.length === 0}
                        className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-sm">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                        Thanh toán tất cả
                    </button>
                    <button 
                        onClick={() => setIsPlayerTotalsModalOpen(true)}
                        disabled={players.length === 0}
                        className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-sm">
                        <ClipboardListIcon className="w-5 h-5 mr-2" />
                        Chi tiết thanh toán
                    </button>
                    <button 
                        onClick={() => setIsSaveConfirmModalOpen(true)}
                        disabled={players.length === 0}
                        className="w-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40">
                        <SaveIcon className="w-5 h-5 mr-2" />
                        Lưu và bắt đầu buổi mới
                    </button>
                 </div>
            </div>
          </div>
        </div>
      </main>
      
      {isHistoryModalOpen && <HistoryModal 
        onClose={() => setIsHistoryModalOpen(false)}
        sessions={sessions}
        onClearHistory={handleClearHistory}
        formatCurrency={formatCurrency}
      />}
      
      {isStatsModalOpen && <DailyStatsModal
        onClose={() => setIsStatsModalOpen(false)}
        stats={dailyStats}
        formatCurrency={formatCurrency}
      />}

      {isPastRevenueModalOpen && <PastRevenueModal
        onClose={() => setIsPastRevenueModalOpen(false)}
        sessions={sessions}
        formatCurrency={formatCurrency}
      />}

      {isPlayerTotalsModalOpen && <PlayerTotalsModal
        onClose={() => setIsPlayerTotalsModalOpen(false)}
        playerDetailsList={playerDetailsList}
        formatCurrency={formatCurrency}
      />}

      {isPlayerManagementModalOpen && <PlayerManagementModal
        onClose={() => setIsPlayerManagementModalOpen(false)}
        players={players.filter(p => !p.isGuest)}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onUpdatePlayerInfo={handleUpdatePlayerInfo}
        onImportPlayers={handleImportPlayers}
      />}

      {isSaveConfirmModalOpen && <SaveConfirmModal
        onClose={() => setIsSaveConfirmModalOpen(false)}
        onConfirm={confirmAndSaveSession}
        savedRevenueToday={dailyStats.savedSessionsRevenue}
        formatCurrency={formatCurrency}
      />}

      {isAdjustmentModalOpen && <CostAdjustmentModal
        onClose={handleCloseAdjustmentModal}
        player={playerDetailsList.find(p => p.id === playerToAdjustId) || null}
        onConfirm={(amount, reason) => {
            if (playerToAdjustId) {
                handleUpdatePlayerAdjustment(playerToAdjustId, amount, reason);
            }
        }}
        formatCurrency={formatCurrency}
      />}
    </div>
  );
};

export default App;
