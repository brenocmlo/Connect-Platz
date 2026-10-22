import { redirect } from "next/navigation";

// Links antigos de espelho apontam para a ficha do imóvel no portal público.
export default function EspelhoRedirect({ params }: { params: { slug: string } }) {
  const slug = String(params.slug || "").replace(/[^a-zA-Z0-9-]/g, "");
  redirect(slug ? `/?imovel=${encodeURIComponent(slug)}#vitrine` : "/#vitrine");
}
