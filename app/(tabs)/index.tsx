import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import AnimatedScreen from "@/components/AnimatedScreen";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import {icons} from "@/constants/icons";
import {images} from "@/constants/images";

export default function Index() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const {
        data: trendingMovies,
        loading: trendingLoading,
        error: trendingError,
        refetch: refetchTrending,
    } = useFetch(getTrendingMovies);

    const {
        data: movies,
        loading: movieLoading,
        error: moviesError,
        refetch: refetchMovies,
    } = useFetch(() => fetchMovies({ query: "" }));

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await Promise.all([refetchTrending(), refetchMovies()]);
        } finally {
            setRefreshing(false);
        }
    }, [refetchTrending, refetchMovies]);

    const latestMovies = useMemo(() => movies || [], [movies]);

    // FlatList header: SearchBar + TrendingMovies
    const ListHeader = () => (
        <View className="flex-1">
            <Image source={images.bg} className="absolute w-full z-0 px-0"/>
            <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
            <View className="px-5">
            <SearchBar
                onPress={() => router.push("/search")}
                placeHolder="Search for a movies"
            />
            </View>

            <View className="px-5">
            {trendingMovies && trendingMovies.length > 0 && (
                <View className="mt-10">
                    <Text className="text-lg text-white font-bold mb-3">
                        Trending Movies
                    </Text>
                    <FlatList
                        horizontal
                        data={trendingMovies}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20, gap: 20 }}
                        keyExtractor={(item, index) =>
                            `${item.movie_id || "no-id"}-${index}`
                        }
                        renderItem={({ item, index }) => (
                            <TrendingCard movie={item} index={index} />
                        )}
                    />
                </View>
            )}

            </View>

            <Text className="text-lg text-white font-bold mt-10 mb-3 px-5">
                Latest Movies
            </Text>
        </View>
    );


    const renderMovieItem = ({ item }: { item: any }) => (
        <MovieCard {...item} />
    );

    if (movieLoading || trendingLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (moviesError || trendingError) {
        return (
            <View className="flex-1 justify-center items-center bg-primary px-5">
                <Text className="text-white">
                    Something went wrong: {moviesError?.message || trendingError?.message}
                </Text>
            </View>
        );
    }

    return (
        <AnimatedScreen>
            <View className="flex-1 bg-primary">
                <FlatList
                    data={latestMovies}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    columnWrapperStyle={{
                        justifyContent: "flex-start",
                        gap: 20,
                        paddingHorizontal: 10, // padding konsisten dengan trending
                        marginBottom: 10,
                    }}
                    renderItem={renderMovieItem}
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={{
                        minHeight: "100%",
                        paddingBottom: 55 + 36 + 20, // total ~111
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />

            </View>
        </AnimatedScreen>
    );
}
