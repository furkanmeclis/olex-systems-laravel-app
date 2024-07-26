<?php

use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
Route::get('/dashboard', function () {
    $user = \auth()->user();
    if ($user && $user->role == "worker") {
        return \Illuminate\Support\Facades\Redirect::route('worker.index');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/view:clear', function () {
        Artisan::call('view:clear');
        Artisan::call('optimize:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('cache:clear');
        return;
    });
    Route::get('/storage:link', function () {
        $mainLink = str_replace('/public', '', $_SERVER['DOCUMENT_ROOT']);
        $targetFolder = $mainLink . '/storage/app/public';
        $linkFolder = $mainLink . '/public/storage';
        File::link($targetFolder, $linkFolder);
        return redirect()->route('dashboard')->with('success', 'Smlink oluşturuldu');
    });
    Route::get('/db:seed', function () {
        Artisan::call('db:seed');
        return redirect()->route('dashboard')->with('success', 'Demo verileri başarılı bir şekilde eklendi.');
    });
    Route::get('/migrate:fresh', function () {
        Artisan::call('migrate:fresh');
        Artisan::call('db:seed');
        return redirect()->route('dashboard')->with('success', 'Veritabanı sıfırlandı ve başarılı bir şekilde yeniden oluşturuldu.Demo verileri eklendi.');

    });
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::prefix('/super')->name('super.')->group(function () {
        /*
         * SUPER ROLES ROUTES
         */
        Route::resource('/central-users', \App\Http\Controllers\Super\CentralController::class)->names([
            'index' => 'central.index',
            'create' => 'central.create',
            'store' => 'central.store',
            'show' => 'central.show',
            'edit' => 'central.edit',
            'update' => 'central.update',
            'destroy' => 'central.destroy',
        ]);
        Route::post('/central-users/multiple-destroy', [\App\Http\Controllers\Super\CentralController::class, 'multipleDestroy'])->name('central.multipleDestroy');
        /*
         * DEALERS ROUTES
         */
        Route::resource('/dealers', \App\Http\Controllers\Super\Dealer::class)->names([
            'index' => 'dealers.index',
            'create' => 'dealers.create',
            'store' => 'dealers.store',
            'show' => 'dealers.show',
            'edit' => 'dealers.edit',
            'update' => 'dealers.update',
            'destroy' => 'dealers.destroy',
        ]);
        Route::post('/dealers/multiple-destroy', [\App\Http\Controllers\Super\Dealer::class, 'multipleDestroy'])->name('dealers.multipleDestroy');
        Route::put('/dealers/{id}/update-details', [\App\Http\Controllers\Super\Dealer::class, 'updateDetails'])->name('dealers.updateDetails');
        Route::post('/dealers/list-all', [\App\Http\Controllers\Super\Dealer::class, 'listAll'])->name('dealers.listAll');
        /*
         *  PRODUCTS ROUTES
         */
        Route::resource('/products', \App\Http\Controllers\Super\ProductController::class)->names([
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'show' => 'products.show',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ]);
        Route::post('/products/list-all', [\App\Http\Controllers\Super\ProductController::class, 'listAll'])->name('products.listAll');
        Route::post('/products/control-sku', [\App\Http\Controllers\Super\ProductController::class, 'controlSku'])->name('products.controlSku');
        Route::post('/products/multiple-destroy', [\App\Http\Controllers\Super\ProductController::class, 'multipleDestroy'])->name('products.multipleDestroy');
        Route::post('/categories/store', [\App\Http\Controllers\Super\ProductController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{id}/update', [\App\Http\Controllers\Super\ProductController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{id}/delete', [\App\Http\Controllers\Super\ProductController::class, 'deleteCategory'])->name('categories.delete');
        Route::post('/products/{id}/list-codes', [\App\Http\Controllers\Super\ProductController::class, 'listCodes'])->name('products.listCodes');
        Route::post('/products/{id}/add-code', [\App\Http\Controllers\Super\ProductController::class, 'addCode'])->name('products.addCode');
        Route::put('/products/{id}/update-code', [\App\Http\Controllers\Super\ProductController::class, 'updateCode'])->name('products.updateCode');
        Route::delete('/products/{id}/delete-code', [\App\Http\Controllers\Super\ProductController::class, 'deleteCode'])->name('products.deleteCode');

        /*
         * ORDERS ROUTES
         */
        Route::resource('/orders', \App\Http\Controllers\Super\OrdersController::class)->names([
            'index' => 'orders.index',
            'create' => 'orders.create',
            'store' => 'orders.store',
            'show' => 'orders.show',
            'edit' => 'orders.edit',
            'update' => 'orders.update',
            'destroy' => 'orders.destroy',
        ]);
        Route::post('/orders/{id}/list-product-codes', [\App\Http\Controllers\Super\OrdersController::class, 'listProductCodes'])->name('orders.listProductCodes');
        Route::put('/orders/{id}/update-product-codes', [\App\Http\Controllers\Super\OrdersController::class, 'updateProductCodes'])->name('orders.updateProductCodes');
        Route::post('/orders/trash-list-all', [\App\Http\Controllers\Super\OrdersController::class, 'trashAll'])->name('orders.trashAll');
        Route::put('/orders/{id}/status-update', [App\Http\Controllers\Super\OrdersController::class, 'updateStatus'])->name('orders.statusUpdate');
        Route::post('/products/multiple-destroy', [\App\Http\Controllers\Super\OrdersController::class, 'multipleDestroy'])->name('orders.multipleDestroy');
        Route::post('/products/restore', [\App\Http\Controllers\Super\OrdersController::class, 'restore'])->name('orders.restore');
        /*
         *  STOCK MANAGEMENT ROUTES
         */
        Route::get('/stock-management', [\App\Http\Controllers\Super\StockManagamentController::class, 'index'])->name('stock-management.index');
        Route::put('/stock-management/{id}/update', [\App\Http\Controllers\Super\StockManagamentController::class, 'update'])->name('stock-management.update');
        /*
         *  WORKERS ROUTES
         */
        Route::resource('/workers', \App\Http\Controllers\Super\Worker::class)->names([
            'index' => 'workers.index',
            'create' => 'workers.create',
            'store' => 'workers.store',
            'show' => 'workers.show',
            'edit' => 'workers.edit',
            'update' => 'workers.update',
            'destroy' => 'workers.destroy',
        ]);
        Route::post('/workers/multiple-destroy', [\App\Http\Controllers\Super\Worker::class, 'multipleDestroy'])->name('workers.multipleDestroy');
        Route::resource('/customers', \App\Http\Controllers\Super\CustomersController::class)->names([
            'index' => 'customers.index',
            'create' => 'customers.create',
            'store' => 'customers.store',
            'show' => 'customers.show',
            'edit' => 'customers.edit',
            'update' => 'customers.update',
            'destroy' => 'customers.destroy',
        ]);
        Route::post('/customers/multiple-destroy', [\App\Http\Controllers\Super\CustomersController::class, 'multipleDestroy'])->name('customers.multipleDestroy');


    });
    /*
     * ----------------------------------------------
     *                 CENTRAL ROLE
     * ----------------------------------------------
     */
    Route::prefix('/central')->name("central.")->group(function () {

        /*
         * DEALERS ROUTES
         */
        Route::resource('/dealers', \App\Http\Controllers\Central\Dealer::class)->names([
            'index' => 'dealers.index',
            'create' => 'dealers.create',
            'store' => 'dealers.store',
            'show' => 'dealers.show',
            'edit' => 'dealers.edit',
            'update' => 'dealers.update',
            'destroy' => 'dealers.destroy',
        ]);
        Route::post('/dealers/multiple-destroy', [\App\Http\Controllers\Central\Dealer::class, 'multipleDestroy'])->name('dealers.multipleDestroy');
        Route::put('/dealers/{id}/update-details', [\App\Http\Controllers\Central\Dealer::class, 'updateDetails'])->name('dealers.updateDetails');
        Route::post('/dealers/list-all', [\App\Http\Controllers\Central\Dealer::class, 'listAll'])->name('dealers.listAll');
        /*
         *  PRODUCTS ROUTES
         */
        Route::resource('/products', \App\Http\Controllers\Central\ProductController::class)->names([
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'show' => 'products.show',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ]);
        Route::post('/products/list-all', [\App\Http\Controllers\Central\ProductController::class, 'listAll'])->name('products.listAll');
        Route::post('/products/control-sku', [\App\Http\Controllers\Central\ProductController::class, 'controlSku'])->name('products.controlSku');
        Route::post('/products/multiple-destroy', [\App\Http\Controllers\Central\ProductController::class, 'multipleDestroy'])->name('products.multipleDestroy');
        Route::post('/categories/store', [\App\Http\Controllers\Central\ProductController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{id}/update', [\App\Http\Controllers\Central\ProductController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{id}/delete', [\App\Http\Controllers\Central\ProductController::class, 'deleteCategory'])->name('categories.delete');
        /*
         * ORDERS ROUTES
         */
        Route::resource('/orders', \App\Http\Controllers\Central\OrdersController::class)->names([
            'index' => 'orders.index',
            'create' => 'orders.create',
            'store' => 'orders.store',
            'show' => 'orders.show',
            'edit' => 'orders.edit',
            'update' => 'orders.update',
            'destroy' => 'orders.destroy',
        ]);
        Route::post('/orders/trash-list-all', [\App\Http\Controllers\Central\OrdersController::class, 'trashAll'])->name('orders.trashAll');
        Route::put('/orders/{id}/status-update', [App\Http\Controllers\Central\OrdersController::class, 'updateStatus'])->name('orders.statusUpdate');
        Route::post('/products/multiple-destroy', [\App\Http\Controllers\Central\OrdersController::class, 'multipleDestroy'])->name('orders.multipleDestroy');
        Route::post('/products/restore', [\App\Http\Controllers\Central\OrdersController::class, 'restore'])->name('orders.restore');
        /*
         *  STOCK MANAGEMENT ROUTES
         */
        Route::get('/stock-management', [\App\Http\Controllers\Central\StockManagamentController::class, 'index'])->name('stock-management.index');
        /*
         *  WORKERS ROUTES
         */
        Route::resource('/workers', \App\Http\Controllers\Central\Worker::class)->names([
            'index' => 'workers.index',
            'create' => 'workers.create',
            'store' => 'workers.store',
            'show' => 'workers.show',
            'edit' => 'workers.edit',
            'update' => 'workers.update',
            'destroy' => 'workers.destroy',
        ]);
        Route::post('/workers/multiple-destroy', [\App\Http\Controllers\Central\Worker::class, 'multipleDestroy'])->name('workers.multipleDestroy');
    });
    /*
     * ----------------------------------------------
     * |               WORKER ROLE                  |
     * ----------------------------------------------
     */
    Route::prefix('/worker')->name("worker.")->group(function () {
        Route::get('/test-mail', function () {
            $user = \App\Models\Customers::find(352);
            $transaction = \Illuminate\Support\Facades\Mail::to('furkanmeclis@icloud.com')->send(new \App\Mail\SubscribeWebPushMail($user));
            return response()->json(['message' => 'Mail Gönderildi', 'transaction' => $transaction]);

        });
        Route::get('/pdf2/{id}', [\App\Http\Controllers\Worker\ServicesController::class, 'pdfSourceDataService'])->name('pdfSourceDataService');
        Route::get('/send/{token}', function ($token) {
            $notify = new \App\Notifications\FirebaseNotification("ARACINIZ İŞLEME ALINDI", "CHROME DENEMESİ", "$token");
            $notify->sendPushNotification();
            return response()->json(['message' => 'MESAJ GİTTİ']);
        });
        Route::get('/', [\App\Http\Controllers\Worker\WorkerHomeController::class, 'index'])->name('index');
        Route::resource('/customers', \App\Http\Controllers\Worker\CustomersController::class)->names([
            'index' => 'customers.index',
            'create' => 'customers.create',
            'store' => 'customers.store',
            'show' => 'customers.show',
            'edit' => 'customers.edit',
            'update' => 'customers.update',
            'destroy' => 'customers.destroy',
        ]);
        Route::post('/customers/get-all', [\App\Http\Controllers\Worker\CustomersController::class, 'getAll'])->name('customers.getAll');
        Route::resource('/services', \App\Http\Controllers\Worker\ServicesController::class)->names([
            'index' => 'services.index',
            'create' => 'services.create',
            'store' => 'services.store',
            'show' => 'services.show',
            'edit' => 'services.edit',
            'update' => 'services.update',
            'destroy' => 'services.destroy',
        ]);
        //Route::get('/pdf-export', [\App\Http\Controllers\Worker\ServicesController::class, 'pdf'])->name('services.pdf');
        Route::resource('/products', \App\Http\Controllers\Worker\ProductsController::class)->names([
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'show' => 'products.show',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ]);
        Route::post('/products/check-product', [\App\Http\Controllers\Worker\ProductsController::class, 'checkProduct'])->name('products.checkProduct');
    });

});
/*
 *  OUTWARD ROUTES
 */
Route::get('manifest.json', function () {
    $json = '{
                "name": "OLEX® Films",
                "short_name": "OLEX® Films",
                "theme_color": "#003f26",
                "background_color": "#003f26",
                "display": "fullscreen",
                "orientation": "portrait",
                "scope": "/",
                "start_url": "{start_url}",
                "icons": [
                    {
                        "src": "/icons/logo-48x48.png",
                        "sizes": "48x48",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-72x72.png",
                        "sizes": "72x72",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-128x128.png",
                        "sizes": "128x128",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-144x144.png",
                        "sizes": "144x144",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                    },
                    {
                        "src": "/icons/logo-1024x1024.png",
                        "sizes": "1024x1024",
                        "type": "image/png"
                    }

                ]
            }';
    if(request()->session()->has('manifest')){
        $customerId = request()->session()->get('manifest');
        $print = str_replace("{start_url}", '/customer/'.Crypt::encrypt($customerId), $json);
        request()->session()->forget('manifest');
        return response($print)->header('Content-Type', 'application/json');
    }else{
        $print = str_replace("{start_url}", '/', $json);
        request()->session()->forget('manifest');
        return response($print)->header('Content-Type', 'application/json');
    }
});
Route::get('/warranty/{id}', [\App\Http\Controllers\WarrantyController::class, 'index'])->name('warranty.index');
Route::get('/customer/{hash}', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customer.notify');
Route::post('/customer/{hash}/store', [\App\Http\Controllers\CustomerController::class, 'update'])->name('customer.notifyUpdate');

require __DIR__ . '/auth.php';
