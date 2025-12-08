import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Bell, Timer, Compass, Settings, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { prayerTimeService, PrayerSettings } from "@/services/prayerTimeService";
import { format, differenceInMinutes, addDays, isAfter } from "date-fns";

export default function Namaz() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['prayerSettings'],
    queryFn: prayerTimeService.getSettings
  });

  // Calculate coordinates for prayer times API
  const lat = settings?.latitude ?? 40.7128; // Default NYC
  const lng = settings?.longitude ?? -74.0060;
  const method = settings?.calculationMethod ?? 2; // ISNA

  // Fetch Prayer Times from External API
  const { data: prayerData, isLoading: isLoadingTimes } = useQuery({
    queryKey: ['prayerTimes', lat, lng, method],
    enabled: !!settings,
    queryFn: async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${method}`
      );
      return response.json();
    }
  });

  // Fetch Qibla Direction
  const { data: qiblaData } = useQuery({
    queryKey: ['qibla', lat, lng],
    enabled: !!settings,
    queryFn: async () => {
      const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
      return response.json();
    }
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: prayerTimeService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerSettings'] });
      showSuccess("Settings Updated", "Prayer time settings have been saved.");
      setIsSettingsOpen(false);
    },
    onError: () => {
      showError("Error", "Failed to update settings");
    }
  });

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    // Construct settings object (simplified for this demo)
    // Ideally use controlled inputs or react-hook-form
    if (!settings) return;

    const newSettings: Partial<PrayerSettings> = {
      location: String(formData.get('location')),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      calculationMethod: Number(formData.get('method')),
      display: {
        ...settings.display,
        use24HourFormat: formData.get('use24Hour') === 'on'
      }
    };

    updateSettingsMutation.mutate(newSettings);
  };

  if (isLoadingSettings) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Process Prayer Times
  const timings = prayerData?.data?.timings;
  const processedPrayers = timings ? [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha }
  ].map(p => {
    const [hours, minutes] = p.time.split(':').map(Number);
    const adjustment = settings?.adjustments[p.name.toLowerCase() as keyof typeof settings.adjustments] || 0;
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes + adjustment, 0, 0);
    const isPassed = isAfter(currentTime, prayerDate);

    return {
      ...p,
      date: prayerDate,
      displayTime: format(prayerDate, settings?.display.use24HourFormat ? "HH:mm" : "h:mm a"),
      passed: isPassed,
      alarmEnabled: settings?.notifications.enabled
    };
  }) : [];

  // Determine Next Prayer
  let nextPrayer = processedPrayers.find(p => !p.passed);
  let nextPrayerCountdown = "";

  if (nextPrayer) {
    const diff = differenceInMinutes(nextPrayer.date, currentTime);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    nextPrayerCountdown = `In ${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  } else if (processedPrayers.length > 0) {
    // Fajr tomorrow
    const fajr = processedPrayers[0];
    const tomorrowFajr = addDays(fajr.date, 1);
    const diff = differenceInMinutes(tomorrowFajr, currentTime);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    nextPrayer = { ...fajr, date: tomorrowFajr, displayTime: fajr.displayTime };
    nextPrayerCountdown = `In ${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  }

  const qiblaDirection = qiblaData?.data?.direction;
  const compassRotation = qiblaDirection ? Math.round(qiblaDirection) : 0;
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Prayer Times</h1>
          <p className="text-muted-foreground">Location: {settings?.location}</p>
        </div>

        {isAdmin && (
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Prayer Settings</DialogTitle>
                <DialogDescription>Configure location and calculation methods.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSettings} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">City Name</Label>
                  <Input id="location" name="location" defaultValue={settings?.location} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" name="latitude" type="number" step="any" defaultValue={settings?.latitude} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" name="longitude" type="number" step="any" defaultValue={settings?.longitude} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Calculation Method</Label>
                  <Select name="method" defaultValue={String(settings?.calculationMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">ISNA (North America)</SelectItem>
                      <SelectItem value="3">Muslim World League</SelectItem>
                      <SelectItem value="4">Umm Al-Qura (Makkah)</SelectItem>
                      <SelectItem value="5">Egyptian General Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="use24Hour" name="use24Hour" defaultChecked={settings?.display.use24HourFormat} />
                  <Label htmlFor="use24Hour">Use 24-hour format</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Timer className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Next: {nextPrayer.name}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {nextPrayer.displayTime} • {nextPrayerCountdown}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {nextPrayerCountdown}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {processedPrayers.map((prayer) => (
          <Card key={prayer.name} className={`text-center transition-colors ${nextPrayer?.name === prayer.name
              ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-sm'
              : prayer.passed
                ? 'bg-muted/50'
                : ''
            }`}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{prayer.name}</h3>
              <p className="text-2xl font-bold text-primary">{prayer.displayTime}</p>
              {nextPrayer?.name === prayer.name && (
                <Badge variant="outline" className="mt-2 text-xs border-primary/50 text-primary">Next</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Qibla Direction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5" /> Qibla Direction</CardTitle>
          <CardDescription>Direction of Kaaba from {settings?.location}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <div className="relative w-48 h-48 border-4 border-muted rounded-full flex items-center justify-center mb-4 bg-background shadow-inner">
            {/* Compass Face */}
            <div className="absolute top-2 text-xs font-bold text-muted-foreground">N</div>
            <div className="absolute bottom-2 text-xs font-bold text-muted-foreground">S</div>
            <div className="absolute left-2 text-xs font-bold text-muted-foreground">W</div>
            <div className="absolute right-2 text-xs font-bold text-muted-foreground">E</div>

            {/* Needle */}
            <div
              className="w-1 h-20 bg-primary/20 absolute rounded-full transition-transform duration-1000 ease-out origin-bottom text-center pt-2"
              style={{ transform: `rotate(${compassRotation}deg) translateY(-50%)` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto -mt-1.5 shadow-sm" />
              <div className="w-0.5 h-full bg-red-500 mx-auto" />
            </div>

            <div className="text-center z-10 bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
              <div className="text-2xl font-bold">{Math.round(compassRotation)}°</div>
              <div className="text-xs text-muted-foreground">from North</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
