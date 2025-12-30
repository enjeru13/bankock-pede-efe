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
        id: number | string; // Can be number or string (from co_cli)
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

    // Obtener URLs usando los helpers de rutas (si están disponibles) o construirlas manualmente
    // Asumimos que documents.preview existe debido a la actualización de rutas
    const previewUrl = `/documents/${document.id}/preview`; // Fallback si el helper falla en TS
    const downloadUrl = documents.download(document.id).url;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[85vh] max-w-4xl flex-col gap-0 p-0">
                <DialogHeader className="border-b p-4">
                    <div className="mr-8 flex items-center justify-between">
                        <div>
                            <DialogTitle className="line-clamp-1">
                                {document.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <span>{document.filename}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground">
                                    {document.client.name}
                                </span>
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir
                                </a>
                            </Button>
                            <Button size="sm" asChild>
                                <a href={downloadUrl}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </a>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

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
