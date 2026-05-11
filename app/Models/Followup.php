<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Followup extends Model
{
    protected $fillable = ['user_id', 'by_user_id', 'date', 'next_date', 'description'];

    protected $casts = [
        'date' => 'datetime',
        'next_date' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'user_id')->where('type', 'client');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'by_user_id')->where('type', 'staff');
    }
}
