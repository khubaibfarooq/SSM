<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = \App\Models\Ticket::with(['creator', 'resolver', 'messages.sender'])->latest();

        if (!$user->hasRole(['admin', 'superadmin', 'Manager', 'manager'])) {
            $query->where('user_id', $user->id);
        }

        return inertia('Tickets/Index', [
            'tickets' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240', // 10MB max
        ]);

        $ticket = \App\Models\Ticket::create([
            'user_id' => auth()->id(),
            'subject' => $validated['subject'],
            'message' => $validated['message'] ?? '', // keeping for backward compatibility if needed, but it's redundant now
            'status' => 'pending',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments', 'public');
        }

        if (!empty($validated['message']) || $attachmentPath) {
            $ticket->messages()->create([
                'user_id' => auth()->id(),
                'message' => $validated['message'],
                'attachment_path' => $attachmentPath,
            ]);
        }

        return back()->with('success', 'Ticket created successfully.');
    }

    public function update(Request $request, \App\Models\Ticket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,resolved',
        ]);

        $user = auth()->user();
        
        if (!$user->hasRole(['admin', 'superadmin', 'Manager', 'manager'])) {
            abort(403, 'Unauthorized action.');
        }

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'resolved' && $ticket->status !== 'resolved') {
            $data['resolved_by'] = $user->id;
            $data['resolved_at'] = now();
        }

        $ticket->update($data);

        return back()->with('success', 'Ticket status updated successfully.');
    }

    public function storeMessage(Request $request, \App\Models\Ticket $ticket)
    {
        $validated = $request->validate([
            'message' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $user = auth()->user();

        // Ensure user has access to this ticket
        if (!$user->hasRole(['admin', 'superadmin', 'Manager', 'manager']) && $ticket->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments', 'public');
        }

        if (empty($validated['message']) && !$attachmentPath) {
            return back()->withErrors(['message' => 'Message or attachment is required.']);
        }

        $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
        ]);

        return back()->with('success', 'Message sent successfully.');
    }
}
