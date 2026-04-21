import UserManagement from '@/components/admin/UserManagement';

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <UserManagement locale={locale} />;
}
