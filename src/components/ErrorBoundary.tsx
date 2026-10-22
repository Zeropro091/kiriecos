import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Changing this value clears a previous error (e.g. on page navigation). */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Keeps a single failing page from blanking the whole app. Also covers stale
 * lazy-chunk errors after a redeploy (the old hashed file no longer exists).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error) {
    console.error('[KIRI] Render error:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Halaman gagal dimuat</h1>
        <p className="text-sm text-muted-foreground">
          Terjadi kendala saat menampilkan halaman ini. Muat ulang untuk mengambil versi terbaru.
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => this.setState({ error: null })}
            className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-granite-900 text-white dark:bg-olive-500 dark:text-granite-950 text-xs font-bold"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}
