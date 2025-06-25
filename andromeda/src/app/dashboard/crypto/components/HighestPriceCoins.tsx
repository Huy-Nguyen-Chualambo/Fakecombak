'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchTopCoins } from '@/app/services/cryptoService';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
}

interface HighestPriceCoinsProps {
  onSelectCoin: (coinId: string) => void;
}

const HighestPriceCoins: React.FC<HighestPriceCoinsProps> = ({ onSelectCoin }) => {
  const [highestPriceCoins, setHighestPriceCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHighestPriceCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchTopCoins(); // This fetches from top50 endpoint
        if (data && data.length > 0) {
          // Get top 10 highest price coins from the top 50 endpoint
          const sortedCoins = [...data].sort((a, b) => b.current_price - a.current_price).slice(0, 10);
          setHighestPriceCoins(sortedCoins);
        }
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu tiền ảo có giá cao nhất');
        setLoading(false);
        console.error(err);
      }
    };

    getHighestPriceCoins();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Giá Cao Nhất</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Giá Cao Nhất</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Thị Trường</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rank</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Coin</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Vốn hoá</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Thay đổi 24h</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {highestPriceCoins.map((coin, index) => (
              <tr key={coin.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectCoin(coin.id)}>
                <td className="py-3 px-3 text-sm font-medium text-black">{index + 1}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 relative">
                      <Image
                        src={coin.image || '/placeholder-coin.png'}
                        alt={coin.name}
                        fill
                        className="rounded-full object-contain"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-black">{coin.name}</p>
                      <p className="text-xs text-black">{coin.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-sm text-black">${coin.current_price.toLocaleString()}</td>
                <td className="py-3 px-3 text-sm">
                  <span className={`${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.price_change_percentage_24h ? `${coin.price_change_percentage_24h.toFixed(2)}%` : 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCoin(coin.id);
                    }}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HighestPriceCoins;