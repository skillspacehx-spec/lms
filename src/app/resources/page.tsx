import ResourceHubPage from '@/components/resources/ResourceHubPage';
import { pages } from '@/data/resources';

type ResourcesPageProps = {
  searchParams?: Promise<{
    type?: string;
    category?: string;
  }>;
};

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;
  const type = params?.type;
  const category = params?.category;

  const page =
    type === 'articles'
      ? pages.articles
      : category === 'send'
        ? pages.send
        : category === 'study-tips'
          ? pages.study
          : category === 'wellbeing'
            ? pages.wellbeing
            : pages.articles;

  return <ResourceHubPage {...page} />;
}
