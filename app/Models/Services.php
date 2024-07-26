<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Services extends Model
{
    use HasFactory;
    public $casts = [
        "car" => "array",
        "body" => "array",
        "status_history" => "array"
    ];
    public function addProducts($products)
    {
        $ignore = false;
        $error_message = '';
        foreach ($products as $product){
            try {
                $newProduct = new ServiceProducts();
                $newProduct->service_id = $this->id;
                $newProduct->product_id = $product->id;
                $newProduct->product_code = $product->code;
                if(!$newProduct->save()){
                    $ignore = true;
                }
            }catch (\Exception $e){
                $ignore = true;
                $error_message = $e->getMessage();
            }
        }
        return [ $ignore, $error_message];
    }

    public function getProducts()
    {
        return ServiceProducts::where('service_id', $this->id)->get()->map(/**
         * @throws \Exception
         */ function($product ) {
            $product->product = Products::find($product->product_id);
            $service = $this;
            if($service->status == "completed"){
                $implementationDate = new \DateTime($service->status_history['completed']['created_at']);
                $warrantyEndDate = new \DateTime($service->status_history['completed']['created_at']);
                $warrantyEndDate->modify('+'.str_replace(" yıl","",$product->product->warranty).' year');
                $now = new \DateTime();
                // not working on expired warranty

                if($now->format("U") < $warrantyEndDate->format("U")) { // not working on expired warranty

                    $interval = $implementationDate->diff($now);
                    $yearsPassed = $interval->y;
                    $product->warranty_text = str_replace(" yıl","",$product->product->warranty).' YIL / '.$yearsPassed.'.yıl';
                }else{
                    $product->warranty_text = "X - ".$warrantyEndDate->format('d.m.Y');
                }
            }else{
                $product->warranty_text = "Başlamadı";
            }


            return $product;
        });
    }

    public static function getServices()
    {
        $services = null;
        if(auth()->user()->role == 'worker'){
            $services = Services::where('worker_id', auth()->user()->id);
        }elseif(auth()->user()->role == 'dealer'){
            $services = Services::where('dealer_id', auth()->user()->id);
        }else{
            $services = Services::where('id','>', 0);
        }
        $services = $services->get()->map(function($service){
            $service->customer = Customers::find($service->customer_id);
            $service->worker = User::find($service->worker_id);
            $service->dealer = User::find($service->dealer_id);
            $service->products = $service->getProducts();
            return $service;
        });
    }

    public function dealer()
    {
        return User::find($this->dealer_id);
    }
}
