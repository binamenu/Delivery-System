<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'regex:/^09\d{8}$/', 'unique:users'],
            'vehicle_type' => ['required', 'string', 'max:100'],
            'vehicle_model' => ['required', 'string', 'max:255'],
            'license_number' => [
                'required',
                'string',
                'max:100',
                'unique:driver_profiles,license_number',
            ],
        ];
    }
}