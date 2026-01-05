import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import documentsRoutes from '@/routes/documents';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Document {
    id: number;
    title: string;
    description?: string;
    category?: { id: number; name: string } | string;
    category_id?: number;
    client_id: number | string;
    client: {
        id: number | string;
        name: string;
        code: string;
    };
}

interface EditDocumentDialogProps {
    document: Document;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories?: { id: number; name: string }[];
}

export function EditDocumentDialog({
    document,
    open,
    onOpenChange,
    categories = [],
}: EditDocumentDialogProps) {
    // Helper to extract category name safely
    const getCategoryName = () => {
        if (
            typeof document.category === 'object' &&
            document.category !== null
        ) {
            return document.category.name;
        }
        return document.category || '';
    };

    const { data, setData, put, transform, processing, errors, clearErrors } =
        useForm({
            client_id: document.client_id,
            title: document.title,
            description: document.description || '',
            category: document.category_id
                ? String(document.category_id)
                : getCategoryName() || 'null_option_empty',
        });

    const [isCustomCategory, setIsCustomCategory] = useState(false);

    useEffect(() => {
        if (open) {
            // Determine initial state based on whether we have an ID or just a string
            const hasId = !!document.category_id;

            // Helper logic inline since we are inside useEffect
            const catName =
                typeof document.category === 'object' &&
                    document.category !== null
                    ? document.category.name
                    : document.category || '';

            setIsCustomCategory(!hasId && !!catName); // Only custom if no ID but has text

            setData({
                title: document.title,
                description: document.description || '',
                category: document.category_id
                    ? String(document.category_id)
                    : catName || 'null_option_empty',
            });
            clearErrors();
        }
    }, [open, document, clearErrors, setData]); // Dependency array fixed

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            category:
                data.category === 'null_option_empty' ? '' : data.category,
        }));

        put(documentsRoutes.update(document.id).url, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Documento</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del documento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Cliente
                    <div className="space-y-2">
                        <Label htmlFor="client_id">Cliente</Label>
                        <Select
                            value={String(data.client_id)}
                            onValueChange={(value) =>
                                setData('client_id', Number(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem
                                        key={client.id}
                                        value={String(client.id)}
                                    >
                                        [{client.code}] {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.client_id && (
                            <p className="text-sm text-destructive">
                                {errors.client_id}
                            </p>
                        )}
                    </div> */}
                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Título del documento"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>
                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Descripción opcional..."
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    {/* Categoría */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category">Categoría</Label>
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => {
                                    setIsCustomCategory(!isCustomCategory);
                                    setData('category', '');
                                }}
                            >
                                {isCustomCategory
                                    ? 'Seleccionar existente'
                                    : 'Crear nueva'}
                            </Button>
                        </div>

                        {isCustomCategory ? (
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) =>
                                    setData('category', e.target.value)
                                }
                                placeholder="Nueva categoría..."
                            />
                        ) : (
                            <Select
                                value={data.category}
                                onValueChange={(value) =>
                                    setData('category', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null_option_empty">
                                        Sin Categoría
                                    </SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.category && (
                            <p className="text-sm text-destructive">
                                {errors.category}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
