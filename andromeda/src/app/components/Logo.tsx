'use client';

import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        alt="Fakecombank Logo"
        width={40}
        height={40}
        className="object-contain"
      />
      <div className="ml-2 font-semibold text-xl">
        <span className="text-blue-600">Fake</span>
        <span className="text-gray-800">combank</span>
      </div>
    </div>
  );
}