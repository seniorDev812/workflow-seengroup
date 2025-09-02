"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Tabs,
  Card,
  TextInput,
  Textarea,
  Group,
  Button,
  ColorInput,
  Switch,
  FileInput,
  SegmentedControl,
  Stack,
  Alert,
  Image as MantineImage,
  LoadingOverlay,
  Box,
  Text,
} from "@mantine/core";
import { IconSettings, IconUpload, IconCheck, IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type Settings = {
  siteTitle: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  darkMode: boolean;
  colorScheme: "light" | "dark" | "auto";
  allowRegistrations: boolean;
};

const defaultSettings: Settings = {
  siteTitle: "Seen Group - We Supply Your Growth",
  siteTagline: "We Supply Your Growth",
  contactEmail: "info@seengroup.com",
  contactPhone: "+1 (555) 123-4567",
  description: "Seen Group provides comprehensive solutions to supply your business growth with innovative products and services.",
  logoUrl: "/imgs/site-logo.png",
  faviconUrl: "/imgs/favicon.ico",
  primaryColor: "#228be6", // Mantine blue
  darkMode: true,
  colorScheme: "dark",
  allowRegistrations: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/proxy/settings`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await res.json();
      if (data?.data) {
        setSettings({ ...defaultSettings, ...data.data });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load settings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setRefreshing(true);
    try {
      await loadSettings();
      notifications.show({
        title: 'Success',
        message: 'Settings refreshed successfully',
        color: 'green',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved("");
  };

  const onSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/proxy/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save settings');
      } else {
        setSaved('Settings saved successfully.');
        setTimeout(() => setSaved(''), 2000);
        notifications.show({
          title: 'Success',
          message: 'Settings saved successfully',
          color: 'green',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setSettings(defaultSettings);
    setSaved("");
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1} c="white">
          <IconSettings size={28} style={{ marginRight: 10 }} /> Settings
        </Title>
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="light" 
          onClick={refreshSettings}
          loading={refreshing}
          size="sm"
        >
          Refresh
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Tabs defaultValue="general" variant="pills" color="brand">
          <Tabs.List mb="md">
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="appearance" leftSection={<IconUpload size={16} />}>
              Appearance
            </Tabs.Tab>
            <Tabs.Tab value="contact" leftSection={<IconCheck size={16} />}>
              Contact
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <Card withBorder p="md" bg="dark.6">
              <Stack>
                <TextInput
                  label="Site Title"
                  value={settings.siteTitle}
                  onChange={(e) => onChange('siteTitle', e.currentTarget.value)}
                  placeholder="Enter site title"
                />
                <TextInput
                  label="Site Tagline"
                  value={settings.siteTagline}
                  onChange={(e) => onChange('siteTagline', e.currentTarget.value)}
                  placeholder="Enter site tagline"
                />
                <Textarea
                  label="Site Description"
                  value={settings.description}
                  onChange={(e) => onChange('description', e.currentTarget.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
                <Switch
                  label="Allow User Registrations"
                  checked={settings.allowRegistrations}
                  onChange={(e) => onChange('allowRegistrations', e.currentTarget.checked)}
                />
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="appearance">
            <Card withBorder p="md" bg="dark.6">
              <Stack>
                <ColorInput
                  label="Primary Color"
                  value={settings.primaryColor}
                  onChange={(value) => onChange('primaryColor', value)}
                  format="hex"
                />
                <div>
                  <Text size="sm" fw={500} mb="xs">Color Scheme</Text>
                  <SegmentedControl
                    value={settings.colorScheme}
                    onChange={(value) => onChange('colorScheme', value as "light" | "dark" | "auto")}
                    data={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'Auto' }
                    ]}
                  />
                </div>
                <Switch
                  label="Dark Mode"
                  checked={settings.darkMode}
                  onChange={(e) => onChange('darkMode', e.currentTarget.checked)}
                />
                <TextInput
                  label="Logo URL"
                  value={settings.logoUrl}
                  onChange={(e) => onChange('logoUrl', e.currentTarget.value)}
                  placeholder="Enter logo URL"
                />
                <TextInput
                  label="Favicon URL"
                  value={settings.faviconUrl}
                  onChange={(e) => onChange('faviconUrl', e.currentTarget.value)}
                  placeholder="Enter favicon URL"
                />
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="contact">
            <Card withBorder p="md" bg="dark.6">
              <Stack>
                <TextInput
                  label="Contact Email"
                  value={settings.contactEmail}
                  onChange={(e) => onChange('contactEmail', e.currentTarget.value)}
                  placeholder="Enter contact email"
                  type="email"
                />
                <TextInput
                  label="Contact Phone"
                  value={settings.contactPhone}
                  onChange={(e) => onChange('contactPhone', e.currentTarget.value)}
                  placeholder="Enter contact phone"
                />
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
            {error}
          </Alert>
        )}

        {saved && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green" mt="md">
            {saved}
          </Alert>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onReset}>
            Reset to Defaults
          </Button>
          <Button onClick={onSave} loading={loading}>
            Save Settings
          </Button>
        </Group>
      </Box>
    </Container>
  );
}




