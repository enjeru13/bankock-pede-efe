<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Client;
use App\Models\Document;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $clientIdsWithDocs = Document::accessibleBy(auth()->user())
            ->select('client_id')
            ->distinct()
            ->pluck('client_id')
            ->toArray();
        $countClientsWithoutDocs = Client::active()
            ->accessibleBy(auth()->user())
            ->whereNotIn('co_cli', $clientIdsWithDocs)
            ->count();

        $stats = [
            'total_clients' => Client::active()->accessibleBy(auth()->user())->count(),
            'total_documents' => Document::accessibleBy(auth()->user())->count(),
            'total_storage' => Document::accessibleBy(auth()->user())->sum('file_size'),
            'formatted_storage' => $this->formatBytes(Document::accessibleBy(auth()->user())->sum('file_size')),
            'total_missing_docs' => $countClientsWithoutDocs,
        ];

        $clientsWithoutDocuments = Client::active()
            ->accessibleBy(auth()->user())
            ->whereNotIn('co_cli', $clientIdsWithDocs)
            ->orderBy('cli_des', 'asc')
            ->take(9)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => trim($client->co_cli),
                    'name' => trim($client->cli_des),
                    'code' => trim($client->co_cli),
                    'created_at' => 'Pendiente',
                ];
            });

        $categoriesDistribution = Category::withCount([
            'documents' => function ($query) {
                $query->accessibleBy(auth()->user());
            }
        ])
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
            'clientsWithoutDocuments' => $clientsWithoutDocuments,
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