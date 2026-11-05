// app/api/vendas/saleCapi.ts
import { prisma } from "@/lib/db/prisma";
import { getOrganizationTrackingSettings } from "@/lib/tracking/tracking-settings";
import { MetaCapiService } from "@/lib/services/meta-capi";

export async function fireSaleMetaCapi(params: {
  orgId: string;
  leadId?: string | null;
  codigoVenda: string;
  propertyName: string;
  vgv: number;
  novoComprador?: { nome: string; email?: string; telefone: string };
}) {
  try {
    const tracking = await getOrganizationTrackingSettings(params.orgId);
    const pixelId = tracking.crmPixelId || tracking.sitePixelId;
    if (!tracking.capiToken || !pixelId || (!tracking.crmPixelActive && !tracking.sitePixelActive)) return;

    const leadData = params.leadId
      ? await prisma.lead.findUnique({
          where: { id: params.leadId },
          select: { nome: true, email: true, telefone: true, fbp: true, fbc: true },
        })
      : null;

    const buyerName = leadData?.nome || params.novoComprador?.nome || "";
    const buyerEmail = leadData?.email || params.novoComprador?.email || undefined;
    const buyerPhone = leadData?.telefone || params.novoComprador?.telefone || undefined;

    const nameParts = buyerName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

    await MetaCapiService.sendEvent({
      pixelId,
      token: tracking.capiToken,
      testEventCode: tracking.capiTestEventCode,
      eventName: "Purchase",
      eventId: `purchase_${params.codigoVenda}`,
      actionSource: "system_generated",
      userData: {
        email: buyerEmail,
        phone: buyerPhone,
        firstName,
        lastName,
        fbp: leadData?.fbp,
        fbc: leadData?.fbc,
      },
      customData: {
        currency: "BRL",
        value: params.vgv,
        contentName: params.propertyName,
        orderId: params.codigoVenda,
      },
    });
  } catch (err: any) {
    console.warn("[Meta CAPI] Falha ao processar conversão Purchase:", err?.message || err);
  }
}
