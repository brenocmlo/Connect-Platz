export type IntegrationStatus = "Conectado" | "Disponível" | "Plugin Oficial" | "Avançado";

export interface IntegrationItem {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  status: IntegrationStatus;
  statusColor?: string;
  logo: string; // Lucide or icon name
  ativo: boolean;
  contaConectada?: string;
  ultimaSincronizacao?: string;
  leadsRecebidos?: number;
  acaoPendente?: string;
  regras?: {
    distribuicao: "roleta" | "fila_geral" | "gestor";
    etapaInicial: string;
  };
  instrucoes?: string[];
}
