import React from 'react';
import styles from './styles.module.css';

export default function EnterpriseBadge(): React.ReactNode {
  return (
    <span className={styles.badge} title='Stacklok Enterprise feature'>
      Enterprise
    </span>
  );
}
