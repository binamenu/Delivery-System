<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\CreateDriverRequest;
use App\Http\Requests\V1\Admin\CreateRestaurantManagerRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    /**
     * Create a driver account and driver profile.
     */
    public function createDriver(CreateDriverRequest $request): JsonResponse
    {
        $temporaryPassword = $this->generateTemporaryPassword();

        $result = DB::transaction(function () use ($request, $temporaryPassword): User {
            $user = new User();

            $user->name = $request->string('name')->trim()->toString();
            $user->email = $request->string('email')->trim()->toString();
            $user->username = $this->generateUsername($user->email);
            $user->phone = $request->string('phone')->trim()->toString();
            $user->password = Hash::make($temporaryPassword);
            $user->role = 'driver';
            $user->status = 'active';
            $user->save();

            $user->driverProfile()->create([
                'vehicle_type' => $request->string('vehicle_type')->trim()->toString(),
                'vehicle_model' => $request->string('vehicle_model')->trim()->toString(),
                'license_number' => $request->string('license_number')->trim()->toString(),
                'approval_status' => 'pending',
                'is_online' => false,
            ]);

            return $user;
        });

        return response()->json([
            'user' => UserResource::make($result),
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    /**
     * Create a restaurant manager account.
     */
    public function createRestaurantManager(
        CreateRestaurantManagerRequest $request
    ): JsonResponse {
        $temporaryPassword = $this->generateTemporaryPassword();

        $user = DB::transaction(function () use ($request, $temporaryPassword): User {
            $user = new User();

            $user->name = $request->string('name')->trim()->toString();
            $user->email = $request->string('email')->trim()->toString();
            $user->username = $this->generateUsername($user->email);
            $user->phone = $request->string('phone')->trim()->toString();
            $user->password = Hash::make($temporaryPassword);
            $user->role = 'restaurant_manager';
            $user->status = 'active';
            $user->save();

            return $user;
        });

        return response()->json([
            'user' => UserResource::make($user),
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    /**
     * Generate a username from the email address.
     */
    private function generateUsername(string $email): string
    {
        $base = Str::before($email, '@');

        $base = Str::of($base)
            ->lower()
            ->replaceMatches('/[^a-z0-9_-]/', '_')
            ->trim('_')
            ->toString();

        $base = $base !== '' ? $base : 'user';

        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = "{$base}_{$counter}";
            $counter++;
        }

        return $username;
    }

    /**
     * Generate a temporary password for an admin-created account.
     */
    private function generateTemporaryPassword(): string
    {
        return 'Td' . Str::random(10) . 'A1';
    }
}