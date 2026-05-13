<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payment_details', function (Blueprint $table) {
            $table->decimal('remaining_balance', 12, 2)->default(0)->after('amount');
        });

        // Initialize remaining_balance from amount for existing records
        DB::table('payment_details')->update([
            'remaining_balance' => DB::raw('amount')
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('balance', 12, 2)->default(0)->after('type');
        });

        Schema::table('payment_details', function (Blueprint $table) {
            $table->dropColumn('remaining_balance');
        });
    }
};
