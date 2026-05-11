<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
        'balance',
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

    public function followups()
    {
        return $this->hasMany(Followup::class, 'user_id');
    }

    public function assignedFollowups()
    {
        return $this->hasMany(Followup::class, 'by_user_id');
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
}
