import { ytSearchService } from './youtube/YouTubeSearchService';

export const searchEngine = {
  /**
   * Search YouTube / YouTube Music for songs or playlists with normalized track structure
   */
  async search(query, type = 'video') {
    const searchType = typeof type === 'string' ? type : (type?.type || 'video');
    return await ytSearchService.search(query, searchType);
  },

  /**
   * Get search query suggestions with local caching and cancellation
   */
  async getSuggestions(query) {
    return await ytSearchService.getSuggestions(query);
  },

  /**
   * Get trending global hits
   */
  async getTrending() {
    return await ytSearchService.getTrending();
  },

  async getTrendingCharts() {
    return await ytSearchService.getTrending();
  }
};

