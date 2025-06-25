'use client';

import { useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import DepositModal from '@/app/dashboard/components/DepositModal';
import TransferModal from '@/app/dashboard/components/TransferModal';

// Các kiểu dữ liệu
interface AccountInfo {
  balance: number;
  accountNumber: string;
  currency: string;
}

interface Wallet {
  id: number;
  balance: number;
  user: any;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  transactionDate: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: string; // Thay vì 'COMPLETED' | 'PENDING' | 'FAILED'
}

// Khai báo key để lưu số dư ví trong localStorage
const WALLET_BALANCE_KEY = 'fakecombank_wallet_balance';

export default function Dashboard() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  
  const user = authService.getCurrentUser();

  const fetchWalletData = async () => {
    try {
      const walletResponse = await api.get('/api/wallet');
      
      if (walletResponse.data) {
        setWallet(walletResponse.data);
        
        // Lấy số dư từ API
        const walletBalance = Number(walletResponse.data.balance);
        
        // Cập nhật localStorage với số dư mới từ backend
        localStorage.setItem(WALLET_BALANCE_KEY, String(walletBalance));
        
        // Tạo dữ liệu accountInfo từ dữ liệu ví thực tế
        setAccountInfo({
          balance: walletBalance,
          accountNumber: String(walletResponse.data.id),
          currency: 'USD'
        });
      }
    } catch (walletError) {
      console.error('Error fetching wallet:', walletError);
      
      // Kiểm tra xem có số dư được lưu trong localStorage không
      const storedBalance = localStorage.getItem(WALLET_BALANCE_KEY);
      const fallbackBalance = storedBalance !== null ? Number(storedBalance) : 15000000;
      
      // Fallback to mock data if API fails
      setAccountInfo({
        balance: fallbackBalance,
        accountNumber: '1234567890',
        currency: 'USD'
      });
    }
  };

  // Tải lại dữ liệu giao dịch
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      
      if (response.data && Array.isArray(response.data)) {
        // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
        const formattedTransactions = response.data.map((tx: any) => ({
          id: tx.id || Math.floor(Math.random() * 1000000), // Tạo ID ngẫu nhiên nếu không có
          amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
          description: tx.purpose || getTransactionDescription(tx.type || 'TRANSFER', tx.transferId),
          transactionDate: tx.date 
            ? new Date(tx.date).toISOString() 
            : tx.timestamp 
              ? new Date(tx.timestamp).toISOString() 
              : new Date().toISOString(),
          transactionType: mapTransactionType(tx.type || 'TRANSFER'),
          status: tx.status || 'COMPLETED'
        }));
        
        // Lọc loại bỏ các bản ghi không hợp lệ (có thể có lỗi dữ liệu)
        const validTransactions = formattedTransactions.filter(tx => 
          tx.id && (tx.amount !== undefined && tx.amount !== null)
        );
        
        // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
        validTransactions.sort((a: Transaction, b: Transaction) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );
        
        // Chỉ lấy 5 giao dịch mới nhất
        setRecentTransactions(validTransactions.slice(0, 5));
      } else {
        console.error('Invalid transactions data format:', response.data);
        // Fallback to empty array if data format is invalid
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data if API fails
      setRecentTransactions([
        {
          id: 1,
          amount: 1500,
          description: 'Nhận tiền từ Nguyễn Văn A',
          transactionDate: '2025-04-21T14:30:00',
          transactionType: 'DEPOSIT',
          status: 'COMPLETED'
        },
        {
          id: 2,
          amount: -500,
          description: 'Chuyển tiền đến Trần Thị B',
          transactionDate: '2025-04-20T10:15:00',
          transactionType: 'TRANSFER',
          status: 'COMPLETED'
        },
        {
          id: 3,
          amount: -200,
          description: 'Thanh toán hóa đơn điện',
          transactionDate: '2025-04-18T09:45:00',
          transactionType: 'WITHDRAWAL',
          status: 'COMPLETED'
        },
        {
          id: 4,
          amount: 3000,
          description: 'Tiền lương tháng 4',
          transactionDate: '2025-04-15T08:00:00',
          transactionType: 'DEPOSIT',
          status: 'COMPLETED'
        }
      ]);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin ví từ API backend
        await fetchWalletData();
        
        // Lấy lịch sử giao dịch
        try {
          await fetchTransactions();
        } catch (transactionError) {
          console.error('Error fetching transactions:', transactionError);
          // Fallback to mock data if API fails
          setRecentTransactions([
            {
              id: 1,
              amount: 1500000,
              description: 'Nhận tiền từ Nguyễn Văn A',
              transactionDate: '2025-04-21T14:30:00',
              transactionType: 'DEPOSIT',
              status: 'COMPLETED'
            },
            {
              id: 2,
              amount: -500000,
              description: 'Chuyển tiền đến Trần Thị B',
              transactionDate: '2025-04-20T10:15:00',
              transactionType: 'TRANSFER',
              status: 'COMPLETED'
            },
            {
              id: 3,
              amount: -200000,
              description: 'Thanh toán hóa đơn điện',
              transactionDate: '2025-04-18T09:45:00',
              transactionType: 'WITHDRAWAL',
              status: 'COMPLETED'
            },
            {
              id: 4,
              amount: 3000000,
              description: 'Tiền lương tháng 4',
              transactionDate: '2025-04-15T08:00:00',
              transactionType: 'DEPOSIT',
              status: 'COMPLETED'
            }
          ]);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };
    
    fetchDashboardData();

    // Check for any crypto transaction changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Xử lý sự kiện thay đổi trong localStorage (từ các component khác như CoinDetails)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === WALLET_BALANCE_KEY && event.newValue) {
      // Cập nhật số dư mới từ localStorage
      const newBalance = Number(event.newValue);
      
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          balance: newBalance
        };
        setWallet(updatedWallet);
      }
      
      if (accountInfo) {
        const updatedAccountInfo = {
          ...accountInfo,
          balance: newBalance
        };
        setAccountInfo(updatedAccountInfo);
      }
    }
  };

  // Handle payment confirmation from Stripe redirect
  useEffect(() => {
    const handlePaymentCallback = async () => {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      const paymentId = params.get('payment_id');
      
      // Check if we have payment callback parameters
      if (orderId && paymentId && !paymentProcessing) {
        try {
          setPaymentProcessing(true);
          // Call API to confirm payment and add balance to wallet
          await api.put(
            `/api/wallet/deposit?order_id=${orderId}&payment_id=${paymentId}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          // Refresh wallet data
          await fetchWalletData();
          setPaymentSuccess(true);
          
          // Clear URL parameters to prevent duplicate processing
          window.history.replaceState({}, document.title, '/dashboard');
        } catch (error) {
          console.error('Error processing payment:', error);
          setError('Có lỗi xảy ra khi xử lý thanh toán.');
        } finally {
          setPaymentProcessing(false);
        }
      }
    };
    
    handlePaymentCallback();
  }, []);

  const handleDepositSuccess = () => {
    // Refresh wallet data after successful deposit
    fetchWalletData();
    // Refresh transaction data
    fetchTransactions();
  };

  const handleTransferSuccess = () => {
    // Show success message and refresh wallet data
    setTransferSuccess(true);
    fetchWalletData();
    // Refresh transaction data
    fetchTransactions();
  };
  
  // Helper để format số tiền - đã cập nhật sang USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Helper để format thời gian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTransactionTypeClass = (type: string, amount: number) => {
    if (amount > 0) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  const handleQuickDeposit = (amount: number) => {
    setIsDepositModalOpen(true);
  };

  // Helper để chuyển đổi kiểu giao dịch từ backend sang frontend
  const mapTransactionType = (type: string): 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' => {
    switch (type) {
      case 'ADD_MONEY':
        return 'DEPOSIT';
      case 'WITHDRAW':
        return 'WITHDRAWAL';
      case 'WALLET_TRANSFER':
        return 'TRANSFER';
      case 'BUY_ASSET':
      case 'SELL_ASSET':
        return 'WITHDRAWAL';
      default:
        return 'TRANSFER';
    }
  };
  
  // Helper để tạo mô tả nếu không có purpose
  const getTransactionDescription = (type: string, transferId: number | null): string => {
    switch (type) {
      case 'ADD_MONEY':
        return 'Nạp tiền vào tài khoản';
      case 'WITHDRAW':
        return 'Rút tiền';
      case 'WALLET_TRANSFER':
        return transferId ? `Chuyển tiền đến ví #${transferId}` : 'Chuyển tiền';
      case 'BUY_ASSET':
        return 'Mua tài sản';
      case 'SELL_ASSET':
        return 'Bán tài sản';
      default:
        return 'Giao dịch';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="mt-4 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      {paymentSuccess && (
        <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Thành công!</strong>
          <span className="block sm:inline"> Nạp tiền vào tài khoản thành công.</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setPaymentSuccess(false)}
          >
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Đóng</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      {paymentProcessing && (
        <div className="mb-4 bg-blue-50 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            <span>Đang xử lý thanh toán...</span>
          </div>
        </div>
      )}

      {transferSuccess && (
        <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Thành công!</strong>
          <span className="block sm:inline"> Chuyển tiền thành công.</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setTransferSuccess(false)}
          >
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Đóng</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      <h1 className="text-2xl font-semibold text-gray-800">
        Xin chào, {user?.fullName || 'Quý khách'}!
      </h1>
      <p className="text-gray-600 mt-1">
        Chào mừng bạn quay trở lại với Fakecombank. Đây là tổng quan tài khoản của bạn.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Thông tin số dư */}
        <div className="bg-white rounded-lg shadow p-6 transform transition-all hover:scale-105">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Số dư khả dụng</h2>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-blue-600">
              {accountInfo ? formatCurrency(accountInfo.balance) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Số ví: {wallet?.id || accountInfo?.accountNumber || 'N/A'}
            </p>
          </div>
        </div>

        {/* Nạp tiền nhanh */}
        <div className="bg-white rounded-lg shadow p-6 transform transition-all hover:scale-105">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Nạp tiền nhanh</h2>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
            >
              Nạp tiền
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button 
                onClick={() => setIsDepositModalOpen(true)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
              >
                $100
              </button>
              <button 
                onClick={() => setIsDepositModalOpen(true)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
              >
                $500
              </button>
              <button 
                onClick={() => setIsDepositModalOpen(true)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
              >
                $1000
              </button>
            </div>
          </div>
        </div>

        {/* Chuyển tiền nhanh */}
        <div className="bg-white rounded-lg shadow p-6 transform transition-all hover:scale-105">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Chuyển tiền</h2>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
              />
            </svg>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => setIsTransferModalOpen(true)} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              Chuyển tiền
            </button>
            <div className="mt-2 text-xs text-gray-500">
              <p>Chuyển tiền nhanh chóng 24/7</p>
              <p>Không phí giao dịch nội bộ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Giao dịch gần đây</h2>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{transaction.transactionType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${getTransactionTypeClass(transaction.transactionType, transaction.amount)}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                      {transaction.status === 'COMPLETED' ? 'Hoàn thành' : 
                       transaction.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thông tin hỗ trợ */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-blue-500 mr-3 mt-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div>
            <h3 className="text-md font-semibold text-gray-800">Hỗ trợ khách hàng 24/7</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gọi <span className="font-semibold">1900 1234</span> hoặc gửi email đến <span className="font-semibold">support@fakecombank.com</span> để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
}