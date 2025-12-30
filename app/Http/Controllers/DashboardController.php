<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Client;
use App\Models\Document;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            // Total de clientes activos
            'total_clients' => Client::active()->count(),

            // Total de documentos
            'total_documents' => Document::count(),

            // Espacio total utilizado
            'total_storage' => Document::sum('file_size'),

            // Espacio formateado
            'formatted_storage' => $this->formatBytes(Document::sum('file_size')),

            // Total de descargas
            'total_downloads' => Document::sum('downloaded_count'),
        ];

        // Documentos recientes (últimos 5)
        $recentDocuments = Document::with(['client:co_cli', 'uploadedBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'formatted_size' => $doc->formatted_size,
                    'created_at' => $doc->created_at->diffForHumans(),
                    'client' => [
                        'id' => $doc->client_id, // For routing
                        'code' => $doc->client_id, // Legacy code
                        'name' => $doc->client ? $doc->client->cli_des : 'Desconocido',
                    ],
                ];
            });

        $topClientStats = Document::select('client_id')
            ->selectRaw('count(*) as count')
            ->selectRaw('sum(file_size) as total_size')
            ->whereNull('deleted_at')
            ->groupBy('client_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get();

        // 2. Fetch Client details from SQL Server
        $clientIds = $topClientStats->pluck('client_id')->toArray();
        $clients = Client::whereIn('co_cli', $clientIds)
            ->get(['co_cli', 'cli_des'])
            ->keyBy('co_cli');

        // 3. Merge data
        $topClients = $topClientStats->map(function ($stat) use ($clients) {
            $client = $clients->get($stat->client_id);
            
            // Skip if client doesn't exist in legacy DB (orphan documents)
            if (!$client) return null;

            return [
                'id' => $client->co_cli,
                'code' => $client->co_cli,
                'name' => $client->cli_des,
                'documents_count' => $stat->count,
                'formatted_total_size' => $this->formatBytes($stat->total_size),
            ];
        })->filter()->values();

        // Distribución por categorías (usando la nueva estructura relacional)
        $categoriesDistribution = Category::withCount('documents')
            ->having('documents_count', '>', 0)
            ->orderBy('documents_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($cat) {
                return [
                    'category' => $cat->name,
                    'count' => $cat->documents_count,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'topClients' => $topClients,
            'categoriesDistribution' => $categoriesDistribution,
        ]);
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
