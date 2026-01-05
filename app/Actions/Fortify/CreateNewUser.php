<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'co_ven' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
        ])->validate();

        $vendedor = DB::connection('sqlsrv')->select("SELECT TOP 1 ven_des FROM vendedor WHERE CO_VEN = '{$input['co_ven']}' AND tipo = 'A'");

        if (empty($vendedor)) {
            throw ValidationException::withMessages([
                'co_ven' => ['El código de vendedor no existe.'],
            ]);
        }

        return User::create([
            'co_ven' => $input['co_ven'],
            'name' => $vendedor[0]->ven_des,
            'password' => $input['password'],
        ]);
    }
}
