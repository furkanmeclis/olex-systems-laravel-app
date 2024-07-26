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
        Schema::create('dealer_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('company_name')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_logo')->nullable();
            $table->string('company_country')->nullable();
            $table->string('company_city')->nullable();
            $table->string('company_district')->nullable();
            $table->string('company_zip')->nullable();
            $table->string('company_address')->nullable();
            $table->string('company_geo_location')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dealer_details');
    }
};
