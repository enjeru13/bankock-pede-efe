import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/client';
import { Head } from '@inertiajs/react';
import {
    Trash2, Scissors, FileUp,
    CheckCircle2, MousePointerClick, LayoutTemplate, FilePlus2,
    Check, ChevronsUpDown, ArrowRight, BookOpenCheck, Settings2,
    Files,
    Eye
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

// IMPORTACIONES NUEVAS PARA EL MOTOR LOCAL
import { PDFDocument } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface Category { id: number; name: string; }
interface Props { clients: Client[]; categories: Category[]; }
interface Split { id: string; pages: number[]; title: string; categoryId: number | null; description: string; action: 'save' | 'download'; }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Herramientas', href: '#' },
    { title: 'Dividir PDF', href: '/tools/pdf-splitter' },
];

export default function PdfSplitter({ clients, categories }: Props) {
    // ESTADOS PRINCIPALES
    const [rawPdfFile, setRawPdfFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [splits, setSplits] = useState<Split[]>([]);
    const [globalClientId, setGlobalClientId] = useState<string>("");
    const [openCombobox, setOpenCombobox] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // ESTADOS PARA EL RANGO DE PÁGINAS
    const [rangeStart, setRangeStart] = useState<number | ''>('');
    const [rangeEnd, setRangeEnd] = useState<number | ''>('');

    // El ancho de 280px es perfecto para móviles en una columna
    const [thumbnailWidth] = useState(280);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const pdfUrl = useMemo(() => {
        if (!rawPdfFile) return null;
        return URL.createObjectURL(rawPdfFile);
    }, [rawPdfFile]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const t = toast.loading('Leyendo documento en el navegador...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            setPageCount(pdfDoc.getPageCount());
            setRawPdfFile(file);
            setSelectedPages(new Set());
            setSplits([]);
            setRangeStart('');
            setRangeEnd('');

            toast.dismiss(t);
            toast.success('Documento cargado correctamente', { description: `${pdfDoc.getPageCount()} páginas detectadas.` });
        } catch (error) {
            console.error(error);
            toast.dismiss(t);
            toast.error('Error al leer el PDF. Asegúrate de que no tenga contraseña.');
        }
    };

    const togglePageSelection = (pageNum: number) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageNum)) newSelected.delete(pageNum);
        else newSelected.add(pageNum);
        setSelectedPages(newSelected);
    };

    const selectAll = () => {
        const allPages = new Set<number>();
        for (let i = 1; i <= pageCount; i++) allPages.add(i);
        setSelectedPages(allPages);
    };

    const clearSelection = () => {
        setSelectedPages(new Set());
        setRangeStart('');
        setRangeEnd('');
    };

    const applyRangeSelection = () => {
        if (rangeStart === '' || rangeEnd === '') return;

        const start = Math.max(1, rangeStart);
        const end = Math.min(pageCount, rangeEnd);

        if (start > end) {
            toast.error('El inicio del rango no puede ser mayor al final.');
            return;
        }

        const newSelected = new Set(selectedPages);
        for (let i = start; i <= end; i++) {
            newSelected.add(i);
        }

        setSelectedPages(newSelected);
        toast.success(`Se añadieron las páginas de la ${start} a la ${end}`);
        setRangeStart('');
        setRangeEnd('');
    };

    const createMergedSplit = () => {
        if (selectedPages.size === 0) return toast.warning('Selecciona páginas primero');
        setSplits([...splits, { id: Date.now().toString(), pages: Array.from(selectedPages).sort((a, b) => a - b), title: '', categoryId: null, description: '', action: globalClientId ? 'save' : 'download' }]);
        setSelectedPages(new Set());
        toast.success('Documento agrupado añadido a la cola');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const createIndividualSplits = () => {
        if (selectedPages.size === 0) return toast.warning('Selecciona páginas primero');
        const newSplits: Split[] = Array.from(selectedPages).sort((a, b) => a - b).map((pageNum, index) => ({
            id: Date.now().toString() + index, pages: [pageNum], title: '', categoryId: null, description: '', action: globalClientId ? 'save' : 'download'
        }));
        setSplits([...splits, ...newSplits]);
        setSelectedPages(new Set());
        toast.success(`${newSplits.length} documentos individuales añadidos a la cola`);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const updateSplit = (id: string, updates: Partial<Split>) => setSplits(splits.map(split => split.id === id ? { ...split, ...updates } : split));
    const removeSplit = (id: string) => setSplits(splits.filter(split => split.id !== id));

    const processSplits = async () => {
        if (!rawPdfFile || splits.length === 0) return;

        const splitsToSave = splits.filter(s => s.action === 'save');
        if (splitsToSave.length > 0 && !globalClientId) return toast.error('Cliente requerido', { description: 'Selecciona un cliente en el Paso 1.' });

        for (const split of splits) if (!split.title.trim()) return toast.error('Falta título', { description: `El documento con páginas [${split.pages.join(', ')}] no tiene nombre.` });

        setIsProcessing(true);
        const processToast = toast.loading(`Generando ${splits.length} documentos...`);
        let errors = 0;

        try {
            const originalBytes = await rawPdfFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(originalBytes);

            for (const split of splits) {
                const newPdf = await PDFDocument.create();
                const pagesToCopy = split.pages.map(p => p - 1);
                const copiedPages = await newPdf.copyPages(originalPdf, pagesToCopy);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                const newFileName = `${split.title}.pdf`;
                const pdfBlob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

                if (split.action === 'download') {
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = newFileName;
                    link.click();
                    URL.revokeObjectURL(blobUrl);
                } else {
                    const formData = new FormData();
                    formData.append('pdf', pdfBlob, newFileName);
                    formData.append('client_id', globalClientId);
                    formData.append('title', split.title);
                    if (split.categoryId) formData.append('category_id', split.categoryId.toString());
                    formData.append('description', split.description);

                    try {
                        await axios.post('/tools/pdf-splitter/save-to-client', formData);
                    } catch (error) {
                        console.error(error);
                        errors++;
                    }
                }
            }
        } catch (error) {
            console.error(error);
            errors++;
        }

        setIsProcessing(false);
        toast.dismiss(processToast);

        if (errors === 0) {
            toast.success('¡Generación exitosa! Puedes seguir trabajando con el mismo PDF.', { duration: 5000 });
            setSplits([]);
            setSelectedPages(new Set());
            setRangeStart('');
            setRangeEnd('');
            document.getElementById('workspace-area')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            toast.warning(`Completado con ${errors} errores.`);
        }
    };

    const resetAll = () => {
        setRawPdfFile(null); setSplits([]); setSelectedPages(new Set()); setGlobalClientId(""); setPageCount(0);
        setRangeStart(''); setRangeEnd('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.info('Todo el espacio de trabajo ha sido reiniciado');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dividir PDF" />
            <Toaster richColors position="top-right" />

            {/* Redujimos el padding inferior en móviles (pb-6 en vez de pb-12) */}
            <div className="space-y-6 md:space-y-8 pb-6 md:pb-12">

                {/* CABECERA (Adaptada a móvil) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start md:items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                            <Scissors className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Divisor de Documentos</h1>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">Sube un PDF grande, selecciona las páginas y asígnalas a un cliente.</p>
                        </div>
                    </div>
                    {rawPdfFile && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={resetAll}
                            className="h-9 px-4 font-medium shadow-sm w-full md:w-auto mt-2 md:mt-0"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Cerrar PDF Actual
                        </Button>
                    )}
                </div>

                {!rawPdfFile && (
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-all bg-card shadow-sm max-w-2xl mx-auto mt-6 md:mt-12 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="p-4 md:p-5 bg-primary/5 rounded-full mb-4 md:mb-6">
                                    <FileUp className="h-10 w-10 md:h-12 md:w-12 text-primary/70" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground">Cargar Documento</h3>
                                <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">Selecciona el PDF que deseas separar. El procesamiento se realizará de forma segura en tu navegador.</p>
                                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
                                <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full md:w-auto h-12 px-8 text-base font-semibold shadow-md shadow-primary/20">
                                    Seleccionar PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {rawPdfFile && (
                    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* PASO 1: CLIENTE */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                                <h2 className="text-base md:text-lg font-bold text-foreground">¿Para quién es este documento?</h2>
                            </div>
                            <Card className="bg-card shadow-sm border-border overflow-hidden">
                                <CardContent className="p-4 md:p-6">
                                    <div>
                                        <Label className="text-xs md:text-sm text-muted-foreground mb-2 block">Cliente Destino (Opcional)</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between h-12 text-sm md:text-base font-medium overflow-hidden">
                                                    <span className="truncate">{globalClientId ? clients.find((c) => c.co_cli === globalClientId)?.cli_des : "Buscar cliente..."}</span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar por nombre..." />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                                        <CommandGroup>
                                                            {clients.map((client) => (
                                                                <CommandItem key={client.co_cli} value={`${client.cli_des} ${client.co_cli}`} onSelect={() => { setGlobalClientId(client.co_cli === globalClientId ? "" : client.co_cli); setOpenCombobox(false); }}>
                                                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", globalClientId === client.co_cli ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex flex-col truncate">
                                                                        <span className="font-medium truncate">{client.cli_des}</span>
                                                                        <span className="text-xs text-muted-foreground">Código: {client.co_cli}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* PASO 2: SELECCIÓN DE PÁGINAS */}
                        <div id="workspace-area">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                                <h2 className="text-base md:text-lg font-bold text-foreground">Selecciona y Corta</h2>
                            </div>
                            <Card className="shadow-sm bg-card border-border flex flex-col w-full">
                                <CardHeader className="p-3 md:p-4 bg-muted/30 border-b flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <BookOpenCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                        <CardTitle className="text-sm md:text-base text-foreground font-semibold">Páginas del Archivo ({pageCount})</CardTitle>
                                    </div>
                                    <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold">
                                        {selectedPages.size} Seleccionadas
                                    </span>
                                </CardHeader>
                                <CardContent className="p-0">

                                    {/* BARRA DE HERRAMIENTAS - 100% RESPONSIVA */}
                                    <div className="flex flex-col xl:flex-row xl:items-center gap-4 p-4 border-b bg-background">

                                        {/* Fila 1 en móvil: Botones Todas/Ninguna + Selector Rango */}
                                        <div className="flex flex-col items-center md:flex-row gap-3 w-full xl:w-auto">

                                            {/* Herramientas Rápidas */}
                                            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg w-full md:w-auto shrink-0">
                                                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs md:text-sm font-medium w-full hover:bg-primary/10">Todas</Button>
                                                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs md:text-sm font-medium w-full hover:bg-primary/10">Ninguna</Button>
                                            </div>

                                            {/* Selector de Rango (Ahora ocupa todo el ancho en móvil) */}
                                            <div className="flex items-center justify-between md:justify-start gap-2 bg-background px-3 py-1 rounded-lg border border-border shadow-sm w-full md:w-auto">
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <Settings2 className="h-4 w-4 text-primary shrink-0" />
                                                    <span className="text-xs md:text-sm font-semibold text-foreground hidden sm:inline">Rango:</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={pageCount}
                                                    value={rangeStart}
                                                    onChange={(e) => setRangeStart(e.target.value ? Number(e.target.value) : '')}
                                                    placeholder="Inicio"
                                                    className="w-16 md:w-20 h-9 text-sm text-center font-medium focus-visible:ring-primary"
                                                />
                                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={pageCount}
                                                    value={rangeEnd}
                                                    onChange={(e) => setRangeEnd(e.target.value ? Number(e.target.value) : '')}
                                                    placeholder="Fin"
                                                    className="w-16 md:w-20 h-9 text-sm text-center font-medium focus-visible:ring-primary"
                                                />
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={applyRangeSelection}
                                                    disabled={rangeStart === '' || rangeEnd === ''}
                                                    className="h-9 px-3 md:px-5 text-xs md:text-sm font-bold shadow-sm"
                                                >
                                                    Aplicar
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 hidden xl:block" />

                                        {/* Fila 2 en móvil: Botones de Acción */}
                                        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full xl:w-auto">
                                            <Button variant="outline" onClick={createIndividualSplits} disabled={selectedPages.size === 0} className="w-full xl:w-auto h-10 border-primary/20 hover:bg-primary/5">
                                                <Files className="h-4 w-4 mr-2 text-primary" />
                                                Separar ({selectedPages.size})
                                            </Button>
                                            <Button variant="default" onClick={createMergedSplit} disabled={selectedPages.size === 0} className="w-full xl:w-auto h-10 shadow-md shadow-primary/20">
                                                <FilePlus2 className="h-4 w-4 mr-2" />
                                                Agrupar ({selectedPages.size})
                                            </Button>
                                        </div>
                                    </div>

                                    {/* GRID DE MINIATURAS (1 columna en Móvil, crece en PC) */}
                                    <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar p-4 md:p-6 bg-slate-100 dark:bg-slate-900">
                                        {pdfUrl && (
                                            <Document
                                                file={pdfUrl}
                                                loading={<div className="p-8 text-center text-muted-foreground animate-pulse text-sm">Renderizando páginas...</div>}
                                                // CLAVE PARA MÓVILES: grid-cols-1 para teléfonos, crece a 2, 3, 4, 5...
                                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                                            >
                                                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => togglePageSelection(pageNum)}
                                                        className={cn(
                                                            "group relative bg-transparent flex flex-col items-center justify-center transition-all",
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute inset-[-4px] rounded-lg transition-all",
                                                            selectedPages.has(pageNum) ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"
                                                        )} />

                                                        <span className={cn(
                                                            "absolute -top-3 -left-3 text-xs md:text-sm font-bold px-2 py-0.5 rounded shadow-sm z-20 transition-colors",
                                                            selectedPages.has(pageNum) ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                                                        )}>
                                                            {pageNum}
                                                        </span>

                                                        {selectedPages.has(pageNum) && (
                                                            <span className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 md:p-1.5 z-20 shadow-sm animate-in zoom-in-75">
                                                                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                                                            </span>
                                                        )}

                                                        <div className={cn(
                                                            "relative z-10 pointer-events-none overflow-hidden rounded shadow-md transition-opacity bg-white",
                                                            selectedPages.has(pageNum) ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                                                        )}>
                                                            <Page
                                                                pageNumber={pageNum}
                                                                width={thumbnailWidth}
                                                                renderTextLayer={false}
                                                                renderAnnotationLayer={false}
                                                            />
                                                        </div>
                                                    </button>
                                                ))}
                                            </Document>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* PASO 3: COLA DE PROCESAMIENTO */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                                <h2 className="text-base md:text-lg font-bold text-foreground">Revisa y Guarda</h2>
                            </div>
                            <Card className={cn(
                                "shadow-md transition-all border-2",
                                splits.length > 0 ? "border-primary/50 bg-card" : "border-dashed border-border bg-muted/20"
                            )}>
                                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-3">
                                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                                        <LayoutTemplate className="h-5 w-5 text-primary" />
                                        A Generar ({splits.length})
                                    </CardTitle>
                                    {splits.length > 0 && (
                                        <Button onClick={processSplits} disabled={isProcessing} className="w-full md:w-auto font-bold text-base h-12 md:h-10 shadow-lg shadow-primary/30 animate-in fade-in" size="lg">
                                            {isProcessing ? 'Procesando...' : `Generar Archivos (${splits.length})`}
                                        </Button>
                                    )}
                                </CardHeader>

                                <CardContent>
                                    {splits.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center text-muted-foreground">
                                            <MousePointerClick className="h-8 w-8 md:h-10 md:w-10 mb-3 opacity-30" />
                                            <p className="text-sm md:text-base font-medium">La cola está vacía.</p>
                                            <p className="text-xs md:text-sm">Selecciona páginas en el Paso 2.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                                            {splits.map((split, index) => (
                                                <Card key={split.id} className="border-border bg-background shadow-sm overflow-hidden flex flex-col">

                                                    <div className="p-2 md:p-3 bg-muted/50 border-b flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">#{index + 1}</span>
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {split.pages.length} pág(s): {split.pages.slice(0, 3).join(', ')}{split.pages.length > 3 ? '...' : ''}
                                                            </span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-6 md:w-6 text-muted-foreground hover:text-destructive" onClick={() => removeSplit(split.id)}>
                                                            <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                                                        </Button>
                                                    </div>

                                                    <CardContent className="p-3 md:p-4 flex-1 flex flex-col space-y-4">
                                                        <div className="relative">
                                                            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 flex items-center gap-1">
                                                                <Eye className="h-3 w-3" /> Contenido
                                                            </div>
                                                            {pdfUrl && (
                                                                <Document file={pdfUrl} loading={null} className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                                                    {split.pages.map(pageNum => (
                                                                        <div key={pageNum} className="relative shrink-0 border border-slate-200 bg-white rounded-sm overflow-hidden shadow-sm">
                                                                            <span className="absolute top-0 left-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-br-sm z-10">
                                                                                Pág {pageNum}
                                                                            </span>
                                                                            <Page
                                                                                pageNumber={pageNum}
                                                                                width={50}
                                                                                renderTextLayer={false}
                                                                                renderAnnotationLayer={false}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </Document>
                                                            )}
                                                        </div>

                                                        <div className="space-y-3 md:space-y-4">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-semibold">Nombre del archivo</Label>
                                                                <Input className="h-9 md:h-8 text-sm border-muted-foreground/30 focus-visible:ring-primary" value={split.title} onChange={(e) => updateSplit(split.id, { title: e.target.value })} placeholder="Ej: Factura Compra..." />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs font-semibold">Acción</Label>
                                                                    <Select value={split.action} onValueChange={(value: 'save' | 'download') => updateSplit(split.id, { action: value })}>
                                                                        <SelectTrigger className="h-9 md:h-8 text-xs md:text-sm border-muted-foreground/30"><SelectValue /></SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="save">Guardar BD</SelectItem>
                                                                            <SelectItem value="download">Descargar</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                {split.action === 'save' && (
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs font-semibold">Categoría</Label>
                                                                        <Select value={split.categoryId?.toString() || ''} onValueChange={(value) => updateSplit(split.id, { categoryId: value ? parseInt(value) : null })}>
                                                                            <SelectTrigger className="h-9 md:h-8 text-xs md:text-sm border-muted-foreground/30"><SelectValue placeholder="Categoría..." /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground)); border-radius: 10px; opacity: 0.5; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary)); }
                .react-pdf__Page__canvas { border-radius: 4px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 100% !important; height: auto !important; }
            `}} />
        </AppLayout>
    );
}