import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    StyleSheet,
    Image,
} from "react-native";
import {images} from "@/constants/images";
import {icons} from "@/constants/icons";

const GITHUB_USERNAME = "bangprabs"; // ganti dengan username kamu

interface Repo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
}

const ProfileScreen = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRepos = async () => {
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
            const data = await response.json();
            setRepos(data);
        } catch (error) {
            console.error("Failed to fetch repos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    const renderRepo = ({ item }: { item: Repo }) => (
        <TouchableOpacity
            style={styles.repoCard}
            onPress={() => Linking.openURL(item.html_url)}
        >
            <Text style={styles.repoName}>{item.name}</Text>
            {item.description ? <Text style={styles.repoDesc}>{item.description}</Text> : null}
            <View style={styles.repoFooter}>
                {item.language ? <Text style={styles.repoLang}>{item.language}</Text> : null}
                <Text style={styles.repoStats}>⭐ {item.stargazers_count} | 🍴 {item.forks_count}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Image source={images.bg} className="absolute w-full z-0"/>
            <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>
            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: `https://github.com/${GITHUB_USERNAME}.png` }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>{GITHUB_USERNAME}</Text>
                <TouchableOpacity
                    style={styles.githubButton}
                    onPress={() => Linking.openURL(`https://github.com/${GITHUB_USERNAME}`)}
                >
                    <Text style={styles.githubButtonText}>Go to GitHub</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={repos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderRepo}
                    contentContainerStyle={{ paddingBottom: 100, padding: 20  }}
                />
            )}
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f0D23"},
    profileHeader: { alignItems: "center", padding: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, padding: 20 },
    username: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    githubButton: { backgroundColor: "#151312", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    githubButtonText: { color: "#fff", fontWeight: "600" },
    repoCard: {
        backgroundColor: "#1b1a2b",
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
    },
    repoName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    repoDesc: { color: "#A8B5DB", marginTop: 5 },
    repoFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    repoLang: { color: "#FFD700", fontWeight: "600" },
    repoStats: { color: "#A8B5DB" },
});
