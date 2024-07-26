<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index($serviceNumber = null)
    {
        return Inertia::render('Warranty/Index',[
            'serviceNumber' => $serviceNumber
        ]);
    }
}
