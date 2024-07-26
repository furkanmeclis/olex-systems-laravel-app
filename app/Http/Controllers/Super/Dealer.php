<?php

namespace App\Http\Controllers\Super;

use App\Models\Categories;
use App\Models\DealerDetails;
use App\Models\Products;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class Dealer extends \App\Http\Controllers\Controller
{
    public function getAllDealers()
    {
        return User::where('role', 'admin')->where('id', '!=', auth()->id())->orderBy('id', 'desc')->get()->map(function ($dealer) {
            if (!str_contains($dealer['avatar'], 'http')) {
                $dealer['avatar'] = asset('storage/' . $dealer['avatar']);
            }
            return $dealer;
        });
    }

    public function index(): \Inertia\Response
    {
        return Inertia::render('Super/Dealers/Index', [
            'dealersAll' => $this->getAllDealers(),

        ]);
    }

    public function listAll()
    {
        return response()->json(['dealers' => User::where('role', 'admin')->where('id', '!=', auth()->id())->orderBy('id', 'desc')->get(['id', 'name', 'email', 'phone'])]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $controlEmail = User::where('email', $request->get('email'))->first();
        if ($controlEmail) {
            return response()->json(['message' => 'Bu e-posta adresi zaten kullanımda.Lütfen başka bir mail adresi giriniz.', 'status' => false]);
        }
        $dealer = new User();
        $dealer->name = $request->get('name');
        $dealer->email = $request->get('email');
        $dealer->phone = $request->get('phone');
        $dealer->role = 'admin';
        $dealer->password = Hash::make($request->get('password'));
        $dealer->active = $request->get('active') == 'true' ? 1 : 0;
        if (request()->hasFile('image')) {
            $dealer->avatar = str_replace('public/', '', request()->file('image')->store('public/avatars'));
        } else {
            $dealer->avatar = 'avatars/default.png';
        }
        if ($dealer->save()) {
            return response()->json(['message' => 'Bayi başarıyla eklendi.', 'status' => true, 'dealers' => $this->getAllDealers(), 'dealer_id' => $dealer->id]);
        } else {
            //delete image
            if (request()->hasFile('image')) {
                unlink(storage_path('app/' . $dealer->avatar));
            }
            return response()->json(['message' => 'Bayi eklenirken bir hata oluştu.', 'status' => false]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dealer = User::where('id', $id)->first();
        $subRoute = request()->get('subRoute') ?? 'profile';
        if ($dealer) {
            $props = [
                'dealer' => $dealer,
                'subRoute' => $subRoute,
            ];
            if($subRoute == 'profile'){
                $props['company'] = $dealer->company();
            }elseif ($subRoute == 'workers'){
                $props['workers'] = $dealer->workers();
            }elseif ($subRoute == 'stock-records'){
                $props['stockRecords'] = $dealer->getStockRecords();
            }elseif($subRoute == 'customers') {
                $props['customers'] = $dealer->customers();
            }
            return Inertia::render('Super/Dealers/Show', $props);
        } else {
            return Redirect::route('super.dealers.index')->with('error', 'Bu Id\'ye sahip bir Bayi bulunamadı.');
        }
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

        $dealer = User::find($id);
        if ($dealer) {
            $dealer->name = $request->get('name');
            $dealer->email = $request->get('email');
            $dealer->phone = $request->get('phone');
            $dealer->active = $request->get('active') == 'true' ? 1 : 0;
            if ($request->hasFile('image')) {
                if ($dealer->avatar != 'avatars/default.png' && file_exists(storage_path('app/public/' . $dealer->avatar))) {
                    unlink(storage_path('app/public/' . $dealer->avatar));
                }
                $dealer->avatar = str_replace('public/', '', $request->file('image')->store('public/avatars'));
            }
            if ($request->get('reset_password') == 1) {
                $dealer->password = Hash::make($request->get('password'));
            }
            if ($dealer->save()) {
                return response()->json(['message' => 'Bayi başarıyla güncellendi.', 'status' => true, 'dealers' => $this->getAllDealers()]);
            } else {
                return response()->json(['message' => 'Bayi güncellenirken bir hata oluştu.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Bayi bulunamadı.'], 404);
        }
    }

    public function updateDetails(Request $request, $id)
    {
        $dealer = User::find($id);
        if($dealer){
            $details = DealerDetails::where('user_id', $dealer->id)->first();
            if(!$details){
                $details = new DealerDetails();
                $details->user_id = $dealer->id;
            }
            if($request->has('action') && $request->get('action') == 'logo'){
                if($details->logo != 'logos/default.png' && $details->logo !=null && $details->logo!="" && file_exists(storage_path('app/public/' . $details->logo))){
                    unlink(storage_path('app/public/' . $details->logo));
                }
                $details->company_logo = str_replace('public/', '', $request->file('logo')->store('public/logos'));
            }else{
                $details->company_name = $request->get('company_name');
                $details->company_phone = $request->get('company_phone');
                $details->company_email = $request->get('company_email');
                $details->company_country = $request->get('company_country');
                $details->company_city = $request->get('company_city');
                $details->company_district = $request->get('company_district');
                $details->company_zip = $request->get('company_zip');
                $details->company_address = $request->get('company_address');
            }
            if($details->save()) {
                $details->company_logo = asset('storage/' . $details->company_logo);
                return response()->json(['message' => 'Bayi detayları başarıyla güncellendi.', 'status' => true,'details'=>$details]);
            }else{
                return response()->json(['message' => 'Bayi detayları güncellenirken bir hata oluştu.', 'status' => false]);
            }
        }else{
            return response()->json(['message' => 'Bu Id\'ye sahip bir Bayi bulunamadı.','status'=>false]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dealer = User::find($id);
        if ($dealer) {
            $image = $dealer->avatar;
            if ($dealer->delete()) {
                if ($image != 'avatars/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
                return response()->json(['message' => 'Bayi başarıyla silindi.']);
            } else {
                return response()->json(['message' => 'Bayi silinirken bir hata oluştu.'], 500);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Bayi bulunamadı.'], 404);
        }
    }

    public function multipleDestroy()
    {
        $dealerIds = request()->get('dealerIds');
        $dealersCount = User::whereIn('id', $dealerIds)->count();
        $dealersImages = User::whereIn('id', $dealerIds)->get()->map(function ($dealer) {
            return $dealer->avatar;
        });

        if (User::whereIn('id', $dealerIds)->delete()) {
            foreach ($dealersImages as $image) {
                if ($image != 'avatars/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
            }
            return response()->json(['message' => $dealersCount . ' bayi başarıyla silindi']);
        } else {
            return response()->json(['message' => 'Bayiler silinirken bir hata oluştu.'], 404);
        }
    }

}
