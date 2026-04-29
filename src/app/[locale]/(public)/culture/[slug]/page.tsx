import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import { buildMetadata } from '@/lib/seo';
import { CULTURE_TOPICS, CULTURE_SLUGS } from '@/data/culture-topics';

export async function generateStaticParams() {
  // Препрендерим все 4 темы для обоих локалей.
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of ['kk', 'ru']) {
    for (const slug of CULTURE_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = CULTURE_TOPICS[slug];
  if (!topic) {
    return buildMetadata({
      locale,
      title: locale === 'kk' ? 'Тақырып табылмады' : 'Тема не найдена',
      path: `/${locale}/culture/${slug}`,
    });
  }
  const isKk = locale === 'kk';
  return buildMetadata({
    locale,
    title: isKk
      ? `${topic.title_kk} — қазақ мәдениеті`
      : `${topic.title_ru} — казахская культура`,
    description: isKk ? topic.tagline_kk : topic.tagline_ru,
    path: `/${locale}/culture/${slug}`,
    image: topic.hero_image,
  });
}

// Простой markdown-substitution для description-абзацев: \n → абзацы, **жирный**.
function renderRich(text: string) {
  return text.split('\n').filter(Boolean).map((para, i) => (
    <p key={i} className="mb-3 last:mb-0">
      {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/);
        if (m) return <strong key={j} className="text-[#0F4C81]">{m[1]}</strong>;
        return <span key={j}>{part}</span>;
      })}
    </p>
  ));
}

export default async function CultureTopicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const topic = CULTURE_TOPICS[slug];
  if (!topic) notFound();
  const isKk = locale === 'kk';
  const title = isKk ? topic.title_kk : topic.title_ru;
  const tagline = isKk ? topic.tagline_kk : topic.tagline_ru;
  const intro = isKk ? topic.intro_kk : topic.intro_ru;
  const category = isKk ? topic.category_kk : topic.category_ru;

  return (
    <article className="bg-[#FAF6EC]">
      {/* HERO */}
      <section className="relative h-[280px] sm:h-[360px] md:h-[440px] overflow-hidden">
        <Image
          src={topic.hero_image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/80 via-[#0B1E3D]/40 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6 h-full flex flex-col justify-end pb-8 text-white">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mb-3"
          >
            ← {isKk ? 'Басты бет' : 'На главную'}
          </Link>
          <div className="text-[#F5C518] text-xs font-extrabold tracking-widest uppercase">
            {category}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-1">{title}</h1>
          <p className="mt-2 text-base sm:text-lg text-white/85 max-w-2xl">{tagline}</p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10 space-y-8">
        <div className="prose-mini text-base text-[#2B2A26] leading-relaxed">
          {renderRich(intro)}
        </div>

        {topic.sections.map((s, i) => (
          <Card key={i}>
            <h2 className="text-xl font-bold text-[#0B1E3D] mb-3">
              {isKk ? s.title_kk : s.title_ru}
            </h2>
            <div className="text-[#2B2A26] leading-relaxed">
              {renderRich(isKk ? s.body_kk : s.body_ru)}
            </div>
          </Card>
        ))}

        {/* Vocabulary */}
        <Card>
          <h2 className="text-xl font-bold text-[#0B1E3D] mb-3">
            📚 {isKk ? 'Тақырып сөздігі' : 'Словарь темы'}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {topic.vocabulary.map((v, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-gray-900">{v.kk}</span>
                {v.tr && <span className="text-xs text-gray-400">{v.tr}</span>}
                <span className="text-gray-600">— {v.ru}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Связки с другими разделами */}
        {topic.links.length > 0 && (
          <Card className="border-teal-100 bg-teal-50/40">
            <h2 className="text-base font-semibold text-teal-900 mb-3">
              {isKk ? 'Тереңірек үйрену' : 'Изучить глубже'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {topic.links.map((l, i) => (
                <li key={i}>
                  <Link
                    href={`/${locale}${l.href}`}
                    className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 underline"
                  >
                    <span aria-hidden>{l.icon || '→'}</span>
                    <span>{isKk ? l.label_kk : l.label_ru}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Связанные темы */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            {isKk ? 'Басқа тақырыптар' : 'Другие темы культуры'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CULTURE_SLUGS.filter((s) => s !== slug).map((other) => {
              const o = CULTURE_TOPICS[other];
              if (!o) return null;
              return (
                <Link
                  key={other}
                  href={`/${locale}/culture/${other}`}
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition"
                >
                  <Image
                    src={o.hero_image}
                    alt={isKk ? o.title_kk : o.title_ru}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <div className="text-xs uppercase tracking-wider text-white/80">
                      {isKk ? o.category_kk : o.category_ru}
                    </div>
                    <div className="font-bold">{isKk ? o.title_kk : o.title_ru}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
