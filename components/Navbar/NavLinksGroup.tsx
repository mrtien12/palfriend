'use client';

import {
  Box,
  Button,
  Collapse,
  Group,
  ThemeIcon,
  UnstyledButton,
  useDirection,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import classes from './NavLinksGroup.module.css';
interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string; balance: string }[];
}

export function NavLinksGroup({
  icon: Icon,
  label,
  link,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const pathname = usePathname();
  const { dir } = useDirection();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const ChevronIcon = dir === 'ltr' ? IconChevronRight : IconChevronLeft;
  const items = (hasLinks ? links : []).map((link) => {
    const value = parseInt(link.balance);
    const balanceClass = value > 0 ? classes.positive : classes.negative;
    return (
      <Button
        component={Link}
        href={link.link}
        key={link.label}
        className={`${classes.link} ${
          link.link === pathname && classes.activeLink
        }`}
        variant="subtle"
        rightSection={<Box className={balanceClass}>{link.balance}</Box>}
        size="md"
        justify="space-between"
        fullWidth
      >
        <span className={classes.buttonLabel}>{link.label}</span>
      </Button>
    );
  });

  return (
    <>
      {link ? (
        <Link
          href={link}
          className={`${classes.control} ${
            link === pathname && classes.activeControl
          }`}
        >
          <Group gap={0} justify="space-between">
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <ThemeIcon variant="light" size={30}>
                <Icon size="1.1rem" />
              </ThemeIcon>
              <Box ml="md">{label}</Box>
            </Box>
          </Group>
        </Link>
      ) : (
        <UnstyledButton
          onClick={() => {
            if (hasLinks) {
              setOpened((o) => !o);
              return;
            }
          }}
          className={classes.control}
        >
          <Group gap={0} justify="space-between">
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <ThemeIcon variant="light" size={30}>
                <Icon size="1.1rem" />
              </ThemeIcon>
              <Box ml="md">{label}</Box>
            </Box>
            {hasLinks && (
              <ChevronIcon
                className={classes.chevron}
                size="1rem"
                stroke={1.5}
                style={{
                  transform: opened
                    ? `rotate(${dir === 'rtl' ? -90 : 90}deg)`
                    : 'none',
                }}
              />
            )}
          </Group>
        </UnstyledButton>
      )}
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
