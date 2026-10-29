// app/api/equipes/equipesSchemas.ts
import { z } from "zod";
import { Role, CorretorStatus } from "@prisma/client";

export const InviteCollaboratorSchema = z.object({
  nome: z.string().trim().min(2, "Nome é obrigatório.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().max(30).optional().nullable(),
  creci: z.string().trim().max(30).optional().nullable(),
  role: z.nativeEnum(Role),
  senhaTemporaria: z
    .string()
    .min(8, "A senha provisória deve ter no mínimo 8 caracteres.")
    .max(128),
});

export const UpdateMemberSchema = z.object({
  userId: z.string().uuid("Colaborador inválido."),
  nome: z.string().trim().min(2, "Nome é obrigatório.").max(120).optional(),
  email: z.string().trim().toLowerCase().email("E-mail inválido.").optional(),
  telefone: z.string().trim().max(30).optional().nullable(),
  creci: z.string().trim().max(30).optional().nullable(),
  status: z.nativeEnum(CorretorStatus).optional(),
  role: z.nativeEnum(Role).optional(),
});

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
