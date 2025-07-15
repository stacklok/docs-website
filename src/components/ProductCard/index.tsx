// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

// ============================================================================
// TYPES - Self-contained within this component
// ============================================================================

/**
 * Base props shared by all ProductCard variants
 */
interface BaseProductCardProps {
  /** The URL the card links to */
  href: string;
  /** Text for the call-to-action link */
  linkText: string;
  /** Additional CSS class names */
  className?: string;
  /** Card variant for different styling */
  variant?: 'default' | 'compact' | 'featured';
  /** Custom hover effect override */
  hoverEffect?: 'default' | 'none' | 'custom';
}

/**
 * ProductCard with logo-based content
 */
interface LogoProductCardProps extends BaseProductCardProps {
  contentType: 'logo';
  /** Path to primary logo (used for light mode by default) */
  logo: string;
  /** Optional path to dark mode logo */
  logoDark?: string;
  /** Alt text for the logo */
  logoAlt?: string;
  /** Title for the logo */
  logoTitle?: string;
  /** Whether to invert the logo color on hover in light mode */
  invertLogoOnHover?: boolean;
  /** Description text or React content */
  description?: string;
  /** React children for custom description content */
  children?: React.ReactNode;
}

/**
 * ProductCard with text-based content (no logo)
 */
interface TextProductCardProps extends BaseProductCardProps {
  contentType: 'text';
  /** Title text to display */
  title: string;
  /** Description text or React content */
  description?: string;
  /** React children for custom description content */
  children?: React.ReactNode;
}

/**
 * Union type for all ProductCard variants
 */
type ProductCardProps = LogoProductCardProps | TextProductCardProps;

// ============================================================================
// UTILITIES - Self-contained within this component
// ============================================================================

/**
 * Determines if a URL is external to the current domain
 * @param url - The URL to check
 * @returns true if the URL is external, false otherwise
 */
function isExternalUrl(url: string): boolean {
  try {
    // If it starts with http:// or https://, it's an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      // Check if the hostname is different from current domain
      return urlObj.hostname !== window.location.hostname;
    }
    // Relative URLs are considered internal
    return false;
  } catch {
    // If URL parsing fails, treat as internal for safety
    return false;
  }
}

/**
 * Gets the appropriate link attributes for external URLs
 * @param url - The URL to get attributes for
 * @returns Object with target and rel attributes for external links
 */
function getExternalLinkAttributes(url: string) {
  const isExternal = isExternalUrl(url);
  return {
    target: isExternal ? '_blank' : undefined,
    rel: isExternal ? 'noopener noreferrer' : undefined,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProductCard component for displaying product information with hover effects
 *
 * Supports two content types:
 * - 'logo': Displays a logo with optional description
 * - 'text': Displays a title with optional description
 */
export default function ProductCard(props: ProductCardProps) {
  const {
    href,
    linkText,
    className,
    variant = 'default',
    hoverEffect = 'default',
    children,
  } = props;

  const linkAttributes = getExternalLinkAttributes(href);

  // Type-safe content rendering based on discriminated union
  const renderContent = () => {
    if (props.contentType === 'logo') {
      const {
        logo,
        logoDark,
        logoAlt = '',
        logoTitle = '',
        invertLogoOnHover = true,
        description,
      } = props;

      return (
        <>
          <div className={styles.logo}>
            <ThemedImage
              alt={logoAlt}
              title={logoTitle}
              className={clsx(invertLogoOnHover && styles.invertOnHover)}
              sources={{
                light: useBaseUrl(logo),
                dark: useBaseUrl(logoDark || logo),
              }}
            />
          </div>
          <div className={styles.body}>{children || description}</div>
        </>
      );
    }

    if (props.contentType === 'text') {
      const { title, description } = props;

      return (
        <>
          <div className={styles.logo}>
            <h3 className={styles.titleHeading}>{title}</h3>
          </div>
          <div className={styles.body}>{children || description}</div>
        </>
      );
    }

    // This should never happen with proper TypeScript usage
    return null;
  };

  return (
    <a
      className={clsx(
        styles.card,
        styles[`card--${variant}`],
        hoverEffect !== 'default' && styles[`card--hover-${hoverEffect}`],
        className
      )}
      href={href}
      {...linkAttributes}
    >
      {renderContent()}
      <div className={styles.link}>{linkText}</div>
    </a>
  );
}

// Export type for external usage
export type { ProductCardProps };
