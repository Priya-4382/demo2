import { useState,useEffect, useRef,useMemo } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { GridStatusPanel } from '@/components/dashboard/GridStatusPanel';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { KeyMetrics } from '@/components/dashboard/KeyMetrics';
import { WeatherPanel } from '@/components/dashboard/WeatherPanel';
import { GridParameters } from '@/components/dashboard/GridParameters';
import { PredictionsPanel } from '@/components/dashboard/PredictionsPanel';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { PredictionsTab } from '@/components/dashboard/PredictionsTab';
import { AlertsTab } from '@/components/dashboard/AlertsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { LogsTab } from '@/components/dashboard/LogsTab';
import { useDashboardStore, useRealTimeSimulation, useDashboardStats } from '@/hooks/useDashboard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { predictions } from '@/data/mockData';

function Dashboard({ onTabChange, globalRisk, onMenuClick }: { onTabChange: (tab: string) => void , globalRisk: number, onMenuClick: () => void }) {
  const { gridStatus, weather, predictions, alerts, getAlertsByStatus } = useDashboardStore();
  const stats = useDashboardStats();
  
  

  const alertCounts = getAlertsByStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        
        <div className="hidden lg:block">
            <Sidebar activeTab="dashboard" onTabChange={onTabChange} />
        </div>
         
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header 
            isConnected={true}
            lastUpdate={new Date(gridStatus.timestamp)}
            pendingAlerts={alertCounts.pending}
            onMenuClick={onMenuClick}
          />
          
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
            {/* Key Metrics */}
              <KeyMetrics 
                activeAlerts={alertCounts.pending}
                predictionsToday={stats.predictionsToday}
                accuracy={stats.avgAccuracy}
                uptime={stats.uptime}
              />

              {/* Main Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Grid Status */}
                <div className="xl:col-span-2 space-y-6">
                  <GridStatusPanel status={gridStatus} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WeatherPanel weather={weather} />
                    <GridParameters />
                  </div>
                </div>

               {/* Right Column - Risk & Predictions */}
                <div className="space-y-6">
                  <RiskGauge probability={globalRisk}  />
                  <PredictionsPanel predictions={predictions.slice(0, 5)} />
                                    <AlertsPanel 
                    alerts={alerts.filter(a => a.status === 'pending').slice(0, 5)} 
                    onAcknowledge={(id) => {
                      const store = useDashboardStore.getState();
                      store.acknowledgeAlert(id, 'Dashboard User');
                    }}
                    onViewAll={() => onTabChange('alerts')}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


const notificationSound = typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3') : null;
const alertSiren = typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/997/997-preview.mp3') : null;

if (alertSiren) alertSiren.volume = 0.5;
if (notificationSound) notificationSound.volume = 0.4;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getAlertsByStatus, alerts, notifications, notificationSettings, predictions: livePredictions} = useDashboardStore();
 
  

    const currentAverage =useMemo(()  => {
    if (!livePredictions || livePredictions.length === 0) return 0;

  const top5 = [...livePredictions]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const sum = top5.reduce((acc, p) => acc + p.probability, 0);
  return sum / top5.length;
},[livePredictions]);

 
 
  const lastAlertCount = useRef(alerts.length);
  const lastNotificationCount = useRef(notifications?.length || 0);

  useEffect(() => {
    if (!notificationSettings.soundsEnabled) return;
    if (alerts.length > lastAlertCount.current) {
      if (alertSiren) {
        alertSiren.currentTime = 0;
        alertSiren.play().catch(() => console.log("Audio blocked: Click page first"));
      }
    }
    lastAlertCount.current = alerts.length;
    if (notifications && notifications.length > lastNotificationCount.current) {
      if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => console.log("Audio blocked: Click page first"));
      }
    }
    lastNotificationCount.current = notifications?.length || 0;

  }, [alerts.length, notifications?.length, notificationSettings.soundsEnabled]);

 // Start real-time simulation globally
  useRealTimeSimulation();
  const alertCounts = getAlertsByStatus();
   const renderContent = () => { 
  switch (activeTab) {
    case 'dashboard':
            return <Dashboard 
               onTabChange={setActiveTab} 
               globalRisk={currentAverage} 
               onMenuClick={() => setMobileMenuOpen(true)} 
             />;

    case 'predictions':
      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header 
                isConnected={true}
                lastUpdate={new Date()}
                pendingAlerts={alertCounts.pending}
                onMenuClick={() => setMobileMenuOpen(true)}
              />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <PredictionsTab />
                </div>
              </main>
            </div>
          </div>
        </div>
      );

    case 'alerts':
      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header 
                isConnected={true}
                lastUpdate={new Date()}
                pendingAlerts={alertCounts.pending}
                onMenuClick={() => setMobileMenuOpen(true)}
              />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <AlertsTab />
                </div>
              </main>
            </div>
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header 
                isConnected={true}
                lastUpdate={new Date()}
                pendingAlerts={alertCounts.pending}
                onMenuClick={() => setMobileMenuOpen(true)}
              />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <AnalyticsDashboard />
                </div>
              </main>
            </div>
          </div>
        </div>
      );

    case 'logs':
      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header 
                isConnected={true}
                lastUpdate={new Date()}
                pendingAlerts={alertCounts.pending}
                onMenuClick={() => setMobileMenuOpen(true)}
              />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <LogsTab />
                </div>
              </main>
            </div>
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header 
                isConnected={true}
                lastUpdate={new Date()}
                pendingAlerts={alertCounts.pending}
                onMenuClick={() => setMobileMenuOpen(true)}
              />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                  <SettingsTab />
                </div>
              </main>
            </div>
          </div>
        </div>
      );

    default:
            return <Dashboard onTabChange={setActiveTab} globalRisk={currentAverage} onMenuClick={() => setMobileMenuOpen(true)} />;
  }
};

return (
    <>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="p-0 w-64 border-r-0">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }} 
        />
      </SheetContent>
    </Sheet>

      {renderContent()}
    </>
  );
}

export default App;


 
