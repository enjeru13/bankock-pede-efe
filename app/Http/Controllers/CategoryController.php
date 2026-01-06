<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Mostrar lista de categorías.
     */
    public function index()
    {
        $categories = Category::withCount('documents')->orderBy('name')->get();

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Crear una nueva categoría.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        Category::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Categoría creada correctamente.');
    }

    /**
     * Actualizar (renombrar) una categoría.
     */
    public function update(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'id' => 'required|exists:categories,id',
            'name' => 'required|string|max:100|unique:categories,name,' . $request->id,
        ]);

        $category = Category::findOrFail($request->id);
        $category->update(['name' => $request->name]);

        return redirect()->back()->with('success', 'Categoría actualizada.');
    }

    /**
     * Eliminar una categoría.
     */
    public function destroy(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'id' => 'required|exists:categories,id',
        ]);

        // Los documentos tendrán category_id = null gracias al nullOnDelete en la migración
        $category = Category::findOrFail($request->id);
        $category->delete();

        return redirect()->back()->with('success', 'Categoría eliminada.');
    }
}
