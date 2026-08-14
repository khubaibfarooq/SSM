<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $zones = Zone::with('areas')->get();
        return Inertia::render('Locations/Index', [
            'zones' => $zones
        ]);
    }

    public function storeZone(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        Zone::create($request->all());
        return back()->with('success', 'Zone created successfully');
    }

    public function updateZone(Request $request, Zone $zone)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $zone->update($request->all());
        return back()->with('success', 'Zone updated successfully');
    }

    public function destroyZone(Zone $zone)
    {
        $zone->delete();
        return back()->with('success', 'Zone deleted successfully');
    }

    public function storeArea(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'zone_id' => 'required|exists:zones,id'
        ]);
        Area::create($request->all());
        return back()->with('success', 'Area created successfully');
    }

    public function updateArea(Request $request, Area $area)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'zone_id' => 'required|exists:zones,id'
        ]);
        $area->update($request->all());
        return back()->with('success', 'Area updated successfully');
    }

    public function destroyArea(Area $area)
    {
        $area->delete();
        return back()->with('success', 'Area deleted successfully');
    }
}
