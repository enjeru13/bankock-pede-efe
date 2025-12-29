<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Document;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador del Dashboard
 * 
 * Muestra estadísticas generales del sistema de gestión de documentos.
 */
class DashboardController extends Controller
{
    /**
     * Mostrar el dashboard con estadísticas.
     * 
     * Incluye:
     * - Total de clientes y documentos
     * - Espacio de almacenamiento utilizado
     * - Documentos recientes
     * - Clientes más activos
     * - Distribución por categorías
     *
     * @return Response
     */
    public function index(): Response
    {
        // Estadísticas generales
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
        $recentDocuments = Document::with(['client:id,name,code', 'uploadedBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'formatted_size' => $doc->formatted_size,
                    'created_at' => $doc->created_at->diffForHumans(),
                    'client' => [
                        'id' => $doc->client->id,
                        'name' => $doc->client->name,
                        'code' => $doc->client->code,
                    ],
                ];
            });

        // Clientes más activos (top 5 por cantidad de documentos)
        $topClients = Client::withCount('documents')
            ->having('documents_count', '>', 0)
            ->orderBy('documents_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'code' => $client->code,
                    'documents_count' => $client->documents_count,
                    'formatted_total_size' => $client->formatted_total_size,
                ];
            });

        // Distribución por categorías
        $categoriesDistribution = Document::select('category')
            ->whereNotNull('category')
            ->get()
            ->groupBy(function ($item) {
                // Normalizar categorías: trim y lowercase para agrupar
                return trim(strtolower($item->category));
            })
            ->map(function ($group) {
                // Usar el nombre de la primera categoría encontrada para mostrar (capitalized)
                $first = $group->first()->category;
                return [
                    'category' => ucfirst(trim($first)),
                    'count' => $group->count(),
                ];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'topClients' => $topClients,
            'categoriesDistribution' => $categoriesDistribution,
        ]);
    }

    /**
     * Formatear bytes a una unidad legible.
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
