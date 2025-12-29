import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import documents from '@/routes/documents';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface Document {
    id: number;
    title: string;
    filename: string;
    description?: string;
    client: {
        id: number;
        name: string;
        code: string;
    };
}

interface DocumentPreviewProps {
    document: Document | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
    if (!document) return null;

    // Obtener URLs usando los helpers de rutas (si están disponibles) o construirlas manualmente
    // Asumimos que documents.preview existe debido a la actualización de rutas
    const previewUrl = `/documents/${document.id}/preview`; // Fallback si el helper falla en TS
    const downloadUrl = documents.download(document.id).url;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center justify-between mr-8">
                        <div>
                            <DialogTitle className="line-clamp-1">{document.title}</DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <span>{document.filename}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground">{document.client.name}</span>
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
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

                <div className="flex-1 bg-muted/20 w-full h-full p-4 overflow-hidden">
                    <iframe
                        src={previewUrl}
                        className="w-full h-full rounded-md border bg-background"
                        title={document.title}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
