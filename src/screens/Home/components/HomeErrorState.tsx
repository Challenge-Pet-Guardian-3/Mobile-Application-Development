import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { colors, spacing } from '../../../constants/theme';
import { shadows } from '../../../utils/shadow';
import { useHomeData } from '../../../hooks/useHomeData';

interface HomeErrorStateProps {
  status: ReturnType<typeof useHomeData>['status'];
}

export function HomeErrorState({ status }: HomeErrorStateProps) {
  const isRefreshing = status.isFetching && !status.isLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={status.refetch}
            tintColor={colors.success.default}
          />
        }
      >
        <Header subtitle="Visão Geral do Cuidado" />
        <View style={styles.errorCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#EF4444" />
          </View>
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.text}>
            {status.error?.message || 'Não foi possível carregar os dados do painel.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={status.refetch} activeOpacity={0.8}>
            <Ionicons name="reload" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 202, 0.8)',
    ...shadows.colored('#EF4444', 0.05),
    elevation: 2,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    marginTop: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...shadows.colored('#EF4444', 0.25),
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
