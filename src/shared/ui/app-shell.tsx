import { SidebarNav } from '@/shared/ui/sidebar-nav';

type AppShellProps = Readonly<{
  children: React.ReactNode;
  header: React.ReactNode;
}>;

export function AppShell({ children, header }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '19rem minmax(0, 1fr)'
      }}
    >
      <SidebarNav />
      <div style={{ minWidth: 0, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
        {header}
        <main style={{ padding: '2rem', minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
