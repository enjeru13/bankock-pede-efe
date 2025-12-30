import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { DocumentCard } from '@/components/document-card';
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
import documentsRoutes from '@/routes/documents';
import type { BreadcrumbItem } from '@/types';

interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: { id: number; name: string };
    category_id?: number;
    downloaded_count: number;
    created_at: string;
    client_id: number;
    client: {
        id: number;
        name: string;
        code: string;
    };
    uploaded_by?: {
        id: number;
        name: string;
    };
}

interface Client {
    id: number;
    name: string;
    code: string;
}

interface PaginatedDocuments {
    data: Document[];
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

interface Category {
    id: number;
    name: string;
}

interface Props {
    documents: PaginatedDocuments;
    clients: Client[];
    categories: Category[];
    filters: {
        search?: string;
        client_id?: string;
        category?: string;
    };
}

export default function DocumentsIndex({
    documents,
    clients,
    categories,
    filters,
}: Props) {
    const getInitialCategory = () => {
        if (!filters.category) return 'all';

        // Buscamos si el filtro coincide con algún nombre de categoría
        const initialCategoryId = categories.find(
            (cat) => cat.name.toLowerCase() === filters.category?.toLowerCase() || String(cat.id) === filters.category
        );

        return initialCategoryId ? String(initialCategoryId.id) : filters.category;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [clientId, setClientId] = useState(filters.client_id || 'all');
    const [category, setCategory] = useState(
        getInitialCategory()
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Documentos',
            href: documentsRoutes.index(),
        },
    ];

    const updateFilters = (newFilters: { search?: string; client_id?: string; category?: string }) => {
        router.get(
            documentsRoutes.index(),
            {
                search: newFilters.search ?? search,
                client_id: (newFilters.client_id ?? clientId) === 'all' ? undefined : (newFilters.client_id ?? clientId),
                // Enviamos el ID al controlador
                category: (newFilters.category ?? category) === 'all' ? undefined : (newFilters.category ?? category),
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateFilters({ search });
        }
    };

    const handleClientChange = (value: string) => {
        setClientId(value);
        updateFilters({ client_id: value });
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        updateFilters({ category: value });
    };

    const handleClearFilters = () => {
        setSearch('');
        setClientId('all');
        setCategory('all');
        router.get(documentsRoutes.index());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentos" />

            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
                        <p className="text-muted-foreground">
                            Gestiona y organiza todos los documentos
                        </p>
                    </div>
                    <Link href={documentsRoutes.create().url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Documento
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar documentos..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>

                        <Select value={clientId} onValueChange={handleClientChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los clientes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los clientes</SelectItem>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={String(client.id)}>
                                        {client.code} - {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las categorías" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(search || clientId !== 'all' || category !== 'all') && (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                onClick={handleClearFilters}
                                className="h-auto px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </div>

                {documents.data.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {documents.data.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    showClient={true}
                                    clients={clients}
                                    categories={categories}
                                />
                            ))}
                        </div>

                        {documents.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {documents.links.map((link, index) => (
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
                            No se encontraron documentos
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {filters.search || filters.client_id || filters.category
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza subiendo tu primer documento'}
                        </p>
                        {!filters.search && !filters.client_id && !filters.category && (
                            <Link href={documentsRoutes.create().url} className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Subir Documento
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
