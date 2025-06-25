'use client';

import React, { useState } from 'react';
import { searchCoin } from '@/app/services/cryptoService';
import Image from 'next/image';

interface SearchBarProps {
  onSelectCoin: (coinId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectCoin }) => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await searchCoin(keyword);
      if (data && data.coins) {
        setSearchResults(data.coins.slice(0, 8)); // Lấy 8 kết quả đầu tiên
      }
      setShowResults(true);
    } catch (error) {
      console.error('Error searching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Tìm kiếm tiền ảo..."
          className="flex-1 py-2 px-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-black"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => keyword.trim() && setShowResults(true)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Tìm kiếm'
          )}
        </button>
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((coin) => (
                <li
                  key={coin.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onSelectCoin(coin.id);
                    setShowResults(false);
                  }}
                >
                  <div className="flex items-center">
                    <div className="relative h-8 w-8 mr-3">
                      <Image 
                        src={coin.thumb || '/placeholder-coin.png'} 
                        alt={coin.name} 
                        fill
                        className="rounded-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-black">{coin.name}</div>
                      <div className="text-xs text-black">{coin.symbol}</div>
                    </div>
                    {coin.market_cap_rank && (
                      <div className="ml-auto text-sm text-black">
                        Rank #{coin.market_cap_rank}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-black text-center">
              {loading ? 'Đang tìm kiếm...' : 'Không tìm thấy kết quả phù hợp'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;