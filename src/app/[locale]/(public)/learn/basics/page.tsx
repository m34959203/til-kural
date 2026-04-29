import BasicsClient from './client';
import rulesData from '@/data/kazakh-grammar-rules.json';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Қазақ тілінің негіздері' : 'Основы казахского языка',
    description: locale === 'kk'
      ? 'Қазақ тілінің грамматика негіздері: сингармонизм, септіктер, етістік шақтары, көптік және тәуелдік жалғаулары.'
      : 'Основы грамматики казахского языка: сингармонизм, падежи, времена глагола, окончания.',
    path: `/${locale}/learn/basics`,
  });
}

export default async function BasicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <BasicsClient locale={locale} rules={rulesData} />;
}
