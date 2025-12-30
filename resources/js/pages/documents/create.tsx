import { FileUploader } from '@/components/file-uploader';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import documentsRoutes from '@/routes/documents';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Página: Subir Documento
 *
 * Formulario para subir un nuevo documento PDF.
 * Incluye:
 * - Selector de cliente (Usa campos legacy: co_cli, cli_des)
 * - Título y descripción
 * - Categoría
 * - Etiquetas
 * - Upload de archivo PDF
 */

interface Client {
    co_cli: string;
    cli_des: string;
    co_seg?: string;
    co_ven?: string;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    client: Client;
    categories: Category[];
}

export default function DocumentsCreate({ client, categories }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Documentos',
            href: documentsRoutes.index().url,
        },
        {
            title: 'Subir Documento',
            href: documentsRoutes.create(client.co_cli).url,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        client_id: client.co_cli,
        title: '',
        description: '',
        category: '',
        tags: [] as string[],
        file: null as File | null,
    });

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        setData('file', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(documentsRoutes.store(client.co_cli).url, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subir Documento" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Subir Documento
                    </h2>
                    <p className="text-muted-foreground">
                        Sube un nuevo documento PDF al sistema
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Documento</CardTitle>
                            <CardDescription>
                                Completa los detalles del documento PDF
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Selector de cliente */}
                            <div className="space-y-2">
                                <Label htmlFor="client_id">
                                    Cliente{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="client_id"
                                    type="text"
                                    value={client.cli_des}
                                    readOnly
                                />
                                {/* <Select
                                    value={data.client_id}
                                    onValueChange={(value) =>
                                        setData('client_id', value)
                                    }
                                >
                                    <SelectTrigger id="client_id">
                                        <SelectValue placeholder="Selecciona un cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem
                                                key={client.co_cli}
                                                value={client.co_cli}
                                            >
                                                {client.co_cli} -{' '}
                                                {client.cli_des}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.client_id} /> */}
                            </div>

                            {/* Título */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Título{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Ej: Factura Enero 2024"
                                />
                                <InputError message={errors.title} />
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
                                    placeholder="Descripción opcional del documento..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
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
                                            setIsCustomCategory(
                                                !isCustomCategory,
                                            );
                                            setData('category', ''); // Reset on toggle
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
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null_option_empty">
                                                Sin categoría
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
                                <InputError message={errors.category} />
                            </div>

                            {/* Etiquetas */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Etiquetas</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="tags"
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        placeholder="Agregar etiqueta..."
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddTag}
                                    >
                                        Agregar
                                    </Button>
                                </div>
                                {data.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {data.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveTag(tag)
                                                    }
                                                    className="hover:text-destructive"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.tags} />
                            </div>

                            {/* Upload de archivo */}
                            <div className="space-y-2">
                                <Label>
                                    Archivo PDF{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <FileUploader
                                    onFileSelect={handleFileSelect}
                                    error={errors.file as string}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="mt-6 flex gap-4">
                        <Button
                            type="submit"
                            disabled={processing || !selectedFile}
                        >
                            {processing ? 'Subiendo...' : 'Subir Documento'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.visit(documentsRoutes.index().url)
                            }
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
