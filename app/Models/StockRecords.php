<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockRecords extends Model
{
    use HasFactory;
    public function product()
    {
        $product = $this->belongsTo(Products::class, 'product_id')->first();
        if($this->order_id !== null){
            $product->codes = ProductCode::where('product_id', $product->id)->where('order_id',$this->order_id)->orderBy('id', 'desc')->get();
        }else{
            $product->codes = (object) [];
        }
        return $product;
    }

    public function dealer()
    {
        return $this->belongsTo(User::class, 'dealer_id')->first();
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')->first();
    }
}
