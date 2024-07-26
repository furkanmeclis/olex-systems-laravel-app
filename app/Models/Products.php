<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;

    public function getCodes()
    {
        $codes = ProductCode::where('product_id', $this->id)->orderBy('id','desc')->get()->map(function($code){
            $code->worker = (object) [];
            if($code->worker_id){
                $code->worker = User::find($code->worker_id);
            }
            if($code->dealer_id){
                $code->dealer = User::find($code->dealer_id);
            }
            return $code;
        });
        return $codes;
    }
}
