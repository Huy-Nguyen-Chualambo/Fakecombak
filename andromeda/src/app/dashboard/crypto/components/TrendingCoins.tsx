'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchTrendingCoins } from '@/app/services/cryptoService';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  price_btc: number;
  score: number;
}

interface TrendingCoinsProps {
  onSelectCoin: (coinId: string) => void;
}

const TrendingCoins: React.FC<TrendingCoinsProps> = ({ onSelectCoin }) => {
  const [trendingCoins, setTrendingCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTrendingCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchTrendingCoins();
        if (data && data.coins) {
          setTrendingCoins(data.coins.map((item: any) => item.item).slice(0, 10));
        }
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu tiền ảo đang trending');
        setLoading(false);
        console.error(err);
      }
    };

    getTrendingCoins();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Trending</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Trending</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Top 10 Trending</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rank</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Coin</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">Thay đổi 24h</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider">BTC Price</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trendingCoins.map((coin, index) => (
              <tr key={coin.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectCoin(coin.id)}>
                <td className="py-3 px-3 text-sm font-medium text-black">{index + 1}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 relative">
                      <Image
                        src={coin.large || '/placeholder-coin.png'}
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
                <td className="py-3 px-3 text-sm">
                  <span className={`${coin.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.score >= 0 ? '+' : ''}{coin.score.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-black">{coin.price_btc.toFixed(8)} BTC</td>
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

export default TrendingCoins;