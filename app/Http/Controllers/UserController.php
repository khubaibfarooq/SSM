<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with(['plan', 'payments.details.toUser', 'receivedAllocations.payment.fromUser'])
                ->latest()
                ->get(),
            'plans' => Plan::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email',
            'password'        => ['required', 'confirmed', Password::min(8)],
            'contact'         => 'nullable|string|max:50',
            'address'         => 'nullable|string|max:500',
            'business_name'   => 'nullable|string|max:255',
            'type'            => 'nullable|in:admin,client,staff',
            'plan_id'         => 'nullable|exists:plans,id',
            'plan_added_date' => 'nullable|date',
            'balance'         => 'nullable|numeric|min:0',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email,' . $user->id,
            'contact'         => 'nullable|string|max:50',
            'address'         => 'nullable|string|max:500',
            'business_name'   => 'nullable|string|max:255',
            'type'            => 'nullable|in:admin,client,staff',
            'plan_id'         => 'nullable|exists:plans,id',
            'plan_added_date' => 'nullable|date',
            'balance'         => 'nullable|numeric|min:0',
        ]);

        $user->update($validated);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Password::min(8)],
            ]);
            $user->update(['password' => Hash::make($request->password)]);
        }

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
