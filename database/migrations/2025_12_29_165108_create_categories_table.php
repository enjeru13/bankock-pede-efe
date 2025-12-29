<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Crear tabla categories si no existe
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->timestamps();
            });
        }

        // 2. Agregar columna category_id a documents (nullable por ahora)
        if (!Schema::hasColumn('documents', 'category_id')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->unsignedBigInteger('category_id')->nullable()->after('category');
                $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            });
        }

        // 3. Migrar datos: Convertir strings a IDs
        $documents = DB::table('documents')->whereNotNull('category')->where('category', '!=', '')->get();

        foreach ($documents as $doc) {
            $rawCategory = trim($doc->category);
            // Normalizar: Primera letra mayúscula, resto minúscula (o como prefieras)
            // Esto evita duplicados como "Factura" y "factura"
            $normalizedCategory = ucfirst(strtolower($rawCategory));

            if (empty($normalizedCategory))
                continue;

            // Busca o crea la categoría
            // Usamos firstOrCreate simulado con DB
            $category = DB::table('categories')->where('name', $normalizedCategory)->first();

            if (!$category) {
                try {
                    $id = DB::table('categories')->insertGetId([
                        'name' => $normalizedCategory,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $categoryId = $id;
                } catch (\Exception $e) {
                    // Si falla por race condition o unique constraint, intenta buscarla de nuevo
                    $categoryId = DB::table('categories')->where('name', $normalizedCategory)->value('id');
                }
            } else {
                $categoryId = $category->id;
            }

            // Actualizar documento
            if ($categoryId) {
                DB::table('documents')
                    ->where('id', $doc->id)
                    ->update(['category_id' => $categoryId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('documents', 'category_id')) {
            Schema::table('documents', function (Blueprint $table) {
                // Check if foreign key exists before dropping - difficult to check portably, so wrapping in try-catch or ignoring
                try {
                    $table->dropForeign(['category_id']);
                } catch (\Exception $e) {
                }
                $table->dropColumn('category_id');
            });
        }

        Schema::dropIfExists('categories');
    }
};
