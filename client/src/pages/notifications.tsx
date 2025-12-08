import React from 'react';
import { NotificationDemo } from '@/components/notification-demo';
import { NotificationSettings } from '@/components/notification-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, Zap, Shield, Clock } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

export default function Notifications() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Notification Center</h1>
          <p className="text-muted-foreground">
            Professional notification system for your workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{notifications.length}</div>
            <div className="text-xs text-muted-foreground">Total Notifications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground">Alert Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground">Delivery Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Test System
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="demo" className="space-y-6">
          <NotificationDemo />
          
          {/* System Info */}
          <Card>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}