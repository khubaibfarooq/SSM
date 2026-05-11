<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(HttpRequest $request)
    {
        $query = Payment::with(['fromUser', 'byUser', 'details.toUser']);

        // Filtering Logic
        if ($request->filled('from_user_id')) {
            $query->where('from_user_id', $request->from_user_id);
        }

        if ($request->filled('by_user_id')) {
            $query->where('by_user_id', $request->by_user_id);
        }

        if ($request->filled('to_user_id')) {
            $query->whereHas('details', function ($q) use ($request) {
                $q->where('to_user_id', $request->to_user_id);
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        return Inertia::render('Payments/Index', [
            'payments' => $query->latest('date')->get(),
            'users' => User::all(),
            'filters' => $request->only(['from_user_id', 'to_user_id', 'by_user_id', 'date_from', 'date_to']),
        ]);
    }

    public function store(HttpRequest $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'from_user_id' => 'required|exists:users,id',
            'by_user_id' => 'required|exists:users,id',
            'details' => 'required|array',
            'details.*.to_user_id' => 'required|exists:users,id',
            'details.*.amount' => 'required|numeric|min:0',
        ]);

        $payer = User::findOrFail($validated['from_user_id']);
        
        $totalAllocated = collect($validated['details'])->sum('amount');
        if (abs($totalAllocated - $validated['amount']) > 0.001) {
            return back()->withErrors(['details' => 'The total allocated amount ($' . number_format($totalAllocated, 2) . ') must exactly equal the total payment amount ($' . number_format($validated['amount'], 2) . ')']);
        }

        if ($validated['amount'] > $payer->balance) {
            return back()->withErrors(['amount' => 'Insufficient balance. Payer only has $' . number_format($payer->balance, 2)]);
        }

        DB::transaction(function () use ($validated, $payer) {
            $payment = Payment::create([
                'date' => $validated['date'],
                'amount' => $validated['amount'],
                'from_user_id' => $validated['from_user_id'],
                'by_user_id' => $validated['by_user_id'],
            ]);

            // Deduct from Payer
            $payer->decrement('balance', $validated['amount']);

            foreach ($validated['details'] as $detail) {
                $payment->details()->create($detail);
                
                // Update balance of the user receiving the amount
                $recipient = User::find($detail['to_user_id']);
                $recipient->increment('balance', $detail['amount']);
            }
        });

        return back()->with('success', 'Payment processed successfully.');
    }
}
