// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Renders a markdown unordered list with the Stacklok brand symbol as the
 * bullet icon. Use as a block wrapper around a standard markdown list in MDX:
 *
 *   <BrandedList>
 *   - item one
 *   - item two
 *   </BrandedList>
 *
 * MDX processes the markdown into a <ul> inside the wrapper <div>, which the
 * CSS module targets via `.list ul li`.
 */

import React, { ReactNode } from 'react';
import styles from './styles.module.css';

interface BrandedListProps {
  children: ReactNode;
}

export default function BrandedList({ children }: BrandedListProps) {
  return <div className={styles.list}>{children}</div>;
}
