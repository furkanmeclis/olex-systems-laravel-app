<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Products;
use App\Models\StockRecords;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockManagamentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getStatuses(): array
    {
        return [
            ['value' => 'draft', 'label' => 'Taslak', 'severity' => 'help'],
            ['value' => 'confirmed', 'label' => 'Onaylandı', 'severity' => 'success'],
            ['value' => 'canceled', 'label' => 'İptal Edildi', 'severity' => 'danger'],
        ];
    }
    public function getAllRecords()
    {
        return StockRecords::where('id', '>', 0)->orderBy('id', 'desc')->get()->map(function ($record) {
            $record->product = $record->product();
            $record->dealer = $record->dealer();
            $record->user = $record->user();
            $statuses = $this->getStatuses();
            foreach ($statuses as $status) {
                if ($status['value'] == $record->status) {
                    $record->status_severity = $status['severity'];
                    $record->status_label = $status['label'];
                    break;
                }
            }
            return $record;
        });
    }



    public function index()
    {
        return Inertia::render('Super/Stock/Index', [
            'recordsAll' => $this->getAllRecords(),
            'dealersAll' => User::where('role', 'admin')->get(['id', 'name', 'email']),
            'productNames' => Products::where('active', true)->get(['id', 'name', 'sku']),
            "statuses" => $this->getStatuses(),
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
        //
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
        $record = StockRecords::find($id);
        if ($record) {

            $record->status = $request->status;
            if($request->status == 'confirmed'){
                $record->confirmed_at = now();
            }elseif($request->status == 'canceled'){
                $record->canceled_at = now();
            }elseif ($request->status == 'draft'){
                $record->drafted_at = now();
            }
            $record->quantity = $request->quantity;
            if ($record->save()) {
                return response()->json(['message' => 'Stok Kaydı başarıyla güncellendi.', "status" => true, 'records' => $this->getAllRecords()]);
            } else {
                return response()->json(['message' => 'Stok Kaydı güncellenirken bir hata oluştu.', "status" => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Stok Kaydı bulunamadı.'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
