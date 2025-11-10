import { HydrateClient, trpc } from '@/trpc/server';
import { Suspense } from 'react';
import { Homeview } from '@/modules/home/view/home-views';

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