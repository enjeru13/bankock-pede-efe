<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;

class PdfSplitterController extends Controller
{
    /**
     * Muestra la interfaz principal.
     */
    public function index(): Response
    {
        // Filtra clientes según permisos del usuario (Scope accessibleBy)
        $clients = Client::select('co_cli', 'cli_des')
            ->accessibleBy(auth()->user())
            ->active()
            ->orderBy('cli_des')
            ->get();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('tools/pdf-splitter', [
            'clients' => $clients,
            'categories' => $categories,
        ]);
    }

    /**
     * Sube el PDF temporalmente y cuenta las páginas.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:51200', // 50MB max
        ]);

        $file = $request->file('pdf');

        // Guardar archivo en storage/app/temp/pdf-splitter
        $tempPath = $file->store('temp/pdf-splitter', 'local');

        // Obtener ruta absoluta del sistema (compatible con Windows/Linux)
        $fullPath = Storage::disk('local')->path($tempPath);

        try {
            $pdf = new Fpdi();

            // Usar StreamReader para compatibilidad con PDFs comprimidos (v1.5+)
            if (class_exists(StreamReader::class)) {
                $pageCount = $pdf->setSourceFile(StreamReader::createByFile($fullPath));
            } else {
                $pageCount = $pdf->setSourceFile($fullPath);
            }

            return response()->json([
                'success' => true,
                'temp_path' => $tempPath,
                'page_count' => $pageCount,
                'filename' => $file->getClientOriginalName(),
            ]);

        } catch (\Throwable $e) {
            // Limpiar archivo si falló la lectura
            if (Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }

            Log::error('PDF Upload Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al leer el PDF. Puede estar dañado o protegido. Detalle: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * NUEVO: Sirve el archivo PDF para vista previa en el navegador.
     * GET /tools/pdf-splitter/preview?path=...
     */
    public function preview(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        $path = $request->input('path');

        // Seguridad: Verificar que el archivo existe dentro del disco local
        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        // Obtener la ruta absoluta segura
        $fullPath = Storage::disk('local')->path($path);

        // Retornar el archivo con cabeceras para visualización inline (no descarga)
        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="preview.pdf"'
        ]);
    }

    /**
     * Divide el PDF en un nuevo archivo temporal basado en las páginas seleccionadas.
     */
    public function split(Request $request)
    {
        $request->validate([
            'temp_path' => 'required|string',
            'pages' => 'required|array',
            'pages.*' => 'integer|min:1',
        ]);

        $tempPath = $request->input('temp_path');
        $pages = $request->input('pages');

        $fullPath = Storage::disk('local')->path($tempPath);

        if (!file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo original ha expirado o no existe.',
            ], 404);
        }

        try {
            $outputPdf = new Fpdi();
            // Preservar versión del PDF original si es posible, o usar 1.4 por defecto
            // $outputPdf->setMinPdfVersion('1.5'); 

            foreach ($pages as $pageNum) {
                $outputPdf->AddPage();

                // Configurar fuente para cada página (necesario por cómo funciona FPDI)
                if (class_exists(StreamReader::class)) {
                    $outputPdf->setSourceFile(StreamReader::createByFile($fullPath));
                } else {
                    $outputPdf->setSourceFile($fullPath);
                }

                $tplId = $outputPdf->importPage($pageNum);
                $outputPdf->useTemplate($tplId);
            }

            // Generar nombre único para el split
            $splitFileName = 'split_' . uniqid() . '.pdf';
            $splitRelativePath = 'temp/pdf-splitter/' . $splitFileName;

            // Ruta absoluta para guardar
            $splitFullPath = Storage::disk('local')->path($splitRelativePath);

            // Asegurarse de que el directorio exista
            $directory = dirname($splitFullPath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $outputPdf->Output('F', $splitFullPath);

            return response()->json([
                'success' => true,
                'split_path' => $splitRelativePath,
            ]);

        } catch (\Throwable $e) {
            Log::error('PDF Split Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al dividir el PDF: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Guarda el archivo dividido permanentemente asignándolo a un cliente.
     */
    public function saveToClient(Request $request)
    {
        $request->validate([
            'split_path' => 'required|string',
            'client_id' => 'required|string',
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
        ]);

        $splitPath = $request->input('split_path');

        if (!Storage::disk('local')->exists($splitPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo dividido no encontrado. Puede haber expirado.',
            ], 404);
        }

        try {
            // Verificar permisos sobre el cliente
            $client = Client::accessibleBy(auth()->user())
                ->where('co_cli', $request->input('client_id'))
                ->firstOrFail();

            $filename = $request->input('title') . '.pdf';
            $filename = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $filename);

            $date = now()->format('Y/m');
            $finalStoragePath = "documents/{$client->co_cli}/{$date}/{$filename}";

            // Mover archivo de temp a destino final
            Storage::put($finalStoragePath, Storage::disk('local')->get($splitPath));

            $document = Document::create([
                'client_id' => $client->co_cli,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'filename' => $filename,
                'file_path' => $finalStoragePath,
                'file_size' => Storage::disk('local')->size($splitPath),
                'category_id' => $request->input('category_id'),
                'uploaded_by' => auth()->id(),
            ]);

            // Eliminar el temporal
            Storage::disk('local')->delete($splitPath);

            return response()->json([
                'success' => true,
                'document' => $document,
                'message' => 'Documento guardado exitosamente.',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Cliente no encontrado o acceso denegado.'], 403);
        } catch (\Throwable $e) {
            Log::error('Save to Client Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar: ' . $e->getMessage()], 422);
        }
    }

    /**
     * Descarga directa del archivo dividido.
     */
    public function download(Request $request)
    {
        $request->validate([
            'split_path' => 'required|string',
            'filename' => 'required|string',
        ]);

        $splitPath = $request->input('split_path');

        if (!Storage::disk('local')->exists($splitPath)) {
            abort(404, 'Archivo no encontrado.');
        }

        $path = Storage::disk('local')->path($splitPath);
        $filename = $request->input('filename');

        return response()->download($path, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Limpieza de archivos temporales.
     */
    public function cleanup(Request $request)
    {
        $request->validate([
            'temp_path' => 'required|string',
        ]);

        $tempPath = $request->input('temp_path');

        if (Storage::disk('local')->exists($tempPath)) {
            Storage::disk('local')->delete($tempPath);
        }

        // Limpieza automática de archivos viejos (> 1 hora) en la carpeta
        $directory = dirname($tempPath);

        if (strpos($directory, 'temp') !== false && Storage::disk('local')->exists($directory)) {
            $files = Storage::disk('local')->files($directory);

            foreach ($files as $file) {
                if (strpos($file, 'split_') !== false) {
                    $lastModified = Storage::disk('local')->lastModified($file);
                    if (time() - $lastModified > 3600) {
                        Storage::disk('local')->delete($file);
                    }
                }
            }
        }

        return response()->json(['success' => true]);
    }
}