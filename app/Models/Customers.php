<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customers extends Model
{
    use HasFactory;

    public static function getCustomersForDealer()
    {
        $dealer_id = null;
        if (auth()->user()->role == 'dealer') {
            $dealer_id = auth()->user()->id;
        } else {
            $dealer_id = auth()->user()->parent_id;
        }
        return Customers::where('dealer_id', $dealer_id)->orderBy('id','desc')->get()->map(function($customer){
        $customer->dealer = User::find($customer->dealer_id);
        $customer->dealer->company = $customer->dealer->company();
        if($customer->worker_id != null) $customer->worker = User::find($customer->worker_id);
        else $customer->worker = (object) [];
        return $customer;
    });
    }
}
