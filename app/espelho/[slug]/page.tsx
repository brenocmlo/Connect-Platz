import { redirect } from "next/navigation";

// app/espelho/[slug]/page.tsx
// Redirecionamento permanente para a URL canônica e otimizada para SEO (/imoveis/[slug]).
export default function EspelhoRedirect({ params }: { params: { slug: string } }) {
  const cleanSlug = String(params.slug || "").replace(/[^a-zA-Z0-9-]/g, "");
  if (cleanSlug) {
    redirect(`/imoveis/${encodeURIComponent(cleanSlug)}`);
  }
  redirect("/#vitrine");
}
