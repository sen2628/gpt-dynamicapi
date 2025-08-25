import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          GPT DynamicAPI
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
        </nav>
      </div>
    </header>
  );
}
