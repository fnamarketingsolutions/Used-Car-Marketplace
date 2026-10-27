"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { SettingsIcon } from "@/components/ui/NavIcons";
import {
  getAdminSettings,
  updateAdminSettings,
  type PlatformSettings,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import overviewImage from "../../../public/assets/adminDashboardImages/admin-overview-image.png";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "",
    supportEmail: "",
    supportPhone: "",
    allowRegistration: true,
    maxPhotosPerListing: 20,
    maintenanceMode: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setSettings({
        siteName: data.settings.siteName || "",
        supportEmail: data.settings.supportEmail || "",
        supportPhone: data.settings.supportPhone || "",
        allowRegistration: data.settings.allowRegistration !== false,
        maxPhotosPerListing: data.settings.maxPhotosPerListing ?? 20,
        maintenanceMode: Boolean(data.settings.maintenanceMode),
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const data = await updateAdminSettings({
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        allowRegistration: settings.allowRegistration,
        maxPhotosPerListing: Number(settings.maxPhotosPerListing) || 20,
        maintenanceMode: settings.maintenanceMode,
      });
      setMessage(data.message || "Settings saved");
      setSettings({
        siteName: data.settings.siteName || "",
        supportEmail: data.settings.supportEmail || "",
        supportPhone: data.settings.supportPhone || "",
        allowRegistration: data.settings.allowRegistration !== false,
        maxPhotosPerListing: data.settings.maxPhotosPerListing ?? 20,
        maintenanceMode: Boolean(data.settings.maintenanceMode),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Configure platform-wide options—site identity, support contacts, registration, listing photo limits, and maintenance mode—from one place."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<SettingsIcon className="h-6 w-6" />}
        image={{
          src: overviewImage.src,
          width: overviewImage.width,
          height: overviewImage.height,
        }}
      />

      {error ? <p className="form-error mb-4">{error}</p> : null}
      {message ? (
        <p className="mb-4 text-sm font-medium text-green-700">{message}</p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded border border-[var(--line)] bg-white p-5"
      >
        <div className="field">
          <label htmlFor="siteName">Site name</label>
          <input
            id="siteName"
            value={settings.siteName || ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, siteName: e.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="supportEmail">Support email</label>
          <input
            id="supportEmail"
            type="email"
            value={settings.supportEmail || ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, supportEmail: e.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="supportPhone">Support phone</label>
          <input
            id="supportPhone"
            value={settings.supportPhone || ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, supportPhone: e.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="maxPhotos">Max photos per listing</label>
          <input
            id="maxPhotos"
            type="number"
            min={1}
            max={50}
            value={settings.maxPhotosPerListing ?? 20}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                maxPhotosPerListing: Number(e.target.value) || 20,
              }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.allowRegistration !== false}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                allowRegistration: e.target.checked,
              }))
            }
          />
          Allow registration
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(settings.maintenanceMode)}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                maintenanceMode: e.target.checked,
              }))
            }
          />
          Maintenance mode
        </label>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
