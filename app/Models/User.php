<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
    ];
    public static $roleDetails = [
        'super' =>'Super Admin',
        'central' => 'Merkez',
        'central_salesman' =>'Merkez Satış Elemanı',
        'central_contact' =>'Merkez İletişim Elemanı',
        'central_worker' =>'Merkez Çalışanı',
        'admin' => 'Bayi',
        'worker' => 'Çalışan',
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function getAllWorkers()
    {
        return User::where('role', 'worker')->where('id', '!=', auth()->id())->orderBy('id', 'desc')->get()->map(function ($worker) {
            if (!str_contains($worker['avatar'], 'http')) {
                $worker['avatar'] = asset('storage/' . $worker['avatar']);
            }
            $worker['dealer'] = $worker->dealer();
            return $worker;
        });
    }
    public static function getCentralUsers($withRolesArray = false)
    {
        $users = User::whereIn('role', ['central','central_salesman','central_contact','central_worker'])->where('id', '!=', auth()->id())->orderBy('id', 'desc')->get()->map(function ($centralUser) {
            if (!str_contains($centralUser['avatar'], 'http')) {
                $centralUser['avatar'] = asset('storage/' . $centralUser['avatar']);
            }
            $centralUser->role_label = self::$roleDetails[$centralUser->role];
            return $centralUser;
        });
        $roles = [];
        foreach(self::$roleDetails as $role => $roleLabel){
            $roles[] = [
                'role' => $role,
                'label' => $roleLabel,
            ];
        }

        if($withRolesArray){
            return [
                'users' => $users,
                'roles' => $roles,
            ];
        }else{
            return $users;
        }
    }

    public function dealer()
    {
        if($this->role == "worker"){
            $dealer = User::find($this->parent_id);
            if($dealer) {
                $dealer->company = $dealer->company();
                return $dealer;
            }else{
                return $dealer;
            }
        }else{
            return (object) [];
        }
    }
    public function workers()
    {
        if($this->role == "admin"){
            return User::where('role', 'worker')->where('parent_id', $this->id)->orderBy('id','desc')->get()->map(function($worker){
                if (!str_contains($worker['avatar'], 'http')) {
                    $worker['avatar'] = asset('storage/' . $worker['avatar']);
                }
                return $worker;
            });
        }else{
            return (object) [];
        }
    }

    public function roleLabel()
    {

        return $this->name." - ".self::$roleDetails[$this->role];
    }

    public function company()
    {
        if($this->role == "admin") {
            $details = DealerDetails::where('user_id', $this->id)->first();
            if($details) {
                $details->company_logo = asset('storage/'.$details->company_logo);
                return $details;
            }else{
                return (object) [
                    'company_name' => '',
                    'company_phone' => '',
                    'company_email' => '',
                    'company_country' => '',
                    'company_city' => '',
                    'company_district' => '',
                    'company_zip' => '',
                    'company_address' => '',
                ];
            }
        }else{
            return (object) [];
        }
    }

    public function getStockRecords()
    {
        if($this->role == "admin") {
            $records = StockRecords::where('dealer_id', $this->id)->orderBy('id','desc')->get();
            $productQuantities = [];
            $productIds = [];
            foreach ($records as $record) {
                if(isset($productQuantities[$record->status][$record->product_id])){
                    $productQuantities[$record->status][$record->product_id] += $record->quantity;
                }else{
                    $productQuantities[$record->status][$record->product_id] = $record->quantity;
                }
                if(!in_array($record->product_id, $productIds)){
                    $productIds[] = $record->product_id;
                }
            }
            $products = Products::whereIn('id', $productIds)->get()->toArray();
            $productList = [
                'divided' => [],
                'all' => [],
            ];

            foreach($productQuantities as $status => $productQuantity){
                foreach($productQuantity as $productId => $quantity){
                    $product = $products[array_search($productId, array_column($products, 'id'))];
                    if($product){
                        if(!isset($product['quantity'])){
                            $product['quantity'] = $quantity;
                        }else{
                            $product['quantity'] += $product['quantity'];
                        }
                        if($product['image'] && !str_contains($product['image'], 'http')){
                            $product['image'] = asset('storage/'.$product['image']);
                        }
                        $productList['divided'][$status][] = $product;
                        // $productList['all'] but add quantity
                        if(isset($productList['all'][$product['sku']])){
                            $productList['all'][$product['sku']]['quantity'] += $quantity;
                        }else{
                            $productList['all'][$product['sku']] = $product;
                            $productList['all'][$product['sku']]['quantity'] = $quantity;
                        }

                    }
                }
            }
            return $productList;
        }else{
            return (object) [];
        }
    }

    public function customers()
    {
        if($this->role == "admin"){
            return Customers::where('dealer_id',$this->id)->orderBy('id','desc')->get()->map(function($customer){
                $customer->dealer = User::find($customer->dealer_id);
                $customer->dealer->company = $customer->dealer->company();
                if($customer->worker_id != null) $customer->worker = User::find($customer->worker_id);
                else $customer->worker = (object) [];
                return $customer;
            });
        }else{
            return (object) [];
        }
    }
}
