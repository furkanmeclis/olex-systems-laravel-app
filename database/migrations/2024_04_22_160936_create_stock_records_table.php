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
        Schema::create('stock_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('dealer_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('order_id')->nullable(); // order_id is nullable because it will be filled when the stock record is confirmed
            $table->integer('quantity');
            $table->enum('status',['draft','confirmed','canceled'])->default('draft');
            $table->string('note')->nullable();
            $table->timestamp('drafted_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('no action');
            $table->foreign('dealer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('no action');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_records');
    }
};
