import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container1: {
        flex: 1,
        backgroundColor: '#ffffff', // Beyaz arka plan rengi
        alignItems: 'center',
        justifyContent: 'center',
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "95%",
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "lightgrey",
        marginVertical: 10,
    },

    LoginPageInput:
    {
        minHeight: 50,
        marginLeft: 10,
        width: "100%",
    },

    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 100,
      },
      logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF0000',
        marginRight: 10,
      },
      carIcon: {
        
        width: 250,
        height: 150,
      },
      inputContainer: {
        marginBottom: 20,
      },
      inputLabel: {
        fontSize: 16,
        marginBottom: 5,
      },
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0', // Açık gri arka plan rengi
        width: '90%', // Genişliği biraz azalttık
        alignSelf: 'center', // Merkeze hizalamak için
      },
      inputIcon: {
        marginRight: 10,
      },
      input: {
        flex: 1,
        height: 40,
      },
      forgotSignupContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
      forgotPasswordText: {
        color: '#888',
      },
      signInButton: {
        backgroundColor: '#888',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
      },
      signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      orText: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#888',
      },
      socialIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
      socialIcon: {
        marginHorizontal: 10,
      },
      socialIconImage: {
        width: 30,
        height: 30,
      },

});
