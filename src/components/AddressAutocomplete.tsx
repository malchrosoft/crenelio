import React, { useState, useEffect, useRef } from 'react';
import { AddressResult } from '../types';

interface BANFeature {
  properties: {
    label: string;
    name?: string;
    postcode?: string;
    city?: string;
    context?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress: (result: AddressResult) => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelectAddress,
}) => {
  const [query, setQuery] = useState<string>(value || '');
  const [suggestions, setSuggestions] = useState<BANFeature[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await res.json();
        if (data && data.features) {
          setSuggestions(data.features as BANFeature[]);
          setIsOpen(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(feature: BANFeature) {
    const props = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;

    const fullAddress = props.name || props.label;
    const postCode = props.postcode || '';
    const city = props.city || '';

    setQuery(props.label || fullAddress);
    setIsOpen(false);

    onSelectAddress({
      address: fullAddress,
      postal_code: postCode,
      city: city,
      coordinates: [lat, lon], // [latitude, longitude]
      label: props.label,
    });
  }

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="form-input"
        placeholder="Tapez votre adresse (ex: 12 rue de la Paix, Paris)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        autoComplete="off"
        required
      />

      {isOpen && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSelect(item)}
            >
              📍 <strong>{item.properties.label}</strong>
              {item.properties.context && (
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  {item.properties.context}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
          Recherche de l'adresse en cours...
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
