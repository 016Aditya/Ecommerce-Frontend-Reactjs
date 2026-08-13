import { useEffect } from 'react';
import SearchInput from './SearchInput';

export default function SearchOverlayMobile({ initialValue = '', onSearch, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        className="flex items-center gap-3 border-b p-4 shadow-sm"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg-elevated)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="p-1 text-2xl transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr;
        </button>
        <SearchInput
          initialValue={initialValue}
          onSearch={onSearch}
          onSubmitSearch={onClose}
          onCloseDropdown={onClose}
          autoFocus
          containerStyle={{ padding: '12px 16px', borderRadius: '14px', borderColor: 'var(--accent)' }}
          inputStyle={{ fontSize: '16px' }}
          buttonClassName="[&>svg]:h-6 [&>svg]:w-6"
        />
      </div>
    </div>
  );
}
