import React from 'react';

export default function TailwindTest() {
  return (
    <div className="p-4 bg-red-500 text-white">
      <h1 className="text-2xl font-bold">Tailwind Test</h1>
      <p className="text-sm">If you can see this styled, Tailwind is working!</p>
      <div className="mt-4 p-2 bg-blue-500 rounded">
        <span className="text-yellow-300">Custom colors test</span>
      </div>
    </div>
  );
}

