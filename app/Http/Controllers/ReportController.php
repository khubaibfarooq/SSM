<?php

namespace App\Http\Controllers;

use App\Models\Followup;
use App\Models\User;
use App\Models\Product;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Followup::with(['client.product', 'staff']);

        if ($request->filled('staff_id')) {
            $query->where('by_user_id', $request->staff_id);
        }

        if ($request->filled('client_id')) {
            $query->where('user_id', $request->client_id);
        }

        if ($request->filled('product_id')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        if ($request->filled('area_id')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('area_id', $request->area_id);
            });
        } elseif ($request->filled('zone_id')) {
            $query->whereHas('client.area', function ($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $query->orderBy('date', 'desc');

        $followups = $query->get();

        // Fetch clients and staff for filters
        $clients = User::role(['Client', 'client'])->get(['id', 'name']);
        $staff = User::role(['Staff', 'staff', 'Manager', 'manager', 'admin', 'superadmin'])->get(['id', 'name']);
        $products = Product::all(['id', 'name']);
        $zones = Zone::with('areas')->get();

        return Inertia::render('Reports/Index', [
            'followups' => $followups,
            'clients' => $clients,
            'staff' => $staff,
            'products' => $products,
            'zones' => $zones,
            'filters' => $request->only(['staff_id', 'client_id', 'product_id', 'zone_id', 'area_id', 'start_date', 'end_date'])
        ]);
    }
}
