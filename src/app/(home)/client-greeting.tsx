'use client';

// <-- hooks can only be used in client components
import { trpc } from '@/trpc/client';
import { useEffect, useState } from 'react';

export function ClientGreeting() {
  const [mounted, setMounted] = useState(false);
  const greeting = trpc.hello.useQuery({ text: 'lcz' });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在挂载前始终显示 Loading，确保 SSR 和客户端首次渲染一致
  if (!mounted || !greeting.data) return <div>Loading...</div>;
  
  return <div>{greeting.data.greeting}</div>;
}