import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const NewPasswordScreen: React.FC = () => {
    const router = useRouter();
    const [obscureText, setObscureText] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const navigateToPasswordChaged = () => {
        router.navigate("/screens/PasswordChaged");
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps='handled'>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.welcomeText}>Create a New Password</Text>
                <Text style={styles.instructionText}>
                    Your new password must be unique from those previously used.
                </Text>

                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="*********"
                            secureTextEntry={obscureText}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            style={styles.visibilityToggle}
                            onPress={() => setObscureText(!obscureText)}
                        >
                            <MaterialIcons
                                name={obscureText ? "visibility-off" : "visibility"}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="*********"
                            secureTextEntry={obscureText}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.visibilityToggle}
                            onPress={() => setObscureText(!obscureText)}
                        >
                            <MaterialIcons
                                name={obscureText ? "visibility-off" : "visibility"}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.sendCodeButton} onPress={navigateToPasswordChaged}>
                    <Text style={styles.sendCodeText}>RESET PASSWORD</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 'auto',
    },
    backText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    instructionText: {
        fontSize: 15,
        color: '#888',
        fontFamily: 'Poppins_500Medium',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 30,
    },
    inputWrapper: {
        marginHorizontal: 30,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Poppins_700Bold',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',
    },
    visibilityToggle: {
        padding: 10,
    },
    bottomContainer: {
        paddingHorizontal: 16,
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'white',
    },
    sendCodeButton: {
        backgroundColor: '#330066',
        borderRadius: 30,
        paddingVertical: 15,
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
    },
    sendCodeText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
});

export default NewPasswordScreen;
