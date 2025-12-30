<?php 

namespace App\Traits;

trait TrimsLegacyData
{
    protected static function bootTrimsLegacyData()
    {
        static::retrieved(function ($model) {
            $model->cleanAttributes();
        });

        static::saving(function ($model) {
            $model->cleanAttributes();
        });
    }

    public function cleanAttributes()
    {
        foreach ($this->attributes as $key => $value) {
            if (is_string($value)) {
                
                $cleanValue = trim($value);
                $cleanValue = mb_convert_encoding($cleanValue, 'UTF-8', 'Windows-1252');

                $this->attributes[$key] = $cleanValue;
            }
        }
    }
}