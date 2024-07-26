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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('dealer_id')->nullable();
            $table->string('worker_id')->nullable();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->unique()->nullable();
            $table->string('player_id')->nullable()->comment("ONESİGNAL PLAYER ID");
            $table->string('address')->nullable();
            $table->text('notification_settings')->default('{"email":true,"sms":true,"push":false}');
            $table->date('birthday')->nullable();
            $table->enum('gender',['male','female','other'])->default('other')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
