import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ClientCard } from '@/components/client-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

/**
 * Página: Lista de Clientes
 * 
 * Muestra todos los clientes del sistema con:
 * - Búsqueda por nombre o código
 * - Filtro por estado (activo/inactivo)
 * - Paginación
 * - Botón para crear nuevo cliente
 */

interface Client {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    is_active: boolean;
    documents_count: number;
    formatted_total_size?: string;
}

interface PaginatedClients {
    data: Client[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    clients: PaginatedClients;
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Clientes',
        href: clientsRoutes.index().url,
    },
];

export default function ClientsIndex({ clients, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    /**
     * Aplicar filtros
     */
    const handleFilter = () => {
        router.get(
            clientsRoutes.index().url,
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    /**
     * Limpiar filtros
     */
    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        router.get(clientsRoutes.index().url);
    };

    /**
     * Manejar enter en búsqueda
     */
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFilter();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Clientes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona los clientes y sus documentos
                        </p>
                    </div>
                    <Link href={clientsRoutes.create().url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Filtro de estado */}
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activos</SelectItem>
                            <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        <Button onClick={handleFilter}>Filtrar</Button>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </div>

                {/* Lista de clientes */}
                {clients.data.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {clients.data.map((client) => (
                                <ClientCard key={client.id} client={client} />
                            ))}
                        </div>

                        {/* Paginación */}
                        {clients.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {clients.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url);
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                            No se encontraron clientes
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {filters.search || filters.status
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza creando tu primer cliente'}
                        </p>
                        {!filters.search && !filters.status && (
                            <Link href={clientsRoutes.create().url} className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Cliente
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
