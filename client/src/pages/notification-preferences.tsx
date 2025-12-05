import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Save,
  FileText,
  Heart,
  Shield
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationPreferences() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [preferences, setPreferences] = useState({
    // Email Notifications
    emailEnabled: true,
    emailLeaveRequests: true,
    emailMeetingReminders: true,
    emailPrayerTimes: true,
    emailSystemUpdates: false,
    emailMarketing: false,

    // Push Notifications
    pushEnabled: true,
    pushLeaveRequests: true,
    pushMeetingReminders: true,
    pushPrayerTimes: true,
    pushSystemUpdates: true,
    pushMarketing: false,

    // In-App Notifications
    inAppEnabled: true,
    inAppLeaveRequests: true,
    inAppMeetingReminders: true,
    inAppPrayerTimes: true,
    inAppSystemUpdates: true,

    // Sound & Timing
    soundEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",

    // Frequency
    digestFrequency: "daily",
    reminderTiming: "15min"
  });

  useEffect(() => {
    if (user?.notificationSettings) {
      setPreferences(prev => ({
        ...prev,
        ...user.notificationSettings
      }));
    }
  }, [user]);

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      await userService.updateUser(user.id, {
        notificationSettings: preferences
      });

      // Handle Push Subscription if enabled
      if (preferences.pushEnabled) {
        await registerPush();
      }

      await refreshUser();
      showSuccess("Preferences Saved", "Your notification preferences have been updated successfully.");
    } catch (error) {
      showError("Save Failed", "Failed to save notification preferences.");
      console.error(error);
    }
  };

  const registerPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      const publicVapidKey = 'BCM74rthvnC60-FZP-t6Acg1Ntm8jcFPDME34jSPJo7PI2fWtGPeMrYFO1I4muPd4gC0wjYz6zvq5HVVkleFEGk'; // Match backend key

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      await userService.subscribeToPush(subscription);
      console.log('Push subscribed');
    } catch (error) {
      console.error('Error registering push:', error);
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const NotificationToggle = ({
    id,
    label,
    description,
    icon,
    checked,
    disabled = false
  }: {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    checked: boolean;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1">{icon}</div>
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={() => handleToggle(id)}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Preferences</h1>
          <p className="text-muted-foreground">Customize how and when you receive notifications</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Control which notifications you receive via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle
              id="emailEnabled"
              label="Enable Email Notifications"
              description="Master switch for all email notifications"
              icon={<Mail className="h-4 w-4 text-blue-500" />}
              checked={preferences.emailEnabled}
            />

            <Separator />

            <NotificationToggle
              id="emailLeaveRequests"
              label="Leave Request Updates"
              description="Status updates on your leave requests"
              icon={<FileText className="h-4 w-4 text-green-500" />}
              checked={preferences.emailLeaveRequests}
              disabled={!preferences.emailEnabled}
            />

            <NotificationToggle
              id="emailPrayerTimes"
              label="Prayer Time Reminders"
              description="Daily prayer time notifications"
              icon={<Heart className="h-4 w-4 text-red-500" />}
              checked={preferences.emailPrayerTimes}
              disabled={!preferences.emailEnabled}
            />

            <NotificationToggle
              id="emailSystemUpdates"
              label="System Updates"
              description="Important system announcements"
              icon={<Shield className="h-4 w-4 text-orange-500" />}
              checked={preferences.emailSystemUpdates}
              disabled={!preferences.emailEnabled}
            />
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Real-time notifications on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle
              id="pushEnabled"
              label="Enable Push Notifications"
              description="Master switch for all push notifications"
              icon={<Smartphone className="h-4 w-4 text-blue-500" />}
              checked={preferences.pushEnabled}
            />

            <Separator />

            <NotificationToggle
              id="pushLeaveRequests"
              label="Leave Request Updates"
              description="Instant updates on leave status"
              icon={<FileText className="h-4 w-4 text-green-500" />}
              checked={preferences.pushLeaveRequests}
              disabled={!preferences.pushEnabled}
            />

            <NotificationToggle
              id="pushPrayerTimes"
              label="Prayer Time Alerts"
              description="Prayer time notifications with sound"
              icon={<Heart className="h-4 w-4 text-red-500" />}
              checked={preferences.pushPrayerTimes}
              disabled={!preferences.pushEnabled}
            />

            <NotificationToggle
              id="pushSystemUpdates"
              label="System Alerts"
              description="Critical system notifications"
              icon={<Shield className="h-4 w-4 text-orange-500" />}
              checked={preferences.pushSystemUpdates}
              disabled={!preferences.pushEnabled}
            />
          </CardContent>
        </Card>

        {/* Sound & Timing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sound & Timing
            </CardTitle>
            <CardDescription>
              Configure notification sounds and quiet hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <NotificationToggle
              id="soundEnabled"
              label="Notification Sounds"
              description="Play sounds for notifications"
              icon={preferences.soundEnabled ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
              checked={preferences.soundEnabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}