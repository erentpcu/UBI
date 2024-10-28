import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../App.styles';

function Login() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = () => {
        // Burada gerçek kimlik doğrulama mantığınızı ekleyebilirsiniz
        navigation.navigate('Connection');
    };

    return (
        <View style={styles.container1}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../app/car.png')}
                    style={styles.carIcon}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={[styles.inputWrapper, { borderRadius: 25 }]}>
                    <Feather name="user" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}

                        onChangeText={(e) => setUsername(e)}
                    
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, { borderRadius: 25 }]}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#888" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.forgotSignupContainer]}>
                <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Sign up</Text>
                </TouchableOpacity>
                <View style={{ width: 15 }} />
                <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or continue with</Text>

            <View style={styles.socialIconsContainer}>
                <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('@/assets/images/google.png')} style={styles.socialIconImage} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('@/assets/images/apple-logo.png')} style={styles.socialIconImage} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                    <Image source={require('@/assets/images/facebook.png')} style={styles.socialIconImage} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Login;
