<?php

namespace App\Http\Controllers;

use App\Models\Followup;
use App\Models\User;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class FollowupController extends Controller
{
    public function index()
    {
        return Inertia::render('Followups/Index', [
            'followups' => Followup::with(['client', 'staff'])->latest()->get(),
            'clients' => User::where('type', 'client')->get(),
            'staff' => User::where('type', 'staff')->get(),
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
        ]);

        Followup::create($validated);

        return back()->with('success', 'Followup logged successfully.');
    }
}
