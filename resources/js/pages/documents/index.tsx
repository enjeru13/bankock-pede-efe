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
        const found = categories.find(
            (cat) => cat.name.toLowerCase() === filters.category?.toLowerCase() || String(cat.id) === filters.category
        );
        return found ? String(found.id) : filters.category;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(getInitialCategory());

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Documentos',
            href: documentsRoutes.index().url,
        },
    ];

    // Función central para aplicar filtros
    const applyFilters = () => {
        router.get(
            documentsRoutes.index().url,
            {
                search: search,
                category: category === 'all' ? undefined : category,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('all');
        router.get(documentsRoutes.index().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentos" />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
                        <p className="text-muted-foreground text-sm">
                            Gestiona y organiza todos los documentos
                        </p>
                    </div>
                </div>

                {/* --- BARRA DE FILTROS ESTILO CLIENTES --- */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row">

                    {/* Búsqueda (Flex-1 para ocupar el espacio disponible) */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar documento, cliente o código..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Filtro de Categoría (Ancho fijo en desktop para alineación) */}
                    <Select value={category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Categoría" />
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

                    {/* Botones de Acción */}
                    <div className="flex gap-2">
                        <Button onClick={applyFilters}>Filtrar</Button>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </div>

                {/* --- RESULTADOS --- */}
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
                            {search || category !== 'all'
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza subiendo tu primer documento'}
                        </p>
                        {!search && category === 'all' && (
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