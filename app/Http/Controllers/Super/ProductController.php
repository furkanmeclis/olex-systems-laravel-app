<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Categories;
use App\Models\ProductCode;
use App\Models\Products;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getAllProducts()
    {
        return Products::where('id', '>', 0)->orderBy('id', 'desc')->get()->map(function ($product) {
            if (!str_contains($product['image'], 'http')) {
                $product['image'] = asset('storage/' . $product['image']);
            }
            return $product;
        });
    }

    protected function convertSku($sku)
    {
        return str_replace(' ', '', $sku);
    }

    public function index(): \Inertia\Response
    {
        return Inertia::render('Super/Products/Index', [
            'productsAll' => $this->getAllProducts(),
            'categoriesAll' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        //
    }

    public function listAll()
    {
        return response()->json(['products' => Products::where('active', 1)->orderBy('id', 'desc')->get(['id', 'name', 'sku', 'category', 'price'])]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //control sku
        $sku = request()->get('sku');
        if (Products::where('sku', $sku)->count() > 0) {
            return response()->json(['message' => 'Bu SKU numarası zaten kullanılmakta.', 'status' => false, 'sku' => $sku]);
        } else {
            $product = new Products();
            $product->name = request()->get('name') ?? '';
            $product->sku = $this->convertSku(request()->get('sku')) ?? '';
            $product->category = request()->get('category') ?? 'Diğer';
            $product->price = request()->get('price') ?? 0;
            $product->warranty = request()->get('warranty') . " Yıl" ?? '0 Yıl';
            $product->description = request()->get('description') ?? '';
            if (request()->hasFile('image')) {
                $product->image = str_replace('public/', '', request()->file('image')->store('public/products'));
            } else {
                $product->image = 'products/default.png';
            }
            if ($product->save()) {
                return response()->json(['message' => 'Ürün başarıyla eklendi.', 'status' => true, 'products' => $this->getAllProducts()]);
            } else {
                //delete image
                if (request()->hasFile('image')) {
                    unlink(storage_path('app/' . $product->image));
                }
                return response()->json(['message' => 'Ürün eklenirken bir hata oluştu.', 'status' => false]);
            }
        }
    }

    public function controlSku(): \Illuminate\Http\JsonResponse
    {
        $sku = $this->convertSku(request()->get('sku'));
        if (Products::where('sku', $sku)->count() > 0) {
            return response()->json(['message' => 'Bu SKU numarası zaten kullanılmakta.', 'status' => false, 'sku' => $sku]);
        } else {
            return response()->json(['message' => 'Bu SKU numarası kullanılabilir.', 'status' => true, 'sku' => $sku]);
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

        $product = Products::find($id);
        if ($product) {
            $controlSku = Products::where('sku', $this->convertSku($request->get("sku")))->where('id', '!=', $id)->count();
            if ($controlSku > 0) {
                return response()->json(['message' => 'Bu SKU numarası zaten kullanılmakta.', 'status' => false, 'sku' => request()->get("sku")]);
            }
            $product->name = $request->get('name');
            $product->sku = $this->convertSku($request->get('sku'));
            $product->category = $request->get('category');
            $product->price = $request->get('price');
            $product->warranty = $request->get('warranty') . " Yıl";
            $product->description = $request->get('description');
            $product->active = $request->get('active') == 'true' ? 1 : 0;
            if ($request->hasFile('image')) {
                if ($product->image != 'products/default.png') {
                    unlink(storage_path('app/public/' . $product->image));
                }
                $product->image = str_replace('public/', '', $request->file('image')->store('public/products'));
            }
            if ($product->save()) {
                return response()->json(['message' => 'Ürün başarıyla güncellendi.', 'status' => true, 'products' => $this->getAllProducts()]);
            } else {
                return response()->json(['message' => 'Ürün güncellenirken bir hata oluştu.', 'status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün bulunamadı.'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Products::find($id);
        if ($product) {
            $image = $product->image;
            if ($product->delete()) {
                if ($image != 'products/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
                return response()->json(['message' => 'Ürün başarıyla silindi.']);
            } else {
                return response()->json(['message' => 'Ürün silinirken bir hata oluştu.'], 500);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün bulunamadı.'], 404);
        }
    }

    public function multipleDestroy()
    {
        $productIds = request()->get('productIds');
        $prodctsCount = Products::whereIn('id', $productIds)->count();
        $productImages = Products::whereIn('id', $productIds)->get()->map(function ($product) {
            return $product->image;
        });

        if (Products::whereIn('id', $productIds)->delete()) {
            foreach ($productImages as $image) {
                if ($image != 'products/default.png') {
                    if (file_exists(storage_path('app/public/' . $image))) {
                        unlink(storage_path('app/public/' . $image));
                    }
                }
            }
            return response()->json(['message' => $prodctsCount . ' adet ürün başarıyla silindi']);
        } else {
            return response()->json(['message' => 'Ürünler silinirken bir hata oluştu.'], 404);
        }
    }

    public function storeCategory(): \Illuminate\Http\JsonResponse
    {
        $category = new Categories();
        $category->name = request()->get('name');
        if ($category->save()) {
            return response()->json(['message' => 'Kategori başarıyla eklendi.', 'categories' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()]]);
        } else {
            return response()->json(['message' => 'Kategori eklenirken bir hata oluştu.'], 500);
        }
    }

    public function updateCategory($id): \Illuminate\Http\JsonResponse
    {
        $category = Categories::find($id);
        if ($category || $id == 0) {
            $lastCategoryName = $id == 0 ? "Diğer" : $category->name;
            if ($id == 0) {
                if (Products::where('category', 'Diğer')->count() == 0) {
                    return response()->json(['message' => 'Kategori başarıyla güncellendi.', 'categories' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()], 'products' => $this->getAllProducts()]);
                }
                $newCategory = new Categories();
                $newCategory->name = request()->get('name');
                if ($newCategory->save()) {
                    Products::where('category', 'Diğer')->update(['category' => request()->get('name')]);
                    return response()->json(['message' => 'Kategori başarıyla güncellendi.', 'categories' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()], 'products' => $this->getAllProducts()]);
                }

            }
            $category->name = request()->get('name');
            if (@$category->save()) {
                Products::where('category', $lastCategoryName)->update(['category' => request()->get('name')]);
                return response()->json(['message' => 'Kategori başarıyla güncellendi.', 'categories' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()], 'products' => $this->getAllProducts()]);
            } else {
                return response()->json(['message' => 'Kategori güncellenirken bir hata oluştu.'], 500);
            }

        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir kategori bulunamadı.'], 404);
        }
    }

    public
    function deleteCategory($id): \Illuminate\Http\JsonResponse
    {
        $category = Categories::find($id);
        if ($category) {
            $lastCategoryName = $category->name;
            if ($category->delete()) {
                Products::where('category', $lastCategoryName)->update(['category' => 'Diğer']);
                return response()->json(['message' => 'Kategori başarıyla silindi.', 'categories' => [['id' => 0, 'name' => 'Diğer'], ...Categories::all()->toArray()], 'products' => Products::all()]);
            } else {
                return response()->json(['message' => 'Kategori silinirken bir hata oluştu.'], 500);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir kategori bulunamadı.'], 404);
        }
    }

    public function listCodes($id)
    {
        $product = Products::find($id);
        if ($product) {
            $codes = $product->getCodes();
            return response()->json(['codes' => $codes]);
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün bulunamadı.'], 404);
        }
    }

    public function addCode($id)
    {
        $product = Products::find($id);
        if ($product) {
            $codes = str_replace(' ','-',\request()->get('codes'));
            if (str_contains($codes, ',')) {
                $codes = explode(',', $codes);
            } else {
                $codes = [$codes];
            }
            $codes = array_map('trim', $codes);
            $codes = array_filter($codes, function ($code) {
                return $code != '';
            });
            $codes = array_unique($codes);
            $controlUnique = ProductCode::whereIn('code', $codes)->get(['code'])->toArray();
            if(count($controlUnique) > 0){
                $message = "Şu kodlar zaten kullanılmakta ".implode(", ",array_map(function($code){
                    return "'".$code['code']."'";
                },$controlUnique));
                return response()->json(['message' => $message, 'codes' => $controlUnique,'status' => false,]);
            }
            $codes = array_map(function ($code) use ($id) {
                return [
                    'code' => str_replace(' ','-',$code),
                    "product_id" => $id,
                    "used" => 0,
                    "created_at" => now(),
                    "updated_at" => now()
                ];
            }, $codes);
            if (ProductCode::insert($codes)) {
                return response()->json(['message' => 'Ürün kodu başarıyla eklendi.', 'codes' => $product->getCodes(), 'status' => true]);
            } else {
                return response()->json(['message' => 'Ürün kodu eklenirken bir hata oluştu.','status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün bulunamadı.','status' => false]);
        }
    }

    public function updateCode($productId)
    {
        $product = Products::find($productId);
        if ($product) {
            $code = ProductCode::find(\request()->get('code_id'));
            if ($code) {
                $code->code = str_replace(' ','-',\request()->get('code'));
                if($code->used == 1){
                    return response()->json(['message' => 'Bu kod kullanılmış ve güncellenemez.','status' => false]);
                }
                if(ProductCode::where('code',$code->code)->where('id','!=',$code->id)->count() > 0){
                    return response()->json(['message' => 'Bu kod zaten kullanılmakta.','status' => false]);
                }
                if ($code->save()) {
                    return response()->json(['message' => 'Ürün kodu başarıyla güncellendi.', 'codes' => $product->getCodes(), 'status' => true]);
                } else {
                    return response()->json(['message' => 'Ürün kodu güncellenirken bir hata oluştu.','status' => false]);
                }
            } else {
                return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün kodu bulunamadı.','status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün bulunamadı.','status' => false]);
        }
    }

    public function deleteCode($codeId)
    {
        $code = ProductCode::find($codeId);
        if ($code) {
           if($code->used == 1){
               return response()->json(['message' => 'Bu kod kullanılmış ve silinemez.','status' => false]);
           }
            if ($code->delete()) {
                return response()->json(['message' => 'Ürün kodu başarıyla silindi.',"status" => true]);
            } else {
                return response()->json(['message' => 'Ürün kodu silinirken bir hata oluştu.','status' => false]);
            }
        } else {
            return response()->json(['message' => 'Bu Id\'ye sahip bir Ürün kodu bulunamadı.','status' => false]);
        }
    }
}
