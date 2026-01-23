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
use App\Models\Category;
use App\Http\Requests\UpdateDocumentRequest;

class DocumentController extends Controller
{

    public function index(): Response
    {
        $search = request('search');
        $category = request('category');

        $documents = Document::query()
            ->with(['client:co_cli,cli_des', 'uploadedBy:id,name', 'category:id,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('filename', 'like', "%{$search}%")
                        ->orWhereHas('client', function ($qClient) use ($search) {
                            $qClient->where('cli_des', 'like', "%{$search}%")
                                ->orWhere('co_cli', 'like', "%{$search}%");
                        });
                });
            })
            ->when($category, function ($query, $category) {
                $query->byCategory($category);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $clients = Client::active()
            ->orderBy('cli_des')
            ->get(['co_cli', 'cli_des']);
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'clients' => $clients,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
        ]);
    }

    public function create(Client $client): Response
    {
        // 1. Buscamos las categorías y verificamos si existen documentos de ESTE cliente
        $categories = Category::withExists([
            'documents' => function ($query) use ($client) {
                $query->where('client_id', $client->co_cli);
            }
        ])
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                // 2. Damos formato a la respuesta para el Frontend
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'has_documents' => $category->documents_exists // True si tiene, False si no
                ];
            });

        return Inertia::render('documents/create', [
            'client' => $client,
            'categories' => $categories,
        ]);
    }

    public function store(StoreDocumentRequest $request, Client $client): RedirectResponse
    {
        $validatedData = $request->validated();
        $file = $request->file('file');

        $filename = time() . '_' . Str::uuid() . '.pdf';

        $year = date('Y');
        $month = date('m');
        $storagePath = "documents/{$client->co_cli}/{$year}/{$month}";
        $filePath = $file->storeAs($storagePath, $filename, 'local');

        $categoryId = null;
        if (!empty($validatedData['category'])) {
            if (is_numeric($validatedData['category'])) {
                $categoryId = $validatedData['category'];
            } else {
                $category = Category::firstOrCreate(['name' => $validatedData['category']]);
                $categoryId = $category->id;
            }
        }

        $document = Document::create([
            'client_id' => $client->co_cli,
            'uploaded_by' => auth()->id(),
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'category_id' => $categoryId,
            'tags' => $validatedData['tags'] ?? null,
            'filename' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return redirect()
            ->route('clients.show', $client)
            ->with('success', "Documento '{$document->title}' subido exitosamente.");
    }

    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $data = $request->validated();

        $document->title = $data['title'];
        $document->description = $data['description'] ?? null;

        if (!empty($data['category'])) {
            if (is_numeric($data['category'])) {
                $document->category_id = $data['category'];
            } else {
                $category = Category::firstOrCreate(['name' => $data['category']]);
                $document->category_id = $category->id;
            }
        } else {
            $document->category_id = null;
        }

        $document->save();

        return redirect()->back()->with('success', 'Documento actualizado correctamente.');
    }

    public function show(Document $document): Response
    {
        $document->load(['client', 'uploadedBy']);

        return Inertia::render('documents/show', [
            'document' => $document,
        ]);
    }

    public function preview(Document $document)
    {
        if (!$document->fileExists()) {
            abort(404, 'El archivo no existe en el servidor.');
        }
        return response()->file(Storage::path($document->file_path), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $document->filename . '"',
        ]);
    }

    public function download(Document $document): StreamedResponse
    {
        if (!auth()->user()->is_admin) {
            abort(403, 'No tiene permiso para descargar documentos.');
        }

        if (!$document->fileExists()) {
            abort(404, 'El archivo no existe en el servidor.');
        }
        $document->incrementDownloadCount();
        return Storage::download(
            $document->file_path,
            $document->filename
        );
    }

    public function destroy(Document $document): RedirectResponse
    {
        $documentTitle = $document->title;
        $clientId = $document->client_id;

        $document->delete();
        return redirect()
            ->route('clients.show', $clientId)
            ->with('success', "Documento '{$documentTitle}' eliminado exitosamente.");
    }

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
