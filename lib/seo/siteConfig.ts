// lib/seo/siteConfig.ts
// Configurações canônicas de SEO, Geo SEO Local e Metadados do Connect Platz

export const SITE_CONFIG = {
  name: "Connect Platz Imobiliária",
  legalName: "Robson Carvalho Negócios Imobiliários & Connect Platz",
  tradeName: "Connect Platz CRM & Imobiliária",
  description:
    "Imobiliária de alto padrão em Fortaleza e Ceará. Venda e aluguel de temporada em Fortaleza, Aquiraz (Porto das Dunas), Eusébio e Caucaia. Lançamentos, casas em condomínio e coberturas frente mar.",
  defaultUrl: "https://connectplatz.com.br",
  cnpj: "53.758.699/0001-10",
  creci: "023456-J",
  founder: "Robson Carvalho",
  telephone: "+55 85 99999-9999", // Atualizável via variáveis ou painel
  email: "contato@connectplatz.com.br",
  address: {
    street: "Avenida Sargento Hermínio Sampaio, 5107",
    neighborhood: "Antônio Bezerra",
    city: "Fortaleza",
    state: "CE",
    postalCode: "60356-640",
    country: "BR",
    formatted:
      "Avenida Sargento Hermínio Sampaio, 5107, Antônio Bezerra, Fortaleza - CE, 60356-640, Brasil",
  },
  geo: {
    latitude: -3.734236,
    longitude: -38.584945,
    region: "BR-CE",
    placename: "Fortaleza, Ceará, Brasil",
    icbm: "-3.734236, -38.584945",
  },
  areaServed: [
    { name: "Fortaleza", state: "Ceará" },
    { name: "Aquiraz", state: "Ceará" },
    { name: "Eusébio", state: "Ceará" },
    { name: "Caucaia", state: "Ceará" },
  ],
  social: {
    instagram: "https://instagram.com/connectplatz",
    facebook: "https://facebook.com/connectplatz",
    linkedin: "https://linkedin.com/company/connectplatz",
  },
} as const;

/**
 * Retorna a URL base do site sanitizada (sem trailing slash).
 */
export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    SITE_CONFIG.defaultUrl;
  return url.replace(/\/+$/, "");
}
