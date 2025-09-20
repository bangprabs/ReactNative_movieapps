import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import useFetch from '@/services/useFetch';
import { fetchMovieDetail, saveFavoriteMovie } from '@/services/appwrite';
import { icons } from '@/constants/icons';
import { database, DATABASE_ID, FAV_MOVIE_ID } from '@/services/appwrite';
import { Query } from 'react-native-appwrite';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-3">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
    </View>
);

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const { data: movie, loading } = useFetch(() => fetchMovieDetail(id as string));

    const [isFavorite, setIsFavorite] = useState(false);

    // Ambil status favorite saat movie sudah load
    useEffect(() => {
        if (!movie?.id) return;

        const fetchFavoriteStatus = async () => {
            try {
                const result = await database.listDocuments(DATABASE_ID, FAV_MOVIE_ID, [
                    Query.equal("movie_id", movie.id)
                ]);
                if (result.documents.length > 0) {
                    setIsFavorite(result.documents[0].is_favorite === 1);
                }
            } catch (err) {
                console.error("Gagal ambil status favorite:", err);
            }
        };

        fetchFavoriteStatus();
    }, [movie?.id]);

    const handleFavorite = async () => {
        if (!movie) return;

        try {
            const newStatus = await saveFavoriteMovie({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
            });

            setIsFavorite(newStatus === 1);
        } catch (err) {
            console.error("Gagal toggle favorite:", err);
        }
    };

    if (loading || !movie) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <Text className="text-white">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View>
                    <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                        className="w-full h-[500px]"
                        resizeMode="stretch"
                    />
                    <TouchableOpacity
                        className="absolute right-5 bottom-[-25px] bg-accent rounded-full p-4 shadow-lg z-10"
                        onPress={handleFavorite}
                    >
                        <Image
                            source={isFavorite ? icons.check : icons.save}
                            tintColor="#fff"
                            className="size-6"
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-col items-start justify-center mt-5 px-5">
                    <Text className="text-white font-bold text-xl">{movie.title}</Text>
                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">{movie.release_date?.split('-')[0]}</Text>
                        <Text className="text-light-200 text-sm">{movie.runtime}m</Text>
                    </View>
                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-5">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">{Math.round(movie.vote_average ?? 0)}/10</Text>
                        <Text className="text-light-200 text-sm">({movie.vote_count} votes)</Text>
                    </View>

                    <MovieInfo label="Overview" value={movie.overview} />
                    <MovieInfo label="Genres" value={movie.genres?.map(g => g.name).join(' - ') || 'N/A'} />

                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo label="Budget" value={`$${movie.budget / 1_000_000} million`} />
                        <MovieInfo label="Revenue" value={`$${Math.round(movie.revenue / 1_000_000)} million`} />
                    </View>

                    <MovieInfo
                        label="Production Companies"
                        value={movie.production_companies?.map(c => c.name).join(' - ') || 'N/A'}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image source={icons.arrow} tintColor="#fff" className="size-5 mr-1 mt-0.5 rotate-180" />
                <Text className="text-white font-semibold text-base">Go Backs</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovieDetails;

const styles = StyleSheet.create({});
