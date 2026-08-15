'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  APP_NAVIGATION,
  findActiveLabel,
  isGroupActive,
  isGroupExpanded,
  isLeafActive
} from '@/shared/ui/navigation';

export function SidebarNav() {
  const pathname = usePathname();
  const activeLabel = findActiveLabel(pathname);

  return (
    <aside
      style={{
        width: '19rem',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: '1.5rem',
        padding: '1.5rem 1rem',
        borderRight: '1px solid var(--border)',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div style={{ display: 'grid', gap: '0.35rem', padding: '0.5rem 0.75rem' }}>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Shared collection
        </span>
        <strong className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 400 }}>
          LedgerBox
        </strong>
        <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Активний розділ: {activeLabel}
        </span>
      </div>

      <nav aria-label="Основна навігація" style={{ display: 'grid', gap: '0.5rem' }}>
        {APP_NAVIGATION.map((item) => {
          if (item.kind === 'leaf') {
            const active = isLeafActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.95rem 1rem',
                  borderRadius: '1rem',
                  color: active ? 'var(--accent-foreground)' : 'var(--foreground)',
                  background: active ? 'var(--accent)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  transition: 'background 120ms ease, color 120ms ease'
                }}
              >
                <span>{item.label}</span>
              </Link>
            );
          }

          const expanded = isGroupExpanded(pathname, item);
          const active = isGroupActive(pathname, item);

          return (
            <div
              key={item.label}
              style={{
                borderRadius: '1rem',
                padding: '0.35rem',
                background: active ? 'rgba(255, 255, 255, 0.66)' : 'transparent'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.75rem',
                  borderRadius: '0.8rem',
                  color: item.disabled ? 'var(--muted)' : 'var(--foreground)'
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.badge ? (
                    <span
                      style={{
                        borderRadius: '999px',
                        padding: '0.15rem 0.5rem',
                        background: 'var(--amber-soft)',
                        color: 'var(--amber)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                  {!item.disabled ? (
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {expanded ? '−' : '+'}
                    </span>
                  ) : null}
                </div>
              </div>

              {!item.disabled && expanded ? (
                <div style={{ display: 'grid', gap: '0.3rem', padding: '0.2rem 0.3rem 0.4rem 0.9rem' }}>
                  {item.items.map((child) => {
                    const childActive = isLeafActive(pathname, child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '0.85rem',
                          color: childActive ? 'var(--accent)' : 'var(--foreground)',
                          background: childActive ? 'var(--accent-soft)' : 'transparent',
                          fontWeight: childActive ? 600 : 500
                        }}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          padding: '1rem',
          background: 'var(--surface)'
        }}
      >
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          Навігація лишається в layout, тому переходи між розділами App Router не перемальовують
          shell повністю.
        </p>
      </div>
    </aside>
  );
}
