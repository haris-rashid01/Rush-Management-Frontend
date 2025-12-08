import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Bell, Save, Volume2, Calendar, Settings, Edit2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { prayerTimeService, PrayerSettings } from "@/services/prayerTimeService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function AdminPrayerTimes() {
  const { showSuccess, showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PrayerSettings>({
    location: "Lahore, PK",
    latitude: 31.5204,
    longitude: 74.3587,
    calculationMethod: 1, // Karachi
    asrMethod: "Standard",
    highLatitudeRule: "MiddleOfNight",
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    },
    notifications: {
      enabled: true,
      soundEnabled: true,
      reminderMinutes: 15
    },
    display: {
      showOnDashboard: true,
      showInSidebar: true,
      use24HourFormat: true
    }
  });

  const [rawTimes, setRawTimes] = useState<Record<string, string>>({});
  const [previewTimes, setPreviewTimes] = useState<any[]>([]);
  const [editPrayer, setEditPrayer] = useState<{ name: string; currentTime: string } | null>(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Fetch preview times whenever location or method changes
    fetchPreviewTimes();
  }, [settings.latitude, settings.longitude, settings.calculationMethod, settings.adjustments]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await prayerTimeService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load prayer settings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreviewTimes = async () => {
    try {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod}`
      );
      const data = await response.json();
      if (data.code === 200) {
        const timings = data.data.timings;
        setRawTimes(timings);

        const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const calculated = prayers.map(name => {
          const key = name.toLowerCase() as keyof typeof settings.adjustments;
          const baseTime = timings[name];
          const adjustment = settings.adjustments[key];
          const adjustedTime = addMinutes(baseTime, adjustment);

          return {
            name,
            originalTime: baseTime,
            time: formatTime(adjustedTime),
            adjustment
          };
        });

        setPreviewTimes(calculated);
      }
    } catch (error) {
      console.error("Failed to fetch preview times", error);
    }
  };

  const addMinutes = (time: string, minutes: number): Date => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + minutes);
    date.setSeconds(0);
    return date;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !settings.display.use24HourFormat
    });
  };

  const handleSave = async () => {
    try {
      await prayerTimeService.updateSettings(settings);
      showSuccess("Settings Saved", "Prayer time settings have been updated successfully.");
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to save settings");
    }
  };

  const handleToggle = (section: keyof PrayerSettings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: !(prev[section] as any)[key]
      }
    }));
  };

  const handleInputChange = (key: keyof PrayerSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAdjustmentChange = (prayer: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [prayer]: value
      }
    }));
  };

  const handleNotificationChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleTimeEdit = (prayerName: string) => {
    const prayer = previewTimes.find(p => p.name === prayerName);
    if (prayer) {
      // Convert current displayed time to HH:mm for input
      // We need the adjusted date object to get 24h format for input
      const key = prayerName.toLowerCase() as keyof typeof settings.adjustments;
      const baseTime = rawTimes[prayerName];
      const adjustment = settings.adjustments[key];
      const date = addMinutes(baseTime, adjustment);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      setNewTime(`${hours}:${minutes}`);
      setEditPrayer({ name: prayerName, currentTime: prayer.time });
    }
  };

  const saveTimeEdit = () => {
    if (!editPrayer || !newTime) return;

    const prayerName = editPrayer.name;
    const baseTime = rawTimes[prayerName]; // HH:mm

    // Calculate difference in minutes
    const [baseH, baseM] = baseTime.split(':').map(Number);
    const [newH, newM] = newTime.split(':').map(Number);

    const baseDate = new Date();
    baseDate.setHours(baseH, baseM, 0);

    const newDate = new Date();
    newDate.setHours(newH, newM, 0);

    // Handle day rollover if needed (unlikely for prayer times but possible near midnight)
    let diffMs = newDate.getTime() - baseDate.getTime();
    let diffMins = Math.round(diffMs / 60000);

    handleAdjustmentChange(prayerName.toLowerCase(), diffMins);
    setEditPrayer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prayer Times Management</h1>
          <p className="text-muted-foreground">Configure Islamic prayer times for your organization</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2" disabled={isLoading}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Current Prayer Times Preview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Prayer Times
          </CardTitle>
          <CardDescription>
            Calculated times based on location + your manual adjustments.
            Click the edit icon to set a fixed time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {previewTimes.map((prayer) => (
              <div key={prayer.name} className="relative group text-center p-4 rounded-lg bg-white dark:bg-gray-900 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="text-lg font-bold text-primary">{prayer.time}</div>
                <div className="text-sm text-muted-foreground">{prayer.name}</div>
                {prayer.adjustment !== 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {prayer.adjustment > 0 ? '+' : ''}{prayer.adjustment} min
                  </Badge>
                )}

                <Dialog open={editPrayer?.name === prayer.name} onOpenChange={(open) => !open && setEditPrayer(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleTimeEdit(prayer.name)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit {prayer.name} Time</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Set Time</Label>
                        <Input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          This will automatically calculate the adjustment offset from the astronomical time ({prayer.originalTime}).
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditPrayer(null)}>Cancel</Button>
                      <Button onClick={saveTimeEdit}>Set Time</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Settings
            </CardTitle>
            <CardDescription>Set your organization's location for accurate prayer times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location Name</Label>
              <Input
                id="location"
                value={settings.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  value={settings.latitude}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                  placeholder="40.7128"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  value={settings.longitude}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                  placeholder="-74.0060"
                />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                  handleInputChange('latitude', position.coords.latitude);
                  handleInputChange('longitude', position.coords.longitude);
                  showSuccess("Location Detected", "Coordinates updated successfully.");
                }, (error) => {
                  showError("Error", "Failed to detect location.");
                });
              }
            }}>
              <MapPin className="h-4 w-4 mr-2" />
              Detect Current Location
            </Button>
          </CardContent>
        </Card>


        {/* Time Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Manual Adjustments
            </CardTitle>
            <CardDescription>Fine-tune prayer times (in minutes)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
              <div key={prayer} className="flex items-center justify-between">
                <Label htmlFor={`${prayer}Adj`} className="capitalize">{prayer}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`${prayer}Adj`}
                    type="number"
                    value={settings.adjustments[prayer as keyof typeof settings.adjustments]}
                    onChange={(e) => handleAdjustmentChange(prayer, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure prayer time notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">Send prayer time notifications to all employees</p>
              </div>
              <Switch
                checked={settings.notifications.enabled}
                onCheckedChange={() => handleNotificationChange('enabled', !settings.notifications.enabled)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Prayer Sound</Label>
                <p className="text-xs text-muted-foreground">Play adhan sound for notifications</p>
              </div>
              <Switch
                checked={settings.notifications.soundEnabled}
                onCheckedChange={() => handleNotificationChange('soundEnabled', !settings.notifications.soundEnabled)}
                disabled={!settings.notifications.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderMinutes">Reminder Before Prayer</Label>
              <Select
                value={(settings.notifications?.reminderMinutes ?? 15).toString()}
                onValueChange={(value) => handleNotificationChange('reminderMinutes', parseInt(value))}
                disabled={!settings.notifications.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Test Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Test & Preview
            </CardTitle>
            <CardDescription>Test your prayer time notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => showSuccess("Test Notification", "It is time for Dhuhr prayer.")}>
              <Bell className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
            <Button variant="outline" className="w-full">
              <Volume2 className="h-4 w-4 mr-2" />
              Play Adhan Sound
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}