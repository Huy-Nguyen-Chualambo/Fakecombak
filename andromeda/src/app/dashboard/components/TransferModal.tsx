import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '@/app/services/api';

// Set app element for screen readers
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Khai báo key để lưu số dư ví trong localStorage - đảm bảo đồng bộ với key trong Dashboard
const WALLET_BALANCE_KEY = 'fakecombank_wallet_balance';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(1px)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '24px',
    width: '90%',
    maxWidth: '450px',
    maxHeight: '80vh',
    overflow: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

export default function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [receiverWalletId, setReceiverWalletId] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);

  // Lấy số dư ví từ API khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  // Hàm lấy số dư ví từ API
  const fetchWalletBalance = async () => {
    try {
      setIsBalanceLoading(true);
      const response = await api.get('/api/wallet');
      if (response.data && response.data.balance !== undefined) {
        const balance = response.data.balance;
        setWalletBalance(balance);
        // Cập nhật lại localStorage để đồng bộ với backend
        localStorage.setItem(WALLET_BALANCE_KEY, balance.toString());
        
        // Thông báo cho các component khác về sự thay đổi
        window.dispatchEvent(new StorageEvent('storage', {
          key: WALLET_BALANCE_KEY,
          newValue: balance.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Nếu API lỗi, thử lấy từ localStorage để tránh không hiển thị gì
      const storedBalance = localStorage.getItem(WALLET_BALANCE_KEY);
      if (storedBalance) {
        setWalletBalance(Number(storedBalance));
      }
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // Reset form when closing
  const handleClose = () => {
    setAmount('');
    setReceiverWalletId('');
    setPurpose('');
    setErrorMessage('');
    onClose();
  };

  const handleSelectAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleTransfer = async () => {
    try {
      // Validate inputs
      const transferAmount = Number(amount);
      if (!transferAmount || transferAmount <= 0) {
        setErrorMessage('Vui lòng nhập số tiền hợp lệ');
        return;
      }

      if (!receiverWalletId || !/^\d+$/.test(receiverWalletId)) {
        setErrorMessage('Vui lòng nhập ID ví người nhận hợp lệ');
        return;
      }

      // Lấy số dư mới nhất trước khi thực hiện chuyển tiền để đảm bảo kiểm tra chính xác
      try {
        await fetchWalletBalance();
      } catch (balanceError) {
        console.error('Error refreshing balance before transfer:', balanceError);
        // Tiếp tục với số dư hiện tại trong state
      }

      // Kiểm tra số dư hiện tại - sử dụng số dư từ state đã được lấy từ API
      if (walletBalance < transferAmount) {
        setErrorMessage(`Số dư không đủ để thực hiện giao dịch này. Số dư hiện tại: $${walletBalance.toFixed(2)}`);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        // Call API to transfer money
        const response = await api.put(
          `/api/wallet/${receiverWalletId}/transfer`,
          {
            amount: transferAmount,
            purpose: purpose || 'Chuyển tiền đến ví'
          }
        );

        // Nếu API thành công, gọi lại API để lấy số dư mới nhất
        if (response.data) {
          // Lấy số dư mới từ response API
          if (response.data.balance !== undefined) {
            const newBalance = response.data.balance;
            setWalletBalance(newBalance);
            localStorage.setItem(WALLET_BALANCE_KEY, newBalance.toString());
            
            // Thông báo cho các component khác biết về sự thay đổi này
            window.dispatchEvent(new StorageEvent('storage', {
              key: WALLET_BALANCE_KEY,
              newValue: newBalance.toString()
            }));
          } else {
            // Nếu API không trả về số dư mới, gọi API lấy số dư
            await fetchWalletBalance();
          }
          
          onSuccess();
          handleClose();
        } else {
          throw new Error('Không nhận được phản hồi từ máy chủ');
        }
      } catch (apiError: any) {
        console.error('Transfer API error:', apiError);
        setErrorMessage(apiError.response?.data?.message || 'Có lỗi xảy ra khi xử lý giao dịch chuyển tiền');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setErrorMessage(error.message || 'Có lỗi xảy ra khi xử lý giao dịch chuyển tiền');
    } finally {
      setIsLoading(false);
    }
  };

  // Format số tiền thành định dạng USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customModalStyles}
      contentLabel="Chuyển tiền"
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chuyển tiền</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hiển thị số dư hiện tại */}
        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Số dư khả dụng:</span>
            {isBalanceLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-blue-600">{formatCurrency(walletBalance)}</span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="receiverWalletId" className="block text-sm font-medium text-gray-700 mb-1">
            ID ví người nhận
          </label>
          <input
            type="text"
            id="receiverWalletId"
            value={receiverWalletId}
            onChange={(e) => setReceiverWalletId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Nhập ID ví người nhận"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền (USD)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Nhập số tiền"
          />
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button 
              onClick={() => handleSelectAmount(50)} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
            >
              $50
            </button>
            <button 
              onClick={() => handleSelectAmount(100)} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
            >
              $100
            </button>
            <button 
              onClick={() => handleSelectAmount(500)} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
            >
              $500
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung chuyển tiền
          </label>
          <input
            type="text"
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Nhập nội dung chuyển tiền"
          />
        </div>
        
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={fetchWalletBalance}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cập nhật số dư
          </button>
          
          <div className="flex">
            <button
              onClick={handleClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Hủy
            </button>
            <button
              onClick={handleTransfer}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý
                </span>
              ) : (
                'Chuyển tiền'
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}