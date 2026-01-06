import { Download, FileText, Trash2, Eye, Edit, MoreVertical, Calendar, HardDrive } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DocumentPreview } from '@/components/document-preview';
import { EditDocumentDialog } from '@/components/edit-document-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import clientsRoutes from '@/routes/clients';
import documentsRoutes from '@/routes/documents';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';

interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: { id: number; name: string } | string;
    category_id?: number;
    downloaded_count: number;
    created_at: string;
    client_id: number | string;
    client: {
        id: number | string;
        name: string;
        code: string;
    };
    uploaded_by?: {
        id: number;
        name: string;
    };
}

interface DocumentCardProps {
    document: Document;
    showClient?: boolean;
    onDelete?: () => void;
    clients?: { id: number | string; name: string; code: string }[];
    categories?: { id: number; name: string }[];
}

export function DocumentCard({
    document,
    showClient = true,
    onDelete,
    clients = [],
    categories = [],
}: DocumentCardProps) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.is_admin ?? false;

    const handleDownload = () => {
        window.location.href = documentsRoutes.download(document.id).url;
    };

    const handleDelete = () => {
        router.delete(documentsRoutes.destroy(document.id).url, {
            onSuccess: () => {
                onDelete?.();
                setIsDeleteOpen(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const categoryName = typeof document.category === 'object' && document.category !== null
        ? document.category.name
        : document.category;

    const isPdf = document.filename.endsWith('.pdf');

    return (
        <>
            <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                {/* Decoración superior sutil */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <CardContent className="flex flex-1 flex-col p-5">

                    {/* Top Row: Icon and Actions */}
                    <div className="flex items-start justify-between">
                        {/* Icono de Archivo Estilizado */}
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                            isPdf ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        )}>
                            <FileText className="h-6 w-6" />
                        </div>

                        {/* Menú de Acciones */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Vista Previa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Descargar
                                </DropdownMenuItem>

                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Editar
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                                            onClick={() => setIsDeleteOpen(true)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </>
                                )}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Contenido Principal */}
                    <div className="mt-4 flex-1 space-y-2">
                        <div>
                            {categoryName && (
                                <span className="mb-1 inline-block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                    {categoryName}
                                </span>
                            )}
                            <h3
                                title={document.title}
                                className="font-semibold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2"
                            >
                                {document.title}
                            </h3>
                        </div>

                        {document.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {document.description}
                            </p>
                        )}
                    </div>

                    {/* Cliente (Badge flotante o integrado) */}
                    {showClient && (
                        <div className="mt-4 pt-3 border-t border-dashed">
                            <Link href={clientsRoutes.show(String(document.client.id)).url} className="flex items-center justify-between group/client">
                                <span className="text-xs text-muted-foreground">Cliente:</span>
                                <Badge variant="outline" className="font-normal transition-colors group-hover/client:border-primary group-hover/client:text-primary">
                                    {document.client.name}
                                </Badge>
                            </Link>
                        </div>
                    )}
                </CardContent>

                {/* Footer: Detalles técnicos */}
                <CardFooter className="bg-muted/30 px-5 py-3 text-[11px] font-medium text-muted-foreground flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(document.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {document.formatted_size}
                        </div>
                    </div>

                    {document.downloaded_count > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5 shadow-sm">
                            <Download className="h-3 w-3 text-primary" />
                            <span>{document.downloaded_count}</span>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <DocumentPreview
                document={document}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
            />
            {isAdmin && (
                <>
                    <EditDocumentDialog
                        document={document}
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                        clients={clients}
                        categories={categories}
                    />

                    <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el documento "{document.title}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-white hover:bg-red-500"
                                >
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </>
    );
}