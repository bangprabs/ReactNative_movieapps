import { ReactNode } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function AnimatedScreen({ children }: { children: ReactNode }) {
    return (
        <Animated.View
            className="flex-1 bg-primary"
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
        >
            {children}
        </Animated.View>
    );
}