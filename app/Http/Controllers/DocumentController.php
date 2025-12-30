<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\Client;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controlador para gestionar documentos PDF.
 * 
 * Maneja todas las operaciones relacionadas con documentos:
 * - Listar y buscar documentos
 * - Subir nuevos PDFs
 * - Descargar PDFs
 * - Eliminar documentos
 */
class DocumentController extends Controller
{
    /**
     * Mostrar listado de documentos.
     * 
     * Retorna una vista con todos los documentos, incluyendo:
     * - Búsqueda por título
     * - Filtro por cliente
     * - Filtro por categoría
     * - Paginación
     *
     * @return Response
     */
    public function index(): Response
    {
        // Obtener parámetros de búsqueda y filtros
        // NOTA: Ya no solicitamos 'client_id' porque lo eliminaste del frontend
        $search = request('search');
        $category = request('category');

        // Construir consulta con relaciones y filtros
        $documents = Document::query()
            ->with(['client:id,name,code', 'uploadedBy:id,name', 'category:id,name'])
            ->when($search, function ($query, $search) {
                // LÓGICA DE BÚSQUEDA GLOBAL
                // Usamos un where group (function($q)) para que los OR no rompan otros filtros
                $query->where(function ($q) use ($search) {
                    // 1. Buscar en datos del documento
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('filename', 'like', "%{$search}%")

                        // 2. Buscar en datos del Cliente relacionado (Nombre o Código)
                        ->orWhereHas('client', function ($qClient) use ($search) {
                        $qClient->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
                });
            })
            ->when($category, function ($query, $category) {
                // Filtrar por categoría (se mantiene igual)
                $query->byCategory($category);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Obtener lista de clientes (Aún la necesitas si vas a mostrarlos en la UI o crear documentos)
        $clients = Client::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        // Obtener categorías para el filtro
        $categories = \App\Models\Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'clients' => $clients,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                // 'client_id' eliminado
                'category' => $category,
            ],
        ]);
    }

    /**
     * Mostrar formulario para subir un nuevo documento.
     *
     * @return Response
     */
    public function create(): Response
    {
        // Obtener lista de clientes activos para el selector
        $clients = Client::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        // Obtener categorías existentes para sugerencias
        $categories = \App\Models\Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('documents/create', [
            'clients' => $clients,
            'categories' => $categories,
        ]);
    }

    /**
     * Guardar un nuevo documento en la base de datos y storage.
     * 
     * Proceso:
     * 1. Validar datos y archivo (StoreDocumentRequest)
     * 2. Guardar archivo en storage organizado por cliente y fecha
     * 3. Crear registro en base de datos
     * 4. Redireccionar con mensaje de éxito
     *
     * @param StoreDocumentRequest $request
     * @return RedirectResponse
     */
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        // Los datos ya vienen validados por StoreDocumentRequest
        $validatedData = $request->validated();

        // Obtener el archivo subido
        $file = $request->file('file');

        // Obtener información del cliente
        $client = Client::findOrFail($validatedData['client_id']);

        // Generar nombre único para el archivo
        // Formato: {timestamp}_{uuid}.pdf
        $filename = time() . '_' . Str::uuid() . '.pdf';

        // Construir ruta de almacenamiento
        // Formato: documents/{codigo-cliente}/{año}/{mes}/{archivo}.pdf
        $year = date('Y');
        $month = date('m');
        $storagePath = "documents/{$client->code}/{$year}/{$month}";

        // Guardar el archivo en storage
        $filePath = $file->storeAs($storagePath, $filename, 'local');

        // Manejo de categoría
        $categoryId = null;
        if (!empty($validatedData['category'])) {
            if (is_numeric($validatedData['category'])) {
                $categoryId = $validatedData['category'];
            } else {
                $category = \App\Models\Category::firstOrCreate(['name' => $validatedData['category']]);
                $categoryId = $category->id;
            }
        }

        // Crear el documento en la base de datos
        $document = Document::create([
            'client_id' => $validatedData['client_id'],
            'uploaded_by' => auth()->id(), // Usuario actual
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'category_id' => $categoryId,
            'tags' => $validatedData['tags'] ?? null,
            'filename' => $file->getClientOriginalName(), // Nombre original
            'file_path' => $filePath,
            'file_size' => $file->getSize(), // Tamaño en bytes
            'mime_type' => $file->getMimeType(),
        ]);

        // Redireccionar al detalle del cliente con mensaje de éxito
        return redirect()
            ->route('clients.show', $client)
            ->with('success', "Documento '{$document->title}' subido exitosamente.");
    }

    /**
     * Actualizar los metadatos de un documento.
     *
     * @param \App\Http\Requests\UpdateDocumentRequest $request
     * @param Document $document
     * @return RedirectResponse
     */
    public function update(\App\Http\Requests\UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $data = $request->validated();

        // Asignar datos básicos
        $document->title = $data['title'];
        $document->description = $data['description'] ?? null;

        // Manejo de categoría
        if (!empty($data['category'])) {
            if (is_numeric($data['category'])) {
                $document->category_id = $data['category'];
            } else {
                $category = \App\Models\Category::firstOrCreate(['name' => $data['category']]);
                $document->category_id = $category->id;
            }
        } else {
            $document->category_id = null;
        }

        $document->save();

        return redirect()->back()->with('success', 'Documento actualizado correctamente.');
    }

    /**
     * Mostrar detalles de un documento específico.
     *
     * @param Document $document
     * @return Response
     */
    public function show(Document $document): Response
    {
        // Cargar relaciones
        $document->load(['client', 'uploadedBy']);

        return Inertia::render('documents/show', [
            'document' => $document,
        ]);
    }

    /**
     * Visualizar un documento PDF en el navegador.
     * 
     * Retorna el archivo con cabeceras para visualización inline.
     *
     * @param Document $document
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function preview(Document $document)
    {
        // Verificar que el archivo existe
        if (!$document->fileExists()) {
            abort(404, 'El archivo no existe en el servidor.');
        }

        // Retornar el archivo para visualización inline
        return response()->file(Storage::path($document->file_path), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $document->filename . '"',
        ]);
    }

    /**
     * Descargar un documento PDF.
     * 
     * Incrementa el contador de descargas y retorna el archivo.
     *
     * @param Document $document
     * @return StreamedResponse
     */
    public function download(Document $document): StreamedResponse
    {
        // Verificar que el archivo existe
        if (!$document->fileExists()) {
            abort(404, 'El archivo no existe en el servidor.');
        }

        // Incrementar contador de descargas
        $document->incrementDownloadCount();

        // Retornar el archivo para descarga
        // El nombre de descarga será el nombre original del archivo
        return Storage::download(
            $document->file_path,
            $document->filename
        );
    }

    /**
     * Eliminar un documento de la base de datos y storage.
     * 
     * IMPORTANTE: Usa soft delete, por lo que el documento puede ser recuperado.
     * El archivo físico se elimina solo cuando se hace hard delete.
     *
     * @param Document $document
     * @return RedirectResponse
     */
    public function destroy(Document $document): RedirectResponse
    {
        // Guardar información antes de eliminar
        $documentTitle = $document->title;
        $clientId = $document->client_id;

        // Soft delete del documento
        // El archivo físico NO se elimina (se puede recuperar)
        $document->delete();

        // Redireccionar al cliente con mensaje de éxito
        return redirect()
            ->route('clients.show', $clientId)
            ->with('success', "Documento '{$documentTitle}' eliminado exitosamente.");
    }

    /**
     * Buscar documentos (endpoint para búsqueda AJAX).
     * 
     * Retorna resultados en formato JSON para búsqueda en tiempo real.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $term = $request->input('term', '');

        if (strlen($term) < 2) {
            return response()->json([]);
        }

        $documents = Document::query()
            ->with(['client:id,name,code', 'category:id,name'])
            ->search($term)
            ->limit(10)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'client' => $doc->client,
                    'category' => is_object($doc->category) ? $doc->category->name : (is_string($doc->category) ? $doc->category : null),
                    'created_at' => $doc->created_at->diffForHumans(),
                ];
            });

        return response()->json($documents);
    }
}
