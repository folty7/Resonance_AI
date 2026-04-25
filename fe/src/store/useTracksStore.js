import { create } from 'zustand';
import { apiClient } from '@/api/axios';

/**
 * Tracks the user's saved Spotify library. Cached in-memory so all dashboard
 * pages share one fetch. Refresh forces a refetch.
 */
export const useTracksStore = create((set, get) => ({
    tracks: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastFetchedAt: null,

    fetchTracks: async ({ force = false } = {}) => {
        const state = get();
        if (state.isLoading || state.isRefreshing) return;
        if (!force && state.tracks.length > 0) return;

        set(force ? { isRefreshing: true, error: null } : { isLoading: true, error: null });

        try {
            const res = await apiClient.get('/tracks');
            if (res.data.success) {
                set({
                    tracks: res.data.data,
                    lastFetchedAt: Date.now(),
                    isLoading: false,
                    isRefreshing: false,
                    error: null
                });
                return { ok: true };
            }
            set({ isLoading: false, isRefreshing: false, error: 'Unexpected response' });
            return { ok: false, status: 500 };
        } catch (err) {
            const status = err.response?.status;
            set({
                isLoading: false,
                isRefreshing: false,
                error: err.response?.data?.error || err.message || 'Failed to load library'
            });
            return { ok: false, status };
        }
    },

    clear: () => set({ tracks: [], isLoading: false, isRefreshing: false, error: null, lastFetchedAt: null })
}));
