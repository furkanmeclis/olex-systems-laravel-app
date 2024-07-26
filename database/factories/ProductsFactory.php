<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Products>
 */
class ProductsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => Str::random(10),
            'name' => $this->faker->randomElement(['PPF', 'Cam Filmi']) . ' ' . $this->faker->randomElement(['Black', 'White', 'Red', 'Blue', 'Green']),
            'description' => $this->faker->text(),
            'price' => $this->faker->randomFloat(2, 1, 1000),
            'image' => $this->faker->imageUrl(),
            'warranty' => $this->faker->randomElement(['5 yıl', '10 yıl']),
            'active' => true,
            'category' => $this->faker->randomElement(['PPF', 'Cam Filmi']),


        ];
    }
}
