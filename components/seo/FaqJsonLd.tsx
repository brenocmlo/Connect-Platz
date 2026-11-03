import React from "react";

// components/seo/FaqJsonLd.tsx
// Rich Snippets de FAQ (Perguntas Frequentes) para destaque expandido na SERP do Google.

export function FaqJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Como comprar um imóvel em Fortaleza e região com a Connect Platz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Connect Platz oferece assessoria completa com corretores credenciados pelo CRECI-CE, desde a seleção de lançamentos e imóveis prontos até a análise de crédito bancário e registro em cartório.",
        },
      },
      {
        "@type": "Question",
        name: "Quais cidades do Ceará são atendidas pela Connect Platz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Atendemos prioritariamente Fortaleza (Meireles, Aldeota, Cocó, Mucuripe), Aquiraz (Porto das Dunas, Prainha), Eusébio e Caucaia (Cumbuco), com foco em imóveis de alto padrão e veraneio.",
        },
      },
      {
        "@type": "Question",
        name: "Como funciona a locação de veraneio e temporada no Porto das Dunas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Disponibilizamos casas e apartamentos selecionados próximos ao Beach Park com bloqueio instantâneo de calendário, contrato digital seguro e suporte durante toda a estadia.",
        },
      },
      {
        "@type": "Question",
        name: "É possível fazer simulação de crédito imobiliário online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim, nosso portal conta com um simulador de financiamento imobiliário gratuito que calcula estimativas de parcelas, entrada e capacidade financeira para bancos como Caixa, Itaú, Bradesco e Santander.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
