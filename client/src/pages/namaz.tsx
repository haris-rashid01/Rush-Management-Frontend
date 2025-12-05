import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, Clock, Bell, Volume2, CheckCircle, Timer } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { prayerTimeService, PrayerSettings } from "@/services/prayerTimeService";
import { format, differenceInMinutes, addDays, isAfter, isBefore, parse } from "date-fns";

export default function Namaz() {
  const { showSuccess, showInfo, showError } = useNotifications();
  const [location, setLocation] = useState("New York");
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any[]>([]);
  const [nextPrayer, setNextPrayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSettings();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (settings) {
      fetchPrayerTimes();
    }
  }, [settings, currentTime]); // Re-calculate when settings or time changes

  const fetchSettings = async () => {
    try {
      const data = await prayerTimeService.getSettings();
      setSettings(data);
      setLocation(data.location);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load prayer settings");
    }
  };

  const fetchPrayerTimes = async () => {
    if (!settings) return;

    try {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod}`
      );
      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        const prayers = [
          { name: "Fajr", time: timings.Fajr, adjustment: settings.adjustments.fajr },
          { name: "Dhuhr", time: timings.Dhuhr, adjustment: settings.adjustments.dhuhr },
          { name: "Asr", time: timings.Asr, adjustment: settings.adjustments.asr },
          { name: "Maghrib", time: timings.Maghrib, adjustment: settings.adjustments.maghrib },
          { name: "Isha", time: timings.Isha, adjustment: settings.adjustments.isha }
        ];

        const processedPrayers = prayers.map(p => {
          // Parse time string (HH:mm) to Date object for today
          const [hours, minutes] = p.time.split(':').map(Number);
          const prayerDate = new Date();
          prayerDate.setHours(hours, minutes + p.adjustment, 0, 0);

          const isPassed = isAfter(currentTime, prayerDate);

          return {
            ...p,
            date: prayerDate,
            displayTime: format(prayerDate, settings.display.use24HourFormat ? "HH:mm" : "h:mm a"),
            passed: isPassed,
            alarmEnabled: settings.notifications.enabled
          };
        });

        setPrayerTimes(processedPrayers);

        // Find next prayer
        const next = processedPrayers.find(p => !p.passed);
        if (next) {
          const diff = differenceInMinutes(next.date, currentTime);
          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          setNextPrayer({
            ...next,
            countdown: `In ${hours > 0 ? `${hours}h ` : ''}${mins}m`
          });
        } else {
          // Next prayer is Fajr tomorrow
          const fajr = processedPrayers.find(p => p.name === "Fajr");
          if (fajr) {
            const tomorrowFajr = addDays(fajr.date, 1);
            const diff = differenceInMinutes(tomorrowFajr, currentTime);
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            setNextPrayer({
              ...fajr,
              date: tomorrowFajr,
              displayTime: format(tomorrowFajr, settings.display.use24HourFormat ? "HH:mm" : "h:mm a"),
              countdown: `In ${hours > 0 ? `${hours}h ` : ''}${mins}m`
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch prayer times", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrayerAlarm = (prayerName: string) => {
    // Local toggle for UI only, doesn't persist to backend per-prayer yet
    setPrayerTimes(prev => prev.map(prayer =>
      prayer.name === prayerName
        ? { ...prayer, alarmEnabled: !prayer.alarmEnabled }
        : prayer
    ));

    const prayer = prayerTimes.find(p => p.name === prayerName);
    if (prayer?.alarmEnabled) {
      showInfo('Alarm Disabled', `${prayerName} alarm turned off`);
    } else {
      showSuccess('Alarm Enabled', `${prayerName} alarm turned on`);
    }
  };

  const enabledAlarms = prayerTimes.filter(prayer => prayer.alarmEnabled).length;

  if (isLoading) {
    return <div className="text-center py-10">Loading prayer times...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Prayer Times</h1>
          <p className="text-muted-foreground">Simple prayer schedule with alarms</p>
        </div>
        <Badge variant={enabledAlarms > 0 ? "default" : "secondary"}>
          <Bell className="h-3 w-3 mr-1" />
          {enabledAlarms}/5 Alarms On
        </Badge>
      </div>

      {/* Next Prayer */}
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
                    {nextPrayer.displayTime} • {nextPrayer.countdown}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {nextPrayer.countdown}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={location}
              readOnly
              className="flex-1 bg-muted"
            />
            <Button variant="outline" disabled>
              Managed by Admin
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Prayer times are calculated based on organization settings.
          </p>
        </CardContent>
      </Card>

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {prayerTimes.map((prayer) => (
          <Card key={prayer.name} className={`text-center ${nextPrayer?.name === prayer.name
            ? 'bg-primary/10 dark:bg-primary/20 border-primary'
            : prayer.passed
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : ''
            }`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{prayer.name}</h3>
                  <p className="text-2xl font-bold text-primary">{prayer.displayTime}</p>
                  {nextPrayer?.name === prayer.name && (
                    <p className="text-sm text-muted-foreground">{prayer.countdown}</p>
                  )}
                </div>

                {prayer.passed && (
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mx-auto" />
                )}

                {nextPrayer?.name === prayer.name && (
                  <Timer className="h-6 w-6 text-primary mx-auto animate-pulse" />
                )}

                <div className="flex items-center justify-center gap-2">
                  <Bell className={`h-4 w-4 ${prayer.alarmEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <Switch
                    checked={prayer.alarmEnabled}
                    onCheckedChange={() => togglePrayerAlarm(prayer.name)}
                    size="sm"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {prayer.alarmEnabled ? 'Alarm On' : 'Alarm Off'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Qibla Direction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Qibla Direction</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 border-4 border-green-200 dark:border-green-800 mb-4">
            <div className="text-center">
              {/* This is a placeholder calculation. Real Qibla calculation requires complex math */}
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {/* Simple approximation or just static for now as Qibla API is separate */}
                Unknown
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Direction</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Qibla direction from {location}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
