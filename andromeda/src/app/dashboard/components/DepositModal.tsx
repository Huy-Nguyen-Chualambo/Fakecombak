import { useState } from 'react';
import Modal from 'react-modal';
import { PaymentMethod } from '@/app/types/payment';
import api from '@/app/services/api';

// Thiết lập app element để screen readers hiểu modal
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Khai báo key để lưu số dư ví trong localStorage - đảm bảo đồng bộ với key trong TransferModal
const WALLET_BALANCE_KEY = 'fakecombank_wallet_balance';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Nền rất mờ để thấy dashboard
    backdropFilter: 'blur(1px)',            // Hiệu ứng làm mờ nhẹ
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

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Reset states when closing
  const handleClose = () => {
    setAmount('');
    setErrorMessage('');
    onClose();
  };

  const handleSelectAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    try {
      // Validate amount
      const depositAmount = Number(amount);
      if (!depositAmount || depositAmount <= 0) {
        setErrorMessage('Vui lòng nhập số tiền hợp lệ');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      // Call the backend API to create a payment order
      const response = await api.post(
        `/api/payment/STRIPE/amount/${depositAmount}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data && response.data.payment_url) {
        // Open the Stripe payment page in a new tab
        window.open(response.data.payment_url, '_blank');
        
        onSuccess();
        handleClose();
      } else {
        throw new Error('Không nhận được link thanh toán');
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customModalStyles}
      contentLabel="Nạp tiền nhanh"
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Nạp tiền nhanh</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            <button 
              onClick={() => handleSelectAmount(1000)} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
            >
              $1000
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phương thức thanh toán
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-gray-50 flex items-center">
            <input
              type="radio"
              id="stripe"
              checked={true}
              readOnly
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="stripe" className="ml-2 flex items-center cursor-pointer">
              <img src="/stripe.png" alt="Stripe" className="h-8" />
            </label>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Hủy
          </button>
          <button
            onClick={handleDeposit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              'Nạp tiền'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}