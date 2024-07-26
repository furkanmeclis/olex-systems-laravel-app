<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Customers;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CustomersController extends Controller
{
    public function getAllCustomers($dealerId=false)
    {
        if($dealerId) $query = Customers::where('dealer_id',$dealerId);
        else $query = Customers::where('id','>','0');
        return $query->orderBy('id','desc')->get()->map(function($customer){
            $customer->dealer = User::find($customer->dealer_id);
            $customer->dealer->company = $customer->dealer->company();
            if($customer->worker_id != null) $customer->worker = User::find($customer->worker_id);
            else $customer->worker = (object) [];
            return $customer;
        });
    }
    public function index()
    {
        $customers = $this->getAllCustomers();
        return Inertia::render('Super/CustomersController/Index',[
            "customersAll" => $customers
        ]);
    }

    public function update($id)
    {
        //return response()->json(['message' => 'Müşteri güncelleme işlemi henüz yapılmadı.', 'data' => \request()->all(), 'status' => false]);
        $customer = Customers::find($id);
        $request = request();
        if ($customer) {
            $default = [
                "sms" => false,
                "email" => false,
                "push" => false,
            ];
            $customer->name = $request->get('name');
            $customer->email = $request->get('email');
            $customer->phone = $request->get('phone');
            $customer->address = $request->get('address');
            $customer->player_id = $request->get('player_id');
            $notificationSettings = json_decode($request->get('notification_settings'),true);
            if($notificationSettings) {
                foreach ($notificationSettings as $key) {
                    if(array_key_exists($key,$default)) $default[$key] = true;
                }
            }
            $customer->notification_settings = json_encode($default);


            if ($customer->save()) {
                return response()->json(['message' => 'Müşteri başarıyla güncellendi.', 'status' => true, 'customers' => $this->getAllCustomers()]);
            } else {
                return response()->json(['message' => 'Müşteri güncellenirken bir hata oluştu.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Müşteri bulunamadı.'], 404);
        }
    }
}
