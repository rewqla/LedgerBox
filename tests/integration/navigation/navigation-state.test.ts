import { describe, expect, it } from 'vitest';
import {
  APP_NAVIGATION,
  findActiveLabel,
  isGroupActive,
  isGroupExpanded,
  isLeafActive
} from '@/shared/ui/navigation';

describe('navigation state helpers', () => {
  const coinsGroup = APP_NAVIGATION.find(
    (item) => item.kind === 'group' && item.label === 'Монети'
  );
  const bondsGroup = APP_NAVIGATION.find(
    (item) => item.kind === 'group' && item.label === 'ОВДП'
  );

  if (!coinsGroup || coinsGroup.kind !== 'group') {
    throw new Error('Монети navigation group must exist.');
  }

  if (!bondsGroup || bondsGroup.kind !== 'group') {
    throw new Error('ОВДП navigation group must exist.');
  }

  it('detects active leaf routes for dashboard and nested coin sections', () => {
    expect(isLeafActive('/dashboard', '/dashboard')).toBe(true);
    expect(isLeafActive('/coins/collection', '/coins/collection')).toBe(true);
    expect(isLeafActive('/coins/collection/details', '/coins/collection')).toBe(true);
    expect(isLeafActive('/coins/wishlist', '/coins/collection')).toBe(false);
  });

  it('expands only the active non-disabled group', () => {
    expect(isGroupActive('/coins/collection', coinsGroup)).toBe(true);
    expect(isGroupExpanded('/coins/collection', coinsGroup)).toBe(true);
    expect(isGroupExpanded('/dashboard', coinsGroup)).toBe(false);
    expect(isGroupExpanded('/bonds', bondsGroup)).toBe(false);
  });

  it('returns the active UI label for top-level and nested destinations', () => {
    expect(findActiveLabel('/dashboard')).toBe('Дашборд');
    expect(findActiveLabel('/coins/collection')).toBe('Колекція');
    expect(findActiveLabel('/coins/wishlist')).toBe('Бажанки');
    expect(findActiveLabel('/unknown')).toBe('LedgerBox');
  });
});
