import { ChannelId } from "./channels";

/** Status derivado de dados reais: leads recebidos e chave configurada no servidor. */
export type IntegrationStatus = "Conectado" | "Aguardando leads" | "Chave pendente";

export interface IntegrationItem {
  id: ChannelId;
  nome: string;
  descricao: string;
  categoria: string;
  /** Rótulo opcional de classificação do canal (ex.: "Plugin Oficial", "Avançado"). */
  selo?: string;
}
