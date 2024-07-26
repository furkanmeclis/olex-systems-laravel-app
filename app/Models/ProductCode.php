<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCode extends Model
{
    use HasFactory;

    public static function getAvailableCodes($orderId): array
    {
        $productIds = OrderItems::where('order_id', $orderId)->get()->pluck('product_id')->toArray();
        $query = ProductCode::where('location', 'central')->where('used', 0);
        if (count($productIds) > 0) {
            $query->whereIn('product_id', $productIds);
        }
        $codes = $query->get()->toArray();
        $codeIds = array_column($codes, 'id');
        $codes = [...$codes,...ProductCode::whereNotIn('id', $codeIds)->where('order_id', $orderId)->get()->toArray()];
        $returnData = [];

        foreach($productIds as $productId) {
            $returnData[$productId] = Products::find($productId)->toArray();
            $returnData[$productId]['codes'] = [];
        }
        foreach ($codes as $code) {
            $returnData[$code["product_id"]]['codes'][] = $code;
        }

        return $returnData;
    }

    public function product()
    {
        $product = Products::find($this->product_id);
        return $product;
    }
}
