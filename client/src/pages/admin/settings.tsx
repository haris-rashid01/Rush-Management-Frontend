import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Mail, Shield, Database, Clock, Save, RefreshCw } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { settingsService, Settings as SettingsType } from "@/services/settingsService";

export default function AdminSettings() {
  const { showSuccess, showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    // General Settings
    companyName: "Rush Corporation",
    companyEmail: "info@rushcorp.com",
    companyPhone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",

    // Email Settings
    emailNotifications: true,
    emailHost: "smtp.rushcorp.com",
    emailPort: "587",
    emailUsername: "noreply@rushcorp.com",

    // Security Settings
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    sessionTimeout: 30,
    twoFactorAuth: true,
    ipWhitelist: false,

    // System Settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    maxFileSize: 50,

    // Prayer Times
    prayerNotifications: true,
    prayerCalculationMethod: "ISNA",
    prayerSoundEnabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      // Merge fetched settings with defaults to ensure all keys exist
      setSettings(prev => ({
        ...prev,
        ...data,
        // Ensure boolean strings are converted back to booleans if needed
        emailNotifications: data.emailNotifications === 'true' || data.emailNotifications === true,
        passwordRequireSpecialChar: data.passwordRequireSpecialChar === 'true' || data.passwordRequireSpecialChar === true,
        twoFactorAuth: data.twoFactorAuth === 'true' || data.twoFactorAuth === true,
        ipWhitelist: data.ipWhitelist === 'true' || data.ipWhitelist === true,
        maintenanceMode: data.maintenanceMode === 'true' || data.maintenanceMode === true,
        autoBackup: data.autoBackup === 'true' || data.autoBackup === true,
        prayerNotifications: data.prayerNotifications === 'true' || data.prayerNotifications === true,
        prayerSoundEnabled: data.prayerSoundEnabled === 'true' || data.prayerSoundEnabled === true,
        // Ensure numbers are numbers
        passwordMinLength: Number(data.passwordMinLength) || 8,
        sessionTimeout: Number(data.sessionTimeout) || 30,
        maxFileSize: Number(data.maxFileSize) || 50,
      }));
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      // Don't show error on first load as it might be empty
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await settingsService.updateSettings(settings);
      showSuccess("Settings Saved", "System settings have been updated successfully.");
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isLoading ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="prayer">Prayer Times</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Karachi">Pakistan (PKT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prayer Times Settings */}
        <TabsContent value="prayer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prayer Times Configuration
              </CardTitle>
              <CardDescription>Configure Islamic prayer time settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Prayer Notifications</Label>
                  <p className="text-xs text-muted-foreground">Enable prayer time notifications for all users</p>
                </div>
                <Switch
                  checked={settings.prayerNotifications}
                  onCheckedChange={() => handleToggle('prayerNotifications')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Prayer Sound</Label>
                  <p className="text-xs text-muted-foreground">Play adhan sound for prayer notifications</p>
                </div>
                <Switch
                  checked={settings.prayerSoundEnabled}
                  onCheckedChange={() => handleToggle('prayerSoundEnabled')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}