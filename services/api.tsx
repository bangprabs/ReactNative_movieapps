export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    }
}

export const fetchMovies = async ({query}: { query: string }) => {
    const endpoint = query ?
        `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
        `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: TMDB_CONFIG.headers
    });

    if (!response.ok) {
        // @ts-ignore
        throw new Error('Failed to fetch movies', response.statusText);
    }

    const movies = await response.json();
    return movies.results;
}

export const fetchGithubProfile = async (username: string) => {
    const response = await fetch(`https://api.github.com/users/${username}`, {
        method: 'GET',
        headers: {
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch GitHub profile: ${response.status}`);
    }

    return await response.json();
};