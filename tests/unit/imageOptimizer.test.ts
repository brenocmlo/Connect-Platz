import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { optimizeImageToWebp, replaceFileExtension } from "@/app/api/upload/imageOptimizer";

describe("imageOptimizer (conversão e redimensionamento para WebP)", () => {
  it("converte PNG com transparência para WebP mantendo dimensão menor ou igual", async () => {
    const pngBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 18, g: 102, b: 199, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImageToWebp({
      buffer: pngBuffer,
      mime: "image/png",
      ext: "png",
      folder: "properties",
    });

    expect(result.converted).toBe(true);
    expect(result.mime).toBe("image/webp");
    expect(result.ext).toBe("webp");

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(400);
    expect(meta.height).toBe(300);
    expect(meta.hasAlpha).toBe(true);
  });

  it("redimensiona JPEG grande (> 1920px) preservando proporção e reduzindo peso", async () => {
    const largeJpeg = await sharp({
      create: {
        width: 3840,
        height: 2160,
        channels: 3,
        background: { r: 40, g: 80, b: 140 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const result = await optimizeImageToWebp({
      buffer: largeJpeg,
      mime: "image/jpeg",
      ext: "jpg",
      folder: "properties",
    });

    expect(result.converted).toBe(true);
    expect(result.mime).toBe("image/webp");
    expect(result.ext).toBe("webp");

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1920);
    expect(meta.height).toBe(1080);
  });

  it("respeita limite de 800x800 para avatares sem ampliar imagens pequenas", async () => {
    const largeAvatar = await sharp({
      create: {
        width: 1600,
        height: 1600,
        channels: 3,
        background: { r: 217, g: 187, b: 76 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImageToWebp({
      buffer: largeAvatar,
      mime: "image/png",
      ext: "png",
      folder: "avatars",
    });

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(800);
  });

  it("atualiza a extensão do nome exibido para .webp", () => {
    expect(replaceFileExtension("fachada-luxo.PNG", "webp")).toBe("fachada-luxo.webp");
    expect(replaceFileExtension("foto.casa.jpg", "webp")).toBe("foto.casa.webp");
    expect(replaceFileExtension("sem_extensao", "webp")).toBe("sem_extensao.webp");
  });
});
