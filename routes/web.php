<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
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
    */
    Route::get('clients', [ClientController::class, 'index'])
        ->name('clients.index');
    Route::get('clients/{client}', [ClientController::class, 'show'])
        ->name('clients.show');

    /*
    |--------------------------------------------------------------------------
    | Gestión de Documentos
    |--------------------------------------------------------------------------
    */

    // Listar todos los documentos
    Route::get('documents', [DocumentController::class, 'index'])
        ->name('documents.index');

    // Formulario para subir documento
    Route::get('documents/{client}/create', [DocumentController::class, 'create'])
        ->name('documents.create');

    // Guardar nuevo documento
    Route::post('documents/{client}', [DocumentController::class, 'store'])
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
    Route::put('categories/update', [CategoryController::class, 'update'])->name('categories.update');
    Route::post('categories/destroy', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Eliminar documento
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])
        ->name('documents.destroy');

    // Búsqueda de documentos (AJAX)
    Route::get('search/documents', [DocumentController::class, 'search'])
        ->name('documents.search');

    // Herramientas
    Route::prefix('tools')->name('tools.')->group(function () {

        Route::get('pdf-splitter', [\App\Http\Controllers\PdfSplitterController::class, 'index'])
            ->name('pdf-splitter');

        Route::post('pdf-splitter/upload', [\App\Http\Controllers\PdfSplitterController::class, 'upload'])
            ->name('pdf-splitter.upload');

        Route::post('pdf-splitter/split', [\App\Http\Controllers\PdfSplitterController::class, 'split'])
            ->name('pdf-splitter.split');

        Route::post('pdf-splitter/save-to-client', [\App\Http\Controllers\PdfSplitterController::class, 'saveToClient'])
            ->name('pdf-splitter.save-to-client');

        Route::post('pdf-splitter/download', [\App\Http\Controllers\PdfSplitterController::class, 'download'])
            ->name('pdf-splitter.download');

        Route::post('pdf-splitter/cleanup', [\App\Http\Controllers\PdfSplitterController::class, 'cleanup'])
            ->name('pdf-splitter.cleanup');
        Route::get('pdf-splitter/preview', [\App\Http\Controllers\PdfSplitterController::class, 'preview'])
            ->name('pdf-splitter.preview');
    });
});

/*
|--------------------------------------------------------------------------
| Rutas de Configuración de Usuario
|--------------------------------------------------------------------------
*/
require __DIR__ . '/settings.php';
