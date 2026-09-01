import { useEffect, useMemo, useRef, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { useProductSuggestionsQuery } from '@/hooks/useQueryProducts';
import { formatCurrencyTrimmed } from '@/utils/currency';

function SuggestionThumbnail({ suggestion, hasImageError, onImageError }) {
  const imageUrl = suggestion.imageUrl || suggestion.thumbnail || '';

  if (!imageUrl || hasImageError) {
    return (
      <div
        aria-hidden="true"
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2" />
          <circle cx="9" cy="10" r="1.25" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 16 3.5-3.5 2.5 2.5 2-2 2.5 3" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      aria-hidden="true"
      className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
      onError={onImageError}
    />
  );
}

export default function SearchInput({
  initialValue = '',
  onSearch,
  autoFocus = false,
  placeholder = 'Search products...',
  onSubmitSearch,
  onCloseDropdown,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  containerStyle,
  inputStyle,
  buttonStyle,
  dropdownStyle,
}) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [imageErrors, setImageErrors] = useState({});
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounced = useDebounce(inputValue, 300);
  const trimmedDebounced = debounced.trim();
  const trimmedInput = inputValue.trim();

  const { data, isLoading } = useProductSuggestionsQuery(trimmedDebounced);
  const suggestions = useMemo(() => (data ?? []).slice(0, 6), [data]);
  const shouldShowDropdown = isOpen && trimmedDebounced.length >= 2;

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (trimmedDebounced.length < 2) {
      setIsOpen(false);
      setActiveIndex(-1);
      setImageErrors({});
      return;
    }

    setIsOpen(true);
    setActiveIndex(-1);
  }, [trimmedDebounced]);

  const submitSearch = (value) => {
    const term = value.trim();
    if (!term) return;
    setInputValue(term);
    setIsOpen(false);
    setActiveIndex(-1);
    onCloseDropdown?.();
    onSearch(term);
    onSubmitSearch?.(term);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      if (!suggestions.length) return;
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!suggestions.length) return;
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => {
        if (prev <= 0) return suggestions.length - 1;
        return prev - 1;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = activeIndex >= 0 ? suggestions[activeIndex]?.name : trimmedInput;
      if (selected) {
        submitSearch(selected);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      onCloseDropdown?.();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          ...containerStyle,
        }}
      >
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={shouldShowDropdown}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined}
          aria-autocomplete="list"
          type="search"
          value={inputValue}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm outline-none ${inputClassName}`.trim()}
          style={{ color: 'var(--text-primary)', ...inputStyle }}
          onChange={handleChange}
          onFocus={() => {
            if (trimmedDebounced.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={() => submitSearch(trimmedInput)}
          aria-label="Search"
          className={`shrink-0 transition-opacity hover:opacity-70 ${buttonClassName}`.trim()}
          style={{ color: 'var(--text-secondary)', ...buttonStyle }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </div>

      {shouldShowDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-lg"
          style={{
            backgroundColor: 'var(--card-bg-elevated)',
            borderColor: 'var(--border-color)',
            ...dropdownStyle,
          }}
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Loading suggestions...
            </p>
          ) : suggestions.length > 0 ? (
            <ul role="listbox" id="search-suggestions" aria-label="Search suggestions">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  id={`search-suggestion-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
                  style={{
                    backgroundColor:
                      activeIndex === index ? 'var(--bg-secondary)' : 'var(--card-bg-elevated)',
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submitSearch(suggestion.name)}
                >
                  <SuggestionThumbnail
                    suggestion={suggestion}
                    hasImageError={Boolean(imageErrors[suggestion.id])}
                    onImageError={() => {
                      setImageErrors((prev) => {
                        if (prev[suggestion.id]) return prev;
                        return { ...prev, [suggestion.id]: true };
                      });
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {suggestion.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {suggestion.category}
                    </p>
                  </div>
                  {suggestion.price != null && (
                    <p
                      className="shrink-0 whitespace-nowrap text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatCurrencyTrimmed(suggestion.price)}
                    </p>
                  )}
                </li>
              ))}
              <li role="presentation" className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submitSearch(trimmedInput)}
                >
                  View all results &rarr;
                </button>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              No matching products found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
