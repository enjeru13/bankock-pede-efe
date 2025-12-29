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
import clientsRoutes from '@/routes/clients';
import documentsRoutes from '@/routes/documents';
import categoriesRoutes from '@/routes/categories';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, FileText, Folder } from 'lucide-react';

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
            title: 'Documentos',
            href: documentsRoutes.index().url,
            icon: FileText,
        },
        {
            title: 'Categorías',
            href: categoriesRoutes.index().url,
            icon: Folder,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <h1 className="text-2xl font-bold">Bancock</h1>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
