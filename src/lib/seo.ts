import type { Metadata } from 'next';

export const SITE = {
  name: 'Тіл-құрал',
  tagline_kk: 'Қазақ тілін оқыту орталығы',
  tagline_ru: 'Центр обучения казахскому языку',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://til-kural.kz',
  twitter: '@tilkural',
  org: {
    legalName_kk: 'Тіл-құрал оқу-әдістемелік орталығы',
    legalName_ru: 'Учебно-методический центр «Тіл-құрал»',
    telephone: '+7 (7212) 00-00-00',
    email: 'info@til-kural.kz',
    streetAddress_kk: 'Қарағанды қ., Тәуелсіздік д., 20',
    streetAddress_ru: 'г. Караганда, пр. Тәуелсіздік, 20',
    city_kk: 'Қарағанды',
    city_ru: 'Караганда',
    country: 'KZ',
  },
} as const;

interface PageMetaInput {
  locale: string;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const url = `${SITE.url}${input.path || ''}`;
  const title = `${input.title} | ${SITE.name}`;
  const description = input.description || (input.locale === 'kk' ? SITE.tagline_kk : SITE.tagline_ru);
  const ogImage = input.image || `${SITE.url}/og-default.svg`;
  const otherLocale = input.locale === 'kk' ? 'ru' : 'kk';
  const altPath = (input.path || '/').replace(/^\/(kk|ru)(\/|$)/, `/${otherLocale}$2`);

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: url,
      languages: {
        kk: `${SITE.url}${input.path?.replace(/^\/ru/, '/kk') || '/kk'}`,
        ru: `${SITE.url}${input.path?.replace(/^\/kk/, '/ru') || '/ru'}`,
        'x-default': `${SITE.url}/kk`,
      },
    },
    openGraph: {
      type: input.type === 'article' ? 'article' : 'website',
      locale: input.locale === 'kk' ? 'kk_KZ' : 'ru_RU',
      alternateLocale: otherLocale === 'kk' ? 'kk_KZ' : 'ru_RU',
      siteName: SITE.name,
      url,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: SITE.twitter,
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export function organizationJsonLd(locale: string) {
  const isKk = locale === 'kk';
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: isKk ? SITE.org.legalName_kk : SITE.org.legalName_ru,
    url: SITE.url,
    logo: `${SITE.url}/logo.svg`,
    telephone: SITE.org.telephone,
    email: SITE.org.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: isKk ? SITE.org.streetAddress_kk : SITE.org.streetAddress_ru,
      addressLocality: isKk ? SITE.org.city_kk : SITE.org.city_ru,
      addressCountry: SITE.org.country,
    },
    sameAs: [],
  };
}

export function newsArticleJsonLd(params: {
  locale: string;
  title: string;
  description: string;
  image?: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: params.title,
    description: params.description,
    image: params.image ? [params.image] : [`${SITE.url}/og-default.svg`],
    datePublished: params.publishedAt,
    dateModified: params.modifiedAt || params.publishedAt,
    publisher: {
      '@type': 'EducationalOrganization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.svg` },
    },
    inLanguage: params.locale === 'kk' ? 'kk-KZ' : 'ru-RU',
    mainEntityOfPage: `${SITE.url}/${params.locale}/news/${params.slug}`,
  };
}

export function eventJsonLd(params: {
  locale: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  id: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: params.title,
    description: params.description,
    startDate: params.startDate,
    ...(params.endDate && { endDate: params.endDate }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: params.location || SITE.org.legalName_ru,
      address: params.locale === 'kk' ? SITE.org.streetAddress_kk : SITE.org.streetAddress_ru,
    },
    image: params.image ? [params.image] : undefined,
    organizer: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    inLanguage: params.locale === 'kk' ? 'kk-KZ' : 'ru-RU',
  };
}
