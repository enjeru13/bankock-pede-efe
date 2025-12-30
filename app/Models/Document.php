<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'mysql';
    protected $table = 'documents';

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
    
    protected $casts = [

        'uploaded_by' => 'integer',
        'file_size' => 'integer',
        'last_downloaded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByCategory($query, $category)
    {
        if (is_numeric($category)) {
            return $query->where('category_id', $category);
        }

        return $query->whereHas('category', function ($q) use ($category) {
            $q->where('name', $category);
        });
    }

    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('filename', 'like', "%{$term}%");
        });
    }

    public function getFormattedSizeAttribute(): string
    {
        return $this->formatBytes($this->file_size);
    }

    public function getDownloadUrlAttribute(): string
    {
        return route('documents.download', $this->id);
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('downloaded_count');
        $this->update(['last_downloaded_at' => now()]);
    }

    public function getFullPath(): string
    {
        return Storage::path($this->file_path);
    }

    public function fileExists(): bool
    {
        return Storage::exists($this->file_path);
    }

    public function deleteFile(): bool
    {
        if ($this->fileExists()) {
            return Storage::delete($this->file_path);
        }

        return false;
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    protected static function booted(): void
    {
        static::deleted(function (Document $document) {
            if ($document->isForceDeleting()) {
                $document->deleteFile();
            }
        });
    }
}
