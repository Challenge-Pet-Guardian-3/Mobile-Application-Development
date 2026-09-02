import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export type HeaderProps = {
    title?: string;
    showBack?: boolean;
};

export function Header({ title, showBack }: HeaderProps) {
    const navigation = useNavigation();

    // Telas internas (com botão de voltar) não precisam repetir a marca completa
    // "Pet Guardian" — ela já apareceu na tela anterior. Aqui damos destaque ao
    // título da tela, que é a informação que importa nesse contexto.
    if (showBack) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backButtonCircle}
                >
                    <Ionicons name="arrow-back" size={20} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.titleGroup}>
                    <View style={styles.titleGroupTop}>
                        <FontAwesome5 name="paw" size={11} color="rgba(255,255,255,0.65)" />
                        <Text style={styles.brandTextSmall}>Pet Guardian</Text>
                    </View>
                    <Text style={styles.pageTitleLarge} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                </View>
            </View>
        );
    }

    // Tela raiz: marca completa, sem botão de voltar
    return (
        <View style={styles.container}>
            <View style={styles.brandContainer}>
                <FontAwesome5 name="paw" size={18} color="#FFF" />
                <Text style={styles.brandText}>Pet Guardian</Text>
            </View>
            {!!title && <Text style={styles.pageTitle}>{title}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: "#134879",
        elevation: 6,
        gap: 12,
    },
    backButtonCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    titleGroup: { flex: 1, minWidth: 0, gap: 2 },
    titleGroupTop: { flexDirection: "row", alignItems: "center", gap: 5 },
    brandTextSmall: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600" },
    pageTitleLarge: { fontSize: 16, color: "#FFF", fontWeight: "700" },

    // Layout original, usado apenas na tela raiz (sem showBack)
    brandContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    brandText: { fontSize: 18, color: "#FFF", fontWeight: "bold" },
    pageTitle: { fontSize: 13, color: "#FFF", fontWeight: "600", opacity: 0.8, marginLeft: "auto" },
});