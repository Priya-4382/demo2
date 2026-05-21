import { Bell, CheckCircle, Clock, User, AlertTriangle, Info, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/dashboard';
import { useState } from 'react';
import { format } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeAlerts = alerts.filter(alert => alert.status === 'pending');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'acknowledged': return 'text-blue-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <AlertTriangle className="w-4 h-4" />;
      case 'threshold': return <Info className="w-4 h-4" />;
      case 'manual': return <User className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (activeAlerts.length === 0) {
    return (
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>No pending alerts</p>
            <p className="text-sm">All alerts have been handled</p>
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
              <Bell className="w-5 h-5 text-primary" />
              Pending Alerts
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500">
              {activeAlerts.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
             {activeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      alert.priority === 'critical' ? "bg-red-500/10" :
                      alert.priority === 'high' ? "bg-orange-500/10" :
                      alert.priority === 'moderate' ? "bg-yellow-500/10" : "bg-green-500/10"
                    )}>
                      {getTypeIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getPriorityColor(alert.priority))}
                        >
                          {alert.priority}
                        </Badge>
                        <span className={cn("text-xs", getStatusColor(alert.status))}>
                          {alert.status}
                        </span>
                      </div>

                      <p className="text-sm text-foreground mb-1 line-clamp-2">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ack
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(getPriorityColor(selectedAlert.priority))}>
                  {selectedAlert.priority}
                </Badge>
                <Badge variant="outline" className={getStatusColor(selectedAlert.status)}>
                  {selectedAlert.status}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="font-medium">{selectedAlert.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedAlert.type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedAlert.timestamp), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
              
              {selectedAlert.acknowledgedBy && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Acknowledged By</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedAlert.acknowledgedBy}
                  </p>
                  {selectedAlert.acknowledgedAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      at {format(new Date(selectedAlert.acknowledgedAt), 'MMM d, HH:mm')}
                    </p>
                  )}
                </div>
              )}
              
              {selectedAlert.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedAlert.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
