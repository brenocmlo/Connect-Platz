import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

interface SiteSettingsData {
  heroImage: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  siteTitle: string;
  siteSlogan: string;
  corretorNome: string;
  creci: string;
  whatsapp: string;
  email: string;
  pixelId?: string;
  siteAtivo: boolean;
  themePreset: string;
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  heroImage:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
  heroTitle: "Seja qual for o seu momento de vida,",
  heroHighlight: "a Connect Platz tem o imóvel certo para você.",
  heroSubtitle:
    "Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado.",
  siteTitle: "Connect Platz Imóveis & Veraneio",
  siteSlogan: "Os melhores lançamentos e imóveis no Ceará",
  corretorNome: "Connect Platz Negócios Imobiliários",
  creci: "CRECI 12345-J",
  whatsapp: "(85) 99999-0001",
  email: "contato@connectplatz.com.br",
  pixelId: "",
  siteAtivo: true,
  themePreset: "connect-blue",
  primaryColor: "#1266C7",
  secondaryColor: "#D9BB4C",
};

const SETTINGS_FILE_PATH = join(process.cwd(), "data", "site-settings.json");

// Cache em memória para acesso ultrarrápido
let inMemorySettings: SiteSettingsData = { ...DEFAULT_SITE_SETTINGS };

async function loadSettingsFromFile(): Promise<SiteSettingsData> {
  try {
    if (existsSync(SETTINGS_FILE_PATH)) {
      const content = await readFile(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      inMemorySettings = { ...DEFAULT_SITE_SETTINGS, ...parsed };
      return inMemorySettings;
    }
  } catch (err) {
    console.warn("Aviso ao ler site-settings.json:", err);
  }
  return inMemorySettings;
}

export async function GET() {
  try {
    const settings = await loadSettingsFromFile();
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: true, settings: inMemorySettings },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await loadSettingsFromFile();
    const merged: SiteSettingsData = {
      ...current,
      ...body,
    };

    inMemorySettings = merged;

    try {
      await writeFile(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch (writeErr) {
      console.warn("Aviso ao salvar site-settings.json em disco:", writeErr);
    }

    return NextResponse.json({ success: true, settings: merged }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar configurações do site." },
      { status: 500 }
    );
  }
}
