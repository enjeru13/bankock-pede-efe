<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para hacer esta petición.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtener las reglas de validación para la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            // Título
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            // Descripción
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            // Categoría
            'category' => [
                'nullable',
                'string',
                'max:100',
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
            'client_id.required' => 'Debe seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no existe.',
            'title.required' => 'El título del documento es obligatorio.',
            'title.max' => 'El título no puede tener más de 255 caracteres.',
            'description.max' => 'La descripción no puede tener más de 1000 caracteres.',
            'category.max' => 'La categoría no puede tener más de 100 caracteres.',
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
            'client_id' => 'cliente',
            'title' => 'título',
            'description' => 'descripción',
            'category' => 'categoría',
        ];
    }
}
