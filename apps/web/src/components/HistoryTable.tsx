import React from 'react';
import { Table, Button } from '@stoik/design-system';
import { HistoryItem } from '../services/ApiService.js';
import styles from './HistoryTable.module.css';

interface HistoryTableProps {
  historyList: HistoryItem[];
  onViewAnalytics: (slug: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  historyList,
  onViewAnalytics,
}) => {
  return (
    <div className={styles.historySection}>
      <h2 className={styles.sectionTitle}>Your Links</h2>

      {historyList.length === 0 ? (
        <div className={styles.emptyState}>
          No links shortened yet. Enter a destination URL above to get started.
        </div>
      ) : (
        <Table headers={['Original URL', 'Shortened Link', 'Created', 'Clicks', 'Actions']}>
          {historyList.map((item) => (
            <tr key={item.id}>
              <td>
                <div className={styles.originalUrlText} title={item.originalUrl}>
                  {item.originalUrl}
                </div>
              </td>
              <td>
                <a
                  href={item.shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shortUrlLink}
                >
                  {item.shortenedUrl}
                </a>
              </td>
              <td>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td>{item.clicks}</td>
              <td>
                <Button
                  onClick={() => onViewAnalytics(item.slug)}
                  variant="glass"
                  size="sm"
                >
                  Analytics
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
