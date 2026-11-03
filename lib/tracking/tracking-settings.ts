import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

export const TrackingSettingsSchema = z.object({
  sitePixelId: z
    .string()
    .trim()
    .regex(/^\d{0,25}$/, "ID do Pixel do Site deve conter apenas números.")
    .default(""),
  sitePixelActive: z.boolean().default(false),

  crmPixelId: z
    .string()
    .trim()
    .regex(/^\d{0,25}$/, "ID do Pixel do CRM deve conter apenas números.")
    .default(""),
  crmPixelActive: z.boolean().default(false),

  capiToken: z.string().trim().max(1000).default(""),
  capiTestEventCode: z
    .string()
    .trim()
    .max(30)
    .regex(/^[A-Za-z0-9_-]{0,30}$/, "Código de teste inválido.")
    .default(""),

  ga4MeasurementId: z
    .string()
    .trim()
    .max(25)
    .regex(/^(G-[A-Z0-9]+)?$/i, "ID do GA4 deve ser no formato G-XXXXXXXXXX.")
    .default(""),
  ga4Active: z.boolean().default(false),
});

export type TrackingSettings = z.infer<typeof TrackingSettingsSchema>;

export const DEFAULT_TRACKING_SETTINGS: TrackingSettings = {
  sitePixelId: "",
  sitePixelActive: false,
  crmPixelId: "",
  crmPixelActive: false,
  capiToken: "",
  capiTestEventCode: "",
  ga4MeasurementId: "",
  ga4Active: false,
};

/**
 * Lê as configurações de rastreamento da organização.
 * Mantém compatibilidade com o legado `settings.site.pixelId`.
 */
export async function getOrganizationTrackingSettings(
  organizationId: string
): Promise<TrackingSettings> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });

  const all = (org?.settings as Record<string, any> | null) || {};
  const tracking = (all.tracking as Partial<TrackingSettings> | undefined) || {};
  const site = (all.site as Record<string, any> | undefined) || {};

  // Se houver legado `site.pixelId` e `tracking.sitePixelId` estiver vazio, herda
  const legacyPixelId = typeof site.pixelId === "string" ? site.pixelId : "";
  const sitePixelId = tracking.sitePixelId || legacyPixelId || "";

  return {
    ...DEFAULT_TRACKING_SETTINGS,
    ...tracking,
    sitePixelId,
    sitePixelActive: tracking.sitePixelActive ?? (sitePixelId.length > 0),
  };
}

/**
 * Salva as configurações de rastreamento na organização.
 * Também sincroniza de volta para `settings.site.pixelId` para retrocompatibilidade.
 */
export async function saveOrganizationTrackingSettings(
  organizationId: string,
  input: Partial<TrackingSettings>
): Promise<TrackingSettings> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });

  const all = (org?.settings as Record<string, any> | null) || {};
  const currentTracking = (all.tracking as Partial<TrackingSettings> | undefined) || {};
  const currentSite = (all.site as Record<string, any> | undefined) || {};

  const mergedTracking: TrackingSettings = {
    ...DEFAULT_TRACKING_SETTINGS,
    ...currentTracking,
    ...input,
  };

  // Mantém retrocompatibilidade no site público
  const updatedSite = {
    ...currentSite,
    pixelId: mergedTracking.sitePixelId,
  };

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      settings: {
        ...all,
        site: updatedSite,
        tracking: mergedTracking,
      } as any,
    },
  });

  return mergedTracking;
}
