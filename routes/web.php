<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\CategoryController;
use App\Models\Client;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren Autenticación)
|--------------------------------------------------------------------------
| Todas las rutas dentro de este grupo requieren que el usuario
| esté autenticado y haya verificado su email.
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Clientes
    |--------------------------------------------------------------------------
    | CRUD completo para clientes:
    | - index: Listar clientes
    | - create: Formulario crear cliente
    | - store: Guardar nuevo cliente
    | - show: Ver cliente y sus documentos
    | - edit: Formulario editar cliente
    | - update: Actualizar cliente
    | - destroy: Eliminar cliente
    */
    Route::resource('clients', ClientController::class);

    /*
    |--------------------------------------------------------------------------
    | Gestión de Documentos
    |--------------------------------------------------------------------------
    */

    // Listar todos los documentos
    Route::get('documents', [DocumentController::class, 'index'])
        ->name('documents.index');

    // Formulario para subir documento
    Route::get('documents/create', [DocumentController::class, 'create'])
        ->name('documents.create');

    // Guardar nuevo documento
    Route::post('documents', [DocumentController::class, 'store'])
        ->name('documents.store');

    // Actualizar documento
    Route::put('documents/{document}', [DocumentController::class, 'update'])
        ->name('documents.update');

    // Ver detalles de un documento
    Route::get('documents/{document}', [DocumentController::class, 'show'])
        ->name('documents.show');

    // Descargar documento PDF
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])
        ->name('documents.download');

    // Visualizar documento PDF
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])
        ->name('documents.preview');

    // Gestión de categorías
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/update', [CategoryController::class, 'update'])->name('categories.update'); // Keeping generic update path or changing to standard REST
    // Actually, let's use standard REST-ish but keeping it simple for the modal
    // Route::put('categories/{category}', ...) is better but the frontend sends an ID in payload.
    // Let's stick to what I wrote: store, update, destroy
    Route::post('categories/destroy', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Eliminar documento
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])
        ->name('documents.destroy');

    // Búsqueda de documentos (AJAX)
    Route::get('search/documents', [DocumentController::class, 'search'])
        ->name('documents.search');
});

/*
|--------------------------------------------------------------------------
| Rutas de Configuración de Usuario
|--------------------------------------------------------------------------
*/
require __DIR__ . '/settings.php';
