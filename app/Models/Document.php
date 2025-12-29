<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * Modelo Document
 * 
 * Representa un documento PDF almacenado en el sistema.
 * Cada documento pertenece a un cliente y fue subido por un usuario.
 * 
 * @property int $id
 * @property int $client_id
 * @property int|null $uploaded_by
 * @property string $title
 * @property string|null $description
 * @property string $filename
 * @property string $file_path
 * @property int $file_size
 * @property string $mime_type
 * @property string|null $category
 * @property array|null $tags
 * @property int $downloaded_count
 * @property \Illuminate\Support\Carbon|null $last_downloaded_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Document extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'category_id',
        'title',
        'description',
        'filename',
        'file_path',
        'file_size',
        'uploaded_by',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'client_id' => 'integer',
        'uploaded_by' => 'integer',
        'file_size' => 'integer',
        'last_downloaded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELACIONES
    |--------------------------------------------------------------------------
    */

    /**
     * Obtener el cliente al que pertenece el documento.
     * 
     * Un documento pertenece a un cliente.
     *
     * @return BelongsTo
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Obtener el usuario que subió el documento.
     * 
     * Un documento fue subido por un usuario.
     *
     * @return BelongsTo
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Obtener la categoría del documento.
     * 
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES (Consultas reutilizables)
    |--------------------------------------------------------------------------
    */

    /**
     * Scope para filtrar documentos por cliente.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $clientId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope para filtrar documentos por categoría.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $category
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategory($query, $category)
    {
        if (is_numeric($category)) {
            return $query->where('category_id', $category);
        }

        return $query->whereHas('category', function ($q) use ($category) {
            $q->where('name', $category);
        });
    }

    /**
     * Scope para obtener documentos recientes.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Scope para buscar documentos por título o descripción.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $term
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('filename', 'like', "%{$term}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS (Atributos calculados)
    |--------------------------------------------------------------------------
    */

    /**
     * Obtener el tamaño del archivo formateado (KB, MB, GB).
     *
     * @return string
     */
    public function getFormattedSizeAttribute(): string
    {
        return $this->formatBytes($this->file_size);
    }

    /**
     * Obtener la URL de descarga del documento.
     *
     * @return string
     */
    public function getDownloadUrlAttribute(): string
    {
        return route('documents.download', $this->id);
    }

    /**
     * Obtener la URL del archivo en storage.
     *
     * @return string
     */
    public function getFileUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTODOS HELPER
    |--------------------------------------------------------------------------
    */

    /**
     * Incrementar el contador de descargas.
     * 
     * Actualiza el contador y la fecha de última descarga.
     *
     * @return void
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('downloaded_count');
        $this->update(['last_downloaded_at' => now()]);
    }

    /**
     * Obtener la ruta completa del archivo en storage.
     *
     * @return string
     */
    public function getFullPath(): string
    {
        return Storage::path($this->file_path);
    }

    /**
     * Verificar si el archivo existe en storage.
     *
     * @return bool
     */
    public function fileExists(): bool
    {
        return Storage::exists($this->file_path);
    }

    /**
     * Eliminar el archivo físico del storage.
     * 
     * NOTA: Esto elimina el archivo del disco, no el registro de la BD.
     *
     * @return bool
     */
    public function deleteFile(): bool
    {
        if ($this->fileExists()) {
            return Storage::delete($this->file_path);
        }

        return false;
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

    /*
    |--------------------------------------------------------------------------
    | EVENTOS DEL MODELO
    |--------------------------------------------------------------------------
    */

    /**
     * Configurar los eventos del modelo.
     * 
     * Cuando se elimina un documento (soft delete o hard delete),
     * también se elimina el archivo físico del storage.
     *
     * @return void
     */
    protected static function booted(): void
    {
        // Cuando se elimina permanentemente un documento, eliminar el archivo
        static::deleted(function (Document $document) {
            if ($document->isForceDeleting()) {
                $document->deleteFile();
            }
        });
    }
}
