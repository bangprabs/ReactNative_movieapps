import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    Dimensions,
    LayoutChangeEvent,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

const { width } = Dimensions.get("window");

export function AnimatedTabBar({ state, descriptors, navigation }: any) {
    const [tabLayouts, setTabLayouts] = useState<
        { x: number; width: number }[]
    >([]);

    const highlightX = useSharedValue(0);
    const highlightWidth = useSharedValue(width / state.routes.length);

    useEffect(() => {
        if (tabLayouts[state.index]) {
            const { x, width } = tabLayouts[state.index];
            highlightX.value = withTiming(x, { duration: 300 });
            highlightWidth.value = withTiming(width, { duration: 300 });
        }
    }, [state.index, tabLayouts]);

    const highlightStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: highlightX.value }],
        width: highlightWidth.value,
    }));

    const iconMap: any = {
        index: icons.home,
        search: icons.search,
        saved: icons.save,
        profile: icons.person,
    };

    const handleLayout = (e: LayoutChangeEvent, i: number) => {
        const { x, width } = e.nativeEvent.layout;
        setTabLayouts((prev) => {
            const copy = [...prev];
            copy[i] = { x, width };
            return copy;
        });
    };

    return (
        <View
            style={{
                flexDirection: "row",
                height: 55,
                backgroundColor: "#0f0D23",
                borderRadius: 50,
                marginHorizontal: 20,
                marginBottom: 36,
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
            }}
        >
            {/* highlight */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        height: "100%",
                        borderRadius: 50,
                        backgroundColor: "transparent",
                    },
                    highlightStyle,
                ]}
            >
                <Image
                    source={images.highlight}
                    style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "stretch",
                        borderRadius: 50,
                    }}
                />
            </Animated.View>

            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        onLayout={(e) => handleLayout(e, index)}
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                                source={iconMap[route.name]}
                                style={{
                                    width: 20,
                                    height: 20,
                                    tintColor: isFocused ? "#151312" : "#A8B5DB",
                                }}
                            />
                            {isFocused && (
                                <Text
                                    style={{
                                        color: "#151312",
                                        fontSize: 14,
                                        fontWeight: "600",
                                        marginLeft: 6,
                                    }}
                                >
                                    {label}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
