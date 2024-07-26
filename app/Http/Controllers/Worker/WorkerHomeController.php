<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class WorkerHomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Worker/Home/Index');
    }
}
