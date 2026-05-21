import { Bell, Activity, Target, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KeyMetricsProps { 
  activeAlerts: number;
  predictionsToday: number;
  accuracy: number;
  uptime: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  alert?: boolean;
}

function MetricCard({ title, value, unit, icon: Icon, trend, trendValue, color, alert }: MetricCardProps) {
  return (
    <Card className={cn("glass-panel overflow-hidden", alert && "border-red-500/30")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold", alert && "text-red-500")}>{value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                trend === 'up' ? "text-green-500" :
                trend === 'down' ? "text-red-500" : "text-muted-foreground"
              )}>
                <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            color
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KeyMetrics({ activeAlerts, predictionsToday, accuracy, uptime }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Active Alerts"
        value={activeAlerts}
        icon={Bell}
        trend={activeAlerts > 0 ? 'up' : 'neutral'}
        trendValue={activeAlerts > 0 ? 'Needs attention' : 'All clear'}
        color="bg-red-500"
        alert={activeAlerts > 0}
      />
      <MetricCard
        title="Predictions Today"
        value={predictionsToday}
        icon={Activity}
        trend="up"
        trendValue="Live tracking"
        color="bg-blue-500"
      />
      <MetricCard
        title="Model Accuracy"
        value={accuracy}
        unit="%"
        icon={Target}
        trend="up"
        trendValue="+2% this week"
        color="bg-green-500"
      />
      <MetricCard
        title="System Uptime"
        value={uptime}
        unit="%"
        icon={Server}
        trend="neutral"
        trendValue="Last 30 days"
        color="bg-cyan-500"
      />
    </div>
  );
}
