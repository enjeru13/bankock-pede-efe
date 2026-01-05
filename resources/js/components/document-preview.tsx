import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import documents from '@/routes/documents';
import { Download, ExternalLink } from 'lucide-react';

interface Document {
    id: number;
    title: string;
    filename: string;
    description?: string;
    client: {
        id: number | string;
        name: string;
        code: string;
    };
}

interface DocumentPreviewProps {
    document: Document | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DocumentPreview({
    document,
    open,
    onOpenChange,
}: DocumentPreviewProps) {
    if (!document) return null;

    // Construcción de URLs
    const previewUrl = `/documents/${document.id}/preview`;
    const downloadUrl = documents.download(document.id).url;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[90vh] max-w-4xl flex-col gap-0 p-0">
                <DialogHeader className="border-b p-4">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                        {/* Información del documento */}
                        <div>
                            <DialogTitle className="line-clamp-1">
                                {document.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{document.filename}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground">
                                    {document.client.name}
                                </span>
                            </DialogDescription>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Abrir documento en nueva pestaña"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir
                                </a>
                            </Button>
                            <Button size="sm" asChild>
                                <a href={downloadUrl} aria-label="Descargar documento">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </a>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Vista previa */}
                <div className="h-full w-full flex-1 overflow-hidden bg-muted/20 p-4">
                    <iframe
                        src={previewUrl}
                        className="h-full w-full rounded-md border bg-background"
                        title={document.title}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
