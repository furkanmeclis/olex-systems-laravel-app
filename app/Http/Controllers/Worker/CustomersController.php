<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Customers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Worker/Customers/Index',[
            'customersAll' => Customers::getCustomersForDealer()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $customer = new Customers();
        $customer->name = $request->get('name');
        $customer->email = $request->get('email');
        $customer->phone = $request->get('phone');
        $customer->address = $request->get('address');
        $default = [
            "sms" => false,
            "email" => false,
            "push" => false,
        ];
        $notificationSettings = json_decode($request->get('notification_settings'),true);
        if($notificationSettings) {
            foreach ($notificationSettings as $key) {
                if(array_key_exists($key,$default)) $default[$key] = true;
            }
        }
        $customer->notification_settings = json_encode($default);
        $dealer_id = auth()->user()->parent_id;
        $customer->dealer_id = $dealer_id;
        $customer->worker_id = auth()->user()->id;
        if ($customer->save()) {
            \Illuminate\Support\Facades\Mail::to($customer->email)->send(new \App\Mail\SubscribeWebPushMail($customer));
            return response()->json(['message' => 'Müşteri başarıyla eklendi.', 'status' => true, 'customers' => Customers::getCustomersForDealer()]);
        } else {
            return response()->json(['message' => 'Müşteri eklenirken bir hata oluştu.', 'status' => false]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
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
                return response()->json(['message' => 'Müşteri başarıyla güncellendi.', 'status' => true, 'customers' => Customers::getCustomersForDealer()]);
            } else {
                return response()->json(['message' => 'Müşteri güncellenirken bir hata oluştu.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Müşteri bulunamadı.'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function getAll()
    {
        return response()->json(['customers' => Customers::getCustomersForDealer()]);
    }
}
