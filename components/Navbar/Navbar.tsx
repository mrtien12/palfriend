'use client';

import { Button, Collapse, ScrollArea, ThemeIcon } from '@mantine/core';
import { NavLinksGroup } from './NavLinksGroup';
import classes from './Navbar.module.css';
// import AddAccountModal from '@/components/AddAccount/AddAccountModal'
import { NavItem } from '@/types/nav-item';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCirclePlus,
  IconCreditCardPay,
  IconDashboard,
  IconLogout,
  IconPaperBag,
  IconReport,
  IconWallet,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
// import { useAccounts } from '@/hooks/useAccount';
// import { DebtSimulator } from '../DebtSimulator/DebtSimulator';
import Link from 'next/link';
// import AddTransactionModal  from '@/components/Transaction/AddTransactionModal/AddTransactionModal';
import AddAccountModal from '@/components/Account/AddAccountModal/AddAccountModal';
import Logo from '@/public/logo.svg';
import { MdKeyboardArrowDown, MdSpaceDashboard } from 'react-icons/md';
import AIChatWrapper from '../AIChat/AIChatWrapper/AIChatWrapper';
import AddBillingImageModal from '../AutoTransaction/AddBillingImage/AddBillingImage';
import AddCategoryModal from '../Category/AddCategoryModal/AddCategoryModal';
// import AddBudgetModal from '../Budget/AddBudgetModal/AddBudgetModal';
interface Props {
  data: NavItem[];
  hidden?: boolean;
}

export const isActiveNavbarItem = (
  path: string,
  currentPath?: string | null
) => {
  if (currentPath !== '/') {
    return currentPath && currentPath === path ? 'filled' : 'subtle';
  }
};

export function Navbar({ data, hidden }: Props) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const navLinks = [
    {
      label: 'Theo danh mục',
      link: '/insights',
    },
    {
      label: 'Theo thời gian',
      link: '/insights-time',
    },
  ];

  const pathname = usePathname();

  const links = data.map((item) => (
    <NavLinksGroup key={item.label} {...item} />
  ));

  const [opened, { open, close }] = useDisclosure(false);
  const [openedCategory, handler] = useDisclosure(false);
  const [openedTransaction, TransactionHandler] = useDisclosure(false);
  const [openedBudget, BudgetHandler] = useDisclosure(false);
  const [openedDialog, DialogHandler] = useDisclosure();
  const [openedFileInput, FileInputHandler] = useDisclosure();
  const [
    openedCollapseReports,
    { open: openCollapseReport, close: closeCollapseReport },
  ] = useDisclosure(false);
  return (
    <>
      <AddAccountModal opened={opened} onClose={close} />

      <AddCategoryModal opened={openedCategory} onClose={handler.close} />

      <AIChatWrapper opened={openedDialog} close={DialogHandler.close} />

      <AddBillingImageModal
        opened={openedFileInput}
        onClose={FileInputHandler.close}
      />
      {/* <AddTransactionModal opened={openedTransaction} onClose={TransactionHandler.close} />
			<AddBudgetModal opened={openedBudget} onClose={BudgetHandler.close} /> */}
      <div
        className={classes.navbarContainer}
        style={{ display: !hidden ? 'none' : 'flex' }}
      >
        <ThemeIcon className={classes.icon} size={60}>
          <Logo />
        </ThemeIcon>

        <Button
          className={classes.button}
          variant={isActiveNavbarItem('/dashboard', pathname)}
          leftSection={<MdSpaceDashboard />}
          href={'/dashboard'}
          component={Link}
        >
          Thống kê
        </Button>

        <Button
          className={classes.button}
          variant={isActiveNavbarItem('/budgets', pathname)}
          leftSection={<IconWallet />}
          href={`/budgets`}
          component={Link}
        >
          Hạn mức
        </Button>

        <Button
          className={classes.button}
          variant={
            navLinks.find((item) => item.link === pathname)
              ? 'filled'
              : 'subtle'
          }
          fullWidth
          leftSection={<IconReport />}
          rightSection={
            <MdKeyboardArrowDown
              className={classes.chevron}
              size="1rem"
              style={{
                transform: !openedCollapseReports ? 'rotate(-90deg)' : 'none',
              }}
            />
          }
          onClick={() => {
            if (openedCollapseReports) {
              closeCollapseReport();
            } else {
              openCollapseReport();
            }
          }}
        >
          Báo cáo
        </Button>

        <Collapse in={openedCollapseReports}>
          {navLinks?.map((link, index) => (
            <div key={index} style={{ width: '100%', padding: '0 20px' }}>
              <Button
                className={classes.button}
                variant={isActiveNavbarItem(link.link, pathname)}
                leftSection={<IconDashboard />}
                href={link.link}
                component={Link}
                fullWidth
                mt="sm"
              >
                {link.label}
              </Button>
            </div>
          ))}
        </Collapse>

        <Button
          className={classes.button}
          variant={isActiveNavbarItem('/scheduled', pathname)}
          leftSection={<IconPaperBag />}
          href={'/scheduled'}
          component={Link}
        >
          Dự chi
        </Button>

        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>{links}</div>
        </ScrollArea>

        {/* <Button className={classes.button} variant={isActiveNavbarItem('/dashboard', pathname)} leftSection={<IconPencilPlus />} onClick={BudgetHandler.open}>Add Budget</Button> */}
        {/* <Button className={classes.button} variant={isActiveNavbarItem('/dashboard', pathname)} leftSection={<IconCirclePlus />} onClick={TransactionHandler.open}> Add Transaction </Button> */}
        <div className={classes.flexColumn}>
          <Button onClick={DialogHandler.open}>Trò chuyện với AI</Button>

          <Button onClick={FileInputHandler.open}>Quét hóa đơn</Button>
        </div>

        <Button
          className={classes.button}
          variant="subtle"
          leftSection={<IconCirclePlus />}
          onClick={open}
        >
          Thêm tài khoản
        </Button>

        <Button
          className={classes.button}
          variant="subtle"
          leftSection={<IconCreditCardPay />}
          onClick={handler.open}
        >
          Thêm danh mục
        </Button>

        <Button
          className={classes.button}
          variant="subtle"
          leftSection={<IconLogout />}
          onClick={() => signOut()}
        >
          Đăng xuất
        </Button>
      </div>
    </>
  );
}

// Navbar.requireAuth = true;
