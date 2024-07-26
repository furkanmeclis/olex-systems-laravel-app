<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('worker_id')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('dealer_id')->nullable();
            $table->enum('location',['dealer','central'])->default('central');
            $table->boolean('used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            $table->foreign('dealer_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_codes');
    }
};
