"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { initUtmCapture } from "@/lib/tracking/utmCapture";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

interface PublicTrackingConfig {
  sitePixelId?: string;
  sitePixelActive?: boolean;
  ga4MeasurementId?: string;
  ga4Active?: boolean;
}

export function PublicTrackingScripts() {
  const [config, setConfig] = useState<PublicTrackingConfig | null>(null);

  useEffect(() => {
    // Inicializa a captura de UTMs e cookies _fbp / _fbc
    initUtmCapture();

    // Carrega configurações de rastreamento do site
    fetch("/api/site-settings", { cache: "default" })
      .then((res) => res.json())
      .then((data) => {
        const site = data?.settings || {};
        setConfig({
          sitePixelId: site.pixelId || "",
          sitePixelActive: Boolean(site.pixelId && site.siteAtivo !== false),
          ga4MeasurementId: site.ga4MeasurementId || "",
          ga4Active: Boolean(site.ga4Active && site.ga4MeasurementId),
        });
      })
      .catch(() => {});
  }, []);

  const pixelId = config?.sitePixelId;
  const pixelActive = config?.sitePixelActive && Boolean(pixelId);

  const ga4Id = config?.ga4MeasurementId;
  const ga4Active = config?.ga4Active && Boolean(ga4Id);

  return (
    <>
      {/* Script do Meta Pixel */}
      {pixelActive && pixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Script do Google Analytics 4 (GA4) */}
      {ga4Active && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
