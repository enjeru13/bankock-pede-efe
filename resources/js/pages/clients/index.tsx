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
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/client';
import { Head, router } from '@inertiajs/react';
import { Search, FileSpreadsheet } from 'lucide-react'; // <-- NUEVO: Icono de Excel
import { useState } from 'react';

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
        file_status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Clientes', href: clientsRoutes.index().url },
];

export default function ClientsIndex({ clients, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [fileStatus, setFileStatus] = useState(filters.file_status || 'all');

    const handleFilter = () => {
        router.get(
            clientsRoutes.index().url,
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
                file_status: fileStatus !== 'all' ? fileStatus : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        setFileStatus('all');
        router.get(clientsRoutes.index().url);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleFilter();
    };

    // ✨ NUEVA FUNCIÓN PARA EXPORTAR ✨
    const handleExportExcel = () => {
        // Redirige al endpoint de Laravel que generará el Excel
        window.location.href = '/clients/export-matrix';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <div className="space-y-6">
                {/* --- CABECERA CON EL BOTÓN DE EXPORTAR --- */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Clientes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona los clientes y sus documentos
                        </p>
                    </div>

                    <Button
                        onClick={handleExportExcel}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Exportar Excel de Documentos
                    </Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="active">Activos</SelectItem>
                            <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={fileStatus} onValueChange={setFileStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Archivos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Archivos</SelectItem>
                            <SelectItem value="with_files">Con Archivos</SelectItem>
                            <SelectItem value="without_files">Sin Archivos</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button onClick={handleFilter}>Filtrar</Button>
                        <Button variant="outline" onClick={handleClearFilters}>Limpiar</Button>
                    </div>
                </div>

                {/* Lista de clientes */}
                {clients.data.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {clients.data.map((client) => (
                                <ClientCard key={client.co_cli} client={client} />
                            ))}
                        </div>

                        {clients.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {clients.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
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
                        <h3 className="mt-4 text-lg font-semibold">No se encontraron clientes</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {filters.search || filters.status
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza creando tu primer cliente'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}