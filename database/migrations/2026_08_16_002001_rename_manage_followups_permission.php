<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Check if old permission exists
        $permission = Permission::where('name', 'manage followups')->first();
        if ($permission) {
            $permission->name = 'manage visits';
            $permission->save();
        } else {
            // If it doesn't exist for some reason, just create it
            Permission::firstOrCreate(['name' => 'manage visits']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::where('name', 'manage visits')->first();
        if ($permission) {
            $permission->name = 'manage followups';
            $permission->save();
        }
    }
};
