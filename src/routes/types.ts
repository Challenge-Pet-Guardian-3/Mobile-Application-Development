export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type FamilyStackParamList = {
  FamilyMain: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Family: { screen?: keyof FamilyStackParamList; params?: FamilyStackParamList[keyof FamilyStackParamList] } | undefined;
  IA: { petId?: number } | undefined;
  Treino: undefined;
  Perfil: { screen?: keyof ProfileStackParamList; params?: ProfileStackParamList[keyof ProfileStackParamList] } | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Tabs: undefined;
  PetDetail: { petId?: number } | undefined;
  IA: { petId?: number } | undefined;
  Family: { screen?: string; params?: { petId?: number } } | undefined;
  Perfil: { screen?: string; params?: Record<string, unknown> } | undefined;
};

