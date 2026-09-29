import React from 'react'
import {
  CloudSun,
  Droplets,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
} from 'lucide-react'
import { Card, Badge, Skeleton } from '@/components/ui'
import { useWeather } from '@/lib/api/planner'

interface WeatherCardProps {
  district?: string
  className?: string
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  district = 'Ludhiana',
  className = '',
}) => {
  const { data: weather, isLoading } = useWeather(district)

  if (isLoading) {
    return <Skeleton variant="card" className={`h-48 w-full ${className}`} />
  }

  if (!weather || !weather.current) {
    return null
  }

  const { current, forecast } = weather
  const isSprayIdeal = current.spray_condition === 'ideal'

  return (
    <Card variant="surface" className={`flex flex-col gap-4 p-5 sm:p-6 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-pill bg-white border border-line flex items-center justify-center text-forest">
            <CloudSun className="w-5 h-5 text-forest" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold tracking-wider text-forest">
              Hyper-Local Farm Weather
            </span>
            <span className="text-sm sm:text-base font-bold text-ink">
              {weather.district} Agri-Zone
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="forest">3-Hour Satellite Cache</Badge>
          <span className="text-[11px] text-muted flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted" />
            <span>Telemetry Synced</span>
          </span>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
        {/* Temperature */}
        <div className="bg-white p-3 rounded-card border border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-ink">{current.temp}°C</span>
            <span className="text-[11px] text-muted truncate">{current.condition_text}</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white p-3 rounded-card border border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-ink">{current.humidity}%</span>
            <span className="text-[11px] text-muted">Relative Humidity</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white p-3 rounded-card border border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
            <Wind className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-ink">
              {current.wind_speed_kmh} <span className="text-xs font-normal">km/h</span>
            </span>
            <span className="text-[11px] text-muted">Canopy Drift</span>
          </div>
        </div>

        {/* 48h Rain Probability */}
        <div className="bg-white p-3 rounded-card border border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
            <CloudSun className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-ink">
              {current.precipitation_mm} <span className="text-xs font-normal">mm</span>
            </span>
            <span className="text-[11px] text-muted">Precipitation</span>
          </div>
        </div>
      </div>

      {/* Agronomic Spray Advisory Banner */}
      <div
        className={`p-3.5 rounded-card border flex items-center gap-3 text-xs sm:text-sm ${
          isSprayIdeal
            ? 'bg-surface-alt border-forest/30 text-ink'
            : 'bg-surface-alt border-warning text-ink'
        }`}
      >
        {isSprayIdeal ? (
          <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 flex-1">
          <div>
            <span className="font-bold text-forest">Agronomy Advisory: </span>
            <span className="text-ink">{current.spray_advisory}</span>
          </div>
          <Badge variant={isSprayIdeal ? 'lime' : 'forest'} className="self-start sm:self-auto shrink-0">
            {isSprayIdeal ? 'Ideal for Spray' : 'Caution Required'}
          </Badge>
        </div>
      </div>

      {/* 5-Day Mini Outlook */}
      {forecast && forecast.length > 0 && (
        <div className="pt-2 border-t border-line flex items-center justify-between gap-2 overflow-x-auto text-xs">
          {forecast.map((day, idx) => (
            <div
              key={day.date || idx}
              className="flex flex-col items-center p-2 rounded-card bg-surface-alt border border-line min-w-[65px] flex-1 text-center"
            >
              <span className="font-semibold text-muted text-[11px] truncate max-w-full">
                {day.date.length > 5 ? day.date.slice(5) : day.date}
              </span>
              <span className="font-bold text-ink mt-0.5">{day.max_temp}°</span>
              <span className="text-[10px] text-muted">{day.min_temp}°</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
