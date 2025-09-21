import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/appwrite";
import AnimatedScreen from '@/components/AnimatedScreen';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies,
        loading,
        error,
        refetch: loadMovies,
        reset
    } = useFetch(() => fetchMovies({ query: searchQuery }), false);

    // Debounce typing + update search count
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!searchQuery.trim()) {
                reset();
                return;
            }

            const fetchedMovies = await loadMovies(); // sekarang return data
            if (fetchedMovies && fetchedMovies.length > 0) {
                await updateSearchCount(searchQuery, fetchedMovies[0]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <AnimatedScreen>
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

            <FlatList
                data={movies || []} // pastiin bukan null
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: 16,
                    marginVertical: 16
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>
                        <View className="my-5 mt-10">
                            <SearchBar
                                placeHolder="Search movies..."
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                                autoFocus
                            />
                        </View>
                        {loading && <ActivityIndicator size="large" color="#0000ff" className="my-3" />}
                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error : {error.message}
                            </Text>
                        )}
                        {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-10 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim() ? 'No Movies Found' : 'Search for a movie'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
        </AnimatedScreen>
    );
};

export default Search;
