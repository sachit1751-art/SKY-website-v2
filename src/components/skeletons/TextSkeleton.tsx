import React from 'react';

interface TextSkeletonProps {
  /** Number of text lines per paragraph block */
  lines?: number;
  /** Number of paragraph blocks to render */
  paragraphs?: number;
  /** Whether to render a simulated title line at the top */
  hasHeading?: boolean;
  /** Optional custom container CSS classes */
  className?: string;
}

/**
 * TextSkeleton component uses CSS shimmer animation background to render smooth,
 * natural-looking skeleton loaders for long-form articles, changelogs, and content sections.
 */
export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 4,
  paragraphs = 1,
  hasHeading = true,
  className = '',
}) => {
  // Varied widths for realistic line ragged edges
  const lineWidths = ['100%', '93%', '97%', '84%', '91%', '76%', '89%'];

  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="Loading content...">
      {hasHeading && (
        <div className="space-y-2">
          <div className="h-7 w-2/5 min-w-[200px] max-w-[320px] rounded-xl shimmer-skeleton" />
          <div className="h-3.5 w-1/4 min-w-[140px] max-w-[200px] rounded-full shimmer-skeleton opacity-75" />
        </div>
      )}

      {Array.from({ length: paragraphs }).map((_, pIdx) => (
        <div key={pIdx} className="space-y-2.5">
          {Array.from({ length: lines }).map((_, lIdx) => (
            <div
              key={lIdx}
              style={{ width: lIdx === lines - 1 ? '65%' : lineWidths[lIdx % lineWidths.length] }}
              className="h-4 rounded-full shimmer-skeleton"
            />
          ))}
        </div>
      ))}
      
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
