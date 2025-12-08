import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  Clock,
  Star,
  RefreshCw,
  Settings,
  Volume2,
  Heart
} from 'lucide-react';
import { duasData } from '@/data/duas';
import { useNotifications } from '@/hooks/use-notifications';
import { useDuaFavorites } from '@/hooks/use-dua-favorites';

interface DailyDuaReminderProps {
  dua?: any;
  stats?: {
    total: number;
    favorites: number;
    categories: number;
  };
}

export function DailyDuaReminder({ dua, stats }: DailyDuaReminderProps) {
  const [currentDua, setCurrentDua] = useState(dua || duasData[0]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showFullDua, setShowFullDua] = useState(false);
  const { showSuccess, showInfo } = useNotifications();
  const { toggleFavorite, isFavorite } = useDuaFavorites();

  const totalCount = stats?.total ?? duasData.length;
  // Fallback to static data logic if stats not provided, or simplify
  const categoriesCount = stats?.categories ?? new Set(duasData.map(d => d.category)).size;

  // If new prop comes in, update state
  useEffect(() => {
    if (dua) {
      setCurrentDua(dua);
    } else {
      // Fallback or previously existing logic
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const duaIndex = dayOfYear % duasData.length;
      setCurrentDua(duasData[duaIndex]);
    }
  }, [dua]);

  // Load reminder settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('duaReminderSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setReminderEnabled(settings.enabled || false);
      setReminderTime(settings.time || '09:00');
    }
  }, []);

  // Save reminder settings
  useEffect(() => {
    const settings = {
      enabled: reminderEnabled,
      time: reminderTime
    };
    localStorage.setItem('duaReminderSettings', JSON.stringify(settings));

    if (reminderEnabled) {
      scheduleReminder();
    }
  }, [reminderEnabled, reminderTime]);

  const scheduleReminder = () => {
    // In a real app, you would set up actual notifications
    showSuccess('Reminder Set', `Daily dua reminder set for ${reminderTime}`);
  };

  const getNextDua = () => {
    const currentIndex = duasData.findIndex(dua => dua.id === currentDua.id);
    const nextIndex = (currentIndex + 1) % duasData.length;
    setCurrentDua(duasData[nextIndex]);
    showInfo('New Dua', 'Here\'s your next dua for today');
  };

  const handleFavoriteToggle = () => {
    toggleFavorite({
      id: currentDua.id,
      title: currentDua.title,
      arabic: currentDua.arabic,
      transliteration: currentDua.transliteration,
      translation: currentDua.translation,
      category: currentDua.category
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Daily Dua
            </CardTitle>
            <CardDescription>
              Your spiritual companion for daily remembrance
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Dua */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{currentDua.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {currentDua.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className="h-8 w-8"
              >
                <Heart className={`h-4 w-4 ${isFavorite(currentDua.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 p-4 rounded-lg border">
            <p className="text-xl font-amiri leading-relaxed text-green-800 dark:text-green-200 text-right" dir="rtl">
              {showFullDua ? currentDua.arabic :
                currentDua.arabic.length > 100 ?
                  `${currentDua.arabic.substring(0, 100)}...` :
                  currentDua.arabic
              }
            </p>
            {currentDua.arabic.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDua(!showFullDua)}
                className="mt-2 text-xs"
              >
                {showFullDua ? 'Show Less' : 'Show Full Dua'}
              </Button>
            )}
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Transliteration:</p>
            <p className="text-sm italic text-blue-700 dark:text-blue-300">{currentDua.transliteration}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Translation:</p>
            <p className="text-sm leading-relaxed">{currentDua.translation}</p>
          </div>

          {currentDua.benefits && (
            <div className="bg-yellow-50 dark:bg-yellow-950/50 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Benefits:</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{currentDua.benefits}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={getNextDua} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Next Dua
          </Button>

        </div>

        {/* Reminder Settings */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="reminder-toggle" className="font-medium">
                Daily Reminder
              </Label>
            </div>
            <Switch
              id="reminder-toggle"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {reminderEnabled && (
            <div className="flex items-center gap-4 pl-6">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reminder-time" className="text-sm">
                Remind me at:
              </Label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 border rounded text-sm bg-background text-foreground"
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-muted/20 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total Duas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {categoriesCount}
              </div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}