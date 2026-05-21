import { Activity, Clock, MapPin, TrendingUp, AlertTriangle, CheckCircle, Eye, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/types/dashboard';
import { useDashboardStore } from '@/hooks/useDashboard';
import { useState } from 'react';
import { format } from 'date-fns';

interface PredictionsPanelProps {
  predictions: Prediction[];
}

export function PredictionsPanel({ predictions }: PredictionsPanelProps) {
  const alertThreshold = useDashboardStore((state) => state?.alertThreshold ?? 70);
  const riskBoundaries = useDashboardStore((state) => state?.riskBoundaries ?? { low: 30, moderate: 60, high: 80 });
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'moderate': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    } catch (e) { return 'Just now'; }
  };

  if (!predictions || predictions.length === 0) {
    return (
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Active Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active predictions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Active Predictions
            </CardTitle>
            <Badge variant="outline" className="text-xs">{predictions.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-3">
              {predictions.map((prediction) => {
                const pct = Math.round(prediction.probability * 100);
                return (
                  <div key={prediction.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={cn("text-xs font-medium", getRiskColor(prediction.riskLevel))}>
                            {getRiskIcon(prediction.riskLevel)}
                            <span className="ml-1 capitalize">{prediction.riskLevel}</span>
                          </Badge>
                          {pct >= alertThreshold && (
                            <div className="flex items-center text-orange-500 gap-1 animate-pulse">
                              <Bell className="w-3 h-3" />
                              <span className="text-[10px] font-bold">ALERTED</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(prediction.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn(
                            "text-2xl font-bold",
                            pct > riskBoundaries.high ? "text-red-500" : 
                            pct > riskBoundaries.moderate ? "text-orange-500" :
                            pct > riskBoundaries.low ? "text-yellow-500" : "text-green-500"
                          )}>
                            {pct}%
                          </span>
                          <span className="text-xs text-muted-foreground">probability</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {prediction.affectedArea && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{prediction.affectedArea}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>~{prediction.estimatedTimeToOutage.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedPrediction(prediction); setDialogOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-3 relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("absolute h-full rounded-full transition-all duration-500",
                          pct > riskBoundaries.high ? "bg-red-500" : 
                          pct > riskBoundaries.moderate ? "bg-orange-500" :
                          pct > riskBoundaries.low ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Probability</p>
                  <p className={cn(
                    "text-xl font-bold",
                    selectedPrediction.probability > 0.8 ? "text-red-500" :
                    selectedPrediction.probability > 0.6 ? "text-orange-500" :
                    selectedPrediction.probability > 0.3 ? "text-yellow-500" : "text-green-500"
                  )}>
                    {Math.round(selectedPrediction.probability * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <Badge variant="outline" className={cn("mt-1", getRiskColor(selectedPrediction.riskLevel))}>
                    {selectedPrediction.riskLevel}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-medium">{Math.round(selectedPrediction.confidence * 100)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Time to Outage</p>
                  <p className="text-lg font-medium">~{selectedPrediction.estimatedTimeToOutage.toFixed(1)}h</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="font-medium">
                  {format(new Date(selectedPrediction.timestamp), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              {selectedPrediction.affectedArea && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Affected Area</p>
                  <p className="font-medium">{selectedPrediction.affectedArea}</p>
                </div>
              )}
              {selectedPrediction.features && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Features</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedPrediction.features).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}