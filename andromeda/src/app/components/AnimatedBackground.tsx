'use client';

import { useEffect, useState } from 'react';
import './animation.css';

interface FloatingItem {
  id: number;
  size: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  delay: number;
  rotate: number;
  color: string;
  type: 'circle' | 'diamond';
}

const AnimatedBackground = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const colors = ['#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#81D4FA'];

  useEffect(() => {
    // Tạo các phần tử nổi ngẫu nhiên (hình tròn và hình thoi)
    const generateItems = () => {
      const newItems: FloatingItem[] = [];
      const totalItems = 40; // Tổng số phần tử
      
      for (let i = 0; i < totalItems; i++) {
        const type = Math.random() > 0.5 ? 'circle' : 'diamond';
        newItems.push({
          id: i,
          size: Math.random() * (type === 'circle' ? 50 : 40) + (type === 'circle' ? 10 : 20), 
          x: Math.random() * 98, // Vị trí ngẫu nhiên theo % màn hình
          y: Math.random() * 100 + 100, // Bắt đầu từ dưới màn hình
          speed: Math.random() * 15 + 10, // Tốc độ di chuyển
          opacity: Math.random() * 0.4 + 0.2, // Độ trong suốt
          delay: Math.random() * 10, // Độ trễ
          rotate: Math.random() * 180, // Góc xoay (chỉ áp dụng cho hình thoi)
          color: colors[Math.floor(Math.random() * colors.length)], // Màu ngẫu nhiên
          type: type
        });
      }
      
      setItems(newItems);
    };

    generateItems();
    
    // Đảm bảo tạo lại các phần tử khi thay đổi kích thước màn hình
    window.addEventListener('resize', generateItems);
    return () => {
      window.removeEventListener('resize', generateItems);
    };
  }, []);

  return (
    <div className="animated-background">
      <div className="circles">
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              width: `${item.size}px`,
              height: `${item.size}px`,
              left: `${item.x}%`,
              bottom: '-100px',
              opacity: item.opacity,
              backgroundColor: item.color,
              boxShadow: `0 0 10px ${item.color}80`,
              borderRadius: item.type === 'circle' ? '50%' : '0',
              transform: item.type === 'diamond' ? `rotate(${45 + item.rotate}deg)` : 'none',
              animation: `${item.type === 'circle' ? 'floatCircle' : 'floatDiamond'} ${item.speed}s linear infinite`,
              animationDelay: `${item.delay}s`
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;