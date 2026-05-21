import { useState, useMemo } from 'react';
import { 
  Filter, CheckCircle, XCircle, AlertTriangle, User, Clock,
  Plus, Trash2, ChevronLeft, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useDashboardStore, useFilteredAlerts } from '@/hooks/useDashboard';
import { format } from 'date-fns';

export function AlertsTab() {
  const { 
    alerts, 
    acknowledgeAlert, 
    resolveAlert, 
    deleteAlert, 
    addAlert,
    getAlertsByStatus 
  } = useDashboardStore();
  
  // Filters
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog states
  const [ackDialogOpen, setAckDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [acknowledgmentNotes, setAcknowledgmentNotes] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  // New alert form
  const [newAlert, setNewAlert] = useState({
    priority: 'moderate' as const,
    message: '',
    type: 'manual' as const
  });

  // Filter alerts
  const filteredAlerts = useFilteredAlerts(priorityFilter, statusFilter, searchQuery);
  
  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const alertCounts = useMemo(() => getAlertsByStatus(), [alerts, getAlertsByStatus]);

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

  const handleAcknowledge = () => {
    if (selectedAlert) {
      acknowledgeAlert(selectedAlert.id, 'Current User', acknowledgmentNotes);
      setAckDialogOpen(false);
      setAcknowledgmentNotes('');
      setSelectedAlert(null);
    }
  };

  const handleCreateAlert = () => {
    addAlert({
      type: newAlert.type,
      priority: newAlert.priority,
      message: newAlert.message,
      
    });
    setCreateDialogOpen(false);
    setSuccessDialogOpen(true);
    setNewAlert({ priority: 'moderate', message: '', type: 'manual' });
    setTimeout(() => setSuccessDialogOpen(false), 2000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredAlerts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const AlertTable = ({ alerts }: { alerts: typeof filteredAlerts }) => (
   <div className="relative overflow-x-auto rounded-md border border-border/50">
   <Table className="min-w-[1000px] border-collapse ">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead  className= "sticky left-0 z-20 bg-card backdrop-blur-xl border-none ">Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead >Message</TableHead>
          <TableHead >Status</TableHead>
          <TableHead >Assigned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No alerts found
            </TableCell>
          </TableRow>
        ) : (
          alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="sticky left-0 z-10 bg-card backdrop-blur-xl whitespace-nowrap border-none font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {format(new Date(alert.timestamp), 'MMM d, HH:mm')}
                </div>
              </TableCell>
              <TableCell >
                <Badge variant="outline" className="text-xs capitalize">
                  {alert.type}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline" className={cn("text-xs", getPriorityColor(alert.priority))}>
                  {alert.priority}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <p className="truncate">{alert.message}</p>
              </TableCell>
              <TableCell>
                <span className={cn("text-sm font-medium capitalize", getStatusColor(alert.status))}>
                  {alert.status}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {alert.acknowledgedBy ? (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    {alert.acknowledgedBy}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {alert.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setAckDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ack
                    </Button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-muted-foreground">Monitor and respond to system alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{alertCounts.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-blue-500">{alertCounts.acknowledged}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-500">{alertCounts.resolved}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
            All ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setStatusFilter('pending')}>
            Pending ({alertCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="acknowledged" onClick={() => setStatusFilter('acknowledged')}>
            Acknowledged ({alertCounts.acknowledged})
          </TabsTrigger>
          <TabsTrigger value="resolved" onClick={() => setStatusFilter('resolved')}>
            Resolved ({alertCounts.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AlertsTableContent />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <AlertsTableContent />
        </TabsContent>
        <TabsContent value="acknowledged" className="mt-4">
          <AlertsTableContent />
        </TabsContent>
        <TabsContent value="resolved" className="mt-4">
          <AlertsTableContent />
        </TabsContent>
      </Tabs>

      {/* Acknowledge Dialog */}
      <Dialog open={ackDialogOpen} onOpenChange={setAckDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alert</DialogTitle>
            <DialogDescription>
              Add notes about the actions taken for this alert
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedAlert && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{selectedAlert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Priority: {selectedAlert.priority}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                placeholder="Add acknowledgment notes..."
                value={acknowledgmentNotes}
                onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={handleAcknowledge}>
              Acknowledge Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Alert</DialogTitle>
            <DialogDescription>
              Create a new alert for operators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={newAlert.priority} 
                onValueChange={(v) => setNewAlert({ ...newAlert, priority: v as typeof newAlert.priority })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Enter alert message..."
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleCreateAlert}
              disabled={!newAlert.message.trim()}
            >
              Create Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
  <DialogContent className="max-w-sm ">
    <div className="flex flex-col items-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <DialogTitle className="text-xl text-white">Alert Created</DialogTitle>
      <DialogDescription className="mt-2">
        The new outage alert has been added successfully.
      </DialogDescription>
      
    </div>
  </DialogContent>
</Dialog>
    </div>
  );

  function AlertsTableContent() {
    return (
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Alerts ({filteredAlerts.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border border-border bg-background w-40"
              />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <AlertTable alerts={paginatedAlerts} />
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}
