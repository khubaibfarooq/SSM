<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Task::with(['assignee', 'assigner'])->latest();
$staff="";
        if ($user->hasRole(['admin', 'superadmin'])) {
            $staff=User::role(['Staff', 'Manager', 'manager', 'admin', 'superadmin'])->get(['id', 'name']);
            // Admin and superadmin see all tasks.
        } elseif ($user->hasRole('Manager')) {
            $staff=User::role(['Staff'])->get(['id', 'name']);
            // Manager sees tasks they assigned or tasks assigned to them
            $query->where(function($q) use ($user) {
                $q->where('assigned_by', $user->id)
                  ->orWhere('assigned_to', $user->id);
            });
        } else {
            $staff = collect([]);
            // Staff only see tasks assigned to them
            $query->where('assigned_to', $user->id);
        }

        // Apply Filters
        if (request()->filled('staff_id')) {
            $query->where('assigned_to', request('staff_id'));
        }
        if (request()->filled('status')) {
            $query->where('status', request('status'));
        }
        if (request()->filled('start_date')) {
            $query->whereDate('due_date', '>=', request('start_date'));
        }
        if (request()->filled('end_date')) {
            $query->whereDate('due_date', '<=', request('end_date'));
        }

        return Inertia::render('Tasks/Index', [
            'tasks' => $query->get(),
            'staff' => $staff,
            'filters' => request()->only(['staff_id', 'status', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $validated['assigned_by'] = auth()->id();
        $validated['status'] = 'pending';

        Task::create($validated);

        return back()->with('success', 'Task assigned successfully.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,approved',
        ]);

        $user = auth()->user();

        // Bypass restrictions for admins
        if (!$user->hasRole(['admin', 'superadmin'])) {
            // Staff restriction
            if ($user->hasRole('staff')) {
                if ($validated['status'] !== 'completed') {
                    abort(403, 'Staff can only mark tasks as completed.');
                }
            }

            // Action-based restrictions for non-admins
            if ($validated['status'] === 'completed') {
                if ($task->assigned_to !== $user->id && $task->assigned_by !== $user->id) {
                    abort(403, 'You can only mark your own tasks as completed.');
                }
            } elseif ($validated['status'] === 'approved') {
                if ($task->assigned_by !== $user->id) {
                    abort(403, 'You can only approve tasks you assigned.');
                }
            }
        }

        $task->update(['status' => $validated['status']]);

        return back()->with('success', 'Task status updated.');
    }
}
