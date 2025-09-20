import {View, Text, Image, TextInput} from 'react-native'
import React from 'react'
import {icons} from "@/constants/icons";

interface Props {
    placeHolder: string;
    onPress?: () => void;
    value?: string;
    onChangeText?: (text:string) => void;
    autoFocus?: boolean;
}

const SearchBar = ({placeHolder, onPress, value, onChangeText, autoFocus}: Props) => {
    return (
        <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
            <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#ab8bff"/>
            <TextInput
                onPress={onPress}
                autoFocus={autoFocus}
                onPressIn={onPress}
                placeholder={placeHolder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#a8b5db"
                className="flex-1 ml-2 text-white"
            />
        </View>
    )
}
export default SearchBar
