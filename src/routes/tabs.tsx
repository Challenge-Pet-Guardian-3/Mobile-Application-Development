import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

import Home from '../screens/Home/HomeScreen';
import FamilyPetScreen from '../screens/FamilyPet/FamilyPetScreen';
import PetDetailScreen from '../screens/PetDetail/PetDetailScreen';
import TrainingEducationScreen from '../screens/TrainingEducation/TrainingEducationScreen';
import UserProfileScreen from '../screens/UserProfile/UserProfileScreen';
import ClinicsSearchScreen from '../screens/ClinicsSearch/ClinicsSearchScreen';
import AiAssistantScreen from '../screens/AiAssistant/AiAssistantScreen';

import { AppTabParamList, FamilyStackParamList, ProfileStackParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const FamilyStackNav = createNativeStackNavigator<FamilyStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function FamilyStack() {
  return (
    <FamilyStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FamilyStackNav.Screen name="FamilyMain" component={FamilyPetScreen} />
      <FamilyStackNav.Screen name="PetDetail" component={PetDetailScreen} />
    </FamilyStackNav.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={UserProfileScreen} />
      <ProfileStackNav.Screen name="Clinicas" component={ClinicsSearchScreen} />
      <ProfileStackNav.Screen name="PetDetail" component={PetDetailScreen} />
    </ProfileStackNav.Navigator>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          bottom: Platform.OS === 'ios' ? 24 : 14,
          marginHorizontal: 16,
          borderRadius: 24,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          height: 64,
          position: 'absolute',
          paddingBottom: Platform.OS === 'ios' ? 10 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size + 2} />
          ),
        }}
      />

      <Tab.Screen
        name="Family"
        component={FamilyStack}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size + 2} />
          ),
        }}
      />

      {/* BOTÃO CENTRAL DEDICADO PARA A IA ASSISTENTE */}
      <Tab.Screen
        name="IA"
        component={AiAssistantScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
              <MaterialCommunityIcons
                name="robot"
                size={28}
                color={focused ? '#FFFFFF' : '#93C5FD'}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Treino"
        component={TrainingEducationScreen}
        options={{
          tabBarLabel: 'Trilhas',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="graduation-cap" color={color} size={size - 2} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 58,
    height: 58,
    backgroundColor: '#1E293B',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 20 : 16,
    borderWidth: 3.5,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  centerButtonActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});