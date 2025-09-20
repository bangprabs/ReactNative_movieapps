import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    View,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { getFavoriteMovies } from '@/services/appwrite';
import {icons} from "@/constants/icons";
import {images} from "@/constants/images";
import {useFocusEffect} from "@react-navigation/native";

const Saved = () => {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const favs = await getFavoriteMovies();
            setMovies(favs || []);
        } catch (err) {
            console.error('Gagal ambil favorite movies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFavorites();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const renderMovieItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="flex-row items-center mb-4"
            onPress={() => router.push(`/movies/${item.movie_id}`)}
        >
            <Image
                source={{ uri: item.poster_url }}
                className="w-16 h-24 rounded-md"
            />
            <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-lg">{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-primary">
            {/* Background Image */}
            <Image source={images.bg} className="absolute w-full h-full z-0" />

            {/* FlatList with header */}
            <FlatList
                data={movies}
                keyExtractor={(item) => item.$id || item.movie_id.toString()}
                renderItem={renderMovieItem}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#fff"
                    />
                }
                ListHeaderComponent={() => (
                    <View className="w-full mt-20 mb-5 flex-col items-start">
                        <Image source={icons.logo} className="w-12 h-10 self-center mb-2" />
                        <Text className="text-lg text-white font-bold">Saved Movies</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center mt-10">
                        <Text className="text-white">No favorite movies yet!</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            />

            {loading && (
                <View className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white text-lg font-semibold mt-2">Loading favorites...</Text>
                </View>
            )}
        </View>
    );
};

export default Saved;

const styles = StyleSheet.create({});