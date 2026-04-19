import Script from 'next/script';
import { getSettings } from '@/lib/settings';

export default async function Analytics() {
  if (process.env.NODE_ENV !== 'production') return null;

  const settings = await getSettings();
  const ga = settings.ga_id;
  const ym = settings.ym_id;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga}', { anonymize_ip: true });
          `}</Script>
        </>
      ) : null}

      {ym ? (
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${ym}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
        `}</Script>
      ) : null}
    </>
  );
}
