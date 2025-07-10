import React, { useState, useMemo } from 'react';

interface Props {
  placeholder?: string;
  onSearch: (value: string) => void;
  onAutocomplete?: (value: string) => void;
  suggestions?: string[];
}

// Simple debounce interno
function debounceFunc<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

const SearchBar: React.FC<Props> = ({ placeholder, onSearch, onAutocomplete, suggestions = [] }) => {
  const [value, setValue] = useState('');
  const debouncedAuto = useMemo(
    () => debounceFunc((q: string) => onAutocomplete && onAutocomplete(q), 300),
    [onAutocomplete]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    debouncedAuto(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded transition-colors"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 z-10">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => { setValue(s); onSearch(s); }}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default SearchBar;
