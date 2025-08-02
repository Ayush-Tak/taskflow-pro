import React, { useState } from 'react';
import { useBoard } from '../contexts/BoardContext';
import Label from './Label';

/**
 * LabelFilter Component
 * Provides filtering functionality for cards based on labels
 * Matches the design system of the Trello clone
 */
const LabelFilter = () => {
  const { boardData, dispatch } = useBoard();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = boardData.activeFilters && boardData.activeFilters.length > 0;
  const filteredCount = hasActiveFilters ? boardData.activeFilters.length : 0;

  const handleToggleFilter = (labelID) => {
    dispatch({
      type: "TOGGLE_LABEL_FILTER",
      payload: { labelID }
    });
  };

  const handleClearFilters = () => {
    dispatch({ type: "CLEAR_ALL_FILTERS" });
  };

  return (
    <div className="mb-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${hasActiveFilters
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80'
            }
          `}
        >
          <span className="text-sm">
            🏷️ Filters {filteredCount > 0 && `(${filteredCount})`}
          </span>
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="bg-secondary/30 border border-border rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
            Filter by Labels
          </h3>
          <div className="flex flex-wrap gap-2">
            {boardData.labels.map(label => {
              const isActive = boardData.activeFilters && boardData.activeFilters.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => handleToggleFilter(label.id)}
                  className={`
                    relative transition-all duration-200 rounded-full
                    ${isActive
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }
                  `}
                >
                  <Label label={label} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing cards with{' '}
                <span className="font-medium text-foreground">
                  {filteredCount === 1 ? 'this label' : 'any of these labels'}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabelFilter;
