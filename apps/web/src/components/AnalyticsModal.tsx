import React from 'react';
import { Card } from '@stoik/design-system';
import { Analytics } from '../services/ApiService.js';
import styles from './AnalyticsModal.module.css';

interface AnalyticsModalProps {
  slug: string;
  analytics: Analytics | null;
  isLoading: boolean;
  error: string;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  slug,
  analytics,
  isLoading,
  error,
  onClose,
}) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Link Analytics: /{slug}</h3>
            <button className={styles.modalCloseBtn} onClick={onClose}>
              &times;
            </button>
          </div>

          {isLoading && <div>Loading statistics...</div>}

          {error && (
            <div style={{ color: 'var(--status-error)' }}>{error}</div>
          )}

          {analytics && (
            <div>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Total Clicks</div>
                  <div className={styles.statValue}>{analytics.clicks}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Unique IPs</div>
                  <div className={styles.statValue}>
                    {new Set(analytics.visits.map((v) => v.ipAddress).filter(Boolean)).size}
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Recent Visits</h4>

              {analytics.visits.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: '20px 0' }}>
                  No clicks recorded yet. Try sharing the link!
                </div>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {analytics.visits.map((visit, index) => (
                    <div key={index} className={styles.visitItem}>
                      <div className={styles.visitMeta}>
                        <span>
                          {new Date(visit.visitedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        <span>IP: {visit.ipAddress || 'Unknown'}</span>
                      </div>
                      <div className={styles.visitDetail}>
                        <span className={styles.visitLabel}>Referrer:</span>{' '}
                        {visit.referrer || 'Direct'}
                      </div>
                      <div className={styles.visitDetail}>
                        <span className={styles.visitLabel}>Device:</span>{' '}
                        {visit.userAgent || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
