<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\TrimsLegacyData;
use Illuminate\Support\Facades\DB;

class Client extends Model
{
    use HasFactory;
    use TrimsLegacyData;

    protected $connection = 'sqlsrv';
    protected $table = 'clientes';
    protected $primaryKey = 'co_cli';
    protected $keyType = 'string';
    
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'client_id', 'co_cli');
    }

    public function scopeActive($query)
    {
        return $query->where('inactivo', 0);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('cli_des', 'like', "%{$term}%")
                ->orWhere('co_cli', 'like', "%{$term}%");
        });
    }

    public function scopeAccessibleBy($query, $user)
    {
        // If ADMIN, show all active clients (excluding internal codes)
        if ($user->name === 'ADMIN' || $user->zone === 'ADMIN') {
             return $query->whereNotIn('co_ven', ['00027', '999']);
        } 
        
        // Filter by user's zone
        if ($user->zone) {
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

            return $query->whereIn('co_seg', $allowedSegments);
        } 
        
        // Filter by vendor code
        if ($user->co_ven) {
            $allowedSegments = DB::connection('sqlsrv')
                ->table('vendedor as v')
                ->join('clientes as c', 'v.co_ven', '=', 'c.co_ven')
                ->join('segmento as s', 'c.co_seg', '=', 's.co_seg')
                ->where('v.co_ven', $user->co_ven)
                ->whereNotIn('v.co_ven', ['00027', '999']) // Fixed: using v.co_ven or just co_ven if unambiguous
                ->where('s.co_seg', '<>', '99999')  
                ->distinct()
                ->pluck('s.co_seg');

            return $query->whereIn('co_seg', $allowedSegments);
        }

        return $query;
    }

    public function getDocumentCountAttribute(): int
    {
        return $this->documents()->count();
    }

    public function getTotalSizeAttribute(): int
    {
        return $this->documents()->sum('file_size');
    }

    public function getFormattedTotalSizeAttribute(): string
    {
        return $this->formatBytes($this->total_size);
    }

    public function canBeDeleted(): bool
    {
        return $this->documents()->count() === 0;
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $client = $this->where('co_cli', $value)->first();
        
        if ($client) {
            return $client;
        }

        return $this->whereRaw("LTRIM(RTRIM(co_cli)) = ?", [$value])->firstOrFail();
    }
}
