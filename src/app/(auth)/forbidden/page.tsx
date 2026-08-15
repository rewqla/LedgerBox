import { redirect } from 'next/navigation';
import { ForbiddenPanel } from '@/features/auth/ui/forbidden-panel';
import { resolveAuthAccessState } from '@/shared/auth/access';

export const dynamic = 'force-dynamic';

export default async function ForbiddenPage() {
  const access = await resolveAuthAccessState();

  if (access.kind === 'anonymous') {
    redirect('/login');
  }

  if (access.kind === 'member') {
    redirect('/dashboard');
  }

  return <ForbiddenPanel email={access.email} />;
}
