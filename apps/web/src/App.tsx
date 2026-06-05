import React, { useState } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { useAppViewModel } from './hooks/useAppViewModel.js';
import { ShortenerForm } from './components/ShortenerForm.js';
import { ShortenedResult } from './components/ShortenedResult.js';
import { HistoryTable } from './components/HistoryTable.js';
import { AnalyticsModal } from './components/AnalyticsModal.js';
import styles from './App.module.css';

export default function App() {
  // Establish reactive context to automatically track Preact signal reads in render
  useSignals();

  // Instantiate/retrieve AppViewModel
  const viewModel = useAppViewModel();

  // React state for pure rendering and user entry states
  const [inputUrl, setInputUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Form submission logic mapping to view model
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);

    const success = await viewModel.shorten(inputUrl, customSlug);
    if (success) {
      setInputUrl('');
      setCustomSlug('');
    }
  };

  // UI action to copy url
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // UI action to open analytics modal
  const handleViewAnalytics = (slug: string) => {
    setActiveSlug(slug);
    viewModel.loadAnalytics(slug);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>⚡</span> Stoik Link
        </h1>
        <p className={styles.subtitle}>
          Secure and high-performance URL shortener with real-time analytics
        </p>
      </header>

      {/* Main Shortener Form */}
      <ShortenerForm
        inputUrl={inputUrl}
        customSlug={customSlug}
        isSubmitting={viewModel.isSubmitting.value}
        urlError={viewModel.urlError.value}
        slugError={viewModel.slugError.value}
        onUrlChange={setInputUrl}
        onSlugChange={setCustomSlug}
        onSubmit={handleSubmit}
      />

      {/* Result Card for newly created link */}
      {viewModel.lastShortened.value && (
        <ShortenedResult
          shortenedUrl={viewModel.lastShortened.value.shortenedUrl}
          copied={copied}
          onCopy={() => {
            if (viewModel.lastShortened.value) {
              handleCopy(viewModel.lastShortened.value.shortenedUrl);
            }
          }}
        />
      )}

      {/* History Dashboard */}
      <HistoryTable
        historyList={viewModel.history.value}
        onViewAnalytics={handleViewAnalytics}
      />

      {/* Analytics Modal Overlay */}
      {activeSlug && (
        <AnalyticsModal
          slug={activeSlug}
          analytics={viewModel.analytics.value}
          isLoading={viewModel.isLoadingAnalytics.value}
          error={viewModel.analyticsError.value}
          onClose={() => setActiveSlug(null)}
        />
      )}
    </div>
  );
}
