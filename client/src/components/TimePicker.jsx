import React, { useEffect, useMemo, useRef, useState } from 'react';

// A smooth, keyboard-friendly time picker with a scrollable list of 15-min increments.
// Props:
// - value: string in 24h "HH:MM" or ''
// - onChange: (value: string) => void
// - placeholder?: string
// - className?: string (applied to the trigger input)
// - step?: number (minutes increment, default 15)
// - disabled?: boolean
// - id?: string, name?: string

const isCoarsePointer = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
};

function to12HourLabel(hh, mm) {
  const h = Number(hh);
  const m = Number(mm);
  const am = h < 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mmStr = m.toString().padStart(2, '0');
  return `${hour12}:${mmStr} ${am ? 'AM' : 'PM'}`;
}

function generateTimes(step = 15) {
  const list = [];
  for (let m = 0; m < 24 * 60; m += step) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    list.push({ value: `${hh}:${mm}`, label: to12HourLabel(hh, mm) });
  }
  return list;
}

const TimePicker = ({ value = '', onChange, placeholder = 'Select time', className = '', step = 15, disabled = false, id, name }) => {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(value);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const coarse = isCoarsePointer();

  useEffect(() => {
    setInternal(value || '');
  }, [value]);

  const times = useMemo(() => generateTimes(step), [step]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  // Scroll to selected time on open
  useEffect(() => {
    if (!open || !listRef.current) return;
    const selectedIndex = times.findIndex(t => t.value === internal);
    const idx = selectedIndex >= 0 ? selectedIndex : times.findIndex(t => t.value === '09:00');
    if (idx >= 0 && listRef.current.children[idx]) {
      listRef.current.children[idx].scrollIntoView({ block: 'center' });
    }
  }, [open, internal, times]);

  const selectValue = (val) => {
    setInternal(val);
    onChange?.(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    const currentIndex = times.findIndex(t => t.value === internal);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(times.length - 1, currentIndex + 1);
      selectValue(times[next].value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(0, currentIndex - 1);
      selectValue(times[prev].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (coarse) {
    // On mobile, native picker is smoother and accessible
    return (
      <input
        type="time"
        id={id}
        name={name}
        disabled={disabled}
        value={internal}
        onChange={(e) => selectValue(e.target.value)}
        className={className}
      />
    );
  }

  const selectedLabel = internal ? to12HourLabel(internal.split(':')[0], internal.split(':')[1]) : '';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        className={`${className} text-left flex items-center justify-between`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${!internal ? 'text-gray-400' : ''}`}>
          {selectedLabel || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-purple-100 rounded-lg shadow-lg max-h-60 overflow-auto" role="listbox">
          <div className="sticky top-0 bg-white p-2 border-b border-purple-50 flex gap-2 justify-between items-center">
            <span className="text-xs text-gray-500">Choose time</span>
            <button type="button" className="text-xs text-purple-600 hover:underline" onClick={() => selectValue('')}>Clear</button>
          </div>
          <ul ref={listRef} className="py-1">
            {times.map((t) => {
              const selected = t.value === internal;
              return (
                <li
                  key={t.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-purple-50 ${selected ? 'bg-purple-100 text-purple-800' : ''}`}
                  onClick={() => selectValue(t.value)}
                  role="option"
                  aria-selected={selected}
                >
                  {t.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
