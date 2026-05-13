// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styles from './styles.module.css';

export default function EnterpriseBadge(): React.ReactNode {
  return (
    <span className={styles.badge} title='Stacklok Enterprise feature'>
      Enterprise
    </span>
  );
}
