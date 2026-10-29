export interface BookingItem {
  id: string;
  imovelNome: string;
  locatarioNome: string;
  checkIn: string;
  checkOut: string;
  diarias: number;
  valorDiaria: number;
  taxaLimpeza: number;
  valorTotal: number;
  meioPagamento: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO" | "TED";
  status: "CONFIRMADA" | "PENDENTE" | "CONCLUIDA";
}
