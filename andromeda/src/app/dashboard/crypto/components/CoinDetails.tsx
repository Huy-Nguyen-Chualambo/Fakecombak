'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchCoinDetails, fetchMarketChart } from '@/app/services/cryptoService';
import api from '@/app/services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import Modal from 'react-modal';

// Thiết lập app element cho Modal để screen readers hiểu modal
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Đăng ký các components cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Thiết lập style cho modal
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

// Key để lưu số dư ví trong localStorage (đồng bộ với dashboard)
const WALLET_BALANCE_KEY = 'fakecombank_wallet_balance';

interface CoinDetailsProps {
  coinId: string | null;
  onBack: () => void;
  walletBalance: number;
  onBalanceChange: (newBalance: number) => void;
}

const CoinDetails: React.FC<CoinDetailsProps> = ({ coinId, onBack, walletBalance, onBalanceChange }) => {
  const [coinDetails, setCoinDetails] = useState<any>(null);
  const [priceChart, setPriceChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError,] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [operation, setOperation] = useState<'buy' | 'sell' | null>(null);
  const [ownedCoins, setOwnedCoins] = useState<Record<string, number>>({});
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<{ type: 'buy' | 'sell', amount: number, value: number } | null>(null);

  useEffect(() => {
    // Tải dữ liệu tiền ảo đang sở hữu từ localStorage
    const loadOwnedCoins = () => {
      try {
        const savedCoins = localStorage.getItem('ownedCoins');
        if (savedCoins) {
          setOwnedCoins(JSON.parse(savedCoins));
        }
      } catch (e) {
        console.error('Failed to load owned coins from localStorage', e);
      }
    };

    loadOwnedCoins();
  }, []);

  useEffect(() => {
    if (!coinId) return;
    
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const details = await fetchCoinDetails(coinId);
        setCoinDetails(details);
        
        const chartData = await fetchMarketChart(coinId, 7);
        setPriceChart(chartData);
        
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin tiền ảo');
        setLoading(false);
        console.error(err);
      }
    };

    fetchDetails();
  }, [coinId]);

  // Hàm chuyển đổi dữ liệu biểu đồ
  const prepareChartData = () => {
    if (!priceChart || !priceChart.prices) {
      return null;
    }
    
    // Lấy ngày và giá từ dữ liệu biểu đồ
    const labels = priceChart.prices.map((item: [number, number]) => {
      const date = new Date(item[0]);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });
    
    const prices = priceChart.prices.map((item: [number, number]) => item[1]);
    
    // Màu cho biểu đồ - xanh nếu xu hướng tăng, đỏ nếu xu hướng giảm
    const priceStart = prices[0];
    const priceEnd = prices.length ? prices[prices.length - 1] : 0;
    const trend = priceEnd >= priceStart;
    const borderColor = trend ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
    const backgroundColor = trend ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    return {
      labels,
      datasets: [
        {
          label: `Giá (USD)`,
          data: prices,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  };
  
  // Tùy chọn biểu đồ
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right',
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  const handleOperation = (type: 'buy' | 'sell') => {
    // Đặt số lượng ban đầu khi mở modal
    if (type === 'buy') {
      // Đặt sẵn số lượng mặc định cho mua (ví dụ: 0.1)
      setQuantity(0.1);
    } else if (type === 'sell' && ownedAmount > 0) {
      // Đặt sẵn số lượng là một nửa số lượng đang sở hữu khi bán
      setQuantity(ownedAmount * 0.5);
    }
    
    setOperation(type);
  };

  const handleConfirmTransaction = () => {
    if (!coinId || !coinDetails || quantity <= 0) return;
    
    setTransactionError(null);
    setTransactionSuccess(null);
    const currentPrice = coinDetails.market_data?.current_price?.usd || 0;
    const transactionAmount = quantity * currentPrice;
    
    if (operation === 'buy') {
      // Kiểm tra xem có đủ số dư để mua không
      if (transactionAmount > walletBalance) {
        setTransactionError(`Số dư không đủ để thực hiện giao dịch. Bạn cần thêm $${(transactionAmount - walletBalance).toFixed(2)} USD`);
        return;
      }
      
      // Cập nhật tiền ảo sở hữu
      const newOwnedCoins = { ...ownedCoins };
      newOwnedCoins[coinId] = (newOwnedCoins[coinId] || 0) + quantity;
      setOwnedCoins(newOwnedCoins);
      localStorage.setItem('ownedCoins', JSON.stringify(newOwnedCoins));
      
      // Trừ số dư trong ví
      const newBalance = walletBalance - transactionAmount;
      onBalanceChange(newBalance);
      
      // Lưu số dư mới vào localStorage để đồng bộ với Dashboard
      localStorage.setItem(WALLET_BALANCE_KEY, String(newBalance));
      
      // Kích hoạt sự kiện storage để các tab khác cũng cập nhật
      window.dispatchEvent(new StorageEvent('storage', {
        key: WALLET_BALANCE_KEY,
        newValue: String(newBalance)
      }));
      
      // Hiển thị thông báo thành công
      setTransactionSuccess({ type: 'buy', amount: quantity, value: transactionAmount });
      
      // Đóng modal sau khi giao dịch thành công
      setOperation(null);
      setQuantity(0);
    } else if (operation === 'sell') {
      const currentOwned = ownedCoins[coinId] || 0;
      
      // Kiểm tra xem có đủ số lượng để bán không
      if (quantity > currentOwned) {
        setTransactionError(`Bạn chỉ sở hữu ${currentOwned} ${coinDetails.symbol?.toUpperCase()}`);
        return;
      }
      
      // Cập nhật tiền ảo sở hữu
      const newOwnedCoins = { ...ownedCoins };
      newOwnedCoins[coinId] = currentOwned - quantity;
      
      // Xóa khỏi danh sách nếu số lượng về 0
      if (newOwnedCoins[coinId] === 0) {
        delete newOwnedCoins[coinId];
      }
      
      setOwnedCoins(newOwnedCoins);
      localStorage.setItem('ownedCoins', JSON.stringify(newOwnedCoins));
      
      // Cộng số dư vào ví
      const newBalance = walletBalance + transactionAmount;
      onBalanceChange(newBalance);
      
      // Lưu số dư mới vào localStorage để đồng bộ với Dashboard
      localStorage.setItem(WALLET_BALANCE_KEY, String(newBalance));
      
      // Kích hoạt sự kiện storage để các tab khác cũng cập nhật
      window.dispatchEvent(new StorageEvent('storage', {
        key: WALLET_BALANCE_KEY,
        newValue: String(newBalance)
      }));
      
      // Hiển thị thông báo thành công
      setTransactionSuccess({ type: 'sell', amount: quantity, value: transactionAmount });
      
      // Đóng modal sau khi giao dịch thành công
      setOperation(null);
      setQuantity(0);
    }
  };

  const cancelTransaction = () => {
    setOperation(null);
    setQuantity(0);
  };

  if (!coinId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Chi tiết tiền ảo</h2>
        <p className="text-black">Vui lòng chọn một loại tiền ảo để xem chi tiết</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Chi tiết tiền ảo</h2>
          <button 
            onClick={onBack}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-black"
          >
            Quay lại
          </button>
        </div>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Chi tiết tiền ảo</h2>
          <button 
            onClick={onBack}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-black"
          >
            Quay lại
          </button>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  const ownedAmount = ownedCoins[coinId] || 0;
  const ownedValue = ownedAmount * (coinDetails?.market_data?.current_price?.usd || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-black">Chi tiết tiền ảo</h2>
        </div>
        <button 
          onClick={onBack}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-black"
        >
          Quay lại
        </button>
      </div>

      {coinDetails && (
        <div>
          <div className="flex flex-wrap md:flex-nowrap items-start gap-6 mb-6">
            <div className="w-full md:w-1/3">
              <div className="flex items-center mb-4">
                {coinDetails.image && (
                  <div className="relative h-12 w-12 mr-3">
                    <Image
                      src={coinDetails.image.large || '/placeholder-coin.png'}
                      alt={coinDetails.name}
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-black">{coinDetails.name}</h1>
                  <span className="text-black">{coinDetails.symbol?.toUpperCase()}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2 text-black">Tài sản của bạn</h3>
                <p className="mb-1 text-black">
                  <span className="font-medium">{ownedAmount.toFixed(6)}</span> {coinDetails.symbol?.toUpperCase()}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  ≈ ${ownedValue.toFixed(2)} USD
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2 text-black">Số dư ví</h3>
                <p className="text-lg font-bold text-yellow-600">
                  ${walletBalance.toFixed(2)} USD
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-black font-medium">Giá hiện tại:</span>
                  <span className="text-black font-medium">${coinDetails.market_data?.current_price?.usd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Thay đổi 24h:</span>
                  <span className={`font-medium ${coinDetails.market_data?.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coinDetails.market_data?.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Market Cap:</span>
                  <span className="text-black font-medium">${coinDetails.market_data?.market_cap?.usd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Khối lượng 24h:</span>
                  <span className="text-black font-medium">${coinDetails.market_data?.total_volume?.usd.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOperation('buy')}
                  className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                >
                  Mua
                </button>
                <button
                  onClick={() => handleOperation('sell')}
                  className={`py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium ${ownedAmount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={ownedAmount === 0}
                >
                  Bán
                </button>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center mb-4">
                {priceChart ? (
                  <div className="w-full h-full">
                    <h3 className="text-lg font-semibold mb-2 text-black">Biểu đồ giá 7 ngày</h3>
                    {(() => {
                      const chartData = prepareChartData();
                      return chartData ? (
                        <Line data={chartData} options={chartOptions} />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center">
                          <p className="text-black">Đang tải dữ liệu biểu đồ...</p>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-black">Không có dữ liệu biểu đồ</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-black">Thông tin thị trường</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-black">Market Cap Rank:</span>
                      <span className="text-black">#{coinDetails.market_data?.market_cap_rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Lượng cung hiện tại:</span>
                      <span className="text-black">{coinDetails.market_data?.circulating_supply?.toLocaleString()} {coinDetails.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Tổng cung:</span>
                      <span className="text-black">
                        {coinDetails.market_data?.total_supply ? coinDetails.market_data.total_supply.toLocaleString() : 'N/A'} {coinDetails.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Cung tối đa:</span>
                      <span className="text-black">
                        {coinDetails.market_data?.max_supply ? coinDetails.market_data.max_supply.toLocaleString() : 'Không giới hạn'} {coinDetails.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-black">Giá theo thời gian</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-black">ATH (cao nhất):</span>
                      <span className="text-black">${coinDetails.market_data?.ath?.usd.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">ATH %:</span>
                      <span className={`text-black ${coinDetails.market_data?.ath_change_percentage?.usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coinDetails.market_data?.ath_change_percentage?.usd.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">ATL (thấp nhất):</span>
                      <span className="text-black">${coinDetails.market_data?.atl?.usd.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">ATL %:</span>
                      <span className={`text-black ${coinDetails.market_data?.atl_change_percentage?.usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coinDetails.market_data?.atl_change_percentage?.usd.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal cho mua/bán */}
      {operation && (
        <Modal
          isOpen={operation !== null}
          onRequestClose={cancelTransaction}
          style={customModalStyles}
          contentLabel={`${operation === 'buy' ? 'Mua' : 'Bán'} ${coinDetails?.symbol?.toUpperCase()}`}
        >
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {operation === 'buy' ? 'Mua' : 'Bán'} {coinDetails?.symbol?.toUpperCase()}
              </h2>
              <button 
                onClick={cancelTransaction}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng {coinDetails?.symbol?.toUpperCase()}
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập số lượng"
                min="0"
                step="0.000001"
              />
              
              {operation === 'buy' && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button 
                    onClick={() => setQuantity(0.01)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    0.01
                  </button>
                  <button 
                    onClick={() => setQuantity(0.1)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    0.1
                  </button>
                  <button 
                    onClick={() => setQuantity(1)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    1
                  </button>
                </div>
              )}

              {operation === 'sell' && ownedAmount > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button 
                    onClick={() => setQuantity(ownedAmount * 0.25)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    25%
                  </button>
                  <button 
                    onClick={() => setQuantity(ownedAmount * 0.5)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    50%
                  </button>
                  <button 
                    onClick={() => setQuantity(ownedAmount)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded text-sm transition-colors"
                  >
                    100%
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Giá hiện tại:</span>
                <span className="text-sm text-gray-800 font-medium">${coinDetails?.market_data?.current_price?.usd.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Số tiền giao dịch:</span>
                <span className="text-sm text-gray-800 font-medium">${(quantity * (coinDetails?.market_data?.current_price?.usd || 0)).toLocaleString()} USD</span>
              </div>
              {operation === 'sell' && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Số dư hiện tại:</span>
                  <span className="text-sm text-gray-800 font-medium">{ownedAmount.toFixed(6)} {coinDetails?.symbol?.toUpperCase()}</span>
                </div>
              )}
              {operation === 'buy' && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Số dư ví:</span>
                  <span className="text-sm text-gray-800 font-medium">${walletBalance.toFixed(2)} USD</span>
                </div>
              )}
            </div>
            
            {transactionError && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
                {transactionError}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={cancelTransaction}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTransaction}
                disabled={quantity <= 0 || (operation === 'sell' && quantity > ownedAmount)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  operation === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {operation === 'buy' ? 'Xác nhận mua' : 'Xác nhận bán'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Thông báo thành công */}
      {transactionSuccess && (
        <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-md mb-4">
          {transactionSuccess.type === 'buy' ? (
            <p>
              Bạn đã mua thành công <span className="font-bold">{transactionSuccess.amount.toFixed(6)}</span> {coinDetails?.symbol?.toUpperCase()} 
              với giá <span className="font-bold">${transactionSuccess.value.toFixed(2)}</span> USD từ ví.
            </p>
          ) : (
            <p>
              Bạn đã bán thành công <span className="font-bold">{transactionSuccess.amount.toFixed(6)}</span> {coinDetails?.symbol?.toUpperCase()} 
              và nhận được <span className="font-bold">${transactionSuccess.value.toFixed(2)}</span> USD vào ví.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinDetails;