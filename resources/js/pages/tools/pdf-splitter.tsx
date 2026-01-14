import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/client';
import { Head } from '@inertiajs/react';
import {
    Trash2,
    Scissors,
    CheckSquare,
    XSquare,
    FileText,
    FileUp,
    RefreshCcw,
    CheckCircle2,
    MousePointerClick,
    LayoutTemplate,
    UserCheck,
    Files,
    FilePlus2,
    Check, ChevronsUpDown
} from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';

interface Category {
    id: number;
    name: string;
}

interface Props {
    clients: Client[];
    categories: Category[];
}

interface UploadedPdf {
    tempPath: string;
    pageCount: number;
    filename: string;
}

interface Split {
    id: string;
    pages: number[];
    title: string;
    categoryId: number | null;
    description: string;
    action: 'save' | 'download';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Herramientas',
        href: '#',
    },
    {
        title: 'Dividir PDF',
        href: '/tools/pdf-splitter',
    },
];

export default function PdfSplitter({ clients, categories }: Props) {
    const [uploadedPdf, setUploadedPdf] = useState<UploadedPdf | null>(null);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [splits, setSplits] = useState<Split[]>([]);
    const [globalClientId, setGlobalClientId] = useState<string>("");
    const [openCombobox, setOpenCombobox] = useState(false)
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const t = toast.loading('Analizando PDF...');

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            // BUSCAR EL TOKEN SIEMPRE ANTES DE LA PETICIÓN
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const resp = await fetch('/tools/pdf-splitter/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '', // Asegúrate de enviarlo aquí
                    'Accept': 'application/json'
                },
            });

            // Si la respuesta es 419, significa que el token expiró/cambió
            if (resp.status === 419) {
                toast.error('Sesión expirada', { id: t });
                // Opcional: Recargar la página automáticamente si el token falla
                window.location.reload();
                return;
            }

            const data = await resp.json();

            if (data.success) {
                toast.dismiss(t);
                toast.success('PDF cargado', { description: `${data.pageCount} páginas disponibles.` });
                setUploadedPdf({
                    tempPath: data.temp_path,
                    pageCount: data.page_count,
                    filename: data.filename,
                });
                setSelectedPages(new Set());
                setSplits([]);
            } else {
                toast.dismiss(t);
                toast.error('Error', { description: data.message });
            }
        } catch (error) {
            console.error(error);
            toast.dismiss(t);
            toast.error('Error de conexión');
        } finally {
            setIsUploading(false);
        }
    };

    const togglePageSelection = (pageNum: number) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageNum)) newSelected.delete(pageNum);
        else newSelected.add(pageNum);
        setSelectedPages(newSelected);
    };

    const selectAll = () => {
        if (!uploadedPdf) return;
        const allPages = new Set<number>();
        for (let i = 1; i <= uploadedPdf.pageCount; i++) allPages.add(i);
        setSelectedPages(allPages);
    };

    const clearSelection = () => setSelectedPages(new Set());

    // OPCIÓN A: Agrupar todo en un solo documento (Como antes)
    const createMergedSplit = () => {
        if (selectedPages.size === 0) {
            toast.warning('Selecciona páginas primero');
            return;
        }

        const newSplit: Split = {
            id: Date.now().toString(),
            pages: Array.from(selectedPages).sort((a, b) => a - b),
            title: '',
            categoryId: null,
            description: '',
            action: globalClientId ? 'save' : 'download',
        };

        setSplits([...splits, newSplit]);
        setSelectedPages(new Set());
        toast.success('Documento agrupado creado');
    };

    // OPCIÓN B: Crear una tarjeta por cada página seleccionada (NUEVO)
    const createIndividualSplits = () => {
        if (selectedPages.size === 0) {
            toast.warning('Selecciona páginas primero');
            return;
        }

        const newSplits: Split[] = Array.from(selectedPages)
            .sort((a, b) => a - b)
            .map((pageNum, index) => ({
                id: Date.now().toString() + index, // ID único
                pages: [pageNum],
                title: '', // Título vacío para rellenar
                categoryId: null,
                description: '',
                action: globalClientId ? 'save' : 'download',
            }));

        setSplits([...splits, ...newSplits]);
        setSelectedPages(new Set());
        toast.success(`${newSplits.length} documentos individuales creados`);
    };

    const updateSplit = (id: string, updates: Partial<Split>) => {
        setSplits(splits.map(split => split.id === id ? { ...split, ...updates } : split));
    };

    const removeSplit = (id: string) => {
        setSplits(splits.filter(split => split.id !== id));
    };

    const processSplits = async () => {
        if (splits.length === 0) return;

        const splitsToSave = splits.filter(s => s.action === 'save');
        if (splitsToSave.length > 0 && !globalClientId) {
            toast.error('Cliente requerido', { description: 'Selecciona un cliente arriba.' });
            return;
        }

        for (const split of splits) {
            if (!split.title.trim()) {
                toast.error('Falta título', { description: `El documento de la página [${split.pages.join(', ')}] necesita nombre.` });
                return;
            }
        }

        setIsProcessing(true);
        const processToast = toast.loading(`Procesando ${splits.length} documentos...`);
        let errors = 0;

        for (const split of splits) {
            try {
                const splitResponse = await fetch('/tools/pdf-splitter/split', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                    body: JSON.stringify({ temp_path: uploadedPdf?.tempPath, pages: split.pages }),
                });

                const splitData = await splitResponse.json();
                if (!splitData.success) { errors++; continue; }

                if (split.action === 'save') {
                    const saveResponse = await fetch('/tools/pdf-splitter/save-to-client', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                        body: JSON.stringify({
                            split_path: splitData.split_path,
                            client_id: globalClientId,
                            title: split.title,
                            category_id: split.categoryId,
                            description: split.description,
                        }),
                    });
                    const saveData = await saveResponse.json();
                    if (!saveData.success) errors++;
                } else {
                    const downloadResponse = await fetch('/tools/pdf-splitter/download', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                        body: JSON.stringify({ split_path: splitData.split_path, filename: `${split.title}.pdf` }),
                    });
                    if (downloadResponse.ok) {
                        const blob = await downloadResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `${split.title}.pdf`;
                        document.body.appendChild(a); a.click();
                        window.URL.revokeObjectURL(url); document.body.removeChild(a);
                    } else { errors++; }
                }
            } catch (error) { console.error(error); errors++; }
        }

        setIsProcessing(false);
        toast.dismiss(processToast);

        if (errors === 0) {
            toast.success('¡Proceso completado!');
            setUploadedPdf(null); setSplits([]); setGlobalClientId(""); setSelectedPages(new Set());
        } else {
            toast.warning(`Completado con ${errors} errores.`);
        }
    };

    const resetAll = () => {
        if (uploadedPdf) {
            fetch('/tools/pdf-splitter/cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: JSON.stringify({ temp_path: uploadedPdf.tempPath }),
            });
        }
        setUploadedPdf(null); setSplits([]); setSelectedPages(new Set()); setGlobalClientId("");
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.info('Editor reiniciado');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dividir PDF" />
            <Toaster richColors position="top-right" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Dividir y Asignar</h1>
                        <p className="text-sm text-muted-foreground">Procesa documentos en lote de forma rápida y visual.</p>
                    </div>
                </div>

                {!uploadedPdf && (
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <FileUp className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">Cargar PDF</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">Arrastra tu archivo aquí.</p>
                                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
                                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} size="lg">
                                    {isUploading ? 'Cargando...' : 'Seleccionar PDF'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {uploadedPdf && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* IZQUIERDA */}
                        <div className="sticky top-6 space-y-4">
                            <Card className="border-primary/20 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2 text-primary">
                                        <UserCheck className="h-5 w-5" /> Cliente Destino
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCombobox}
                                                className="w-full justify-between bg-background text-foreground"
                                            >
                                                {globalClientId
                                                    ? clients.find((client) => client.co_cli === globalClientId)?.cli_des
                                                    : "Buscar cliente por nombre o código..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Escribe nombre o código..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                                    <CommandGroup>
                                                        {clients.map((client) => (
                                                            <CommandItem
                                                                key={client.co_cli}
                                                                value={`${client.cli_des} ${client.co_cli}`}
                                                                onSelect={() => {
                                                                    setGlobalClientId(client.co_cli === globalClientId ? "" : client.co_cli)
                                                                    setOpenCombobox(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        globalClientId === client.co_cli ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{client.cli_des}</span>
                                                                    <span className="text-xs text-muted-foreground">Código: {client.co_cli}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </CardContent>
                            </Card>

                            <Card className="h-full overflow-hidden flex flex-col shadow-md">
                                <CardHeader className="pb-3 bg-muted/20 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" /> PDF
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 min-h-[500px] bg-slate-100">
                                    <iframe src={`/tools/pdf-splitter/preview?path=${encodeURIComponent(uploadedPdf.tempPath)}`} className="w-full h-[500px] lg:h-[calc(100vh-200px)] border-none" title="Vista previa" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* DERECHA */}
                        <div className="space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <CardTitle className="text-base">Selección de Páginas</CardTitle>
                                                <CardDescription className="text-xs">Elige qué páginas procesar</CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={resetAll} className="text-destructive hover:bg-destructive/10">
                                            <RefreshCcw className="h-4 w-4 mr-2" /> Reiniciar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2 p-1">
                                        <Button variant="ghost" size="sm" onClick={selectAll} className="flex-1">
                                            <CheckSquare className="h-4 w-4 mr-2" /> Todas
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={clearSelection} className="flex-1">
                                            <XSquare className="h-4 w-4 mr-2" /> Ninguna
                                        </Button>
                                    </div>

                                    {/* BOTONES DE ACCIÓN PRINCIPALES */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={createIndividualSplits}
                                            disabled={selectedPages.size === 0}
                                            className="flex-1 border border-primary/20 hover:bg-primary/10"
                                        >
                                            <Files className="h-4 w-4 mr-2 text-primary" />
                                            Separar ({selectedPages.size})
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={createMergedSplit}
                                            disabled={selectedPages.size === 0}
                                            className="flex-1"
                                        >
                                            <FilePlus2 className="h-4 w-4 mr-2" />
                                            Agrupar ({selectedPages.size})
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                                        {Array.from({ length: uploadedPdf.pageCount }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => togglePageSelection(pageNum)}
                                                className={cn(
                                                    "relative aspect-[210/297] rounded-md border-2 transition-all flex flex-col items-center justify-center font-bold text-sm shadow-sm group",
                                                    selectedPages.has(pageNum)
                                                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 ring-offset-2"
                                                        : "border-border hover:border-primary/50 bg-background text-foreground/60 hover:shadow-md"
                                                )}
                                            >
                                                <span className="z-10">{pageNum}</span>
                                                {selectedPages.has(pageNum) && (
                                                    <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-primary fill-primary/20" /></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {splits.length > 0 ? (
                                <Card className="border-2 border-primary/10 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <LayoutTemplate className="h-5 w-5 text-primary" /> Documentos a Generar ({splits.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        {splits.map((split, index) => (
                                            <Card key={split.id} className="border bg-card hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm bg-muted px-2 py-0.5 rounded">#{index + 1}</span>
                                                            <span className="text-xs text-muted-foreground">Pág: {split.pages.join(', ')}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeSplit(split.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Nombre</Label>
                                                            <Input className="h-8 text-sm" value={split.title} onChange={(e) => updateSplit(split.id, { title: e.target.value })} placeholder="Ej: Factura..." />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Acción</Label>
                                                            <Select value={split.action} onValueChange={(value: 'save' | 'download') => updateSplit(split.id, { action: value })}>
                                                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="save">Guardar</SelectItem>
                                                                    <SelectItem value="download">Descargar</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {split.action === 'save' && (
                                                        <div className="p-3 rounded-md border border-gray-200 text-sm space-y-3">
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                <div className="space-y-3">
                                                                    <Label className="text-xs">Categoría</Label>
                                                                    <Select value={split.categoryId?.toString() || ''} onValueChange={(value) => updateSplit(split.id, { categoryId: value ? parseInt(value) : null })}>
                                                                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs">Cliente</Label>
                                                                    <div className="h-8 px-3 py-1.5 bg-background border rounded-md  text-xs text-muted-foreground flex items-center truncate">
                                                                        {globalClientId ? clients.find(c => c.co_cli === globalClientId)?.cli_des : "Sin cliente"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <Button onClick={processSplits} disabled={isProcessing} className="w-full font-semibold" size="lg">
                                            {isProcessing ? 'Procesando...' : `Procesar ${splits.length} Documento(s)`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/10">
                                    <p className="text-sm">Cola vacía</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}