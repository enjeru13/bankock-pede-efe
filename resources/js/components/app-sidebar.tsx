import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import categoriesRoutes from '@/routes/categories';
import clientsRoutes from '@/routes/clients';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Folder, LayoutGrid, Users, Scissors } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
            icon: LayoutGrid,
        },
        {
            title: 'Clientes',
            href: clientsRoutes.index().url,
            icon: Users,
        },
        {
            title: 'Categorías',
            href: categoriesRoutes.index().url,
            icon: Folder,
        },
    ];

    const toolsNavItems: NavItem[] = [
        {
            title: 'Dividir PDF',
            href: '/tools/pdf-splitter',
            icon: Scissors,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={toolsNavItems} label="Herramientas" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
