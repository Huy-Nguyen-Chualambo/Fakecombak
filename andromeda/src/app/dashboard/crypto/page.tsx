'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Portfolio from './components/Portfolio';
import TrendingCoins from './components/TrendingCoins';
import HighestPriceCoins from './components/HighestPriceCoins';
import CoinDetails from './components/CoinDetails';
import api from '@/app/services/api';

export default function CryptoPage() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    // Fetch wallet balance when the component mounts
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get('/api/wallet');
        if (response.data && response.data.balance) {
          setWalletBalance(Number(response.data.balance));
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchWalletBalance();
  }, []);

  const handleSelectCoin = (coinId: string) => {
    setSelectedCoinId(coinId);
    // Cuộn lên đầu trang khi chọn một coin
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedCoinId(null);
  };

  const handleBalanceChange = (newBalance: number) => {
    setWalletBalance(newBalance);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Tiền ảo</h1>
      
      <SearchBar onSelectCoin={handleSelectCoin} />
      
      {selectedCoinId ? (
        <CoinDetails 
          coinId={selectedCoinId} 
          onBack={handleBackToList} 
          walletBalance={walletBalance}
          onBalanceChange={handleBalanceChange}
        />
      ) : null}
      
      <Portfolio onSelectCoin={handleSelectCoin} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingCoins onSelectCoin={handleSelectCoin} />
        <HighestPriceCoins onSelectCoin={handleSelectCoin} />
      </div>
    </div>
  );
}