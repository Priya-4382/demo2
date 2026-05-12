import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Bell, Mail, Smartphone, Shield, Database, Save,
  CheckCircle, RefreshCw, Upload, Key, Moon, Volume2,VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/hooks/useDashboard';


const saveSuccessSound = typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3') : null;
if (saveSuccessSound) {
  saveSuccessSound.load();
  saveSuccessSound.volume = 1.0;
}

export function SettingsTab() {
  const { 
    notificationSettings, 
    updateNotificationSettings,
    alertThreshold,
    updateAlertThreshold,
    riskBoundaries,
    updateRiskBoundaries,
    addLog,
    predictions,
    alerts
  } = useDashboardStore();
  
  // Local state for form values
  const [localSettings, setLocalSettings] = useState(notificationSettings);
  const [localThreshold, setLocalThreshold] = useState(alertThreshold);
  const [localBoundaries, setLocalBoundaries] = useState(riskBoundaries);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [retrainDialogOpen, setRetrainDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Track changes
  useEffect(() => {
    const changed = 
      JSON.stringify(localSettings) !== JSON.stringify(notificationSettings) ||
      localThreshold !== alertThreshold ||
      JSON.stringify(localBoundaries) !== JSON.stringify(riskBoundaries);
    setHasChanges(changed);
  }, [localSettings, localThreshold, localBoundaries, notificationSettings, alertThreshold, riskBoundaries]);

  const handleSave = async () => {
  setSaving(true);
  try {
      await updateNotificationSettings(localSettings);
      await updateAlertThreshold(localThreshold);
    await updateRiskBoundaries(localBoundaries);
    
    if (localSettings.soundsEnabled && saveSuccessSound) {
      saveSuccessSound.currentTime = 0;
      saveSuccessSound.play().catch(e => console.error("Save sound failed", e));
    }

    setSaveDialogOpen(true);
    setTimeout(() => {
      setSaveDialogOpen(false);
    }, 2500);
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    setSaving(false);
  }
};

  const handleReset = () => {
    setLocalSettings(notificationSettings);
    setLocalThreshold(alertThreshold);
    setLocalBoundaries(riskBoundaries);
    setHasChanges(false);
  };

  const addEmailRecipient = () => {
    const email = prompt('Enter email address:');
    if (email && email.includes('@')) {
      setLocalSettings({ ...localSettings, emailRecipients: [...localSettings.emailRecipients, email]
      });
    }
  };

  const removeEmailRecipient = (email: string) => {
    setLocalSettings({
      ...localSettings,
      emailRecipients: localSettings.emailRecipients.filter(e => e !== email)
    });
  };

  const addSmsRecipient = () => {
    const phone = prompt('Enter phone number (e.g., +2348012345678):');
    if (phone && phone.startsWith('+')) {
      setLocalSettings({
        ...localSettings,
        smsRecipients: [...localSettings.smsRecipients, phone]
      });
    }
  };

  const removeSmsRecipient = (phone: string) => {
    setLocalSettings({
      ...localSettings,
      smsRecipients: localSettings.smsRecipients.filter(p => p !== phone)
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure dashboard and system preferences</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Email Notifications */}
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Email Notifications</CardTitle>
                    <CardDescription>Send alerts via email</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={localSettings.emailEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, emailEnabled: checked })}
                />
              </div>
            </CardHeader>
            {localSettings.emailEnabled && (
              <CardContent className="space-y-4">
                <div>
                  <Label>Email Recipients</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {localSettings.emailRecipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button 
                          onClick={() => removeEmailRecipient(email)}
                          className="ml-1 hover:text-red-500"
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm" onClick={addEmailRecipient}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Email Template</Label>
                  <Select defaultValue="detailed">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple - Basic alert info</SelectItem>
                      <SelectItem value="detailed">Detailed - Full prediction data</SelectItem>
                      <SelectItem value="custom">Custom - User defined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SMS Notifications */}
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">SMS Notifications</CardTitle>
                    <CardDescription>Send critical alerts via SMS</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={localSettings.smsEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, smsEnabled: checked })}
                />
              </div>
            </CardHeader>
            {localSettings.smsEnabled && (
              <CardContent>
                <Label>SMS Recipients</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {localSettings.smsRecipients.map((phone) => (
                    <Badge key={phone} variant="secondary" className="flex items-center gap-1">
                      {phone}
                      <button 
                        onClick={() => removeSmsRecipient(phone)}
                        className="ml-1 hover:text-red-500"
                      >
                        <span className="sr-only">Remove</span>
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" onClick={addSmsRecipient}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Push Notifications */}
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Push Notifications</CardTitle>
                    <CardDescription>Browser and mobile push notifications</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={localSettings.pushEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, pushEnabled: checked })}
                />
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-4">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Alert Threshold
              </CardTitle>
              <CardDescription>Minimum probability to trigger an alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">{localThreshold}%</span>
                  <p className="text-sm text-muted-foreground">
                    Predictions above this threshold will generate alerts
                  </p>
                </div>
              </div>
              <Slider 
                value={[localThreshold]} 
                onValueChange={(value) => setLocalThreshold(value[0])}
                min={30}
                max={90}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30% (More alerts)</span>
                <span>60% (Balanced)</span>
                <span>90% (Fewer alerts)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Risk Level Boundaries</CardTitle>
              <CardDescription>Define risk categories based on probability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <RiskBoundaryCard 
                  title="Low Risk"
                  color="green"
                  value={localBoundaries.low}
                  onChange={(v) => setLocalBoundaries({ ...localBoundaries, low: v })}
                  max={localBoundaries.moderate - 1}
                />
                <RiskBoundaryCard 
                  title="Moderate Risk"
                  color="yellow"
                  value={localBoundaries.moderate}
                  onChange={(v) => setLocalBoundaries({ ...localBoundaries, moderate: v })}
                  min={localBoundaries.low + 1}
                  max={localBoundaries.high - 1}
                />
                <RiskBoundaryCard 
                  title="High Risk"
                  color="orange"
                  value={localBoundaries.high}
                  onChange={(v) => setLocalBoundaries({ ...localBoundaries, high: v })}
                  min={localBoundaries.moderate + 1}
                  max={99}
                />
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">Critical Risk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {localBoundaries.high}% - 100%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatic for values above High Risk threshold
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Tab */}
        <TabsContent value="model" className="space-y-4">
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Current Model</CardTitle>
                    <CardDescription>Ensemble (Random Forest + Gradient Boosting)</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2 font-medium">v2.1.0</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Last Trained:</span>
                  <span className="ml-2 font-medium">2024-03-15</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="ml-2 font-medium">75%</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Features:</span>
                  <span className="ml-2 font-medium">15</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setRetrainDialogOpen(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retrain Model
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Model
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Data Sources</CardTitle>
              <CardDescription>Connected data feeds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'SCADA System', status: 'connected', lastSync: '2s ago' },
                { name: 'Weather API', status: 'connected', lastSync: '5m ago' },
                { name: 'Smart Meters', status: 'connected', lastSync: '1m ago' },
                { name: 'Equipment Sensors', status: 'warning', lastSync: '15m ago' },
              ].map((source) => (
                <div 
                  key={source.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      source.status === 'connected' ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    <span className="text-sm">{source.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Last sync: {source.lastSync}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Sounds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Sytem Sounds</p>
                    <p className="text-sm text-muted-foreground">Play audio alerts</p>
                  </div>
                </div>
                <Switch checked={localSettings.soundsEnabled || false}
          onCheckedChange={(checked) => {
            setLocalSettings({ ...localSettings, soundsEnabled: checked });
          }} />
              </div>
            </CardContent>
          </Card>

          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                </div>
                <Switch 
  checked={localSettings.darkMode} 
  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, darkMode: checked })} 
/>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
                  </div>
                </div>
                <Switch 
                     checked={localSettings.twoFactor} 
                     onCheckedChange={(checked) => setLocalSettings({ ...localSettings, twoFactor: checked })} 
                        />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes</p>
                  </div>
                </div>
                <Switch 
  checked={localSettings.sessionTimeout} 
  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, sessionTimeout: checked })} 
/>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-red-500/20">
            <CardHeader>
              <CardTitle className="text-base text-red-500">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reset All Data</p>
                  <p className="text-sm text-muted-foreground">Clear all predictions, alerts, and logs</p>
                </div>
                <Button variant="destructive" size="sm">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>
      </Tabs>

      {/* Save Success Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle>Settings Saved</DialogTitle>
            <DialogDescription>
              Your changes have been saved successfully.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retrain Dialog */}
      <Dialog open={retrainDialogOpen} onOpenChange={setRetrainDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retrain Model</DialogTitle>
            <DialogDescription>
              This will retrain the model using the latest data. This process may take several minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Training Data</p>
              <p className="text-sm text-muted-foreground">
                {predictions.length} predictions, {alerts.length} alerts
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRetrainDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setRetrainDialogOpen(false);
                  addLog({
                    level: 'info',
                    category: 'Model',
                    message: 'Model retraining initiated',
                    details: 'Training started with latest data'
                  });
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RiskBoundaryCard({ 
  title, 
  color, 
  value, 
  onChange,
  min = 0,
  max = 100
}: { 
  title: string; 
  color: string; 
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500/10 border-green-500/30',
    yellow: 'bg-yellow-500/10 border-yellow-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30'
  };

  return (
    <div className={cn("p-4 rounded-lg border", colorClasses[color])}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)} />
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-16 px-2 py-1 text-sm rounded border border-border bg-background"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full mt-3"
      />
    </div>
  );
}

// Plus icon component
function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
