<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Ejecutar las migraciones.
     *
     * Crea la tabla 'clients' para almacenar información de clientes.
     * Los clientes NO tienen acceso al sistema, solo son registros
     * de información para organizar los documentos.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            // ID autoincremental
            $table->id();

            // Información básica del cliente
            $table->string('name'); // Nombre del cliente o empresa
            $table->string('code')->unique(); // Código único del cliente (ej: CLI-001)

            // Información de contacto (opcional)
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();

            // Notas internas para el equipo de compras
            $table->text('notes')->nullable();

            // Estado del cliente (activo/inactivo)
            $table->boolean('is_active')->default(true);

            // Timestamps automáticos (created_at, updated_at)
            $table->timestamps();

            // Índices para mejorar el rendimiento de búsquedas
            $table->index('code'); // Búsqueda por código
            $table->index('is_active'); // Filtrar por estado
        });
    }

    /**
     * Reverse the migrations.
     */
    /**
     * Revertir las migraciones.
     * 
     * Elimina la tabla 'clients' de la base de datos.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
