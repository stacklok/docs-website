import remarkFrontmatter from 'remark-frontmatter';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide';
import remarkLintNoFileNameIrregularCharacters from 'remark-lint-no-file-name-irregular-characters';
import remarkLintMaximumHeadingLength from 'remark-lint-maximum-heading-length';
import remarkLintNoUndefinedReferences from 'remark-lint-no-undefined-references';
import remarkPresetPrettier from 'remark-preset-prettier';

export default {
  plugins: [
    // Parse YAML front matter (must be first)
    remarkFrontmatter,
    // Lint presets (order: recommended → consistent → style-guide)
    remarkPresetLintRecommended,
    remarkPresetLintConsistent,
    remarkPresetLintMarkdownStyleGuide,
    // Disable: underscore is valid in filenames (_partials/, CODE_OF_CONDUCT.md)
    [remarkLintNoFileNameIrregularCharacters, false],
    // Disable: 60 char limit is too strict for descriptive headings
    [remarkLintMaximumHeadingLength, false],
    // Disable: too many false positives with Docusaurus admonition titles
    [remarkLintNoUndefinedReferences, false],
    // Load last: disable formatting rules that Prettier handles
    remarkPresetPrettier,
  ],
};
