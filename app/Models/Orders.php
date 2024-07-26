<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Orders extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'product_id',
        'dealer_id',
        'user_id',
        'status',
    ];

    protected static $statuses =  [
        ['value' => 'draft', 'label' => 'Taslak', 'severity' => 'help'],
        ['value' => 'pending','label' => 'Onaylandı','severity' => 'info'],
        ['value' => 'processing','label' => 'Hazırlanıyor','severity' => 'warning'],
        ['value' => 'completed','label' => 'Tamamlandı','severity' => 'success'],
        ['value' => 'cancelled','label' => 'İptal Edildi','severity' => 'danger'],
        ['value' => 'refunded','label' => 'İade Edildi','severity' => 'danger'],
    ];
    public static function getAllData($trashedData = false)
    {
        $statuses = self::$statuses;
        $instance = Orders::where('id','>','0');
        if ($trashedData) {
            $instance = $instance->onlyTrashed();
        }
        return $instance->orderBy('id','desc')->get()->map(function ($order) use ($statuses) {
            $order->dealer = $order->dealer();
            $price = 0;
            $order->products = OrderItems::where('order_id', $order->id)->get()->map(function ($item) use (&$price) {
                $item->product = $item->product();
                $price += $item->price * $item->quantity;
                //$item->codes = ProductCode::where('order_id', $item->order_id)->where('product_id', $item->product_id)->get();
                return $item;
            });
            $order->products_count = count($order->products);
            foreach ($statuses as $status) {
                if ($status['value'] == $order->status) {
                    $order->status_severity = $status['severity'];
                    $order->status_label = $status['label'];
                    break;
                }
            }
            $order->user = $order->user();
            $order->user_label = $order->user->roleLabel();
            $order->price = $price;
            return $order;
        });
    }

    public function getProducts()
    {
        return OrderItems::where('order_id', $this->id)->get()->map(function ($item) {
            $item->product = $item->product();
            return $item;
        });
    }

    public function dealer()
    {
        return User::find($this->dealer_id);
    }

    public function user()
    {
        return User::find($this->user_id);
    }

    public function getProductCodes()
    {
        return ProductCode::where('order_id', $this->id)->get();
    }
}
