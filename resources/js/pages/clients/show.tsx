import { Head, Link, router } from '@inertiajs/react';
import { FileText, Mail, Phone, MapPin, Edit, Trash2, Plus } from 'lucide-react';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients';
import documents from '@/routes/documents';
import type { BreadcrumbItem } from '@/types';

/**
 * Página: Ver Cliente
 * 
 * Muestra los detalles de un cliente y todos sus documentos.
 * Incluye:
 * - Información del cliente
 * - Estadísticas de documentos
 * - Lista de documentos del cliente
 * - Acciones (editar, eliminar)
 */

interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: string; // Legacy
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
    categories: string[]; // These are names strings plucked in controller
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    client: Client;
    stats: Stats;
    clients: { id: number; name: string; code: string }[];
    categories: Category[]; // Array of objects
}

export default function ClientsShow({ client, stats, clients, categories }: Props) {
    // ... (breadcrumbs/handlers - unchanged)
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Clientes',
            href: clientsRoutes.index().url,
        },
        {
            title: client.name,
            href: clientsRoutes.show(client.id).url,
        },
    ];

    /**
     * Manejar eliminación de cliente
     */
    const handleDelete = () => {
        router.delete(clientsRoutes.destroy(client.id).url, {
            onBefore: () => confirm('¿Estás seguro de eliminar este cliente?'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* ... (Header/Info/Stats - mostly unchanged save for types) */}
            <Head title={client.name} />

            <div className="space-y-6">
                {/* Header con acciones */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {client.name}
                            </h1>
                            {!client.is_active && (
                                <Badge variant="secondary">Inactivo</Badge>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-mono">
                                {client.code}
                            </Badge>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link href={clientsRoutes.edit(client.id).url}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        ¿Eliminar cliente?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción eliminará el cliente "{client.name}".
                                        Solo se puede eliminar si no tiene documentos asociados.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Información del cliente */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Detalles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{client.email}</span>
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{client.phone}</span>
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="text-sm">{client.address}</span>
                                </div>
                            )}
                            {client.notes && (
                                <div className="mt-4 rounded-md bg-muted p-3">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Notas:</strong> {client.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Estadísticas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total de documentos
                                </span>
                                <span className="text-2xl font-bold">
                                    {stats.total_documents}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Espacio utilizado
                                </span>
                                <span className="text-lg font-semibold">
                                    {stats.formatted_size}
                                </span>
                            </div>
                            {stats.categories.length > 0 && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Categorías
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {stats.categories.map((category) => (
                                            <Badge key={category} variant="secondary">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Documentos */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Documentos</h2>
                        <Link href={documents.create().url}>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Subir Documento
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
                                        client_id: client.id,
                                        client: {
                                            id: client.id,
                                            name: client.name,
                                            code: client.code,
                                        },
                                    }}
                                    showClient={false}
                                    clients={clients}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    No hay documentos
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Este cliente aún no tiene documentos subidos
                                </p>
                                <Link href={documents.create().url} className="mt-4">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Subir Primer Documento
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
