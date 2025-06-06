# ProductGrid Component

A self-contained, responsive grid container for displaying ProductCard
components with flexible layout options and spacing controls.

## Features

- **Self-contained**: All types and utilities are included within the component
- **Multiple layout variants**: Auto-fit, fixed 2/3/4 column layouts
- **Configurable spacing**: Compact, normal, and spacious options
- **Responsive design**: Automatic breakpoint handling for mobile devices
- **Customizable grid properties**: Min item width and max columns
- **CSS Grid powered**: Modern, efficient layout system
- **Equal height rows**: Consistent card heights across rows
- **Portable**: Easy to copy to other projects - no external dependencies

## Usage

### Basic Usage

```jsx
import ProductGrid from '@site/src/components/ProductGrid';
import ProductCard from '@site/src/components/ProductCard';

<ProductGrid>
  <ProductCard
    contentType='logo'
    href='/product-1'
    logo='/img/product1-logo.svg'
    linkText='Learn more'
  >
    Product 1 description
  </ProductCard>
  <ProductCard
    contentType='text'
    href='/product-2'
    title='Product 2'
    linkText='Learn more'
  >
    Product 2 description
  </ProductCard>
</ProductGrid>;
```

### Advanced Configuration

```jsx
<ProductGrid
  layout='fixed-3'
  spacing='spacious'
  minItemWidth='300px'
  maxColumns={4}
  className='my-custom-grid'
>
  {/* ProductCard components */}
</ProductGrid>
```

## Props

| Prop           | Type                                          | Required | Default  | Description                                |
| -------------- | --------------------------------------------- | -------- | -------- | ------------------------------------------ |
| `children`     | ReactNode                                     | Yes      | -        | ProductCard components to display          |
| `className`    | string                                        | No       | -        | Additional CSS class names                 |
| `layout`       | 'auto' \| 'fixed-2' \| 'fixed-3' \| 'fixed-4' | No       | 'auto'   | Grid layout variant                        |
| `spacing`      | 'compact' \| 'normal' \| 'spacious'           | No       | 'normal' | Spacing between grid items                 |
| `minItemWidth` | string                                        | No       | '350px'  | Minimum width for grid items (auto layout) |
| `maxColumns`   | number                                        | No       | -        | Maximum columns for auto layout            |

## Layout Variants

### Auto Layout (`layout='auto'`)

Uses CSS Grid's `auto-fit` to automatically determine the number of columns
based on available space and minimum item width.

```jsx
<ProductGrid layout='auto' minItemWidth='300px' maxColumns={3}>
  {/* Cards will automatically wrap based on container width */}
</ProductGrid>
```

### Fixed Layouts

Explicitly sets the number of columns, with responsive breakpoints:

- `fixed-2`: 2 columns on desktop, 1 on mobile
- `fixed-3`: 3 columns on desktop, 2 on tablet, 1 on mobile
- `fixed-4`: 4 columns on desktop, 3 on large tablet, 2 on tablet, 1 on mobile

```jsx
<ProductGrid layout='fixed-3'>
  {/* Always attempts 3 columns, responsive on smaller screens */}
</ProductGrid>
```

## Spacing Variants

### Compact (`spacing='compact'`)

- Gap: 1rem
- Vertical margins: 2rem top/bottom
- Mobile gap: 0.75rem, margins: 1.5rem

### Normal (`spacing='normal'`)

- Gap: `var(--ifm-spacing-horizontal)` (Docusaurus default)
- Vertical margins: 3rem top/bottom

### Spacious (`spacing='spacious'`)

- Gap: 2rem
- Vertical margins: 4rem top/bottom
- Mobile gap: 1.5rem, margins: 3rem

## Responsive Behavior

The grid automatically adapts to different screen sizes:

| Screen Size | Fixed-4 | Fixed-3 | Fixed-2 | Auto |
| ----------- | ------- | ------- | ------- | ---- |
| > 1200px    | 4 cols  | 3 cols  | 2 cols  | Auto |
| 997-1200px  | 3 cols  | 3 cols  | 2 cols  | Auto |
| 769-996px   | 2 cols  | 2 cols  | 2 cols  | Auto |
| ≤ 768px     | 1 col   | 1 col   | 1 col   | Auto |

## CSS Custom Properties

The component uses CSS custom properties for flexible configuration:

```css
.my-grid {
  --grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  --grid-gap: 1.5rem;
  --grid-min-width: 280px;
}
```

## Best Practices

### Content Guidelines

- Use with ProductCard components for consistent styling
- 2-4 cards per row typically provides the best visual balance
- Consider using `compact` spacing for dense content areas
- Use `spacious` spacing for featured content sections

### Layout Selection

- **Auto layout**: Best for dynamic content where card count varies
- **Fixed layouts**: Better for consistent, designed layouts
- **Fixed-2**: Good for comparison layouts or featured content
- **Fixed-3**: Ideal for service/feature showcases
- **Fixed-4**: Best for large catalogs or directory-style layouts

### Performance

- The grid uses CSS Grid for optimal performance
- Equal height rows prevent layout shifts
- Responsive breakpoints minimize layout recalculations

## Self-Contained Design

This component is designed to be completely self-contained:

- **All TypeScript interfaces** are defined within the component file
- **Layout and spacing configurations** are included inline
- **No external dependencies** beyond React and clsx
- **Easy to copy** to other projects without missing dependencies
- **Perfect for documentation sites** where component portability is important

## Examples

### Feature Showcase

```jsx
<ProductGrid layout='fixed-3' spacing='spacious'>
  <ProductCard
    contentType='logo'
    href='/feature-1'
    logo='/icons/feature1.svg'
    linkText='Learn more'
  >
    Advanced security scanning
  </ProductCard>
  <ProductCard
    contentType='logo'
    href='/feature-2'
    logo='/icons/feature2.svg'
    linkText='Learn more'
  >
    Real-time monitoring
  </ProductCard>
  <ProductCard
    contentType='logo'
    href='/feature-3'
    logo='/icons/feature3.svg'
    linkText='Learn more'
  >
    Automated compliance
  </ProductCard>
</ProductGrid>
```

### Compact Tool List

```jsx
<ProductGrid
  layout='auto'
  spacing='compact'
  minItemWidth='250px'
  maxColumns={4}
>
  {tools.map((tool) => (
    <ProductCard
      key={tool.id}
      contentType='text'
      href={tool.url}
      title={tool.name}
      linkText='View tool'
      variant='compact'
    >
      {tool.description}
    </ProductCard>
  ))}
</ProductGrid>
```

## Migration from Shared Utils Version

The component API remains exactly the same:

```jsx
// No changes needed - the API is identical
<ProductGrid layout='fixed-3' spacing='spacious'>
  <ProductCard contentType='logo' ... />
</ProductGrid>
```

The component now includes all necessary types and utilities internally, making
it more portable and easier to maintain while preserving the same functionality.
