import { FileUp, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

/**
 * Componente FileUploader
 * 
 * Componente para subir archivos PDF con drag & drop.
 * Características:
 * - Drag and drop
 * - Validación de tipo de archivo (solo PDF)
 * - Validación de tamaño (max 10MB)
 * - Preview del archivo seleccionado
 * - Mensajes de error
 */

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    error?: string;
    maxSize?: number; // en MB
}

export function FileUploader({
    onFileSelect,
    error,
    maxSize = 1024
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Validar archivo PDF
     */
    const validateFile = (file: File): string | null => {
        // Validar tipo de archivo
        if (file.type !== 'application/pdf') {
            return 'El archivo debe ser un PDF';
        }

        // Validar tamaño (convertir MB a bytes)
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            return `El archivo no puede ser mayor a ${maxSize}MB`;
        }

        return null;
    };

    /**
     * Manejar selección de archivo
     */
    const handleFileChange = (file: File | null) => {
        if (!file) {
            setSelectedFile(null);
            setFileError('');
            onFileSelect(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        const error = validateFile(file);
        if (error) {
            setFileError(error);
            setSelectedFile(null);
            onFileSelect(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        setSelectedFile(file);
        setFileError('');
        onFileSelect(file);
    };

    /**
     * Manejar click en contenedor
     */
    const handleClick = () => {
        inputRef.current?.click();
    };

    /**
     * Manejar drag over
     */
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    /**
     * Manejar drag leave
     */
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    /**
     * Manejar drop
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    /**
     * Manejar input file change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    /**
     * Remover archivo seleccionado
     */
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleFileChange(null);
    };

    /**
     * Formatear tamaño de archivo
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
            />

            {/* Área de drop */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25',
                    (error || fileError) && 'border-destructive'
                )}
            >
                {!selectedFile ? (
                    <>
                        <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4">
                            <span className="text-sm font-medium text-primary">
                                Selecciona un archivo
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {' '}o arrastra y suelta
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            PDF hasta {maxSize}MB
                        </p>
                    </>
                ) : (
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
                                <FileUp className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Mensajes de error */}
            {(error || fileError) && (
                <p className="mt-2 text-sm text-destructive">
                    {error || fileError}
                </p>
            )}
        </div>
    );
}
