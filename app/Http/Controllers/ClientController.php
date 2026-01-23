<?php

namespace App\Http\Controllers;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\Client;
use App\Models\Document;
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

    public function exportMatrix(): StreamedResponse
    {
        $fileName = 'matriz_clientes_' . date('Y_m_d_H_i') . '.xls'; // Cambiamos a .xls para mejor compatibilidad con estilos

        $categories = Category::orderBy('name')->get();
        $clients = Client::active()->orderBy('cli_des')->get();

        $documentMatrix = DB::table('documents')
            ->select('client_id', 'category_id')
            ->groupBy('client_id', 'category_id')
            ->get()
            ->groupBy('client_id');

        $headers = [
            "Content-type" => "application/vnd.ms-excel", // Cambiado para que Excel tome el control
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($clients, $categories, $documentMatrix) {
            $file = fopen('php://output', 'w');

            // Empezamos a escribir la estructura HTML/Excel con estilos CSS
            echo '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=utf-8" />
            <style>
                .header { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #000000; height: 35px; }
                .client-info { background-color: #f8fafc; font-weight: bold; border: 1px solid #000000; }
                .si { color: #15803d; background-color: #dcfce7; text-align: center; font-weight: bold; border: 1px solid #000000; }
                .no { color: #b91c1c; background-color: #fee2e2; text-align: center; font-weight: bold; border: 1px solid #000000; }
                td { width: 150px; height: 25px; border: 0.5pt solid #cccccc; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th class="header">Código</th>
                        <th class="header" style="width: 350px;">Nombre del Cliente</th>';

            foreach ($categories as $cat) {
                echo '<th class="header">' . htmlspecialchars($cat->name) . '</th>';
            }

            echo '      </tr>
                </thead>
                <tbody>';

            foreach ($clients as $client) {
                $clientDocs = $documentMatrix->get($client->co_cli, collect());

                echo '<tr>';
                echo '<td class="client-info">' . $client->co_cli . '</td>';
                echo '<td class="client-info">' . htmlspecialchars($client->cli_des) . '</td>';

                foreach ($categories as $cat) {
                    $hasDoc = $clientDocs->contains('category_id', $cat->id);
                    if ($hasDoc) {
                        echo '<td class="si">SÍ</td>';
                    } else {
                        echo '<td class="no">NO</td>';
                    }
                }
                echo '</tr>';
            }

            echo '  </tbody>
            </table>
        </body>
        </html>';

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportClientMatrix(Client $client): StreamedResponse
    {
        // Nombre del archivo personalizado con el nombre del cliente
        $safeName = str_replace(' ', '_', $client->cli_des);
        $fileName = "matriz_{$client->co_cli}_{$safeName}_" . date('Y_m_d') . ".xls";

        $categories = Category::orderBy('name')->get();

        // Obtenemos solo las categorías que este cliente específico tiene
        $clientCategoryIds = DB::table('documents')
            ->where('client_id', $client->co_cli)
            ->distinct()
            ->pluck('category_id')
            ->toArray();

        $headers = [
            "Content-type" => "application/vnd.ms-excel",
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($client, $categories, $clientCategoryIds) {
            echo '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=utf-8" />
            <style>
                .header { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #000000; height: 35px; text-align: center; }
                .client-name { background-color: #f1f5f9; font-weight: bold; font-size: 14px; border: 1px solid #000000; }
                .si { color: #15803d; background-color: #dcfce7; text-align: center; font-weight: bold; border: 1px solid #000000; }
                .no { color: #b91c1c; background-color: #fee2e2; text-align: center; font-weight: bold; border: 1px solid #000000; }
                td { width: 160px; height: 30px; border: 0.5pt solid #cccccc; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th colspan="2" class="client-name" style="height: 45px;">CLIENTE: ' . htmlspecialchars($client->cli_des) . ' (' . $client->co_cli . ')</th>
                    </tr>
                    <tr>
                        <th class="header">CATEGORÍA</th>
                        <th class="header">ESTADO</th>
                    </tr>
                </thead>
                <tbody>';

            foreach ($categories as $cat) {
                $hasDoc = in_array($cat->id, $clientCategoryIds);
                echo '<tr>';
                echo '<td style="background-color: #f8fafc; font-weight: 500;">' . htmlspecialchars($cat->name) . '</td>';
                if ($hasDoc) {
                    echo '<td class="si">SÍ (Completado)</td>';
                } else {
                    echo '<td class="no">NO (Pendiente)</td>';
                }
                echo '</tr>';
            }

            echo '  </tbody>
            </table>
        </body>
        </html>';
        };

        return response()->stream($callback, 200, $headers);
    }
}
