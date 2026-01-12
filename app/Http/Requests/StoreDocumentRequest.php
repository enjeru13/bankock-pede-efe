<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request para validar la subida de un documento PDF.
 * 
 * Define las reglas de validación para subir un nuevo documento
 * al sistema, incluyendo validación del archivo PDF.
 */
class StoreDocumentRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para hacer esta petición.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Todos los usuarios autenticados pueden subir documentos
    }

    /**
     * Obtener las reglas de validación para la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Título del documento (obligatorio)
            'title' => [
                'nullable',
                'string',
                'max:255',
            ],

            // Descripción del documento (opcional)
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            // Categoría del documento (opcional)
            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            // Etiquetas para búsqueda (opcional, array)
            'tags' => [
                'nullable',
                'array',
            ],
            'tags.*' => [
                'string',
                'max:50',
            ],

            // Archivo PDF (obligatorio)
            'file' => [
                'required',
                'file',
                'mimes:pdf', // Solo archivos PDF
                'max:1048576', // Máximo 1GB (en kilobytes)
            ],
        ];
    }

    /**
     * Obtener los mensajes de error personalizados.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.max' => 'El título no puede tener más de 255 caracteres.',
            'description.max' => 'La descripción no puede tener más de 1000 caracteres.',
            'category.max' => 'La categoría no puede tener más de 100 caracteres.',
            'tags.array' => 'Las etiquetas deben ser un array.',
            'tags.*.string' => 'Cada etiqueta debe ser texto.',
            'tags.*.max' => 'Cada etiqueta no puede tener más de 50 caracteres.',
            'file.required' => 'Debe seleccionar un archivo PDF.',
            'file.file' => 'El archivo no es válido.',
            'file.mimes' => 'El archivo debe ser un PDF.',
            'file.max' => 'El archivo no puede ser mayor a 1GB.',
        ];
    }

    /**
     * Obtener los nombres personalizados de los atributos.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [

            'title' => 'título',
            'description' => 'descripción',
            'category' => 'categoría',
            'tags' => 'etiquetas',
            'file' => 'archivo',
        ];
    }
}
