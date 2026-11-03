import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export interface ExtensionTemplate {
  id: string;
  title: string;
  category: "Venda" | "Temporada" | "Financeiro" | "Geral";
  roles: Role[];
  text: string;
}

const templates: ExtensionTemplate[] = [
  // Vendas (Corretor Venda, Admin)
  {
    id: "apresentacao_venda",
    title: "1º Contato — Apresentação (Venda)",
    category: "Venda",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_VENDA],
    text: "Olá, {primeiroNome}! Tudo bem? Sou {corretor}, da Connect Platz Imobiliária. Vi seu interesse no {empreendimento}. Preparei o material completo com fotos, plantas e valores para você: {catalogoUrl}. Gostaria de receber o PDF ou tirar alguma dúvida por aqui?",
  },
  {
    id: "visita",
    title: "Agendamento de Visita",
    category: "Venda",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_VENDA],
    text: "Olá, {primeiroNome}! Aqui é {corretor}, da Connect Platz. Que tal agendarmos uma visita para você conhecer o {empreendimento} de perto nesta semana? Tenho horários reservados na quinta e no sábado. Qual período fica melhor para você?",
  },
  {
    id: "simulacao",
    title: "Simulação de Financiamento",
    category: "Venda",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_VENDA],
    text: "Olá, {primeiroNome}! Aqui é {corretor}, da Connect Platz. Concluí a simulação do plano de pagamento para o {empreendimento} com entrada facilitada e aprovação junto ao banco parceiro. Posso te enviar o resumo com o valor das parcelas?",
  },
  {
    id: "followup_venda",
    title: "Follow-up Sem Resposta",
    category: "Venda",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_VENDA],
    text: "Olá, {primeiroNome}! Passando rapidinho para saber se você conseguiu dar uma olhada nas informações do {empreendimento} que te enviei. Surgiu alguma dúvida? Permaneço totalmente à sua disposição aqui na Connect Platz!",
  },

  // Temporada / Locação (Corretor Aluguel, Admin)
  {
    id: "apresentacao_aluguel",
    title: "1º Contato — Temporada / Locação",
    category: "Temporada",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_ALUGUEL],
    text: "Olá, {primeiroNome}! Tudo bem? Sou {corretor}, especialista em locações de temporada na Connect Platz. Vi seu interesse no {empreendimento}. Para quais datas de check-in e check-out você planeja sua estadia? Segue o link com fotos dos bangalôs: {catalogoUrl}",
  },
  {
    id: "reserva_temporada",
    title: "Confirmação de Reserva de Veraneio",
    category: "Temporada",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_ALUGUEL],
    text: "Olá, {primeiroNome}! Aqui é {corretor}. Seu período no {empreendimento} já está pré-reservado no nosso calendário. Para confirmarmos o bloqueio e emitirmos o contrato de locação de temporada, podemos alinhar os dados do titular e a taxa de reserva?",
  },
  {
    id: "regras_estadia",
    title: "Regras de Check-in e Estadia",
    category: "Temporada",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_ALUGUEL, Role.FINANCEIRO_ALUGUEL],
    text: "Olá, {primeiroNome}! Tudo pronto para sua estadia no {empreendimento}! Nosso check-in inicia às 14h e check-out até às 11h. A taxa de limpeza cobre a higienização completa pré e pós estadia. Qualquer dúvida durante sua permanência, estamos 100% à disposição!",
  },

  // Financeiro Venda
  {
    id: "doc_financeiro_venda",
    title: "Solicitação de Documentos (Análise de Crédito)",
    category: "Financeiro",
    roles: [Role.ADMINISTRADOR, Role.FINANCEIRO_VENDA],
    text: "Olá, {primeiroNome}! Sou do setor Financeiro da Connect Platz. Para darmos andamento à aprovação do financiamento do {empreendimento}, precisamos que nos envie: RG/CPF, Comprovante de Residência atualizado e os 3 últimos contracheques/extratos. Se preferir, pode enviar os PDFs diretamente por aqui!",
  },
  {
    id: "aprovacao_credito",
    title: "Crédito Bancário Aprovado",
    category: "Financeiro",
    roles: [Role.ADMINISTRADOR, Role.FINANCEIRO_VENDA],
    text: "Ótima notícia, {primeiroNome}! O seu crédito imobiliário para aquisição do imóvel no {empreendimento} foi APROVADO pela instituição financeira parceira. Podemos formalizar os termos do contrato de compra e venda agora?",
  },

  // Financeiro Aluguel
  {
    id: "confirmacao_sinal_aluguel",
    title: "Confirmação de Sinal / Caução",
    category: "Financeiro",
    roles: [Role.ADMINISTRADOR, Role.FINANCEIRO_ALUGUEL],
    text: "Olá, {primeiroNome}! Aqui é do setor Financeiro da Connect Platz. Confirmamos com sucesso o recebimento da taxa de reserva para o período no {empreendimento}. Seu voucher de hospedagem e termo de locação já foram validados no sistema!",
  },

  // Geral
  {
    id: "lembrete_geral",
    title: "Lembrete de Compromisso",
    category: "Geral",
    roles: [Role.ADMINISTRADOR, Role.CORRETOR_VENDA, Role.CORRETOR_ALUGUEL, Role.FINANCEIRO_VENDA, Role.FINANCEIRO_ALUGUEL],
    text: "Olá, {primeiroNome}! Confirmando nosso compromisso agendado para hoje. Estarei à sua espera! Caso precise ajustar o horário, só me avisar por aqui. Abraços, {corretor} — Connect Platz.",
  },
];

/**
 * GET /api/extension/templates
 * Retorna os templates de WhatsApp compatíveis com o perfil do usuário logado.
 */
export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const role = session.role;
  const filtered = templates.filter((tpl) => tpl.roles.includes(role));

  return NextResponse.json({
    templates: filtered,
    userRole: role,
  });
}
