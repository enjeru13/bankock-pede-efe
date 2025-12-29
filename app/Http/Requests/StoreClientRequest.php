<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request para validar la creación de un cliente.
 * 
 * Define las reglas de validación para crear un nuevo cliente
 * en el sistema de gestión de documentos.
 */
class StoreClientRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para hacer esta petición.
     * 
     * Todos los usuarios autenticados pueden crear clientes
     * ya que todos son administradores.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Todos los usuarios autenticados pueden crear clientes
    }

    /**
     * Obtener las reglas de validación para la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Nombre del cliente (obligatorio)
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            // Código único del cliente (obligatorio y único)
            'code' => [
                'required',
                'string',
                'max:50',
                'unique:clients,code', // Debe ser único en la tabla clients
                'regex:/^[A-Z0-9\-]+$/', // Solo mayúsculas, números y guiones
            ],

            // Email de contacto (opcional pero debe ser válido)
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            // Teléfono de contacto (opcional)
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],

            // Dirección (opcional)
            'address' => [
                'nullable',
                'string',
                'max:500',
            ],

            // Notas internas (opcional)
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],

            // Estado activo/inactivo (opcional, por defecto true)
            'is_active' => [
                'nullable',
                'boolean',
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
            'name.required' => 'El nombre del cliente es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',

            'code.required' => 'El código del cliente es obligatorio.',
            'code.unique' => 'Este código ya está en uso por otro cliente.',
            'code.regex' => 'El código solo puede contener letras mayúsculas, números y guiones.',
            'code.max' => 'El código no puede tener más de 50 caracteres.',

            'email.email' => 'El email debe ser una dirección válida.',
            'email.max' => 'El email no puede tener más de 255 caracteres.',

            'phone.max' => 'El teléfono no puede tener más de 20 caracteres.',
            'address.max' => 'La dirección no puede tener más de 500 caracteres.',
            'notes.max' => 'Las notas no pueden tener más de 1000 caracteres.',
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
            'name' => 'nombre',
            'code' => 'código',
            'email' => 'correo electrónico',
            'phone' => 'teléfono',
            'address' => 'dirección',
            'notes' => 'notas',
            'is_active' => 'estado',
        ];
    }
}
