<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentDetail;
use App\Models\User;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(HttpRequest $request)
    {
        $query = Payment::with(['fromUser', 'byUser', 'client', 'details.toUser']);

        // Filtering Logic
        if ($request->filled('from_user_id')) {
            $query->where('from_user_id', $request->from_user_id);
        }

        if ($request->filled('by_user_id')) {
            $query->where('by_user_id', $request->by_user_id);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
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
            'users' => User::with(['receivedAllocations' => function($q) {
                $q->where('remaining_balance', '>', 0)->with('payment.fromUser');
            }])->get(),
            'filters' => $request->only(['from_user_id', 'to_user_id', 'by_user_id', 'date_from', 'date_to', 'client_id']),
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
            'description' => 'nullable|string',
            'img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'source_allocation_id' => 'nullable|exists:payment_details,id',
        ]);

        $payer = User::findOrFail($validated['from_user_id']);
        
        $totalAllocated = collect($validated['details'])->sum('amount');
        if (abs($totalAllocated - $validated['amount']) > 0.001) {
            return back()->withErrors(['details' => 'The total allocated amount ($' . number_format($totalAllocated, 2) . ') must exactly equal the total payment amount ($' . number_format($validated['amount'], 2) . ')']);
        }

        if ($validated['amount'] > $payer->balance) {
            return back()->withErrors(['amount' => 'Insufficient balance. Payer only has $' . number_format($payer->balance, 2)]);
        }

        DB::transaction(function () use ($validated, $payer, $request) {
            $imgPath = null;
            if ($request->hasFile('img')) {
                $file = $request->file('img');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/payments'), $filename);
                $imgPath = '/uploads/payments/' . $filename;
            }

            $clientId = null;
            if (!empty($validated['source_allocation_id'])) {
                $sourceAllocation = PaymentDetail::findOrFail($validated['source_allocation_id']);
                $clientId = Payment::findOrFail($sourceAllocation->payment_id)->from_user_id;
            }

            $payment = Payment::create([
                'date' => $validated['date'],
                'amount' => $validated['amount'],
                'from_user_id' => $validated['from_user_id'],
                'by_user_id' => $validated['by_user_id'],
                'description' => $validated['description'] ?? null,
                'img' => $imgPath,
                'client_id' => $clientId,
            ]);

            // Deduct from Payer's balance
            if (!empty($validated['source_allocation_id'])) {
                // Manual Selection
                $sourceAllocation = PaymentDetail::findOrFail($validated['source_allocation_id']);
                
                if ($sourceAllocation->to_user_id != $payer->id) {
                    abort(403, 'Unauthorized source allocation.');
                }

                if ($sourceAllocation->remaining_balance < $validated['amount']) {
                    abort(422, 'The selected transaction has insufficient balance ($' . $sourceAllocation->remaining_balance . ') for this amount.');
                }

                $sourceAllocation->decrement('remaining_balance', $validated['amount']);
            } else {
                // Fallback to FIFO
                $remainingToDeduct = $validated['amount'];
                $payerAllocations = PaymentDetail::where('to_user_id', $payer->id)
                    ->where('remaining_balance', '>', 0)
                    ->orderBy('id', 'asc')
                    ->get();

                foreach ($payerAllocations as $allocation) {
                    if ($remainingToDeduct <= 0) break;

                    $deduction = min($remainingToDeduct, $allocation->remaining_balance);
                    $allocation->decrement('remaining_balance', $deduction);
                    $remainingToDeduct -= $deduction;
                }
            }

            foreach ($validated['details'] as $detail) {
                $payment->details()->create([
                    'to_user_id' => $detail['to_user_id'],
                    'amount' => $detail['amount'],
                    'remaining_balance' => $detail['amount'],
                ]);
            }
        });

        return back()->with('success', 'Payment processed successfully.');
    }
}
