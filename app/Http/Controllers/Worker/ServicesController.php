<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Customers;
use App\Models\Products;
use App\Models\ServiceProducts;
use App\Models\Services;
use Barryvdh\DomPDF\Facade\Pdf;
use DateInterval;
use DateTime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public $defaultStatusHistoryString = '{"pending": {"created_at": null,"updated_at": null},"progress": {"created_at": null,"updated_at": null},"completed": {"created_at": null,"updated_at": null},"cancelled":{"created_at": null,"updated_at": null}}';

    public function index()
    {
        return Inertia::render('Worker/Services/Index',[
            'servicesAll' => []
        ]);
    }

    public function pdf()
    {
        Pdf::setOption(['dpi' => 150, 'defaultFont' => 'sans-serif', 'isRemoteEnabled' => true]);
        $pdf = PDF::loadView('services')->stream('hizmet.pdf');
        return $pdf;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Worker/Services/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $customer = Customers::find($request->input('customer_id'));
        if ($customer) {
            $products = [];
            foreach ($request->input('products') as $product) {
                $pr = Products::find($product['id']);
                if ($pr) {
                    $pr->code = $product['code'];
                    $products[] = $pr;
                }
            }
            if (count($products) > 0) {
                $carData = [
                    "brand" => $request->input('car_brand'),
                    "model" => $request->input('car_model'),
                    "generation" => $request->input('car_generation'),
                    "year" => $request->input('car_year'),
                    "plate" => $request->input('car_plate'),
                    "km" => $request->input('car_kilometer'),
                    "brand_logo" => $request->input('brand_logo'),
                ];
                $serviceNoControl = Services::where('service_no', $request->input('service_no'))->first();
                if ($serviceNoControl) {
                    return response()->json(['message' => 'Hizmet numarası zaten kullanımda.', 'status' => false]);
                }
                $newService = new Services();
                $newService->customer_id = $customer->id;
                $newService->car = $carData;
                if (auth()->user()->role == 'worker') {
                    $newService->worker_id = auth()->user()->id;
                    $newService->dealer_id = auth()->user()->parent_id;
                } elseif (auth()->user()->role == 'dealer') {
                    $newService->dealer_id = auth()->user()->id;
                }
                $newService->note = $request->input('notes');
                $newService->status = 'pending';
                $newService->body = $request->input('body');
                $status_history = json_decode($this->defaultStatusHistoryString, true);
                $status_history['pending']['created_at'] = now();
                $status_history['pending']['updated_at'] = now();
                $newService->status_history = json_encode($status_history);
                $newService->service_no = $request->input('service_no');

                if ($newService->save()) {
                    foreach ($products as $product) {
                        $newProduct = new ServiceProducts();
                        $newProduct->service_id = $newService->id;
                        $newProduct->product_id = $product->id;
                        $newProduct->product_code = $product->code;
                        if (!$newProduct->save()) {
                            $newService->delete();
                            return response()->json(['message' => 'Hizmet oluşturulurken bir hata oluştu.', 'status' => false]);
                        }
                    }
                    if($customer->player_id != null){
                        $token = $customer->player_id;
                        $company = $newService->dealer()->company();
                        $notify = new \App\Notifications\FirebaseNotification("OLEX® Films, Aracınız Teslim Alındı 🛞","Sayın $customer->name, $company->company_name şubemize bırakmış olduğunuz ".$carData["brand"]." ".$carData["model"]." ".$carData["year"]." Marka Model araç teslim alınmış, uygulama için hazırlıkları yapılmaktadır.",$token);
                        $notify->sendPushNotification();
                    }

                    return response()->json(['message' => 'Hizmet başarıyla oluşturuldu.', 'status' => true]);
                } else {
                    return response()->json(['message' => 'Hizmet oluşturulurken bir hata oluştu.', 'status' => false]);
                }

            } else {
                return response()->json(['message' => 'Ürün bulunamadı.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Müşteri bulunamadı.', 'status' => false]);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * @throws \Exception
     */
    public function pdfSourceDataService($idOrServiceNumber)
    {
        $service = Services::where('service_no', $idOrServiceNumber)->orWhere('id', $idOrServiceNumber)->first();
        /*
         * EXAMPLE FRONT END DATA
         * {
                brand:"Lamborghini",
                model:"Huracan",
                year:"2021",
                generation:"LP 610-4",
                brand_logo:"https://www.auto-data.net/img/logos2/Lamborghini.png",
                body_data:["body_kaput","window_on_cam","window_sunroof","window_arka_cam","body_tavan"],
                applied_services:[
                    {
                        category:"FILM",
                        code:"OLXFLM7686",
                        name:"Signer Series Film",
                        warranty:"10 YIL / 1.Yıl"
                    },
                    {
                        category:"KORUMA",
                        code:"OLXKRM7686",
                        name:"Koruma Kaplama",
                        warranty:"5 YIL / 1.Yıl"
                    },

                ],
            }
         */
        if ($service) {
            $serviceProducts = $service->getProducts();
            $products = [];
            foreach ($serviceProducts as $serviceProduct) {
                $product = Products::find($serviceProduct->product_id);
                if ($product) {
                    $products[] = [
                        "category" => $product->category,
                        "code" => $serviceProduct->product_code,
                        "name" => $product->name,
                        "warranty" => $serviceProduct->warranty_text,
                    ];
                }
            }
            list($sehirKodu, $ortadakiHarfler, $sonRakamlar) = $this->plakaBilgisi($service->car["plate"]);
            $data = [
                "brand" => $service->car["brand"],
                "model" => $service->car["model"],
                "generation" => $service->car["generation"],
                "year" => $service->car["year"],
                "brand_logo" => $service->car["brand_logo"],
                "body_data" => $service->body,
                "applied_services" => $products,
                "dealer" => $service->dealer()->company(),
                "plate" => $sehirKodu . ' ' . $ortadakiHarfler . ' ' . $sonRakamlar,
                "service_no" => $service->service_no,
            ];
            return response()->json(['data' => $data, 'status' => true]);
        } else {
            return response()->json(['message' => 'Hizmet bulunamadı.', 'status' => false]);
        }
    }
    public function plakaBilgisi($plaka): array|string
    {
        $sehirKodu = substr($plaka, 0, 2);
        $ortadakiHarfler = preg_replace('/[^A-Z]/', '', $plaka);
        $sonRakamlar = preg_replace('/[^0-9]/', '', substr($plaka, -2));
        return [$sehirKodu, $ortadakiHarfler, $sonRakamlar];
    }

}
