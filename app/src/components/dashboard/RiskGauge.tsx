import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  probability: number;
}

export function RiskGauge({ probability }: RiskGaugeProps) {
  const percentage = (probability * 100);
  
  const getRiskLevel = (p: number) => {
    if (p < 0.3) return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (p < 0.6) return { level: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    if (p < 0.8) return { level: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500' };
    return { level: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  const risk = getRiskLevel(probability);
  
  // Calculate arc position (0-100 maps to 0-180 degrees)
  const angle = (percentage / 100) * 180;
  
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Outage Risk Level</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Gauge Container */}
        <div className="relative w-48 h-28 mt-2">
          {/* Background Arc */}
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            
            {/* Background Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Colored Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Needle */}
            <g 
              transform={`rotate(${angle - 90}, 100, 100)`}
              className="transition-transform duration-1000 ease-out"
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="35"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill="white" />
              <circle cx="100" cy="100" r="5" fill="hsl(var(--background))" />
            </g>
            
            {/* Ticks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = (tick / 100) * 180 - 90;
              const rad = (tickAngle * Math.PI) / 180;
              const x1 = 100 + 65 * Math.cos(rad);
              const y1 = 100 + 65 * Math.sin(rad);
              const x2 = 100 + 75 * Math.cos(rad);
              const y2 = 100 + 75 * Math.sin(rad);
              
              return (
                <g key={tick}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + 55 * Math.cos(rad)}
                    y={100 + 55 * Math.sin(rad)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Risk Level Display */}
        <div className="text-center mt-4">
          <div className={cn("text-4xl font-bold", risk.color)}>
            {percentage.toFixed(1)}%
          </div>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full mt-2",
            "bg-opacity-10 border",
            risk.bgColor.replace('bg-', 'bg-') + '/10',
            risk.bgColor.replace('bg-', 'border-') + '/30'
          )}>
            <span className={cn("w-2 h-2 rounded-full", risk.bgColor)} />
            <span className={cn("text-sm font-medium", risk.color)}>
              {risk.level} Risk
            </span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">&lt;30%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">30-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">&gt;80%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
