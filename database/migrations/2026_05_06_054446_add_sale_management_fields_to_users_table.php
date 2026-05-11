<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('address')->nullable();
            $table->string('contact')->nullable();
            $table->string('business_name')->nullable();
            $table->enum('type', ['client', 'salesman', 'account'])->default('client');
            $table->foreignId('plan_id')->nullable()->constrained('plans')->onDelete('set null');
            $table->date('plan_added_date')->nullable();
            $table->decimal('balance', 12, 2)->default(0.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn([
                'address', 
                'contact', 
                'business_name', 
                'type', 
                'plan_id', 
                'plan_added_date', 
                'balance'
            ]);
        });
    }
};
