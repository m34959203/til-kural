import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import { buildMetadata } from '@/lib/seo';
import { CULTURE_TOPICS, CULTURE_SLUGS } from '@/data/culture-topics';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  return buildMetadata({
    locale,
    title: isKk ? 'Қазақ мәдениеті' : 'Казахская культура',
    description: isKk
      ? 'Киіз үй, домбыра, дала табиғаты, қалалар — қазақ халқының мәдени мұрасы туралы тақырыптар жинағы.'
      : 'Юрта, домбра, природа степи, города — подборка тем о культурном наследии казахского народа.',
    path: `/${locale}/culture`,
  });
}

export default async function CultureOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const topics = CULTURE_SLUGS.map((slug) => CULTURE_TOPICS[slug]).filter(Boolean);

  return (
    <div className="bg-[#FAF6EC] min-h-screen">
      <section className="bg-gradient-to-br from-[#0F4C81] to-[#0B1E3D] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm uppercase tracking-wider text-[#F5C518] mb-2">
            {isKk ? 'Мәдениет' : 'Культура'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isKk ? 'Қазақ халқының мәдениеті' : 'Культура казахского народа'}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            {isKk
              ? 'Тіл — мәдениеттің кілті. Әр сабақтың артында дәстүр, символ, тарих тұр. Төмендегі тақырыптарды оқып, тілмен бірге халықты тани түсіңіз.'
              : 'Язык — это ключ к культуре. За каждым уроком стоят традиции, символы, история. Изучите темы ниже и узнайте народ глубже через язык.'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => {
            const title = isKk ? topic.title_kk : topic.title_ru;
            const cat = isKk ? topic.category_kk : topic.category_ru;
            const tagline = isKk ? topic.tagline_kk : topic.tagline_ru;
            return (
              <Link
                key={topic.slug}
                href={`/${locale}/culture/${topic.slug}`}
                aria-label={isKk ? `${title} тақырыбы` : `Тема «${title}»`}
                className="group block"
              >
                <Card hover className="overflow-hidden p-0">
                  <div className="relative h-48 md:h-56 bg-gray-100">
                    <Image
                      src={topic.hero_image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0F4C81] text-xs font-medium px-2.5 py-1 rounded-full">
                      {cat}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-[#0F4C81] mb-1.5 flex items-center gap-2">
                      {title}
                      <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">{tagline}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {isKk
                        ? `${topic.sections.length} бөлім · ${topic.vocabulary.length} сөз`
                        : `${topic.sections.length} раздела · ${topic.vocabulary.length} слов`}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl bg-white border border-[#0F4C81]/10 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-[#0F4C81] mb-2">
            {isKk ? 'Тілмен танысуды жалғастыру' : 'Продолжить знакомство с языком'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isKk
              ? 'Мәдениет туралы білгеннен кейін — тілді үйренуді бастаңыз.'
              : 'Узнав о культуре — начните учить сам язык.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/learn/lessons`}
              className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0B3A66] transition-colors"
            >
              {isKk ? 'Сабақтар →' : 'Уроки →'}
            </Link>
            <Link
              href={`/${locale}/learn/dialog`}
              className="px-4 py-2 rounded-lg border border-[#0F4C81] text-[#0F4C81] text-sm font-medium hover:bg-[#0F4C81]/5 transition-colors"
            >
              {isKk ? 'Диалог тренажёр' : 'Диалог-тренажёр'}
            </Link>
            <Link
              href={`/${locale}/test/level`}
              className="px-4 py-2 rounded-lg border border-[#0F4C81] text-[#0F4C81] text-sm font-medium hover:bg-[#0F4C81]/5 transition-colors"
            >
              {isKk ? 'Деңгей тесті' : 'Тест уровня'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
