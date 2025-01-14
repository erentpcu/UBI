import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { styles } from '../../App.styles';

function Login() {
    const dispatch = useDispatch();
    const { user,loading, error, status } = useSelector(state => state.auth);
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setUsername('');
            setPassword('');
            setEmailError(false);
            setPasswordError(false);
            
            if (dispatch && clearError) {
                dispatch(clearError());
            }
        }, [])
    );

    useEffect(() => {
        if (user) {
            navigation.navigate('Connection');
        }

    }, [user, dispatch]);

    const validateEmail = (email) => {
        const emailchecker = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailchecker.test(email);
    };

    const handleLogin = () => {
        const isEmailValid = validateEmail(username);
        const isPasswordValid = password.length >= 6;

        setEmailError(!isEmailValid);
        setPasswordError(!isPasswordValid);

        if (isEmailValid && isPasswordValid) {
            dispatch(loginUser({email: username, password: password}));
        }
    };

    const handleGoogleLogin = async () => {
        try {
            Alert.alert('Info', 'Google login will be implemented');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Google login failed');
        }
    };

    const renderButtonContent = () => {
        if (loading) {
            return <ActivityIndicator color="#fff" />;
        }
        return <Text style={styles.signInButtonText}>Sign in</Text>;
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
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                    styles.inputWrapper, 
                    { borderRadius: 25 },
                    emailError && { borderColor: 'red', borderWidth: 1 }
                ]}>
                    <Feather name="mail" size={20} color={emailError ? "red" : "#888"} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={username}
                        onChangeText={(e) => {
                            setUsername(e);
                            setEmailError(false);
                        }}
                        autoCapitalize="none"
                    />
                </View>
                {emailError && <Text style={styles.errorText}>Please enter a valid email</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                    styles.inputWrapper, 
                    { borderRadius: 25 },
                    passwordError && { borderColor: 'red', borderWidth: 1 }
                ]}>
                    <Feather name="lock" size={20} color={passwordError ? "red" : "#888"} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError(false);
                        }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={passwordError ? "red" : "#888"} />
                    </TouchableOpacity>
                </View>
                {passwordError && <Text style={styles.errorText}>Password must be at least 6 characters</Text>}
            </View>

            <View style={[styles.forgotSignupContainer]}>
                <TouchableOpacity onPress={() => navigation.navigate('login/register')}>
                    <Text style={styles.forgotPasswordText}>Sign up</Text>
                </TouchableOpacity>
                <View style={{ width: 15 }} />
                <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[
                    styles.signInButton,
                    loading && styles.signInButtonDisabled
                ]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {renderButtonContent()}
            </TouchableOpacity>

            {status === 'pending' && (
                <Text style={styles.statusText}>Signing in...</Text>
            )}
            {status === 'failed' && error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <Text style={styles.orText}>Or continue with</Text>

            <View style={styles.socialIconsContainer}>
                <TouchableOpacity style={styles.socialIcon} onPress={handleGoogleLogin}>
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
