import { Download, FileText, Trash2, Eye, Edit, Pencil, MoreVertical, Folder } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { DocumentPreview } from '@/components/document-preview';
import { EditDocumentDialog } from '@/components/edit-document-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
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

interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: { id: number; name: string } | string; // Can be object (relation) or string (legacy column)
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

interface DocumentCardProps {
    document: Document;
    showClient?: boolean;
    onDelete?: () => void;
    clients?: { id: number; name: string; code: string }[];
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

    /**
     * Manejar descarga de documento
     */
    const handleDownload = () => {
        window.location.href = documentsRoutes.download(document.id).url;
    };

    /**
     * Manejar eliminación de documento
     */
    const handleDelete = () => {
        router.delete(documentsRoutes.destroy(document.id).url, {
            onSuccess: () => {
                onDelete?.();
                setIsDeleteOpen(false);
            },
        });
    };

    /**
     * Formatear fecha
     */
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Helper to get category name safely
    const categoryName = typeof document.category === 'object' && document.category !== null
        ? document.category.name
        : document.category;

    return (
        <>
            <Card className="group relative flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
                <div className="flex flex-1 flex-col p-4">
                    {/* Header: Icon & Options */}
                    <div className="mb-3 flex items-start justify-between">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Vista Previa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Detalles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Content: Title & Desc */}
                    <div className="flex-1 space-y-1">
                        <h3 className="line-clamp-2 font-medium leading-tight group-hover:text-primary">
                            {document.title}
                        </h3>
                        {document.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                {document.description}
                            </p>
                        )}
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {categoryName && (
                            <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-normal hover:bg-secondary">
                                {categoryName}
                            </Badge>
                        )}
                        {showClient && (
                            <Link href={clientsRoutes.show(document.client.id).url}>
                                <Badge variant="outline" className="text-[10px] font-normal hover:bg-accent cursor-pointer">
                                    {document.client.name}
                                </Badge>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer: Tech specs */}
                <CardFooter className="flex items-center justify-between border-t bg-muted/30 p-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span>{document.formatted_size}</span>
                        <span>•</span>
                        <span>{formatDate(document.created_at)}</span>
                    </div>
                    {document.downloaded_count > 0 && (
                        <div className="flex items-center gap-1" title={`${document.downloaded_count} descargas`}>
                            <Download className="h-3 w-3" />
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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
