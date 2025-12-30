import { DocumentCard } from '@/components/document-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients';
import documentsRoutes from '@/routes/documents';
import type { BreadcrumbItem } from '@/types';
import type { ClientDetail } from '@/types/client';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    FileText,
    HardDrive,
    LayoutGrid,
    Mail,
    MapPin,
    Phone,
    Plus,
} from 'lucide-react';

interface Stats {
    total_documents: number;
    total_size: number;
    formatted_size: string;
    categories: string[];
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    client: ClientDetail;
    stats: Stats;
    clients: {
        co_cli: string;
        cli_des: string;
        co_seg?: string;
        co_ven?: string;
    }[];
    categories: Category[];
}

export default function ClientsShow({ client, stats, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Clientes', href: clientsRoutes.index().url },
        { title: client.cli_des, href: clientsRoutes.show(client.co_cli).url },
    ];

    const isActive = client.inactivo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.cli_des} />

            <div className="space-y-8">
                {/* --- HEADER PRINCIPAL --- */}
                <div className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        {/* Icono Hero */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400">
                            <Building2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {client.cli_des}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-muted-foreground"
                                >
                                    {client.co_cli}
                                </Badge>
                                {isActive == 1 ? (
                                    <Badge
                                        variant="destructive"
                                        className="ml-2"
                                    >
                                        Inactivo
                                    </Badge>
                                ) : null}
                            </div>
                            <p className="text-muted-foreground">
                                Perfil del cliente y gestión de documentos
                                asociados.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- INFORMACIÓN Y ESTADÍSTICAS --- */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Columna 1: Info Contacto (Ocupa 2 espacios) */}
                    <Card className="shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Información Detallada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Rif
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">
                                            {client.rif || 'No registrado'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Teléfono
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">
                                            {client.telefonos ||
                                                'No registrado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Dirección
                                    </label>
                                    <div className="mt-1 flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">
                                            {client.direc1 || 'Sin dirección'}
                                        </span>
                                    </div>
                                </div>
                                {client.notes && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Notas Internas
                                        </label>
                                        <div className="mt-1 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground italic">
                                            {client.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna 2: Estadísticas (Ocupa 1 espacio) */}
                    <Card className="h-fit shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                        <LayoutGrid className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Documentos
                                        </span>
                                        <span className="text-2xl font-bold">
                                            {stats.total_documents}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20">
                                        <HardDrive className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Espacio
                                        </span>
                                        <span className="text-xl font-bold">
                                            {stats.formatted_size}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {stats.categories.length > 0 && (
                                <div>
                                    <span className="mb-2 block text-xs font-medium text-muted-foreground">
                                        Categorías activas
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {stats.categories.map((cat) => (
                                            <Badge
                                                key={cat}
                                                variant="secondary"
                                                className="font-normal"
                                            >
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- SECCIÓN DOCUMENTOS --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-primary" />
                            <h2 className="text-xl font-semibold tracking-tight">
                                Documentos Asociados
                            </h2>
                        </div>
                        <Link href={documentsRoutes.create(client.co_cli).url}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Subir Nuevo
                            </Button>
                        </Link>
                    </div>

                    {client.documents && client.documents.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {client.documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={{
                                        ...document,
                                        category:
                                            document.category_obj ||
                                            document.category,
                                        client_id: client.co_cli,
                                        client: {
                                            id: client.co_cli,
                                            name: client.cli_des,
                                            code: client.co_cli,
                                        },
                                    }}
                                    showClient={false}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-muted p-4">
                                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    Sin documentos
                                </h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Este cliente aún no tiene archivos. Sube el
                                    primer documento para comenzar a gestionar
                                    su historial.
                                </p>
                                <Link
                                    href={
                                        documentsRoutes.create(client.co_cli)
                                            .url
                                    }
                                    className="mt-6"
                                >
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Subir Documento
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
