<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $status = request('status');

        $query = Client::select('co_cli', 'cli_des', 'co_seg', 'co_ven', 'direc1', 'telefonos', 'rif', 'inactivo');

        if ($search) {
            $query->search($search);
        }

        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->where('inactivo', 1);
        }

        $clients = $query->paginate(15)
            ->withQueryString();

        foreach ($clients as $client) {
            $client->documents_count = $client->documents()->count();
        }

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
                'status' => $status,
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
