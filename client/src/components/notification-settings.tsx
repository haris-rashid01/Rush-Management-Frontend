import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Settings, Volume2, VolumeX, Smartphone } from 'lucide-react';

interface NotificationSettings {
  pushNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showOnLockScreen: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    system: boolean;
    updates: boolean;
    reminders: boolean;
    social: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  pushNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  showOnLockScreen: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  categories: {
    system: true,
    updates: true,
    reminders: true,
    social: false,
  },
};

export function NotificationSettings() {
  const { requestPermission, showSuccess, showError } = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check current permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (granted) {
        setPermissionStatus('granted');
        saveSettings({ ...settings, pushNotifications: true });
        showSuccess('Notifications Enabled', 'You will now receive push notifications');
      } else {
        showError('Permission Denied', 'Please enable notifications in your browser settings');
      }
    } else {
      saveSettings({ ...settings, pushNotifications: false });
      showSuccess('Notifications Disabled', 'Push notifications have been turned off');
    }
  };

  const testNotification = () => {
    if (settings.pushNotifications && permissionStatus === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Rush Corporation',
        icon: '/favicon.png',
        badge: '/favicon.png',
      });
    } else {
      showError('Cannot Test', 'Please enable push notifications first');
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Customize how you receive notifications and alerts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <div>
              <p className="font-medium">Browser Permission</p>
              <p className="text-sm text-muted-foreground">Current notification permission status</p>
            </div>
          </div>
          {getPermissionBadge()}
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when the app is closed
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={handlePushNotificationToggle}
            />
          </div>

          {settings.pushNotifications && (
            <Button onClick={testNotification} variant="outline" size="sm">
              <Smartphone className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          )}
        </div>

      </CardContent>
    </Card>
  );
}