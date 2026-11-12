<?php
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Holidays.php';

class HolidayController
{
    /** GET /admin/holidays — Jours fériés de l'année en cours et des deux suivantes (calcul des délais). */
    public function index(): void
    {
        $year = (int)date('Y');
        Response::json(['dates' => Holidays::forYears([$year, $year + 1, $year + 2])]);
    }
}
