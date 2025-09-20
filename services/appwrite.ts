import {Client, Databases, Query, ID} from "react-native-appwrite";
import {TMDB_CONFIG} from "@/services/api";
export { database, DATABASE_ID, FAV_MOVIE_ID };

// Ambil dari env
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_NAME!;
const FAV_MOVIE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_MOV_FAV!;

if (!PROJECT_ID || !ENDPOINT || !DATABASE_ID || !TABLE_ID) {
    throw new Error("Salah satu environment variable Appwrite belum di-set!");
}

// Setup client
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const database = new Databases(client);

interface Movie {
    id: string;
    title: string;

    [key: string]: any;
}

export const updateSearchCount = async (query: string, movie?: Movie) => {
    if (!query.trim()) return;

    try {
        // Cari dokumen berdasarkan searchTerm
        const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.equal("searchTerm", query)
        ]);

        if (result.documents.length > 0) {
            // Jika dokumen sudah ada → update count
            const existingDoc = result.documents[0];
            await database.updateDocument(DATABASE_ID, TABLE_ID, existingDoc.$id, {
                count: (existingDoc.count || 0) + 1
            });
        } else {
            // Jika dokumen belum ada → buat baru
            // @ts-ignore
            await database.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
                searchTerm: query,
                count: 1,
                movie_id: movie?.id,
                title: movie?.title,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie?.poster_path}`,
            });
        }
    } catch (err) {
        console.error("Error updating search count:", err);
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);
        return result.documents as unknown as TrendingMovie[];
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

export const fetchMovieDetail = async (movieId: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        console.log(`${TMDB_CONFIG.BASE_URL}/movies/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`);

        if (!response.ok){
            throw new Error("Failed to fetch movie detail");
        }

        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export const saveFavoriteMovie = async (movie: { id: number; title: string; poster_path: string | null }) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, FAV_MOVIE_ID, [
            Query.equal("movie_id", movie.id)
        ]);

        if (result.documents.length > 0) {
            const existingDoc = result.documents[0];
            // Pastikan default ke 0 jika field belum ada
            const currentStatus = existingDoc.is_favorite ?? 0;
            const newStatus = currentStatus === 1 ? 0 : 1;

            await database.updateDocument(DATABASE_ID, FAV_MOVIE_ID, existingDoc.$id, {
                is_favorite: newStatus,
            });

            return newStatus;
        } else {
            // Hanya buat field yang ada di table
            await database.createDocument(DATABASE_ID, FAV_MOVIE_ID, ID.unique(), {
                movie_id: movie.id,
                title: movie.title,
                poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                is_favorite: 1, // Pastikan field ini ada di table
            });

            return 1;
        }
    } catch (e) {
        console.error("Error toggle favorite:", e);
        throw e;
    }
};

export const getFavoriteMovies = async (): Promise<any[]> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, FAV_MOVIE_ID, [
            Query.equal("is_favorite", 1), // hanya yang favorite
            Query.orderDesc("$createdAt")  // urut dari terbaru
        ]);
        return result.documents;
    } catch (err) {
        console.error("Gagal fetch favorite movies:", err);
        return [];
    }
};

