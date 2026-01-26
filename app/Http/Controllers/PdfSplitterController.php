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

class PdfSplitterController extends Controller
{
    /**
     * Muestra la interfaz principal.
     */
    public function index(): Response
    {
        $clients = Client::select('co_cli', 'cli_des')->accessibleBy(auth()->user())->active()->orderBy('cli_des')->get();
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('tools/pdf-splitter', [
            'clients' => $clients,
            'categories' => $categories,
        ]);
    }

    /**
     * Recibe el PDF YA CORTADO por React y lo guarda en el Cliente.
     */
    public function saveToClient(Request $request)
    {
        // Validación estándar de Laravel para un archivo
        $request->validate([
            'pdf' => 'required|file|mimes:pdf',
            'client_id' => 'required|string',
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
        ]);

        try {
            // Verificar permisos sobre el cliente
            $client = Client::accessibleBy(auth()->user())
                ->where('co_cli', $request->input('client_id'))
                ->firstOrFail();

            $file = $request->file('pdf');
            $filename = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $request->input('title')) . '.pdf';

            // Definir ruta final
            $date = now()->format('Y/m');
            $finalStoragePath = "documents/{$client->co_cli}/{$date}/{$filename}";

            // Guardar archivo directamente en el disco final
            Storage::put($finalStoragePath, file_get_contents($file->getRealPath()));

            // Crear registro en BD
            $document = Document::create([
                'client_id' => $client->co_cli,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'filename' => $filename,
                'file_path' => $finalStoragePath,
                'file_size' => $file->getSize(),
                'category_id' => $request->input('category_id'),
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'document' => $document,
                'message' => 'Documento guardado exitosamente.',
            ]);

        } catch (\Throwable $e) {
            Log::error('Error guardando PDF procesado: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar el archivo.'], 422);
        }
    }
}