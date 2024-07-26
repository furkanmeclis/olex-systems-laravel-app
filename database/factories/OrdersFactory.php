<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Orders>
 */
class OrdersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dealer_id' => 2,
            'user_id' => 1,
            'status' => $this->faker->randomElement(['draft', 'pending', 'completed']),
            'created_at' => now(),
        ];
    }
}
