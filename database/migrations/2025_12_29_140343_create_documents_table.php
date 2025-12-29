<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    /**
     * Ejecutar las migraciones.
     * 
     * Crea la tabla 'documents' para almacenar información de documentos PDF.
     * Cada documento pertenece a un cliente y fue subido por un usuario.
     */
    public function up(): void
    {
        if (!Schema::hasTable('documents')) {
            Schema::create('documents', function (Blueprint $table) {
                // ID autoincremental
                $table->id();

                // Relación con cliente (obligatorio)
                // Si se elimina un cliente, se eliminan sus documentos en cascada
                $table->foreignId('client_id')
                    ->constrained('clients')
                    ->onDelete('cascade');

                // Usuario que subió el documento (obligatorio)
                // Si se elimina el usuario, se mantiene el registro pero se marca como NULL
                $table->foreignId('uploaded_by')
                    ->constrained('users')
                    ->onDelete('set null')
                    ->nullable();

                // Información del documento
                $table->string('title'); // Título descriptivo del documento
                $table->text('description')->nullable(); // Descripción opcional

                // Información del archivo
                $table->string('filename'); // Nombre original del archivo
                $table->string('file_path'); // Ruta en storage
                $table->unsignedBigInteger('file_size'); // Tamaño en bytes
                $table->string('mime_type')->default('application/pdf'); // Tipo MIME

                // Categorización y búsqueda
                $table->string('category')->nullable(); // Categoría del documento
                $table->json('tags')->nullable(); // Etiquetas para búsqueda

                // Estadísticas de uso
                $table->unsignedInteger('downloaded_count')->default(0); // Contador de descargas
                $table->timestamp('last_downloaded_at')->nullable(); // Última descarga

                // Timestamps automáticos (created_at, updated_at)
                $table->timestamps();

                // Soft deletes (deleted_at) - permite recuperar documentos eliminados
                $table->softDeletes();

                // Índices para mejorar el rendimiento
                $table->index('client_id'); // Búsqueda por cliente
                $table->index('uploaded_by'); // Búsqueda por usuario
                $table->index('category'); // Filtrar por categoría
                $table->index('created_at'); // Ordenar por fecha
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    /**
     * Revertir las migraciones.
     * 
     * Elimina la tabla 'documents' de la base de datos.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
