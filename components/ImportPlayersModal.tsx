import React, { useState, useCallback, useRef } from 'react';
import { CloseIcon, UploadIcon, SaveIcon, TrashIcon } from './IconComponents';

interface ImportPlayersModalProps {
  onClose: () => void;
  onConfirmImport: (players: { name: string; phone?: string }[]) => void;
}

type ParsedPlayer = { name: string; phone?: string };

// Robust CSV row parser that handles quoted fields with delimiters.
const parseCsvRow = (row: string, separator: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotedField = false;
    for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
        if (inQuotedField && row[i + 1] === '"') {
        currentField += '"';
        i++; // Skip the next quote (escaped quote)
        } else {
        inQuotedField = !inQuotedField;
        }
    } else if (char === separator && !inQuotedField) {
        fields.push(currentField);
        currentField = '';
    } else {
        currentField += char;
    }
    }
    fields.push(currentField);

    return fields.map(field => {
    const trimmed = field.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).replace(/""/g, '"').trim();
    }
    return trimmed;
    });
};


const ImportPlayersModal: React.FC<ImportPlayersModalProps> = ({ onClose, onConfirmImport }) => {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [parsedPlayers, setParsedPlayers] = useState<ParsedPlayer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (!file || !file.type.includes('csv')) {
            setError('Vui lòng chọn một file có định dạng .csv');
            return;
        }
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    setError('Không thể đọc file hoặc file trống.');
                    return;
                }

                let lines = text.trim().split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length === 0) {
                    setError('File không có dữ liệu người chơi.');
                    return;
                }
                
                const firstLine = lines[0] || '';
                const separator = firstLine.includes(';') ? ';' : ',';
                
                const firstLineLower = firstLine.toLowerCase();
                const isHeader = ['họ và tên', 'sdt', 'zalo', 'name', 'phone'].some(keyword => firstLineLower.includes(keyword));
                
                if (isHeader) {
                    lines.shift();
                }
                
                if (lines.length === 0) {
                    setError('File không có dữ liệu người chơi sau khi bỏ qua dòng tiêu đề.');
                    return;
                }
                
                const newPlayers = lines
                    .map(row => row.trim())
                    .filter(row => row)
                    .map(row => {
                        const columns = parseCsvRow(row, separator);
                        const name = columns[0] || '';
                        const phone = columns[1] || '';
                        return name.trim() ? { name, phone } : null;
                    })
                    .filter((p): p is { name: string; phone: string } => p !== null);

                if (newPlayers.length > 0) {
                    setParsedPlayers(newPlayers);
                    setStep('preview');
                } else {
                    setError('Không tìm thấy người chơi hợp lệ trong file. Vui lòng kiểm tra file có đúng định dạng (2 cột: Họ và tên, SDT/zalo), dùng dấu phẩy (,) hoặc chấm phẩy (;) để phân tách và được mã hoá UTF-8.');
                }
            } catch (err) {
                console.error("Error processing CSV file:", err);
                setError('Đã có lỗi xảy ra khi xử lý file. Vui lòng kiểm tra lại định dạng file.');
            }
        };

        reader.onerror = () => {
            setError('Có lỗi xảy ra khi đọc file.');
        };
        
        reader.readAsText(file, 'UTF-8');
    }, []);
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        // Reset file input to allow selecting the same file again
        e.target.value = '';
    };

    const handleConfirm = () => {
        onConfirmImport(parsedPlayers);
    };

    const handleReset = () => {
        setStep('upload');
        setParsedPlayers([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center text-xl font-semibold text-emerald-600">
                        <UploadIcon className="w-6 h-6 mr-3" />
                        Nhập danh sách từ file CSV
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-4">
                    {step === 'upload' && (
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="font-semibold text-gray-700">Kéo và thả file vào đây</p>
                            <p className="text-gray-500 text-sm mt-1">hoặc</p>
                            <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 border border-gray-300">
                                Chọn file từ máy tính
                            </button>
                            <div className="text-xs text-gray-500 mt-6 text-left p-3 bg-white border border-gray-200 rounded-md">
                                <p className="font-bold mb-1">Yêu cầu định dạng file:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>File phải có định dạng `.csv`.</li>
                                    <li>Cột đầu tiên là <span className="font-mono bg-gray-200 px-1 rounded">Tên người chơi</span>.</li>
                                    <li>Cột thứ hai là <span className="font-mono bg-gray-200 px-1 rounded">Số điện thoại</span> (có thể bỏ trống).</li>
                                    <li>Có thể có hoặc không có dòng tiêu đề.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {step === 'preview' && (
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">Xem trước dữ liệu ({parsedPlayers.length} người chơi)</h3>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-semibold text-gray-600">Tên người chơi</th>
                                            <th className="p-2 text-left font-semibold text-gray-600">Số điện thoại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedPlayers.slice(0, 10).map((player, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="p-2">{player.name}</td>
                                                <td className="p-2 text-gray-500">{player.phone || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedPlayers.length > 10 && <p className="text-xs text-gray-500 mt-2 text-center">... và {parsedPlayers.length - 10} người chơi khác.</p>}
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                                <p><span className="font-bold">Lưu ý:</span> Nhập danh sách mới sẽ <span className="font-bold">thay thế hoàn toàn</span> danh sách người chơi hiện tại.</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                            <p className="font-bold">Lỗi!</p>
                            <p>{error}</p>
                        </div>
                    )}
                </main>

                <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex justify-end gap-3">
                    {step === 'upload' && !error &&(
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                            Hủy
                        </button>
                    )}
                     {error && (
                        <button onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                           Thử lại
                        </button>
                    )}
                    {step === 'preview' && (
                        <>
                            <button onClick={handleReset} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Chọn file khác
                            </button>
                            <button onClick={handleConfirm} className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                <SaveIcon className="w-5 h-5 mr-2" />
                                Xác nhận và Nhập
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ImportPlayersModal;
