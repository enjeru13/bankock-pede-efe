<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\TrimsLegacyData;

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
