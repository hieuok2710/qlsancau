
import React from 'react';
import { BillIcon } from './IconComponents';

interface SummaryProps {
  totalCourtFee: number;
  totalDrinksCost: number;
  totalShuttlecockCost: number;
  grandTotal: number;
  totalPaid: number;
  formatCurrency: (amount: number) => string;
  playerCount: number;
}

const Summary: React.FC<SummaryProps> = ({
  totalCourtFee,
  totalDrinksCost,
  totalShuttlecockCost,
  grandTotal,
  totalPaid,
  formatCurrency,
  playerCount,
}) => {

  const totalOwed = grandTotal - totalPaid;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-3 text-emerald-600 flex items-center">
        <BillIcon className="w-6 h-6 mr-3" />
        Tổng kết chi phí
      </h3>
      <div className="space-y-3 text-gray-600">
        <div className="flex justify-between items-center">
          <span>Tiền sân ({playerCount} người)</span>
          <span className="font-medium text-gray-900">{formatCurrency(totalCourtFee)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Tiền nước</span>
          <span className="font-medium text-gray-900">{formatCurrency(totalDrinksCost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Phí cầu</span>
          <span className="font-medium text-gray-900">{formatCurrency(totalShuttlecockCost)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-green-600">Đã thanh toán</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-red-600">Còn lại</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalOwed)}</span>
            </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        <div className="flex justify-between items-center text-xl">
          <span className="font-bold text-emerald-600">Tổng cộng</span>
          <span className="font-bold text-3xl text-emerald-500 tracking-tight">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default Summary;
