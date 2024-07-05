'use client';
import CheckingAccountScreen from '@/components/Account/CheckingAccountScreen/CheckingAccountScreen';
import CreditCardAccountScreen from '@/components/Account/CreditCardAccountScreen/CreditCardAccountScreen';
import DebtAccountScreen from '@/components/Account/DebtAccountScreen/DebtAccountScreen';
import DepositAccountScreen from '@/components/Account/DepositAccountScreen/DepositAccountScreen';
import useAccountType from '@/hooks/useAccountType';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AccountDetails({ params }: { params: { id: string } }) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const type = useAccountType(params.id);

  return (
    <>
      {type === '0' && <CheckingAccountScreen id={params.id} />}
      {type === '1' && <DepositAccountScreen id={params.id} />}
      {type === '2' && <DebtAccountScreen id={params.id} />}
      {type === '3' && <CreditCardAccountScreen id={params.id} />}
    </>
  );
}
