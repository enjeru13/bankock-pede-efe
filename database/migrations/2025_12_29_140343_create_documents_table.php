<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('documents')) {
            Schema::create('documents', function (Blueprint $table) {
                $table->id();
                $table->string('client_id');
                $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('filename');
                $table->string('file_path');
                $table->unsignedBigInteger('file_size');
                $table->string('mime_type')->default('application/pdf');
                $table->string('category')->nullable();
                $table->json('tags')->nullable();
                $table->unsignedInteger('downloaded_count')->default(0);
                $table->timestamp('last_downloaded_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
                $table->index('client_id');
                $table->index('uploaded_by');
                $table->index('category');
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
