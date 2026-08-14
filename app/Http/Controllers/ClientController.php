<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Payment;
use App\Models\PaymentDetail;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        return Inertia::render('Clients/Index', [
            'users' => User::with(['plan', 'product', 'payments.details.toUser', 'receivedAllocations.payment.fromUser', 'roles'])
                ->role('client')
                ->latest()
                ->get(),
            'plans' => Plan::all(),
            'products' => \App\Models\Product::all(),
            'roles' => Role::where('name', 'client')->get(),
            'zones' => Zone::with('areas')->get(),
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
            'product_id'      => 'nullable|exists:products,id',
            'plan_id'         => 'nullable|exists:plans,id',
            'plan_added_date' => 'nullable|date',
            'area_id'         => 'nullable|exists:areas,id',
        ]);

        $validated['password'] = Hash::make($request->password);
        $user = User::create($validated);
        $user->assignRole('client');

        return back()->with('success', 'Client created successfully.');
    }

    public function update(Request $request, User $client)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email,' . $client->id,
            'contact'         => 'nullable|string|max:50',
            'address'         => 'nullable|string|max:500',
            'business_name'   => 'nullable|string|max:255',
            'product_id'      => 'nullable|exists:products,id',
            'plan_id'         => 'nullable|exists:plans,id',
            'plan_added_date' => 'nullable|date',
            'area_id'         => 'nullable|exists:areas,id',
        ]);

        $client->update($validated);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Password::min(8)],
            ]);
            $client->update(['password' => Hash::make($request->password)]);
        }

        return back()->with('success', 'Client updated successfully.');
    }

    public function destroy(User $client)
    {
        $client->delete();

        return back()->with('success', 'Client deleted successfully.');
    }

    public function assignPlan(Request $request, User $client)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        \DB::transaction(function () use ($validated, $client) {
            // 1. Update User Plan
            $client->update([
                'plan_id' => $validated['plan_id'],
                'plan_added_date' => now(),
            ]);

            // 2. Create Payment Transaction
            $imgPath = null;
            if ($request->hasFile('img')) {
                $file = $request->file('img');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/payments'), $filename);
                $imgPath = '/uploads/payments/' . $filename;
            }

            $payment = Payment::create([
                'date' => now(),
                'amount' => $validated['amount'],
                'from_user_id' => 4, // Company/Main Account pays
                'by_user_id' => auth()->id(),
                'description' => $validated['description'] ?? null,
                'img' => $imgPath,
            ]);

            // 3. Create Payment Detail (Allocated to the client)
            $payment->details()->create([
                'to_user_id' => $client->id, // Client receives the credit
                'amount' => $validated['amount'],
                'remaining_balance' => $validated['amount'],
            ]);
        });

        return back()->with('success', 'Plan assigned and payment recorded successfully.');
    }
}
