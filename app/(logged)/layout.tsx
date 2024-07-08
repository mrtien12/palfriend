'use client';

import { Navbar } from '@/components/Navbar/Navbar';
import NotificationBell from '@/components/Notification/NotificationBell';
import { NavItem } from '@/types/nav-item';
import {
  Button,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconComponents,
  IconCreditCard,
  IconFileDelta,
  IconLock,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
// import { useAccounts } from "@/hooks/useAccount";
import useAccount from '@/hooks/useAccount';
import { MdMenu } from 'react-icons/md';
import classes from './layout.module.css';

interface Props {
  children: React.ReactNode;
}

export default function LoggedinLayout({ children }: Props) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const accounts = useAccount();
  const budgetAccounts = accounts.filter((account) =>
    ['0'].includes(account.type)
  );
  const savingAccounts = accounts.filter((account) =>
    ['1'].includes(account.type)
  );
  const debtAccounts = accounts.filter((account) =>
    ['2'].includes(account.type)
  );
  const creditCardAccounts = accounts.filter((account) =>
    ['3'].includes(account.type)
  );
  const navLinks: NavItem[] = [
    {
      label: 'Tiêu dùng',
      icon: IconComponents,
      initiallyOpened: true,
      links: budgetAccounts.map((account) => ({
        label: account.name,
        link: `/accounts/${account.id}`,
        balance: account.amount.toFixed(2),
      })),
    },
    {
      label: 'Tiết kiệm',
      icon: IconLock,
      initiallyOpened: true,
      links: savingAccounts.map((account) => ({
        label: account.name,
        link: `/accounts/${account.id}`,
        balance: account.amount.toFixed(2),
      })),
    },

    {
      label: 'Khoản nợ',
      icon: IconFileDelta,
      initiallyOpened: true,
      links: debtAccounts.map((account) => ({
        label: account.name,
        link: `/accounts/${account.id}`,
        balance: account.amount.toFixed(2),
      })),
    },
    {
      label: 'Thẻ tín dụng',
      icon: IconCreditCard,
      initiallyOpened: true,
      links: creditCardAccounts.map((account) => ({
        label: account.name,
        link: `/accounts/${account.id}`,
        balance: account.amount.toFixed(2),
      })),
    },
  ];

  const [opened, { toggle, open, close }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const bg =
    colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

  return (
    <div className={classes.pageContainer}>
      <Navbar data={navLinks} hidden={!opened} />
      <div className={classes.sideContainer}>
        <div className={classes.headerContainer}>
          <Button
            variant="transparent"
            onClick={() => (!opened ? open() : close())}
          >
            <MdMenu size={40} />
          </Button>

          <div className={classes.info}>
            <Text style={{ fontSize: '20px' }}>
              {session.data?.user?.email}
            </Text>
            <NotificationBell />
          </div>
        </div>
        <div className={classes.mainContainer}>{children}</div>
      </div>
    </div>
  );
}
