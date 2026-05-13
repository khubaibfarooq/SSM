<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentDetail extends Model
{
    protected $fillable = ['payment_id', 'to_user_id', 'amount', 'remaining_balance'];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
