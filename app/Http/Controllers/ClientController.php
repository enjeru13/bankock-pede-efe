<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador para gestionar clientes.
 * 
 * Maneja todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * para los clientes del sistema de gestión de documentos.
 */
class ClientController extends Controller
{
    /**
     * Mostrar listado de clientes.
     * 
     * Retorna una vista con todos los clientes, incluyendo:
     * - Búsqueda por nombre o código
     * - Filtro por estado (activo/inactivo)
     * - Paginación
     * - Conteo de documentos por cliente
     *
     * @return Response
     */
    public function index(): Response
    {
        // Obtener parámetros de búsqueda y filtros
        $search = request('search');
        $status = request('status'); // 'active', 'inactive', o null (todos)

        // Construir consulta con relaciones y filtros
        $clients = Client::query()
            ->withCount('documents') // Agregar conteo de documentos
            ->when($search, function ($query, $search) {
                // Aplicar búsqueda si existe
                $query->search($search);
            })
            ->when($status === 'active', function ($query) {
                // Filtrar solo activos
                $query->active();
            })
            ->when($status === 'inactive', function ($query) {
                // Filtrar solo inactivos
                $query->where('is_active', false);
            })
            ->orderBy('created_at', 'desc') // Más recientes primero
            ->paginate(15) // 15 clientes por página
            ->withQueryString(); // Mantener parámetros de búsqueda en paginación

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Mostrar formulario para crear un nuevo cliente.
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('clients/create');
    }

    /**
     * Guardar un nuevo cliente en la base de datos.
     * 
     * Valida los datos usando StoreClientRequest y crea el cliente.
     *
     * @param StoreClientRequest $request
     * @return RedirectResponse
     */
    public function store(StoreClientRequest $request): RedirectResponse
    {
        // Los datos ya vienen validados por StoreClientRequest
        $validatedData = $request->validated();

        // Crear el cliente
        $client = Client::create($validatedData);

        // Redireccionar a la lista de clientes con mensaje de éxito
        return redirect()
            ->route('clients.index')
            ->with('success', "Cliente '{$client->name}' creado exitosamente.");
    }

    /**
     * Mostrar un cliente específico con sus documentos.
     * 
     * Muestra la información del cliente y todos sus documentos PDF.
     *
     * @param Client $client
     * @return Response
     */
    public function show(Client $client): Response
    {
        // Cargar documentos con relaciones
        $documents = $client->documents()
            ->with(['uploadedBy:id,name', 'category:id,name'])
            ->latest()
            ->get();

        // Calcular estadísticas
        $stats = [
            'total_documents' => $documents->count(),
            'total_size' => $documents->sum('file_size'),
            'formatted_size' => $this->formatBytes($documents->sum('file_size')),
            // Obtener nombres de categorías desde la relación
            'categories' => $documents->map(function ($doc) {
                // Check if 'category' is the relation object or the string attribute
                $val = $doc->category;
                if (is_string($val)) {
                    return $val;
                }
                // If it's the model object
                return $val ? $val->name : null;
            })
                ->filter()
                ->unique()
                ->values(),
        ];

        // Obtener clientes activos para el select del modal de edición
        $activeClients = Client::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        // Obtener todas las categorías para el select (ahora desde tabla categories)
        $allCategories = \App\Models\Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('clients/show', [
            'client' => $client->setRelation('documents', $documents),
            'stats' => $stats,
            'clients' => $activeClients,
            'categories' => $allCategories,
        ]);
    }

    /**
     * Mostrar formulario para editar un cliente.
     *
     * @param Client $client
     * @return Response
     */
    public function edit(Client $client): Response
    {
        return Inertia::render('clients/edit', [
            'client' => $client,
        ]);
    }

    /**
     * Actualizar un cliente en la base de datos.
     * 
     * Valida los datos usando UpdateClientRequest y actualiza el cliente.
     *
     * @param UpdateClientRequest $request
     * @param Client $client
     * @return RedirectResponse
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        // Los datos ya vienen validados por UpdateClientRequest
        $validatedData = $request->validated();

        // Actualizar el cliente
        $client->update($validatedData);

        // Redireccionar al detalle del cliente con mensaje de éxito
        return redirect()
            ->route('clients.show', $client)
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    /**
     * Eliminar un cliente.
     * 
     * @param Client $client
     * @return RedirectResponse
     */
    public function destroy(Client $client): RedirectResponse
    {
        // Guardar el nombre antes de eliminar
        $clientName = $client->name;

        // Eliminar el cliente
        $client->delete();

        // Redireccionar a la lista con mensaje de éxito
        return redirect()
            ->route('clients.index')
            ->with('success', "Cliente '{$clientName}' eliminado exitosamente.");
    }

    /**
     * Formatear bytes a un formato legible por humanos.
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
