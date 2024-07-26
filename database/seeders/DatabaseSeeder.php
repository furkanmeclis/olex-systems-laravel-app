<?php

namespace Database\Seeders;

use App\Models\Customers;
use App\Models\DealerDetails;
use App\Models\OrderItems;
use App\Models\Orders;
use App\Models\Products;
use App\Models\StockRecords;
use App\Models\User;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $usersNotFound = User::whereIn('email',['furkanmeclis@icloud.com','huseyinullkenn@gmail.com','suleymanipek@gmail.com','olex@gmail.com'])->count();
        if($usersNotFound === 0){
            User::factory(1)->create([
                'name' => 'Furkan Meclis',
                'email' => 'furkanmeclis@icloud.com',
                'role' => 'super',
            ]);
            User::factory(1)->create([
                'name' => 'Hüseyin Ülken',
                'email' => 'huseyinullkenn@gmail.com',
                'role' => 'super',
            ]);
            User::factory(1)->create([
                'name' => 'Süleyman İpek',
                'email' => 'suleymanipek@gmail.com',
                'role' => 'super',
            ]);
            User::factory(1)->create([
                'name' => 'OLEX SUPER',
                'email' => 'olex@gmail.com',
                'role' => 'super',
            ]);
        }
        Products::factory(100)->create();
        User::factory(96)->create();
        $users = User::where('role', 'admin')->get();
        $dealerIds = [];
        foreach ($users as $user) {
            $dealerIds[] = $user->id;
            $details = new  DealerDetails;
            $details->user_id = $user->id;
            $details->company_name = $user->name;
            $details->company_phone = fake()->phoneNumber();
            $details->company_email = fake()->unique()->safeEmail();
            $details->company_logo = fake()->imageUrl();
            $details->company_country = fake()->country();
            $details->company_city = fake()->city();
            $details->company_district = fake()->streetName();
            $details->company_zip = fake()->postcode();
            $details->company_address = fake()->address();
            $details->save();
        }
        foreach (User::where('role','worker')->get() as $worker) {
            $worker->parent_id = $dealerIds[array_rand($dealerIds)];
            for($i = 0; $i < 10; $i++){
                $newCustomer = new Customers;
                $newCustomer->dealer_id = $worker->parent_id;
                $newCustomer->worker_id = $worker->id;
                $newCustomer->name = fake()->name();
                $newCustomer->email = fake()->unique()->safeEmail();
                $newCustomer->phone = fake()->phoneNumber();
                $newCustomer->address = fake()->address();
                $newCustomer->save();
            }
            $worker->save();
        }
    }
}
