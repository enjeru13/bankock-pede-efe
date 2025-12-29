<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Client
 * 
 * Representa un cliente del departamento de compras.
 * Los clientes NO tienen acceso al sistema, solo son registros
 * para organizar los documentos PDF.
 * 
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $notes
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Client extends Model
{
    use HasFactory;

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'email',
        'phone',
        'address',
        'notes',
        'is_active',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELACIONES
    |--------------------------------------------------------------------------
    */

    /**
     * Obtener todos los documentos del cliente.
     * 
     * Un cliente puede tener muchos documentos PDF.
     *
     * @return HasMany
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES (Consultas reutilizables)
    |--------------------------------------------------------------------------
    */

    /**
     * Scope para filtrar solo clientes activos.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para buscar clientes por nombre o código.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $term
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('code', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS (Atributos calculados)
    |--------------------------------------------------------------------------
    */

    /**
     * Obtener el número total de documentos del cliente.
     *
     * @return int
     */
    public function getDocumentCountAttribute(): int
    {
        return $this->documents()->count();
    }

    /**
     * Obtener el tamaño total de todos los documentos del cliente (en bytes).
     *
     * @return int
     */
    public function getTotalSizeAttribute(): int
    {
        return $this->documents()->sum('file_size');
    }

    /**
     * Obtener el tamaño total formateado (KB, MB, GB).
     *
     * @return string
     */
    public function getFormattedTotalSizeAttribute(): string
    {
        return $this->formatBytes($this->total_size);
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTODOS HELPER
    |--------------------------------------------------------------------------
    */

    /**
     * Verificar si el cliente puede ser eliminado.
     * 
     * Un cliente puede ser eliminado solo si no tiene documentos.
     *
     * @return bool
     */
    public function canBeDeleted(): bool
    {
        return $this->documents()->count() === 0;
    }

    /**
     * Formatear bytes a una unidad legible (KB, MB, GB).
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
