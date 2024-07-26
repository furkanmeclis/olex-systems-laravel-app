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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->integer('dealer_id');
            $table->integer('user_id');
            $table->string('note')->nullable();
            $table->enum('status', ['draft', 'pending', 'processing', 'completed', 'cancelled', 'refunded'])->default('draft');
            $table->timestamps();
            $table->foreign('dealer_id')->references('id')->on('users')->onDelete('cascade');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
