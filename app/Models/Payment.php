<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['date', 'amount', 'from_user_id', 'by_user_id', 'description', 'img', 'client_id'];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    protected $casts = [
        'date' => 'datetime',
    ];

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function byUser()
    {
        return $this->belongsTo(User::class, 'by_user_id');
    }

    public function details()
    {
        return $this->hasMany(PaymentDetail::class);
    }
}
