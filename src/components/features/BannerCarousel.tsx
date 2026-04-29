'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BannerItem {
  id: string;
  title: string | null;
  image_url: string;
  link_url?: string | null;
  subtitle_kk?: string | null;
  subtitle_ru?: string | null;
  position?: string | null;
  sort_order?: number | null;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  locale: string;
  /** Авто-смена в миллисекундах. 0 — отключить. */
  autoplayMs?: number;
}

export default function BannerCarousel({ banners, locale, autoplayMs = 6000 }: BannerCarouselProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1 || autoplayMs <= 0) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % banners.length);
    }, autoplayMs);
    return () => clearInterval(id);
  }, [banners.length, autoplayMs]);

  if (!banners || banners.length === 0) return null;

  const b = banners[idx];
  const subtitle = locale === 'kk' ? b.subtitle_kk : b.subtitle_ru;

  return (
    <section
      className="relative overflow-hidden h-[260px] sm:h-[320px] md:h-[380px]"
      aria-label="Баннеры"
    >
      {/* Фон с текущим баннером — fade при смене idx (через key). */}
      <div key={b.id} className="absolute inset-0 animate-[fadeIn_400ms_ease-out]">
        <Image
          src={b.image_url}
          alt={b.title || ''}
          fill
          sizes="100vw"
          priority={idx === 0}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 h-full flex flex-col justify-center text-white">
        {b.title && (
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl break-words">
            {b.title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg max-w-2xl text-white/95">
            {subtitle}
          </p>
        )}
        {b.link_url && (
          <Link
            href={b.link_url}
            className="mt-4 sm:mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#C2461A] hover:brightness-110 px-5 py-2.5 sm:px-6 sm:py-3 font-bold shadow-lg"
          >
            {locale === 'kk' ? 'Толығырақ' : 'Подробнее'} →
          </Link>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Баннер ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
          {/* prev/next для клавиатурной навигации */}
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)}
            aria-label="Предыдущий баннер"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white text-lg flex items-center justify-center"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % banners.length)}
            aria-label="Следующий баннер"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white text-lg flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
