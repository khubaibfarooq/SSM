<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['name', 'type', 'amount', 'product_id'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
