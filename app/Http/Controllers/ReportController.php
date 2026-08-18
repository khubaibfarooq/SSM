<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\User;
use App\Models\Product;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $visitsQuery = Visit::with(['client.product', 'staff']);

        $user = auth()->user();
        $isManagerOrAdmin = $user->hasAnyRole(['Manager', 'manager', 'admin', 'superadmin']);

        if (!$isManagerOrAdmin) {
            $visitsQuery->where('by_user_id', $user->id);
        }

        if ($request->filled('staff_id')) {
            $visitsQuery->where('by_user_id', $request->staff_id);
        }

        if ($request->filled('client_id')) {
            $visitsQuery->where('user_id', $request->client_id);
        }

        if ($request->filled('product_id')) {
            $visitsQuery->whereHas('client', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        if ($request->filled('area_id')) {
            $visitsQuery->whereHas('client', function ($q) use ($request) {
                $q->where('area_id', $request->area_id);
            });
        } elseif ($request->filled('zone_id')) {
            $visitsQuery->whereHas('client.area', function ($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        if ($request->filled('start_date')) {
            $visitsQuery->whereDate('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $visitsQuery->whereDate('date', '<=', $request->end_date);
        }

        $visitsQuery->orderBy('date', 'desc');

        $visits = $visitsQuery->get();

        // Fetch clients and staff for filters
        $clients = User::role(['Client', 'client'])->get(['id', 'name']);
        $staff = User::role(['Staff', 'staff', 'Manager', 'manager', 'admin', 'superadmin'])->get(['id', 'name']);
        $products = Product::all(['id', 'name']);
        $zones = Zone::with('areas')->get();

        return Inertia::render('Reports/Index', [
            'visits' => $visits,
            'clients' => $clients,
            'staff' => $staff,
            'products' => $products,
            'zones' => $zones,
            'filters' => $request->only(['staff_id', 'client_id', 'product_id', 'zone_id', 'area_id', 'start_date', 'end_date'])
        ]);
    }
    public function calendar()
    {
        $clients = User::role(['Client', 'client'])->get(['id', 'name']);
        $staff = User::role(['Staff', 'staff', 'Manager', 'manager', 'admin', 'superadmin'])->get(['id', 'name']);

        return Inertia::render('Reports/Calendar', [
            'clients' => $clients,
            'staff' => $staff
        ]);
    }

    public function calendarEvents(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        $query = Visit::with(['staff', 'client']);
        
        $startStr = $start ? \Carbon\Carbon::parse($start)->toDateString() : null;
        $endStr = $end ? \Carbon\Carbon::parse($end)->toDateString() : null;

        $user = auth()->user();
        $isManagerOrAdmin = $user->hasAnyRole(['Manager', 'manager', 'admin', 'superadmin']);

        if (!$isManagerOrAdmin) {
            $query->where('by_user_id', $user->id);
        } elseif ($request->filled('staff_id')) {
            $query->where('by_user_id', $request->staff_id);
        }

        if ($request->filled('client_id')) {
            $query->where('user_id', $request->client_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'follow-up') {
                $query->whereNotNull('next_date');
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($startStr && $endStr) {
            $query->where(function($q) use ($startStr, $endStr) {
                $q->whereBetween('date', [$startStr, $endStr])
                  ->orWhereBetween('next_date', [$startStr, $endStr]);
            });
        }

        $visits = $query->get();
        $events = [];

        // 1. Regular Visits
        if ($request->status === 'follow-up') {
            $regularVisits = collect();
        } else {
            $regularVisits = $visits->filter(function($v) use ($startStr, $endStr) {
                if (!$v->date) return false;
                $d = $v->date->format('Y-m-d');
                return (!$startStr || $d >= $startStr) && (!$endStr || $d <= $endStr);
            });
        }

        $groupedRegular = $regularVisits->groupBy(function($visit) {
            return $visit->date->format('Y-m-d');
        })->map(function($dateGroup) {
            return $dateGroup->groupBy('by_user_id');
        });

        foreach ($groupedRegular as $date => $staffGroups) {
            foreach ($staffGroups as $staffId => $staffVisits) {
                $staffName = $staffVisits->first()->staff->name ?? 'Unknown';
                $total = $staffVisits->count();
                $pending = $staffVisits->where('status', 'pending')->count();
                $completed = $staffVisits->where('status', 'completed')->count();
                $approved = $staffVisits->where('status', 'approved')->count();

                $title = "{$staffName}: {$total} (P:{$pending}, C:{$completed}, App:{$approved})";
                
                $className = 'bg-primary-subtle text-primary';
                if ($total == $approved) {
                    $className = 'bg-success-subtle text-success';
                } elseif ($pending > 0) {
                    $className = 'bg-warning-subtle text-warning';
                } elseif ($completed > 0) {
                    $className = 'bg-info-subtle text-info';
                }

                $events[] = [
                    'id' => "{$date}-{$staffId}",
                    'title' => $title,
                    'start' => $date,
                    'allDay' => true,
                    'className' => $className,
                    'visits' => $staffVisits->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'by_user_id' => $v->by_user_id,
                            'user_id' => $v->user_id,
                            'client_name' => $v->client->name ?? 'Unknown Client',
                            'status' => $v->status,
                            'description' => $v->description,
                            'next_date' => $v->next_date ? $v->next_date->format('Y-m-d') : null,
                        ];
                    })->values()->toArray()
                ];
            }
        }

        // 2. Follow-up Visits
        if ($request->filled('status') && $request->status !== 'follow-up') {
            $followupVisits = collect();
        } else {
            $followupVisits = $visits->filter(function($v) use ($startStr, $endStr) {
                if (!$v->next_date) return false;
                $nd = $v->next_date->format('Y-m-d');
                return (!$startStr || $nd >= $startStr) && (!$endStr || $nd <= $endStr);
            });
        }

        $groupedFollowups = $followupVisits->groupBy(function($visit) {
            return $visit->next_date->format('Y-m-d');
        })->map(function($dateGroup) {
            return $dateGroup->groupBy('by_user_id');
        });

        foreach ($groupedFollowups as $date => $staffGroups) {
            foreach ($staffGroups as $staffId => $staffVisits) {
                $staffName = $staffVisits->first()->staff->name ?? 'Unknown';
                $total = $staffVisits->count();
                
                $title = "{$staffName}: {$total} Follow-up(s)";
                $className = 'bg-warning-subtle text-warning'; // Yellow

                $events[] = [
                    'id' => "followup-{$date}-{$staffId}",
                    'title' => $title,
                    'start' => $date,
                    'allDay' => true,
                    'className' => $className,
                    'visits' => $staffVisits->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'by_user_id' => $v->by_user_id,
                            'user_id' => $v->user_id,
                            'client_name' => $v->client->name ?? 'Unknown Client',
                            'status' => 'follow-up', // Display as follow-up in modal
                            'description' => $v->description,
                            'next_date' => $v->next_date ? $v->next_date->format('Y-m-d') : null,
                        ];
                    })->values()->toArray()
                ];
            }
        }

        return response()->json($events);
    }
}
