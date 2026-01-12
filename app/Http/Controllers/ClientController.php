<?php

namespace App\Http\Controllers;
use App\Models\Client;
use App\Models\Document;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;


class ClientController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $status = request('status');
        $fileStatus = request('file_status');

        $query = Client::select('co_cli', 'cli_des', 'co_seg', 'co_ven', 'direc1', 'telefonos', 'rif', 'inactivo');

        if ($search) {
            $query->search($search);
        }

        // Filter by Status
        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->where('inactivo', 1);
        }

        // Filter by File Status (Cross-Database)
        if ($fileStatus === 'with_files') {
            $clientIdsWithFiles = Document::distinct()->pluck('client_id')->toArray();
            $query->whereIn('co_cli', $clientIdsWithFiles);
        } elseif ($fileStatus === 'without_files') {
            $clientIdsWithFiles = Document::distinct()->pluck('client_id')->toArray();
            $query->whereNotIn('co_cli', $clientIdsWithFiles);
        }

        $query->accessibleBy(auth()->user());

        $clients = $query->paginate(15)->withQueryString();

        $clientIds = $clients->pluck('co_cli')->toArray();

        // Calculate Document Counts
        $documentCounts = Document::whereIn('client_id', $clientIds)
            ->selectRaw('client_id, count(*) as count')
            ->groupBy('client_id')
            ->pluck('count', 'client_id');

        // Calculate Category Counts (Distinct categories per client)
        // $categoryCounts = Document::whereIn('client_id', $clientIds)
        //     ->selectRaw('client_id, count(distinct category_id) as count')
        //     ->groupBy('client_id')
        //     ->pluck('count', 'client_id');

        // Mandatory Categories Logic
        $mandatoryCategoryNames = [
            'CEDULAS Y RIF DEL REPRESENTANTE LEGAL',
            'PERMISO DE FUNCIONAMIENTO',
            'REGISTRO MERCANTIL',
            'RIF',
        ];

        $mandatoryCategoryIds = Category::whereIn('name', $mandatoryCategoryNames)
            ->pluck('id')
            ->toArray();

        // Get all category IDs present for each client
        $clientCategories = Document::whereIn('client_id', $clientIds)
            ->whereIn('category_id', $mandatoryCategoryIds)
            ->select('client_id', 'category_id')
            ->distinct()
            ->get()
            ->groupBy('client_id');

        $clients->getCollection()->transform(function ($client) use ($documentCounts, $clientCategories, $mandatoryCategoryIds) {
            $client->documents_count = $documentCounts->get($client->co_cli, 0);
            $client->categories_count = $clientCategories->get($client->co_cli, collect())->count();

            // Check if client has ALL mandatory categories
            $hasCategories = $clientCategories->get($client->co_cli, collect())->pluck('category_id')->toArray();
            $missingCategories = array_diff($mandatoryCategoryIds, $hasCategories);
            $client->is_complete = empty($missingCategories) && count($mandatoryCategoryIds) > 0;

            return $client;
        });

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'file_status' => $fileStatus,
            ],
        ]);
    }

    public function show(Client $client): Response
    {
        $documents = $client->documents()
            ->with(['uploadedBy:id,name', 'category:id,name'])
            ->latest()
            ->get();

        $stats = [
            'total_documents' => $documents->count(),
            'total_size' => $documents->sum('file_size'),
            'formatted_size' => $this->formatBytes($documents->sum('file_size')),
            'categories' => $documents->map(function ($doc) {
                $val = $doc->category;
                if (is_string($val)) {
                    return $val;
                }
                return $val ? $val->name : null;
            })
                ->filter()
                ->unique()
                ->values(),
        ];

        // $activeClients = Client::active()
        //     ->orderBy('cli_des')
        //     ->get(['co_cli', 'cli_des', 'co_seg', 'co_ven']);
        $allCategories = Category::orderBy('name')->get(['id', 'name']);
        return Inertia::render('clients/show', [
            'client' => $client->setRelation('documents', $documents),
            'stats' => $stats,
            // 'clients' => $activeClients,
            'categories' => $allCategories,
        ]);
    }

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
