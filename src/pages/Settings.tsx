
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Bell, Palette, Save } from "lucide-react";

interface UserSettings {
  id: string;
  theme: string;
  notification_email: boolean;
  notification_push: boolean;
  default_currency: string;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    id: "",
    theme: "light",
    notification_email: true,
    notification_push: true,
    default_currency: "USD",
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user?.id,
          theme: settings.theme,
          notification_email: settings.notification_email,
          notification_push: settings.notification_push,
          default_currency: settings.default_currency,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (settings.theme !== theme) {
        setTheme(settings.theme as "light" | "dark");
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title gradient-text">Settings</h1>
        <p className="page-subtitle">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="section-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="h-5 w-5 text-primary" />
              </div>
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed from here
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
                <Input
                  id="userId"
                  value={user?.id || ""}
                  disabled
                  className="bg-muted/50 cursor-not-allowed font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="section-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Palette className="h-5 w-5 text-accent" />
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme" className="text-sm font-medium">Theme Preference</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">☀️ Light Mode</SelectItem>
                  <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="section-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notification_email}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, notification_email: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive real-time notifications in browser
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notification_push}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, notification_push: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="section-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <SettingsIcon className="h-5 w-5 text-green-500" />
              </div>
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-sm font-medium">Default Currency</Label>
              <Select 
                value={settings.default_currency} 
                onValueChange={(value) => setSettings({ ...settings, default_currency: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                  <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
                  <SelectItem value="CAD">🇨🇦 CAD (C$)</SelectItem>
                  <SelectItem value="AUD">🇦🇺 AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-gradient h-12 px-8"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
