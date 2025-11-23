import { HydrateClient, trpc } from '@/trpc/server';
import { Suspense } from 'react';
import { Homeview } from '@/modules/home/view/home-views';

// 强制动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';

export default async function Home() {

  void trpc.hello.prefetch({ text: 'lcz' });
  
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
      
        <Homeview />

      </Suspense>
    </HydrateClient>
  );
}