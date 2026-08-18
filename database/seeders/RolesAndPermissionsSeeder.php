<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $superAdminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $clientRole = Role::firstOrCreate(['name' => 'client']);

        // Create some default permissions
        $permissions = [
            'manage roles',
            'manage users',
            'manage settings',
            'manage plans',
            'manage visits',
            'manage payments'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign some permissions to admin (superadmin bypasses this via Gate)
        $adminRole->givePermissionTo(['manage users']);

        // Create default superadmin user
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'contact' => '1234567890',
                'business_name' => 'System Admin',
                'type' => 'staff'
            ]
        );

        $superadmin->assignRole('superadmin');
    }
}
