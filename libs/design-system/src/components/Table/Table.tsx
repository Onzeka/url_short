import React from 'react';
import styles from './Table.module.css';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '', ...props }) => {
  return (
    <div className={styles.responsiveWrapper}>
      <table className={`${styles.table} ${className}`} {...props}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {children}
        </tbody>
      </table>
    </div>
  );
};
