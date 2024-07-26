<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Orders>
 */
class OrderItemsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => rand(1,50),
            'product_id' => rand(1,100),
            'quantity' => rand(1,100),
            'price' => rand(1,100),
            'created_at' => now(),
        ];
    }
}
