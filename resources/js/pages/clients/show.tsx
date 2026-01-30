/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentCard } from '@/components/document-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    CheckCircle2,
    XCircle,
    Eye,
    CalendarDays
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

    const documentsMatrix = categories.map((category) => {
        const existingDoc = client.documents?.find(doc => {
            const docCatId = doc.category_obj?.id;
            const catMixed = doc.category as any;
            const docCatName = typeof catMixed === 'string' ? catMixed : catMixed?.name;
            return docCatId === category.id || docCatName === category.name;
        });

        return {
            ...category,
            hasDocument: !!existingDoc,
            documentDate: existingDoc?.created_at,
        };
    });

    const completedCount = documentsMatrix.filter(m => m.hasDocument).length;
    const totalCategories = categories.length;
    const completionPercentage = totalCategories > 0
        ? Math.round((completedCount / totalCategories) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.cli_des} />

            <div className="space-y-8">
                {/* --- HEADER PRINCIPAL --- */}
                {/* RESPONSIVE: Cambiado a flex-col en móvil, flex-row en desktop */}
                <div className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                        {/* Icono Hero */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400">
                            <Building2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                {/* RESPONSIVE: Texto más pequeño en móvil (2xl) */}
                                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                    {client.cli_des}
                                </h1>
                                <Badge variant="outline" className="font-mono text-muted-foreground">
                                    {client.co_cli}
                                </Badge>
                                {isActive == 1 ? (
                                    <Badge variant="destructive">Inactivo</Badge>
                                ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground md:text-base">
                                Perfil del cliente y gestión de documentos asociados.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- INFORMACIÓN Y ESTADÍSTICAS --- */}
                {/* RESPONSIVE: grid-cols-1 por defecto (móvil), grid-cols-3 en desktop */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Columna 1: Info Contacto */}
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
                                    <label className="text-xs font-medium text-muted-foreground">Rif</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">{client.rif || 'No registrado'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">{client.telefonos || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Dirección</label>
                                    <div className="mt-1 flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium break-words">
                                            {client.direc1 || 'Sin dirección'}
                                        </span>
                                    </div>
                                </div>
                                {client.notes && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Notas Internas</label>
                                        <div className="mt-1 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground italic">
                                            {client.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna 2: Estadísticas */}
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
                                        <span className="text-sm font-medium text-muted-foreground">Documentos</span>
                                        <span className="text-2xl font-bold">{stats.total_documents}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20">
                                        <HardDrive className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-muted-foreground">Espacio</span>
                                        <span className="text-xl font-bold">{stats.formatted_size}</span>
                                    </div>
                                </div>
                            </div>
                            {stats.categories.length > 0 && (
                                <div>
                                    <span className="mb-2 block text-xs font-medium text-muted-foreground">Categorías activas</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {stats.categories.map((cat) => (
                                            <Badge key={cat} variant="secondary" className="font-normal">
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
                    {/* RESPONSIVE: Stack vertical en móvil, fila en sm/md */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-primary" />
                            <h2 className="text-xl font-semibold tracking-tight">Documentos Asociados</h2>
                        </div>

                        {/* Botones: ancho completo en móvil, auto en desktop */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 
                                                   dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/60"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Estado
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] sm:max-w-md md:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Estado de Documentación</DialogTitle>
                                        <DialogDescription>
                                            Verifica qué documentos han sido cargados.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Barra de Progreso */}
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Progreso de entrega</span>
                                            <span>{completionPercentage}% ({completedCount}/{totalCategories})</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ease-out ${completionPercentage === 100 ? 'bg-green-500' :
                                                        completionPercentage > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`}
                                                style={{ width: `${completionPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <ScrollArea className="mt-4 max-h-[60vh] pr-4">
                                        <div className="space-y-3">
                                            {documentsMatrix.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-start justify-between rounded-lg border p-3 transition-colors ${item.hasDocument
                                                            ? 'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/20'
                                                            : 'border-red-100 bg-red-50/40 dark:border-red-900/50 dark:bg-red-900/20'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${item.hasDocument
                                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                                                : 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400'
                                                            }`}>
                                                            {item.hasDocument ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-semibold ${item.hasDocument
                                                                    ? 'text-green-900 dark:text-green-100'
                                                                    : 'text-red-900 dark:text-red-100'
                                                                }`}>
                                                                {item.name}
                                                            </p>
                                                            {item.hasDocument ? (
                                                                <p className="mt-1 flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                                                                    <CalendarDays className="h-3 w-3" />
                                                                    {new Date(item.documentDate!).toLocaleDateString()}
                                                                </p>
                                                            ) : (
                                                                <p className="mt-1 text-xs text-red-700 font-medium dark:text-red-400">
                                                                    Pendiente
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>

                            <Link href={documentsRoutes.create(client.co_cli).url} className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Subir Nuevo
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {client.documents && client.documents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {client.documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={{
                                        ...document,
                                        category: document.category_obj || document.category,
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
                                <h3 className="text-lg font-semibold">Sin documentos</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Este cliente aún no tiene archivos. Sube el primer documento para comenzar a gestionar su historial.
                                </p>
                                <Link href={documentsRoutes.create(client.co_cli).url} className="mt-6 w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto">
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