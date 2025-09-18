import { Text, View } from "react-native";
import {Link} from "expo-router";

export default function Index() {
  return (
    <View
      className="flex-1 flex-col items-center justify-center"
    >
      <Text className="text-5xl text-blue-500 font-bold">Welcome</Text>
        <Link href="./onboarding">Onboarding Page...</Link>
    </View>
  );
}
