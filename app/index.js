import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, Text, View, Image, ImageBackground, FlatList, TextInput, } from "react-native";
import { styles } from "../App.styles";
import { useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";

function IndexPage() {

    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, }}>
                <TouchableOpacity onPress={() => { navigation.navigate("login/login") }} style={styles.inputContainer}>
                    <FontAwesome name="envelope-o" size={24} color="lightgrey" />
                </TouchableOpacity>
                <View style={{
                    flexDirection: "row", alignItems: "center", width: "95%",
                    paddingHorizontal: 20, borderWidth: 1, borderRadius: 10, borderColor: "lightgrey",
                    marginVertical: 10,
                }}>
                    <FontAwesome name="envelope-o" size={24} color="lightgrey" />
                    <TextInput multiline placeholder="E-mail" style={styles.LoginPageInput} />
                </View>
            </View>
        </View>
    )
}

export default IndexPage;