// app/api/vendas/saleSchemas.ts
import { z } from "zod";
import { Prisma, PaymentMethod } from "@prisma/client";

export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD).");

export const ParticipantSchema = z.object({
  role: z.enum(["CORRETOR_1", "CORRETOR_2", "GESTOR", "CAPTADOR"]),
  userId: z.string().uuid("Participante inválido."),
  percentual: z.number().min(0).max(100),
  desconto: z.number().nonnegative().optional().default(0),
  bonus: z.number().nonnegative().optional().default(0),
  documentoPix: z.string().trim().max(140).optional(),
});

export const CreateSaleSchema = z
  .object({
    leadId: z.string().uuid().optional(),
    novoComprador: z
      .object({
        nome: z.string().trim().min(2, "Informe o nome do comprador."),
        telefone: z.string().trim().min(8, "Informe o telefone do comprador."),
        email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
      })
      .optional(),
    propertyId: z.string().uuid("Selecione um empreendimento."),
    unidadeNumero: z.string().trim().max(40).optional(),
    dataVenda: dateOnly,
    dataPrevistaPagamento: dateOnly.optional(),
    vgv: z.number().positive("O VGV deve ser maior que zero."),
    valorAvaliacao: z.number().nonnegative().optional(),
    percentualComissao: z.number().positive("Informe a % de comissão.").max(100),
    impostoPercentual: z.number().min(0).max(100).default(6),
    isRepasse: z.boolean().default(false),
    valorRepasse: z.number().nonnegative().optional(),
    entradaRepasse: z.number().nonnegative().optional(),
    parcelasRepasse: z.number().int().min(1).max(120).optional(),
    valorParcelaRepasse: z.number().nonnegative().optional(),
    saldoDevedor: z.number().nonnegative().optional(),
    titularOriginario: z.string().trim().max(160).optional(),
    baseCalculoComissao: z.enum(["REPASSE", "VGV"]).default("REPASSE"),
    meioPagamento: z.nativeEnum(PaymentMethod).default(PaymentMethod.TED),
    participants: z.array(ParticipantSchema).min(1, "Informe o corretor titular."),
  })
  .refine(
    (d) =>
      !d.isRepasse ||
      (d.valorRepasse !== undefined && d.valorRepasse > 0 && d.saldoDevedor !== undefined),
    {
      message: "Para vendas de repasse, informe o valor do repasse (ágio) e o saldo devedor.",
      path: ["valorRepasse"],
    }
  )
  .refine((d) => Boolean(d.leadId) !== Boolean(d.novoComprador), {
    message: "Selecione um cliente cadastrado ou informe os dados do novo comprador.",
    path: ["leadId"],
  })
  .refine((d) => d.participants.some((p) => p.role === "CORRETOR_1"), {
    message: "O Corretor 1 (titular) é obrigatório.",
    path: ["participants"],
  })
  .refine((d) => new Set(d.participants.map((p) => p.role)).size === d.participants.length, {
    message: "Cada papel do split só pode aparecer uma vez.",
    path: ["participants"],
  });

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function nextSaleCode(tx: Prisma.TransactionClient, year: number) {
  const prefix = `CP-${year}-`;
  const count = await tx.sale.count({ where: { codigoVenda: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}
