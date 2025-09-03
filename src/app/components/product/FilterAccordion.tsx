import React from 'react';
import { FilterState } from '@/hooks/useProductFilter';
import { FilterCategory } from '@/lib/api/productFilterApi';
import Icon from '../ui/Icon';

interface FilterAccordionProps {
  title: string;
  category: keyof FilterState;
  isActive: boolean;
  onToggle: (category: string) => void;
  onSearch: (query: string, category: string) => void;
  onFilterChange: (category: keyof FilterState, value: string, checked: boolean) => void;
  activeFilters: FilterState;
  searchQuery: string;
  children?: React.ReactNode;
  dataId?: string;
  filterCount?: number;
  categories?: FilterCategory[];
}

export const FilterAccordion: React.FC<FilterAccordionProps> = ({
  title,
  category,
  isActive,
  onToggle,
  onSearch,
  onFilterChange,
  activeFilters,
  searchQuery,
  children,
  dataId,
  filterCount,
  categories
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value, category);
  };

  // const handleFilterChange = (value: string, checked: boolean) => {
  //   onFilterChange(category, value, checked);
  // };

  return (
    <div className="sei-accordion-item">
              <button 
          className={`sei-accordion-header sei-filter-oem-cat-tab-btn ${isActive ? 'active' : ''}`}
          onClick={() => onToggle(category)}
          data-id={dataId}
          aria-expanded={isActive}
          aria-controls={`accordion-${category}`}
        >
          <div className="sei-accordion-title">
            {title}
            {filterCount !== undefined && filterCount > 0 && (
              <span className="sei-filter-count">({filterCount})</span>
            )}
          </div>
          <span className="sei-arrow" aria-hidden="true">
            <Icon name="icon-mini-down" size={16} />
          </span>
        </button>
      
      <div 
        className={`sei-accordion-content ${isActive ? 'open' : ''}`}
        id={`accordion-${category}`}
        role="region"
        aria-labelledby={`accordion-header-${category}`}
      >
        <div className="sei-search-bar-container">
          <input 
            type="text" 
            className="sei-search-bar sei-sw-part-filter-search-text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={handleSearch}
            aria-label={`Search in ${title}`}
          />
          <span className="sei-search-icon sei-sw-part-filter-search-btn" aria-hidden="true">
            <Icon name="icon-search" size={16} />
          </span>
        </div>
        
    
        
        <ul className="sei-checkbox-list" role="group" aria-label={`${title} filters`}>
          <li>
            <label style={{ color: '#949ca3', fontWeight: 'bold' }}>
              <input 
                type="checkbox" 
                value="Show All" 
                className="sei-filter-oem-cat-cb" 
                checked={activeFilters[category].includes('Show All')}
                onChange={(e) => {
                  if (e.target.checked) {
                    // When "Show All" is checked, the handleFilterChange will automatically:
                    // 1. Clear all specific category selections
                    // 2. Set "Show All" as active
                    // 3. Clear all other filter types
                    onFilterChange(category, 'Show All', true);
                  } else {
                    // When "Show All" is unchecked, just remove it
                    onFilterChange(category, 'Show All', false);
                  }
                }}
                data-order="DESC" 
                data-orderby="count" 
                aria-label="Show all items"
              />
              <span>Show All</span>
            </label>
          </li>
          {categories ? (
            // Use real database categories
            categories.map((cat) => (
              <li key={cat.id}>
                <label>
                  <input 
                    type="checkbox" 
                    value={cat.id} 
                    className="sei-filter-oem-cat-cb" 
                    checked={activeFilters[category].includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // When a category is checked, the handleFilterChange will automatically:
                        // 1. Clear all other category selections
                        // 2. Set only this category as active
                        // 3. Clear all other filter types
                        onFilterChange(category, cat.id, true);
                      } else {
                        // When a category is unchecked, remove it and default to "Show All"
                        onFilterChange(category, cat.id, false);
                      }
                    }}
                    aria-label={cat.name}
                  />
                  <span>{cat.name}</span>
                </label>
              </li>
            ))
          ) : (
            // Fallback to children (for backward compatibility)
            children
          )}
        </ul>
      </div>
    </div>
  );
};

interface FilterCheckboxProps {
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string, checked: boolean) => void;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  value,
  label,
  checked,
  onChange
}) => {
  return (
    <li>
      <label>
        <input 
          type="checkbox" 
          value={value} 
          className="sei-filter-oem-cat-cb" 
          checked={checked}
          onChange={(e) => onChange(value, e.target.checked)}
          aria-label={label}
        />
        <span>{label}</span>
      </label>
    </li>
  );
};

