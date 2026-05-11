<?php

namespace App\Http\Controllers;

use App\Models\Plan;
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
}
