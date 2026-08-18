<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'contact',
        'business_name',
        'type',
        'plan_id',
        'plan_added_date',
        'area_id',
        'product_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'plan_added_date' => 'date',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'user_id');
    }

    public function assignedVisits()
    {
        return $this->hasMany(Visit::class, 'by_user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'from_user_id');
    }

    public function recordedPayments()
    {
        return $this->hasMany(Payment::class, 'by_user_id');
    }

    public function receivedAllocations()
    {
        return $this->hasMany(PaymentDetail::class, 'to_user_id');
    }

    protected $appends = ['balance'];

    public function getBalanceAttribute()
    {
        return $this->receivedAllocations()->sum('remaining_balance');
    }
}
