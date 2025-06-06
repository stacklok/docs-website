import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// ============================================================================
// TYPES - Self-contained within this component
// ============================================================================

/**
 * ProductGrid layout variants
 */
type GridLayout = 'auto' | 'fixed-2' | 'fixed-3' | 'fixed-4';

/**
 * ProductGrid spacing variants
 */
type GridSpacing = 'compact' | 'normal' | 'spacious';

/**
 * ProductGrid component props
 */
interface ProductGridProps {
  /** Child components to display in the grid */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Grid layout variant */
  layout?: GridLayout;
  /** Spacing between grid items */
  spacing?: GridSpacing;
  /** Minimum width for grid items */
  minItemWidth?: string;
  /** Maximum number of columns */
  maxColumns?: number;
}

// ============================================================================
// UTILITIES - Self-contained within this component
// ============================================================================

/**
 * Grid layout configurations
 */
const gridLayouts = {
  auto: 'repeat(auto-fit, minmax(var(--grid-min-width, 350px), 1fr))',
  'fixed-2': 'repeat(2, 1fr)',
  'fixed-3': 'repeat(3, 1fr)',
  'fixed-4': 'repeat(4, 1fr)',
} as const;

/**
 * Grid spacing configurations
 */
const gridSpacing = {
  compact: '1rem',
  normal: 'var(--ifm-spacing-horizontal)',
  spacious: '2rem',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProductGrid component for displaying ProductCard components in a responsive grid layout
 *
 * Features:
 * - Multiple layout variants (auto, fixed-2, fixed-3, fixed-4)
 * - Configurable spacing (compact, normal, spacious)
 * - Responsive design with customizable minimum item width
 * - Maximum column constraints
 */
export default function ProductGrid({
  children,
  className,
  layout = 'auto',
  spacing = 'normal',
  minItemWidth = '350px',
  maxColumns,
}: ProductGridProps) {
  // Generate CSS custom properties for grid configuration
  const gridStyles: React.CSSProperties & Record<string, string> = {
    '--grid-template-columns': gridLayouts[layout],
    '--grid-gap': gridSpacing[spacing],
    '--grid-min-width': minItemWidth,
  };

  // Apply max columns constraint for auto layout
  if (layout === 'auto' && maxColumns) {
    gridStyles['--grid-template-columns'] =
      `repeat(auto-fit, minmax(${minItemWidth}, ${100 / maxColumns}%))`;
  }

  return (
    <div
      className={clsx(
        styles.grid,
        styles[`grid--${layout}`],
        styles[`grid--spacing-${spacing}`],
        className
      )}
      style={gridStyles}
    >
      {children}
    </div>
  );
}

// Export type for external usage
export type { ProductGridProps };
