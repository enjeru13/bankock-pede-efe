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
use Illuminate\Support\Facades\DB;

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

        // Filter by vendor's segments
        // Filter by user's zone or vendor code
        $user = auth()->user();

        // If ADMIN, show all active clients (or whatever logic for "all")
        if ($user->name === 'ADMIN' || $user->zone === 'ADMIN') {
             $query->whereNotIn('co_ven', ['00027', '999']);
        } 
        elseif ($user->zone) {
            $sqlZoneLogic = "
                UPPER(TRIM(
                    CASE 
                        WHEN seg_des LIKE '%TACHIRA%' 
                          OR seg_des LIKE '%S/C%' 
                          OR seg_des LIKE '%FRONTERA%'
                          OR seg_des LIKE '%PANAMERICANA%'
                          OR seg_des LIKE '%LLANO%'
                          OR seg_des LIKE '%PLAZA%'
                        THEN 'TACHIRA'

                        WHEN CHARINDEX(')', seg_des) > 0 AND CHARINDEX(')', seg_des) < 15
                        THEN SUBSTRING(
                                LTRIM(SUBSTRING(seg_des, CHARINDEX(')', seg_des) + 1, LEN(seg_des))), 
                                1, 
                                CHARINDEX(' ', LTRIM(SUBSTRING(seg_des, CHARINDEX(')', seg_des) + 1, LEN(seg_des))) + ' ') - 1
                             )

                        ELSE 
                            SUBSTRING(
                                REPLACE(REPLACE(seg_des, '-', ' '), '/', ' '), 
                                1, 
                                CHARINDEX(' ', REPLACE(REPLACE(seg_des, '-', ' '), '/', ' ') + ' ') - 1
                            )
                    END
                ))
            ";

            $allowedSegments = DB::connection('sqlsrv')
                ->table('segmento')
                ->whereRaw("{$sqlZoneLogic} = ?", [$user->zone])
                ->pluck('co_seg');

            $query->whereIn('co_seg', $allowedSegments);

        } elseif ($user->co_ven) {
            $allowedSegments = DB::connection('sqlsrv')
                ->table('vendedor as v')
                ->join('clientes as c', 'v.co_ven', '=', 'c.co_ven')
                ->join('segmento as s', 'c.co_seg', '=', 's.co_seg')
                ->where('v.co_ven', $user->co_ven)
                ->whereNotIn('co_ven', ['00027', '999'])
                ->where('s.co_seg', '<>', '99999')  
                ->distinct()
                ->pluck('s.co_seg');

            $query->whereIn('co_seg', $allowedSegments);
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
