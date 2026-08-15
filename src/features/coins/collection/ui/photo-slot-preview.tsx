type PhotoSlotPreviewProps = {
  label: string;
  path: string | null;
};

export function PhotoSlotPreview({ label, path }: PhotoSlotPreviewProps) {
  const hasPhoto = Boolean(path);

  return (
    <div
      style={{
        display: 'grid',
        gap: '0.5rem',
        padding: '0.9rem',
        borderRadius: '1rem',
        border: '1px dashed var(--border-strong)',
        background: hasPhoto ? 'var(--surface)' : 'var(--surface-muted)',
        minHeight: '7.5rem',
        alignContent: 'space-between'
      }}
    >
      <span style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {hasPhoto ? (
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <strong style={{ fontSize: '0.95rem' }}>Фото додано</strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
            {path}
          </span>
        </div>
      ) : (
        <span style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
          Поки без фото. У цьому MVP є тільки два окремі слоти: аверс і реверс.
        </span>
      )}
    </div>
  );
}
