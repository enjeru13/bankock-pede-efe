import { Head, Link, router } from '@inertiajs/react';
import { FileText, Mail, Phone, MapPin, Plus, Building2, HardDrive, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { DocumentCard } from '@/components/document-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients';
import documentsRoutes from '@/routes/documents'; // Corregido nombre de importación
import type { BreadcrumbItem } from '@/types';

interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: string;
    category_obj?: { id: number; name: string };
    category_id?: number;
    downloaded_count: number;
    created_at: string;
    client_id: number;
    uploaded_by?: {
        id: number;
        name: string;
    };
}

interface Client {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    is_active: boolean;
    documents: Document[];
}

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
    client: Client;
    stats: Stats;
    clients: { id: number; name: string; code: string }[];
    categories: Category[];
}

export default function ClientsShow({ client, stats, clients, categories }: Props) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Clientes', href: clientsRoutes.index().url },
        { title: client.name, href: clientsRoutes.show(client.id).url },
    ];

    const handleDeleteClient = () => {
        router.delete(clientsRoutes.destroy(client.id).url, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.name} />

            <div className="space-y-8">
                {/* --- HEADER PRINCIPAL --- */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b pb-6">
                    <div className="flex items-start gap-4">
                        {/* Icono Hero */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm">
                            <Building2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {client.name}
                                </h1>
                                <Badge variant="outline" className="font-mono text-muted-foreground">
                                    {client.code}
                                </Badge>
                                {!client.is_active && (
                                    <Badge variant="destructive" className="ml-2">Inactivo</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Perfil del cliente y gestión de documentos asociados.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- INFORMACIÓN Y ESTADÍSTICAS --- */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Columna 1: Info Contacto (Ocupa 2 espacios) */}
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Información Detallada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Correo Electrónico</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">{client.email || 'No registrado'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="text-sm font-medium">{client.phone || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Dirección</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground/70 mt-0.5" />
                                        <span className="text-sm font-medium">{client.address || 'Sin dirección'}</span>
                                    </div>
                                </div>
                                {client.notes && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Notas Internas</label>
                                        <div className="mt-1 rounded-md bg-muted/50 p-3 text-sm italic text-muted-foreground">
                                            {client.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna 2: Estadísticas (Ocupa 1 espacio) */}
                    <Card className="shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
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
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/20">
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
                                    <span className="text-xs font-medium text-muted-foreground mb-2 block">Categorías activas</span>
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h2 className="text-xl font-semibold tracking-tight">Documentos Asociados</h2>
                        </div>
                        <Link href={documentsRoutes.create().url}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Subir Nuevo
                            </Button>
                        </Link>
                    </div>

                    {client.documents.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {client.documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={{
                                        ...document,
                                        // IMPORTANTE: Mapeo correcto para que la card funcione
                                        category: document.category_obj || document.category,
                                        client_id: client.id,
                                        client: {
                                            id: client.id,
                                            name: client.name,
                                            code: client.code,
                                        },
                                    }}
                                    showClient={false} // No mostramos cliente porque ya estamos en su perfil
                                    clients={clients}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold">Sin documentos</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Este cliente aún no tiene archivos. Sube el primer documento para comenzar a gestionar su historial.
                                </p>
                                <Link href={documentsRoutes.create().url} className="mt-6">
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Subir Documento
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* --- DIÁLOGO ELIMINAR CLIENTE --- */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción eliminará permanentemente al cliente <strong>{client.name}</strong> y todos sus documentos asociados. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteClient}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Eliminar Cliente
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}