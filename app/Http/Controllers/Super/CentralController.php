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

class CentralController extends \App\Http\Controllers\Controller
{
    public function getAllUsers($withRolesArray = false)
    {
        return User::getCentralUsers($withRolesArray);
    }

    public function index(): \Inertia\Response
    {
        $users = $this->getAllUsers(true);
        $roles = [];
        foreach ($users['roles'] as $user) {
            if(str_contains($user['role'],'central')){
                $roles[] = [
                    'role' => $user['role'],
                    'label' => $user['label'],
                ];
            }
        }
        $users = $users['users'];
        return Inertia::render('Super/Central/Index', [
            'usersAll' => $users,
            'roles' => $roles
        ]);
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
        $centralUser = new User();
        $centralUser->name = $request->get('name');
        $centralUser->email = $request->get('email');
        $centralUser->phone = $request->get('phone');
        $centralUser->role = $request->get('role');
        $centralUser->password = Hash::make($request->get('password'));
        $centralUser->active = $request->get('active') == 'true' ? 1 : 0;
        if (request()->hasFile('image')) {
            $centralUser->avatar = str_replace('public/', '', request()->file('image')->store('public/avatars'));
        } else {
            $centralUser->avatar = 'avatars/default.png';
        }
        if ($centralUser->save()) {
            return response()->json(['message' => 'Merkez üyesi başarıyla eklendi.', 'status' => true, 'users' => $this->getAllUsers(), 'dealer_id' => $centralUser->id]);
        } else {
            //delete image
            if (request()->hasFile('image')) {
                unlink(storage_path('app/' . $centralUser->avatar));
            }
            return response()->json(['message' => 'Merkez üyesi eklenirken bir hata oluştu.', 'status' => false]);
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

        $centralUser = User::find($id);

        if ($centralUser) {
            $centralUser->name = $request->get('name');
            $centralUser->email = $request->get('email');
            $centralUser->phone = $request->get('phone');
            $centralUser->role = $request->get('role');
            $centralUser->active = $request->get('active') == 'true' ? 1 : 0;
            if ($request->hasFile('image')) {
                if ($centralUser->avatar != 'avatars/default.png' && file_exists(storage_path('app/public/' . $centralUser->avatar))) {
                    unlink(storage_path('app/public/' . $centralUser->avatar));
                }
                $centralUser->avatar = str_replace('public/', '', $request->file('image')->store('public/avatars'));
            }
            if ($request->get('reset_password') == 1) {
                $centralUser->password = Hash::make($request->get('password'));
            }
            if ($centralUser->save()) {
                return response()->json(['message' => 'Merkez üyesi başarıyla güncellendi.', 'status' => true, 'users' => $this->getAllUsers()]);
            } else {
                return response()->json(['message' => 'Merkez üyesi güncellenirken bir hata oluştu.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Merkez üye bulunamadı.'], 404);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $centralUser = User::find($id);
        if ($centralUser) {
            $image = $centralUser->avatar;
            if ($centralUser->delete()) {
                if ($image != 'avatars/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
                return response()->json(['message' => 'Merkez üyesi başarıyla silindi.']);
            } else {
                return response()->json(['message' => 'Merkez üyesi silinirken bir hata oluştu.'], 500);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Merkez üyesi bulunamadı.'], 404);
        }
    }

    public function multipleDestroy()
    {
        $centralUserIds = request()->get('workerIds');
        $centralUsersCount = User::whereIn('id', $centralUserIds)->count();
        $centralUsersImages = User::whereIn('id', $centralUserIds)->get()->map(function ($centralUser) {
            return $centralUser->avatar;
        });

        if (User::whereIn('id', $centralUserIds)->delete()) {
            foreach ($centralUsersImages as $image) {
                if ($image != 'avatars/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
            }
            return response()->json(['message' => $centralUsersCount . ' Merkez üyesi başarıyla silindi']);
        } else {
            return response()->json(['message' => 'Merkez üyesi silinirken bir hata oluştu.'], 404);
        }
    }

}

