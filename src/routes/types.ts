export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type FamilyStackParamList = {
  FamilyMain: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Family: undefined;
  IA: { petId?: number } | undefined;
  Treino: undefined;
  Perfil: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Clinicas: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  PetDetail: { petId?: number } | undefined;
  Clinicas: undefined;
  IA: { petId?: number } | undefined;
};
