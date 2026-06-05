import { signal } from '@preact/signals-react';
import { ApiService, HistoryItem, Analytics } from '../services/ApiService.js';

export class AppViewModel {
  readonly history = signal<HistoryItem[]>([]);
  readonly isSubmitting = signal<boolean>(false);
  readonly urlError = signal<string>('');
  readonly slugError = signal<string>('');
  readonly lastShortened = signal<HistoryItem | null>(null);

  // Analytics states
  readonly analytics = signal<Analytics | null>(null);
  readonly isLoadingAnalytics = signal<boolean>(false);
  readonly analyticsError = signal<string>('');

  constructor(private readonly apiService: ApiService) {
    this.loadHistoryFromStorage();
  }

  private loadHistoryFromStorage() {
    const stored = localStorage.getItem('stoik_url_history');
    if (stored) {
      try {
        this.history.value = JSON.parse(stored);
      } catch (err) {
        console.error('Failed to load history from localStorage:', err);
      }
    }
  }

  private saveHistoryToStorage(historyList: HistoryItem[]) {
    localStorage.setItem('stoik_url_history', JSON.stringify(historyList));
  }

  async syncHistory() {
    if (this.history.value.length === 0) return;
    const updated = await Promise.all(
      this.history.value.map(async (item) => {
        try {
          const data = await this.apiService.getAnalytics(item.slug);
          return { ...item, clicks: data.clicks };
        } catch (err) {
          console.error('Failed to sync clicks for', item.slug, err);
          return item;
        }
      })
    );
    this.history.value = updated;
    this.saveHistoryToStorage(updated);
  }

  async shorten(url: string, customSlug?: string): Promise<boolean> {
    this.urlError.value = '';
    this.slugError.value = '';
    this.lastShortened.value = null;

    if (!url.trim()) {
      this.urlError.value = 'Please enter a valid URL.';
      return false;
    }

    this.isSubmitting.value = true;
    try {
      const newItem = await this.apiService.shortenUrl(url, customSlug);

      const newHistory = [newItem, ...this.history.value];
      this.history.value = newHistory;
      this.saveHistoryToStorage(newHistory);

      this.lastShortened.value = newItem;
      return true;
    } catch (err: any) {
      const msg = err.message || 'An error occurred. Please check your network.';
      if (msg.toLowerCase().includes('slug') || msg.toLowerCase().includes('alias')) {
        this.slugError.value = msg;
      } else {
        this.urlError.value = msg;
      }
      return false;
    } finally {
      this.isSubmitting.value = false;
    }
  }

  async loadAnalytics(slug: string) {
    this.analytics.value = null;
    this.analyticsError.value = '';
    this.isLoadingAnalytics.value = true;

    try {
      const data = await this.apiService.getAnalytics(slug);
      this.analytics.value = data;

      // Sync click count in local dashboard history if it changed
      const updated = this.history.value.map((item) =>
        item.slug === slug ? { ...item, clicks: data.clicks } : item
      );
      this.history.value = updated;
      this.saveHistoryToStorage(updated);
    } catch (err: any) {
      this.analyticsError.value = err.message || 'Failed to load click logs.';
    } finally {
      this.isLoadingAnalytics.value = false;
    }
  }
}
