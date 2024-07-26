<?php

namespace Database\Factories;

use App\Models\StockRecords;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StockRecords>
 */
class StockRecordsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => rand(1,100),
            'dealer_id' => 2,
            'quantity' => rand(1,100),
            'user_id' => 1,
            'status' => $this->faker->randomElement(['draft','confirmed','canceled']),
            'note' => $this->faker->text(),
            'order_id' => rand(1,50),
            'created_at' => now(),
        ];
    }
}
