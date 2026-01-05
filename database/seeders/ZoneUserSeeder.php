<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ZoneUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create ADMIN User
        $adminName = 'ADMIN';
        if (!User::where('name', $adminName)->exists()) {
            User::create([
                'name' => $adminName,
                'password' => Hash::make('admin12345'),
                'zone' => 'ADMIN', // Special marker
                'co_ven' => null,
            ]);
            $this->command->info("Created ADMIN user.");
        } else {
            $this->command->info("ADMIN user already exists.");
        }

        // 2. Create Zone Users
        $zones = DB::connection('sqlsrv')->select("
            SELECT DISTINCT
                UPPER(TRIM(
                    CASE 
                        WHEN s.seg_des LIKE '%TACHIRA%' 
                          OR s.seg_des LIKE '%S/C%' 
                          OR s.seg_des LIKE '%FRONTERA%'
                          OR s.seg_des LIKE '%PANAMERICANA%'
                          OR s.seg_des LIKE '%LLANO%'
                          OR s.seg_des LIKE '%PLAZA%'
                        THEN 'TACHIRA'

                        WHEN CHARINDEX(')', s.seg_des) > 0 AND CHARINDEX(')', s.seg_des) < 15
                        THEN SUBSTRING(
                                LTRIM(SUBSTRING(s.seg_des, CHARINDEX(')', s.seg_des) + 1, LEN(s.seg_des))), 
                                1, 
                                CHARINDEX(' ', LTRIM(SUBSTRING(s.seg_des, CHARINDEX(')', s.seg_des) + 1, LEN(s.seg_des))) + ' ') - 1
                             )

                        ELSE 
                            SUBSTRING(
                                REPLACE(REPLACE(s.seg_des, '-', ' '), '/', ' '), 
                                1, 
                                CHARINDEX(' ', REPLACE(REPLACE(s.seg_des, '-', ' '), '/', ' ') + ' ') - 1
                            )
                    END
                )) AS ZONA_AGRUPADA
            FROM 
                segmento s
            WHERE 
                s.co_seg <> '99999'
                AND s.seg_des NOT LIKE '%NO USAR%'
                AND s.seg_des NOT LIKE '%INACTIVO%'
                AND s.seg_des NOT LIKE '%CERRADO%'
                AND s.seg_des NOT LIKE '%disponible%'
                
                AND s.seg_des NOT LIKE '%PEDIDOS%'
                AND s.seg_des NOT LIKE '%NACIONAL%'
                AND s.seg_des NOT LIKE '%INTERNO%'
                AND s.seg_des NOT LIKE '%CASA%' 
                AND s.seg_des NOT LIKE '%COJE/ VALEN%'
                AND s.seg_des <> 'caracas'
            ORDER BY 
                ZONA_AGRUPADA
        ");

        foreach ($zones as $zoneData) {
            $zoneName = $zoneData->ZONA_AGRUPADA;
            
            if (empty($zoneName)) continue;

            // Check by zone or name effectively
            $existingUser = User::where('name', $zoneName)->first();

            if (!$existingUser) {
                User::create([
                    'name' => $zoneName, // Just the Zone Name
                    'password' => Hash::make('12345678'), 
                    'zone' => $zoneName,
                    'co_ven' => null,
                ]);
                $this->command->info("Created user for zone: {$zoneName}");
            } else {
                $this->command->info("User for zone {$zoneName} already exists.");
            }
        }
    }
}
