# ProductCard Component

A self-contained, reusable card component for displaying product information
with hover effects and multiple content types.

## Features

- **Self-contained**: All types and utilities are included within the component
- **Type-safe content patterns**: Logo-based or text-based content using
  discriminated unions
- **Inline icon support**: Optional icon displayed to the right of content with
  theme support
- **Multiple variants**: Default, compact, and featured styling
- **Configurable hover effects**: Default, none, or custom hover behaviors
- **Theme support**: CSS custom properties for easy customization
- **Accessibility**: Proper external link handling and semantic markup
- **Dark mode support**: Automatic theme detection and logo variants
- **Portable**: Easy to copy to other projects - no external dependencies

## Usage

### Logo-based ProductCard

```jsx
import ProductCard from '@site/src/components/ProductCard';

<ProductCard
  contentType='logo'
  href='/product-path'
  logo='/img/product-logo-light.svg'
  logoDark='/img/product-logo-dark.svg' // Optional
  logoAlt='Product Logo'
  logoTitle='Product Logo'
  linkText='Read documentation'
  variant='default' // Optional: 'default' | 'compact' | 'featured'
  invertLogoOnHover={true} // Optional, default: true
>
  Product description content goes here. You can use any React content.
</ProductCard>;
```

### Text-based ProductCard

```jsx
import ProductCard from '@site/src/components/ProductCard';

<ProductCard
  contentType='text'
  href='/product-path'
  title='Product Name'
  linkText='Learn more'
  variant='compact'
  hoverEffect='none'
>
  Product description content goes here.
</ProductCard>;
```

### ProductCard with Inline Icon

```jsx
import ProductCard from '@site/src/components/ProductCard';

<ProductCard
  contentType='text'
  href='/product-path'
  title='Product Name'
  linkText='Learn more'
  icon={{
    src: '/img/icon-light.svg',
    srcDark: '/img/icon-dark.svg', // Optional
    alt: 'Product icon',
    width: '80px', // Optional, default: '60px'
    style: { marginLeft: '1.5rem' }, // Optional style overrides
  }}
>
  Product description with an icon floated to the right.
</ProductCard>;
```

## Props

### Base Props (shared by all variants)

| Prop          | Type                                 | Required | Default   | Description                            |
| ------------- | ------------------------------------ | -------- | --------- | -------------------------------------- |
| `href`        | string                               | Yes      | -         | The URL the card links to              |
| `linkText`    | string                               | Yes      | -         | Text for the call-to-action link       |
| `className`   | string                               | No       | -         | Additional CSS class names             |
| `variant`     | 'default' \| 'compact' \| 'featured' | No       | 'default' | Card styling variant                   |
| `hoverEffect` | 'default' \| 'none' \| 'custom'      | No       | 'default' | Hover effect behavior                  |
| `icon`        | IconConfig                           | No       | -         | Inline icon displayed right of content |
| `children`    | ReactNode                            | No       | -         | Custom description content             |

### IconConfig Props

| Prop      | Type          | Required | Default | Description                                 |
| --------- | ------------- | -------- | ------- | ------------------------------------------- |
| `src`     | string        | Yes      | -       | Path to icon (used for light mode or both)  |
| `srcDark` | string        | No       | -       | Optional path to dark mode icon             |
| `alt`     | string        | Yes      | -       | Alt text for the icon                       |
| `width`   | string        | No       | '60px'  | Icon width                                  |
| `style`   | CSSProperties | No       | -       | Custom style overrides merged with defaults |

Default icon styles: `float: right`, `display: block`, `height: auto`,
`maxWidth: 40%`, `marginLeft: 1rem`.

### Logo Content Type Props

| Prop                | Type    | Required | Default | Description                                         |
| ------------------- | ------- | -------- | ------- | --------------------------------------------------- |
| `contentType`       | 'logo'  | Yes      | -       | Discriminator for logo-based content                |
| `logo`              | string  | Yes      | -       | Path to primary logo (used for light mode)          |
| `logoDark`          | string  | No       | -       | Optional path to dark mode logo                     |
| `logoAlt`           | string  | No       | ''      | Alt text for the logo image                         |
| `logoTitle`         | string  | No       | ''      | Title attribute for the logo image                  |
| `invertLogoOnHover` | boolean | No       | true    | Whether to invert logo color on hover in light mode |
| `description`       | string  | No       | -       | Description text (alternative to children)          |

### Text Content Type Props

| Prop          | Type   | Required | Default | Description                                |
| ------------- | ------ | -------- | ------- | ------------------------------------------ |
| `contentType` | 'text' | Yes      | -       | Discriminator for text-based content       |
| `title`       | string | Yes      | -       | Title text to display                      |
| `description` | string | No       | -       | Description text (alternative to children) |

## Variants

### Default

Standard card styling with full padding and standard logo size.

### Compact

Reduced padding and smaller logo for denser layouts.

### Featured

Enhanced styling with larger padding, bigger logo, and box shadow.

## Hover Effects

### Default

Changes background to gradient image, inverts text to white, and optionally
inverts logo.

### None

Minimal hover effect with just background color change, preserving original text
colors.

### Custom

No predefined hover styles - allows for custom CSS hover effects.

## Theming

The component supports theming through CSS custom properties:

```css
.my-custom-card {
  --card-background: #f0f0f0;
  --card-text-color: #333;
  --card-primary-color: #007bff;
  --card-border-radius: 16px;
}
```

## External Link Handling

The component automatically detects external URLs and adds appropriate
`target="_blank"` and `rel="noopener noreferrer"` attributes for security and
usability.

## Accessibility

- Proper semantic markup with meaningful link text
- Alt text support for logos
- Title attributes for additional context
- Keyboard navigation support
- Screen reader friendly structure

## Self-Contained Design

This component is designed to be completely self-contained:

- **All TypeScript interfaces** are defined within the component file
- **Utility functions** (URL validation, external link detection) are included
  inline
- **No external dependencies** beyond React, Docusaurus, and clsx
- **Easy to copy** to other projects without missing dependencies
- **Perfect for documentation sites** where component portability is important

## Migration from Shared Utils Version

If migrating from a version that used shared utilities:

```jsx
// No changes needed to usage - the API remains the same
<ProductCard
  contentType='logo'
  href='/path'
  logo='/logo.svg'
  linkText='Learn more'
/>
```

The component now includes all necessary types and utilities internally, making
it more portable and easier to maintain.

<!-- markdownlint-disable-file MD024 -->
