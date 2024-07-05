'use client';

import DashboardScreen from '@/components/Dashboard/DashboardScreen';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Dashboard() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  return (
    <>
      <DashboardScreen />
    </>
  );
}
