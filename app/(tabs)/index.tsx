import {View, Image, ScrollView, ActivityIndicator, Text, FlatList, RefreshControl} from "react-native";
import {images} from "@/constants/images"
import {icons} from "@/constants/icons"
import SearchBar from "@/components/SearchBar";
import {useRouter} from "expo-router";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import MovieCard from "@/components/MovieCard";
import {getTrendingMovies} from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
import {useCallback, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";

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
    } = useFetch(() => fetchMovies({
        query: ''
    }))

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await Promise.all([refetchTrending(), refetchMovies()]);
        } finally {
            setRefreshing(false);
        }
    }, [refetchTrending, refetchMovies]);

    useFocusEffect(
        useCallback(() => {
            refetchMovies();
            refetchTrending();
        }, [])
    );

    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="absolute w-full z-0"/>

            <ScrollView className="flex-1 px-5" showsHorizontalScrollIndicator={false} contentContainerStyle={{
                minHeight: "100%", paddingBottom: 10
            }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
            >
                <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>
                {movieLoading || trendingLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        className="mt-10 self-center"
                    />
                ) : moviesError || trendingError ? (
                    <Text>Something went wrong : {moviesError?.message || trendingError?.message}</Text>
                ) : (
                    <View className="flex-1 mt-5">
                        <SearchBar
                            onPress={() => router.push("/search")}
                            placeHolder="Search for a movies"
                        />
                        {trendingMovies && (
                            <View className="mt-10">
                                <Text className="text-lg text-white font-bold mb-3">
                                    Trending Movies
                                </Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4 mt-3"
                                    data={trendingMovies}
                                    contentContainerStyle={{gap: 26}}
                                    renderItem={({item, index}) => (
                                        <TrendingCard movie={item} index={index}/>
                                    )}
                                    keyExtractor={(item, index) => `${item.movie_id || 'no-id'}-${index}`}
                                />
                            </View>
                        )}
                        <>
                            <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movie</Text>
                            <FlatList
                                data={movies}
                                renderItem={
                                    ({item}) => (
                                        <MovieCard
                                            {...item}
                                        />
                                    )
                                }
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3}
                                columnWrapperStyle={{
                                    justifyContent: 'flex-start',
                                    gap: 20,
                                    paddingRight: 5,
                                    marginBottom: 10
                                }}
                                className="mt-2 pb-32"
                                scrollEnabled={false}
                            />
                        </>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
