'use client'
import { AppShell,useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {Navbar} from "@/components/Navbar/Navbar";
import { AuthenticationTitle } from "@/components/AuthenticationForm/AuthenticationForm";

interface Props {
    children: React.ReactNode
}

export default function DashboardLayout(
    {children} : Props
) {
    const [opened, {toggle}] = useDisclosure();
    const {colorScheme} = useMantineColorScheme();
    const theme = useMantineTheme();
    const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

    return (
        <AppShell>
            <AppShell.Main>
                <AuthenticationTitle />
            </AppShell.Main>
        </AppShell>
    )
}