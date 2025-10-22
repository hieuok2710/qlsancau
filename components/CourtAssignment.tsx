import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Player } from '../types';
import { CloseIcon, UserIcon } from './IconComponents';

interface CourtAssignmentProps {
  players: Player[];
  assignments: Record<string, string | null>;
  unassignedPlayers: Player[];
  onAssign: (playerId: string, slotId: string) => void;
  onUnassign: (slotId: string) => void;
  onEndMatch: (courtIndex: number, losingTeam: 'A' | 'B') => void;
  courtGameTypes: Record<number, 'singles' | 'doubles'>;
  onSetGameType: (courtIndex: number, gameType: 'singles' | 'doubles') => void;
  courtColors: Record<number, string>;
  onSetCourtColor: (courtIndex: number, color: string) => void;
}

const PlayerSelectionPopover: React.FC<{
  players: Player[];
  onSelect: (playerId: string) => void;
  onClose: () => void;
}> = ({ players, onSelect, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg" ref={popoverRef}>
      <div className="p-2 text-sm font-semibold text-center text-gray-500 border-b border-gray-200">Chọn người chơi</div>
      <div className="max-h-48 overflow-y-auto">
        {players.length > 0 ? (
          players.map(player => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className="w-full text-left px-3 py-2 text-gray-800 hover:bg-emerald-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-emerald-500" />
              {player.name}
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-gray-400">Không có người chơi nào</div>
        )}
      </div>
    </div>
  );
};


const CourtSlot: React.FC<{
  slotId: string;
  playerId: string | null;
  players: Player[];
  unassignedPlayers: Player[];
  onAssign: (playerId: string, slotId: string) => void;
  onUnassign: (slotId: string) => void;
  activeSlotId: string | null;
  setActiveSlotId: (slotId: string | null) => void;
}> = ({ slotId, playerId, players, unassignedPlayers, onAssign, onUnassign, activeSlotId, setActiveSlotId }) => {
  const player = players.find(p => p.id === playerId);
  const isPopoverOpen = activeSlotId === slotId;

  const handleAssign = (selectedPlayerId: string) => {
    onAssign(selectedPlayerId, slotId);
    setActiveSlotId(null);
  };

  if (player) {
    return (
      <div className="bg-gray-200/70 border border-gray-300 rounded-md min-h-[3rem] flex items-center justify-between px-2 text-sm relative animate-in fade-in duration-300">
        <span className="font-semibold text-gray-900 break-words pr-1">{player.name}</span>
        <button 
          onClick={() => onUnassign(slotId)}
          className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 flex-shrink-0"
          aria-label={`Unassign ${player.name}`}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-12 flex items-center justify-center">
      <button
        onClick={() => setActiveSlotId(isPopoverOpen ? null : slotId)}
        className={`w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 font-bold text-2xl transition-all duration-300 ${
            isPopoverOpen 
            ? 'bg-gray-100 border-emerald-500 text-emerald-500 scale-110'
            : 'hover:bg-gray-100 hover:border-emerald-500 hover:text-emerald-500 hover:scale-110 hover:rotate-90'
        }`}
      >
        +
      </button>
      {isPopoverOpen && (
        <PlayerSelectionPopover 
            players={unassignedPlayers}
            onSelect={handleAssign}
            onClose={() => setActiveSlotId(null)}
        />
      )}
    </div>
  );
};

const Court: React.FC<{
  courtIndex: number;
  players: Player[];
  assignments: Record<string, string | null>;
  unassignedPlayers: Player[];
  onAssign: (playerId: string, slotId: string) => void;
  onUnassign: (slotId: string) => void;
  onEndMatch: (courtIndex: number, losingTeam: 'A' | 'B') => void;
  activeSlotId: string | null;
  setActiveSlotId: (slotId: string | null) => void;
  courtGameTypes: Record<number, 'singles' | 'doubles'>;
  onSetGameType: (courtIndex: number, gameType: 'singles' | 'doubles') => void;
  courtColor?: string;
  onSetCourtColor: (courtIndex: number, color: string) => void;
}> = ({ courtIndex, onEndMatch, courtGameTypes, onSetGameType, courtColor, onSetCourtColor, ...props }) => {
  const gameType = courtGameTypes[courtIndex] || 'doubles';
  const currentCourtColor = courtColor || '#f9fafb';
  
  const teamAPlayerIds = useMemo(() => {
    const slots = gameType === 'singles'
      ? [`court-${courtIndex}-A-0`]
      : [`court-${courtIndex}-A-0`, `court-${courtIndex}-A-1`];
    return slots
      .map(slotId => props.assignments[slotId])
      .filter((id): id is string => id !== null);
  }, [props.assignments, courtIndex, gameType]);

  const teamBPlayerIds = useMemo(() => {
    const slots = gameType === 'singles'
      ? [`court-${courtIndex}-B-0`]
      : [`court-${courtIndex}-B-0`, `court-${courtIndex}-B-1`];
    return slots
      .map(slotId => props.assignments[slotId])
      .filter((id): id is string => id !== null);
  }, [props.assignments, courtIndex, gameType]);

  const isMatchEndable = useMemo(() => {
    const teamAPlayersCount = teamAPlayerIds.length;
    const teamBPlayersCount = teamBPlayerIds.length;
    if (gameType === 'singles') {
        return teamAPlayersCount === 1 && teamBPlayersCount === 1;
    }
    return teamAPlayersCount > 0 && teamBPlayersCount > 0;
  }, [teamAPlayerIds, teamBPlayerIds, gameType]);

  const teamHeaderBaseClasses = "text-center text-sm font-bold rounded-t-md py-1";
  const teamAHeaderClasses = `${teamHeaderBaseClasses} text-blue-700 ${isMatchEndable ? "cursor-pointer bg-gradient-to-b from-blue-100 to-blue-200/80 hover:from-blue-200 transition-colors" : "bg-blue-100/70"}`;
  const teamBHeaderClasses = `${teamHeaderBaseClasses} text-red-700 ${isMatchEndable ? "cursor-pointer bg-gradient-to-b from-red-100 to-red-200/80 hover:from-red-200 transition-colors" : "bg-red-100/70"}`;


  return (
    <div 
        className="p-3 rounded-lg border border-gray-200 flex flex-col gap-2 shadow-inner transition-colors duration-200"
        style={{ backgroundColor: currentCourtColor }}
      >
       <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-gray-600">
                  Sân {courtIndex + 1}
              </h4>
              <div className="relative w-6 h-6">
                <label 
                    htmlFor={`color-picker-${courtIndex}`}
                    className="w-full h-full rounded-full border border-gray-400/50 cursor-pointer block shadow-sm"
                    style={{ backgroundColor: currentCourtColor }}
                    title="Đổi màu sân"
                ></label>
                <input
                    id={`color-picker-${courtIndex}`}
                    type="color"
                    value={currentCourtColor}
                    onChange={(e) => onSetCourtColor(courtIndex, e.target.value)}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center">
                <button 
                    onClick={() => onSetGameType(courtIndex, 'singles')}
                    className={`px-4 py-2 text-sm font-semibold rounded-l-lg transition-colors duration-200 ${gameType === 'singles' ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Đơn
                </button>
                 <button 
                    onClick={() => onSetGameType(courtIndex, 'doubles')}
                    className={`px-4 py-2 text-sm font-semibold rounded-r-lg transition-colors duration-200 ${gameType === 'doubles' ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Đôi
                </button>
            </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* Team A */}
        <div>
          <div 
            className={teamAHeaderClasses}
            onClick={() => isMatchEndable && onEndMatch(courtIndex, 'A')}
            title={isMatchEndable ? "Nhấn để xác nhận Đội A thua" : "Đội A"}
          >
            ĐỘI A
          </div>
          <div className="bg-blue-50/50 p-2 rounded-b-md space-y-2 border-x border-b border-blue-200 min-h-[144px] flex flex-col justify-around">
            <CourtSlot slotId={`court-${courtIndex}-A-0`} playerId={props.assignments[`court-${courtIndex}-A-0`]} {...props} />
            {gameType === 'doubles' && (
                 <CourtSlot slotId={`court-${courtIndex}-A-1`} playerId={props.assignments[`court-${courtIndex}-A-1`]} {...props} />
            )}
          </div>
        </div>
        {/* Team B */}
        <div>
           <div 
            className={teamBHeaderClasses}
            onClick={() => isMatchEndable && onEndMatch(courtIndex, 'B')}
            title={isMatchEndable ? "Nhấn để xác nhận Đội B thua" : "Đội B"}
          >
            ĐỘI B
          </div>
          <div className="bg-red-50/50 p-2 rounded-b-md space-y-2 border-x border-b border-red-200 min-h-[144px] flex flex-col justify-around">
            <CourtSlot slotId={`court-${courtIndex}-B-0`} playerId={props.assignments[`court-${courtIndex}-B-0`]} {...props} />
            {gameType === 'doubles' && (
                 <CourtSlot slotId={`court-${courtIndex}-B-1`} playerId={props.assignments[`court-${courtIndex}-B-1`]} {...props} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourtAssignment: React.FC<CourtAssignmentProps> = (props) => {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  return (
    <div className="p-4 bg-gray-50/30 rounded-lg border border-gray-200/50 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-300"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Court 
            key={i} 
            courtIndex={i} 
            {...props} 
            courtColor={props.courtColors[i]}
            activeSlotId={activeSlotId}
            setActiveSlotId={setActiveSlotId}
          />
        ))}
      </div>
    </div>
  );
};

export default CourtAssignment;