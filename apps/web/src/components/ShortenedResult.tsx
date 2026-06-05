import React from 'react';
import { Card, Button } from '@stoik/design-system';
import styles from './ShortenedResult.module.css';

interface ShortenedResultProps {
  shortenedUrl: string;
  copied: boolean;
  onCopy: () => void;
}

export const ShortenedResult: React.FC<ShortenedResultProps> = ({
  shortenedUrl,
  copied,
  onCopy,
}) => {
  return (
    <Card className={styles.resultCard}>
      <h3 className={styles.resultTitle}>URL Shortened Successfully!</h3>
      <div className={styles.resultLinkGroup}>
        <a
          href={shortenedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.resultLink}
        >
          {shortenedUrl}
        </a>
        <Button
          onClick={onCopy}
          variant={copied ? 'glass' : 'secondary'}
          size="sm"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
};
