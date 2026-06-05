import React from 'react';
import { Card, Button, Input } from '@stoik/design-system';
import styles from './ShortenerForm.module.css';

interface ShortenerFormProps {
  inputUrl: string;
  customSlug: string;
  isSubmitting: boolean;
  urlError: string;
  slugError: string;
  onUrlChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ShortenerForm: React.FC<ShortenerFormProps> = ({
  inputUrl,
  customSlug,
  isSubmitting,
  urlError,
  slugError,
  onUrlChange,
  onSlugChange,
  onSubmit,
}) => {
  return (
    <Card className={styles.formCard}>
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <div style={{ flex: 2 }}>
            <Input
              label="Destination URL"
              placeholder="e.g. https://www.stoik.com/barometre-ifop-2025"
              value={inputUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              error={urlError}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="Custom Alias (Optional)"
              placeholder="e.g. cyberstats (4-10 chars)"
              value={customSlug}
              onChange={(e) => onSlugChange(e.target.value)}
              error={slugError}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            {isSubmitting ? 'Shortening...' : 'Shorten'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
