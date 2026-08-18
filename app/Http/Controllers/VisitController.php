<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\User;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isManagerOrAdmin = $user->hasAnyRole(['Manager', 'manager', 'admin', 'superadmin']);

        $visitsQuery = Visit::with(['client', 'staff', 'assignee', 'completer', 'approver'])->latest();
        
        if (!$isManagerOrAdmin) {
            $visitsQuery->where('by_user_id', $user->id);
        }

        return Inertia::render('Visits/Index', [
            'visits' => $visitsQuery->get(),
            'clients' => User::role(['Client', 'client'])->get(),
            'staff' => User::role(['Staff', 'staff', 'Manager', 'manager', 'admin', 'superadmin'])->get(),
        ]);
    }

    public function store(HttpRequest $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'by_user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'next_date' => 'nullable|date',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'nullable|in:pending,completed,approved,rejected',
            'completed_followup_id' => 'nullable|exists:visits,id',
        ]);

        $status = $validated['status'] ?? 'pending';
        $validated['status'] = $status;

        if ($status === 'completed') {
            $validated['completed_by'] = auth()->id();
            $validated['completed_at'] = now();
        }

        $visit = Visit::create(collect($validated)->except('completed_followup_id')->toArray());

        if ($request->filled('completed_followup_id')) {
            Visit::where('id', $request->completed_followup_id)->update(['next_date' => null]);
        }

        return back()->with('success', 'Visit logged successfully.');
    }

    public function updateStatus(HttpRequest $request, Visit $visit)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,approved,rejected',
            'next_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $user = auth()->user();

        $updateData = ['status' => $validated['status']];

        if ($request->has('next_date')) {
            $updateData['next_date'] = $validated['next_date'];
        }

        if ($request->has('description')) {
            $updateData['description'] = $validated['description'];
        }

        if ($validated['status'] === 'completed') {
            $updateData['completed_by'] = $user->id;
            $updateData['completed_at'] = now();
        } elseif ($validated['status'] === 'approved') {
            $updateData['approved_by'] = $user->id;
            $updateData['approved_at'] = now();
        }

        $visit->update($updateData);

        return back()->with('success', 'Visit status updated.');
    }
}
