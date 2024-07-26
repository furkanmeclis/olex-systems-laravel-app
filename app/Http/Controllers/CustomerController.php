<?php

namespace App\Http\Controllers;

use App\Models\Customers;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index($hash): \Inertia\Response
    {
        $customerId = Crypt::decrypt($hash);
        $customer = Customers::find($customerId);
        request()->session()->put('manifest',$customerId);
        return Inertia::render('Customer/Index',[
            'customerB' => $customer,
            'hash' => Crypt::encrypt($customerId)
        ]);
    }

    public function update($hash)
    {
        try {
            $customerId = Crypt::decrypt($hash);
            $customer = Customers::find($customerId);
            if ($customer) {
                $action = request()->get('action');
                if ($action == "token") {
                    $customer->player_id = request()->input('player_id');
                    if ($customer->save()) {
                        return response()->json(['message' => 'Bildirimler Açıldı Token Güncellendi', 'status' => true, 'customer' => $customer]);
                    } else {
                        return response()->json(['message' => 'Bildirimler Açılamadı Token Güncellenemedi', 'status' => false]);
                    }
                } elseif ($action == "settings") {
                    $default = [
                        "sms" => false,
                        "email" => false,
                        "push" => false,
                    ];
                    $notificationSettings = json_decode(request()->get('settings'), true);
                    if ($notificationSettings) {
                        foreach ($notificationSettings as $key) {
                            if (array_key_exists($key, $default)) $default[$key] = true;
                        }
                    }
                    $customer->notification_settings = json_encode($default);
                    if ($customer->save()) {
                        return response()->json(['message' => 'Müşteri Tercihleri Güncellendi', 'status' => true, 'customer' => $customer]);
                    } else {
                        return response()->json(['message' => 'Müşteri Tercihleri Güncellenemedi', 'status' => false]);
                    }
                }else{
                    return response()->json(['message' => 'Geçersiz İşlem', 'status' => false]);
                }
            } else {
                return response()->json(['message' => 'Müşteri Bulunamadı Lütfen URL İle Oynamayınız.', 'status' => false]);
            }
        }catch (\Exception $e){
            return response()->json(['message' => 'Müşteri Bulunamadı Lütfen URL İle Oynamayınız.', 'status' => false,'error'=>$e->getMessage()]);
        }
    }
}
