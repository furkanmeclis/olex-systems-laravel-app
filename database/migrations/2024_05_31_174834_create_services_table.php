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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('service_no')->unique();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('worker_id');
            $table->unsignedBigInteger('dealer_id');
            $table->longText('note')->nullable();
            $table->enum('status', ['pending', 'progress', 'completed', 'cancelled'])->default('pending');
            $table->json('body')->default('[]');
            $table->json('car')->default('{}');
            $table->json('status_history')->default('{"pending": {"created_at": null,"updated_at": null},"progress": {"created_at": null,"updated_at": null},"completed": {"created_at": null,"updated_at": null},"cancelled":{"created_at": null,"updated_at": null}}');
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('dealer_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
