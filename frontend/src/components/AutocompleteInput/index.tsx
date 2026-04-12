import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getFilteredTickers } from '../../constants/tickers';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => unknown;
  placeholder?: string;
  disabled?: boolean;
  submitLabel?: string;
  showSubmitButton?: boolean;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter ticker (e.g., AAPL, CBA.AX, HSBA.L)',
  disabled = false,
  submitLabel = 'Analyse',
  showSubmitButton = true,
  className = '',
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const justClickedRef = useRef(false);

  // Compute suggestions directly from value (derived state)
  const suggestions = value.trim() ? getFilteredTickers(value) : [];

  // Get suffix hint for display
  const getSuffixHint = (ticker: string): string | null => {
    if (ticker.endsWith('.AX')) return 'Australia';
    if (ticker.endsWith('.L')) return 'London';
    if (ticker.endsWith('.TO')) return 'Toronto';
    if (ticker.endsWith('.SS') || ticker.endsWith('.SZ')) return 'Shanghai';
    if (ticker.endsWith('.HK')) return 'Hong Kong';
    if (ticker.endsWith('.T')) return 'Tokyo';
    return null;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    justClickedRef.current = false;
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    justClickedRef.current = true;
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onChange(suggestions[highlightedIndex]);
          setShowSuggestions(false);
          justClickedRef.current = true;
        } else {
          e.preventDefault();
          onSubmit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll highlighted suggestion into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        const suggestionsElement = suggestionsRef.current;
        if (suggestionsElement && !suggestionsElement.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (justClickedRef.current) {
                  justClickedRef.current = false;
                  return;
                }
                if (value && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls="ticker-suggestions"
              aria-expanded={showSuggestions && suggestions.length > 0}
              className="w-full px-4 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          {showSubmitButton && (
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
            >
              {disabled ? 'Loading...' : submitLabel}
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          id="ticker-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const suffixHint = getSuffixHint(suggestion);
            return (
              <li
                key={suggestion}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="font-medium">{suggestion}</span>
                {suffixHint && (
                  <span
                    className={`ml-2 text-xs ${index === highlightedIndex ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    ({suffixHint})
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
