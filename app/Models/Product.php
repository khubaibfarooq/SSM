<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'description'];

    public function plans()
    {
        return $this->hasMany(Plan::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}