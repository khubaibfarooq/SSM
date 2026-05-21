<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use App\Notifications\PlanRenewed;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Plans/Index', [
            'plans' => Plan::all()
        ]);
    }

    public function store(HttpRequest $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:lifetime,yearly,monthly',
            'amount' => 'required|numeric|min:0',
        ]);

        Plan::create($validated);

        return back()->with('success', 'Plan created successfully.');
    }

    public function update(HttpRequest $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:lifetime,yearly,monthly',
            'amount' => 'required|numeric|min:0',
        ]);

        $plan->update($validated);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return back()->with('success', 'Plan deleted successfully.');
    }

    public function checkRenewals()
    {
        $users = User::with(['plan', 'receivedAllocations.payment'])
            ->whereHas('plan', function ($q) {
                $q->whereIn('type', ['monthly', 'yearly']);
            })
            ->get();

        $renewedCount = 0;

        foreach ($users as $user) {
            // Find the last payment date, or fallback to plan_added_date
            $lastPaymentDate = null;
            
            // Check received allocations which represent payments to the user
            $allocations = $user->receivedAllocations->sortByDesc(function ($alloc) {
                return $alloc->payment->date ?? null;
            });

            if ($allocations->isNotEmpty()) {
                $lastPaymentDate = $allocations->first()->payment->date;
            }

            if (!$lastPaymentDate) {
                $lastPaymentDate = $user->plan_added_date;
            }

            if (!$lastPaymentDate) {
                continue; // Cannot determine when to bill
            }

            $intervalMonths = $user->plan->type === 'monthly' ? 1 : 12;
            $nextBillingDate = \Carbon\Carbon::parse($lastPaymentDate)->addMonths($intervalMonths)->startOfDay();

            if (now()->startOfDay()->gte($nextBillingDate)) {
                DB::transaction(function () use ($user) {
                    $payment = Payment::create([
                        'date' => now(),
                        'amount' => $user->plan->amount,
                        'from_user_id' => 4, // Company pays (as requested)
                        'by_user_id' => 4, // Assuming system/company
                        'description' => 'Recurring ' . $user->plan->type . ' subscription charge for ' . $user->plan->name,
                    ]);

                    $payment->details()->create([
                        'to_user_id' => $user->id,
                        'amount' => $user->plan->amount,
                        'remaining_balance' => $user->plan->amount,
                    ]);

                    $user->notify(new PlanRenewed($payment, $user->plan));
                });
                
                $renewedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Checked users and renewed {$renewedCount} plans."
        ]);
    }
}
