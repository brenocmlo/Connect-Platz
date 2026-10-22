import { IntegrationItem } from "./types";

/** Catálogo estático dos canais suportados (somente descrição; status vem da API). */
export const integrationCatalog: IntegrationItem[] = [
  {
    id: "meta-ads",
    nome: "Meta Ads (Facebook & Instagram)",
    descricao: "Captação automática de leads dos formulários instantâneos do Facebook e Instagram.",
    categoria: "Mídia Paga",
  },
  {
    id: "google-ads",
    nome: "Google Ads (Lead Form)",
    descricao: "Recebimento dos leads captados pelos formulários de lead das campanhas do Google Ads.",
    categoria: "Mídia Paga",
  },
  {
    id: "grupo-olx",
    nome: "Grupo OLX (Zap Imóveis & Viva Real)",
    descricao: "Webhook para receber contatos dos portais OLX, Zap Imóveis e Viva Real.",
    categoria: "Portais Imobiliários",
    selo: "Portal",
  },
  {
    id: "dream-casa",
    nome: "Dream Casa",
    descricao: "Recebimento direto de solicitações de contato e visitas do portal Dream Casa.",
    categoria: "Portais Imobiliários",
    selo: "Portal",
  },
  {
    id: "chaves-na-mao",
    nome: "Chaves na Mão",
    descricao: "Repasse de leads do portal Chaves na Mão direto para o funil.",
    categoria: "Portais Imobiliários",
    selo: "Portal",
  },
  {
    id: "landing-page",
    nome: "Landing Page (WordPress & Elementor)",
    descricao: "Captura de leads de landing pages, formulários Elementor e formulários customizados.",
    categoria: "Site e Landing Pages",
    selo: "Plugin Oficial",
  },
  {
    id: "api-webhooks",
    nome: "API & Webhooks Customizados",
    descricao: "Endpoint REST para n8n, Make, Zapier e sistemas de construtoras.",
    categoria: "Desenvolvimento",
    selo: "Avançado",
  },
];
