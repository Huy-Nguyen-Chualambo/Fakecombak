'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchCoinDetails } from '@/app/services/cryptoService';

interface PortfolioProps {
  onSelectCoin: (coinId: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onSelectCoin }) => {
  const [ownedCoins, setOwnedCoins] = useState<Record<string, number>>({});
  const [coinDetails, setCoinDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    // Tải dữ liệu tiền ảo đang sở hữu từ localStorage
    const loadOwnedCoins = () => {
      try {
        const savedCoins = localStorage.getItem('ownedCoins');
        if (savedCoins) {
          return JSON.parse(savedCoins);
        }
        return {};
      } catch (e) {
        console.error('Failed to load owned coins from localStorage', e);
        return {};
      }
    };

    const fetchOwnedCoinsDetails = async () => {
      setLoading(true);
      const owned = loadOwnedCoins();
      setOwnedCoins(owned);
      
      const coinIds = Object.keys(owned);
      if (coinIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const detailsPromises = coinIds.map(id => fetchCoinDetails(id));
        const results = await Promise.allSettled(detailsPromises);
        
        const newCoinDetails: Record<string, any> = {};
        let newTotalValue = 0;
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const coinId = coinIds[index];
            newCoinDetails[coinId] = result.value;
            
            const price = result.value?.market_data?.current_price?.usd || 0;
            const amount = owned[coinId] || 0;
            newTotalValue += price * amount;
          }
        });
        
        setCoinDetails(newCoinDetails);
        setTotalValue(newTotalValue);
      } catch (error) {
        console.error('Error fetching portfolio coin details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedCoinsDetails();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Danh mục đầu tư</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (Object.keys(ownedCoins).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Danh mục đầu tư</h2>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-black mb-4">Bạn chưa sở hữu bất kỳ tiền ảo nào trong danh mục đầu tư.</p>
          <p className="text-sm text-black">Hãy khám phá các loại tiền ảo và bắt đầu đầu tư!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Danh mục đầu tư</h2>
        <div className="text-right">
          <p className="text-sm text-black">Tổng giá trị:</p>
          <p className="text-xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Coin</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Số lượng</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Giá hiện tại</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Giá trị</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Thay đổi 24h</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(ownedCoins).map(([coinId, amount]) => {
              const coin = coinDetails[coinId];
              if (!coin) return null;
              
              const value = amount * (coin.market_data?.current_price?.usd || 0);
              const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
              
              return (
                <tr key={coinId} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectCoin(coinId)}>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 relative">
                        <Image
                          src={coin.image?.thumb || '/placeholder-coin.png'}
                          alt={coin.name}
                          fill
                          className="rounded-full object-contain"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-black">{coin.name}</p>
                        <p className="text-xs text-black">{coin.symbol?.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-black">{amount.toFixed(6)}</td>
                  <td className="py-3 px-3 text-sm text-black">${coin.market_data?.current_price?.usd.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm font-medium text-black">${value.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-sm font-medium ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCoin(coinId);
                      }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;