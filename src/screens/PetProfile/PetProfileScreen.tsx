import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  TextInput, 
  KeyboardAvoidingView, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AVATARES_DISPONIVEIS, getAvatarById } from '../../constants/Avatares';
import { PetSchema } from '../../utils/schemas';
import { usePets, PetBackend } from '../../hooks/usePets';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    const confirmou = window.confirm(`${title}\n${message}`);
    if (confirmou) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

const aplicarMascaraDataBr = (valor: string): string => {
  const nums = valor.replace(/\D/g, '').slice(0, 8);
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
  return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
};

const isoParaBr = (iso?: string | null): string => {
  if (!iso || !iso.trim()) return '';
  const clean = iso.trim();
  if (clean.includes('-')) {
    const [ano, mes, dia] = clean.split('-');
    if (ano && mes && dia && ano.length === 4) {
      return `${dia}/${mes}/${ano}`;
    }
  }
  return clean;
};

const brParaIso = (br?: string | null): string | null => {
  if (!br || !br.trim()) return null;
  const clean = br.trim();
  if (clean.includes('/')) {
    const [dia, mes, ano] = clean.split('/');
    if (dia && mes && ano && ano.length === 4) {
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  return null;
};

interface PetFormState {
  avatarId: string;
  nome: string;
  raca: string;
  idade: string;
  sexo: string;
  castrado: string;
  peso: string;
  ultimaVacina: string;
  ultimaConsulta: string;
}

const initialFormState: PetFormState = {
  avatarId: '1',
  nome: '',
  raca: '',
  idade: '',
  sexo: 'Macho',
  castrado: 'Sim',
  peso: '',
  ultimaVacina: '',
  ultimaConsulta: '',
};

export default function PetProfileScreen() {
  const { 
    pets, 
    isLoading, 
    createPet, 
    updatePet, 
    deletePet, 
    isCreating, 
    isUpdating, 
    isDeleting 
  } = usePets();

  const [petAtualId, setPetAtualId] = useState<number | null>(null);
  const [modoCriacao, setModoCriacao] = useState(false);
  const [form, setForm] = useState<PetFormState>(initialFormState);

  const selecionarPet = useCallback((pet: PetBackend) => {
    setModoCriacao(false);
    setPetAtualId(pet.id ?? null);
    setForm({
      avatarId: pet.avatarId ? String(pet.avatarId) : '1',
      nome: pet.nome || '',
      raca: pet.raca || '',
      idade: pet.idade != null ? `${pet.idade} anos` : '',
      sexo: pet.sexo === 'M' ? 'Macho' : 'Fêmea',
      castrado: pet.castrado ? 'Sim' : 'Não',
      peso: pet.peso != null ? String(pet.peso) : '',
      ultimaVacina: isoParaBr(pet.ultimaVacina),
      ultimaConsulta: isoParaBr(pet.ultimaConsulta),
    });
  }, []);

  const prepararNovoPet = useCallback(() => {
    setModoCriacao(true);
    setPetAtualId(null);
    setForm(initialFormState);
  }, []);

  useEffect(() => {
    if (pets && pets.length > 0) {
      if (modoCriacao) return; // Não sobrescreve quando o usuário clicar em + Novo
      const petExiste = pets.some(p => p.id === petAtualId);
      if (petAtualId === null || !petExiste) {
        selecionarPet(pets[0]);
      }
    } else {
      prepararNovoPet();
    }
  }, [pets, petAtualId, modoCriacao, selecionarPet, prepararNovoPet]);

  const handleInputChange = useCallback((campo: keyof PetFormState, valor: string) => {
    if (campo === 'ultimaVacina' || campo === 'ultimaConsulta') {
      valor = aplicarMascaraDataBr(valor);
    }
    setForm(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const salvarDadosPet = useCallback(async () => {
    const result = PetSchema.safeParse(form);
    if (!result.success) {
      const primeiroErro = result.error.issues[0].message;
      showAlert('Erro de Validação', primeiroErro);
      return;
    }

    const isoVacina = brParaIso(form.ultimaVacina);
    const isoConsulta = brParaIso(form.ultimaConsulta);

    if (form.ultimaVacina.trim() && !isoVacina) {
      showAlert('Data Inválida', 'Data da vacina deve estar no formato DD/MM/AAAA');
      return;
    }

    if (form.ultimaConsulta.trim() && !isoConsulta) {
      showAlert('Data Inválida', 'Data da consulta deve estar no formato DD/MM/AAAA');
      return;
    }

    const { nome, raca, idade, sexo, castrado } = result.data;
    const idadeNumero = parseInt(idade.replace(/\D/g, ''), 10) || 1;
    const sexoChar: 'M' | 'F' = sexo.toLowerCase().startsWith('m') ? 'M' : 'F';
    const isCastrado = ['sim', 's', 'true'].includes(castrado.toLowerCase());

    const pesoNumero = form.peso.trim() 
      ? Number(form.peso.replace(/[^\d.,]/g, '').replace(',', '.')) 
      : null;

    const payload: Omit<PetBackend, 'id'> = {
      nome: nome.trim(),
      idade: idadeNumero,
      raca: raca.trim(),
      porte: 'MEDIO',
      sexo: sexoChar,
      castrado: isCastrado,
      avatarId: parseInt(form.avatarId, 10) || 1,
      peso: isNaN(pesoNumero as number) ? null : pesoNumero,
      ultimaVacina: isoVacina,
      ultimaConsulta: isoConsulta,
    };

    try {
      if (!modoCriacao && petAtualId) {
        await updatePet({ ...payload, id: petAtualId });
        showAlert('Sucesso!', 'Pet atualizado com sucesso.');
      } else {
        const novo = await createPet(payload);
        setModoCriacao(false);
        if (novo?.id) {
          setPetAtualId(novo.id);
        }
        showAlert('Sucesso!', 'Novo pet cadastrado com sucesso!');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao salvar pet no servidor.';
      showAlert('Erro na API', msg);
    }
  }, [form, modoCriacao, petAtualId, updatePet, createPet]);

  const excluirPet = useCallback(async () => {
    if (!petAtualId) return;

    try {
      await deletePet(petAtualId);
      prepararNovoPet();
      showAlert('Sucesso', 'Pet removido com sucesso.');
    } catch (error: any) {
      showAlert('Erro na API', 'Não foi possível excluir o pet.');
    }
  }, [petAtualId, deletePet, prepararNovoPet]);

  const confirmarExclusao = useCallback(() => {
    if (!petAtualId) return;
    showConfirm('Excluir Pet', `Tem certeza que deseja remover o(a) ${form.nome}?`, excluirPet);
  }, [petAtualId, form.nome, excluirPet]);

  const avatarAtual = getAvatarById(form.avatarId) || AVATARES_DISPONIVEIS[0].imagem;
  const processando = isCreating || isUpdating || isDeleting;

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Buscando pets no servidor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Header title="Meus Pets" />
        </View>

        {/* Carrossel Superior de Pets */}
        <View style={styles.carrosselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listaDePets}>
            {pets.map((pet) => {
              const avatarKey = pet.avatarId ? String(pet.avatarId) : '1';
              const avatarImage = getAvatarById(avatarKey) || AVATARES_DISPONIVEIS[0].imagem;
              const isSelected = !modoCriacao && petAtualId === pet.id;

              return (
                <TouchableOpacity key={pet.id} onPress={() => selecionarPet(pet)} style={styles.itemPetCarrossel}>
                  <View style={[styles.miniAvatarBorda, isSelected && styles.miniAvatarSelecionado]}>
                    <Image source={avatarImage} style={styles.miniAvatarImg} resizeMode="cover" />
                  </View>
                  <Text style={[styles.miniAvatarTexto, isSelected && styles.miniAvatarTextoSelecionado]} numberOfLines={1}>
                    {(pet.nome || '').split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Botão + Novo */}
            <TouchableOpacity onPress={prepararNovoPet} style={styles.itemPetCarrossel}>
              <View style={[styles.miniAvatarBorda, styles.botaoNovoPet, modoCriacao && styles.miniAvatarSelecionado]}>
                <MaterialCommunityIcons name="plus" size={30} color={modoCriacao ? "#0066FF" : "#A0AEC0"} />
              </View>
              <Text style={[styles.miniAvatarTexto, modoCriacao && styles.miniAvatarTextoSelecionado]}>+ Novo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Avatar Central Selecionado */}
        <View style={styles.avatarSection}>
          <View style={styles.imageWrapper}>
            <Image source={avatarAtual} style={styles.petImage} resizeMode="cover" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
            {AVATARES_DISPONIVEIS.map((avatar) => (
              <TouchableOpacity 
                key={avatar.id} 
                onPress={() => handleInputChange('avatarId', avatar.id)} 
                style={[styles.avatarOption, form.avatarId === avatar.id && styles.avatarOptionSelected]}
              >
                <Image source={avatar.imagem} style={styles.avatarOptionImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Formulário de Identificação */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Nome do Pet</Text>
          <TextInput 
            style={styles.input} 
            value={form.nome} 
            onChangeText={(val) => handleInputChange('nome', val)} 
            placeholder="Ex: Bob" 
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Raça</Text>
              <TextInput 
                style={styles.input} 
                value={form.raca} 
                onChangeText={(val) => handleInputChange('raca', val)} 
                placeholder="Ex: Husky" 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Idade</Text>
              <TextInput 
                style={styles.input} 
                value={form.idade} 
                onChangeText={(val) => handleInputChange('idade', val)} 
                placeholder="Ex: 4 anos" 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Sexo (Macho / Fêmea)</Text>
              <TextInput 
                style={styles.input} 
                value={form.sexo} 
                onChangeText={(val) => handleInputChange('sexo', val)} 
                placeholder="Macho ou Fêmea" 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Castrado? (Sim / Não)</Text>
              <TextInput 
                style={styles.input} 
                value={form.castrado} 
                onChangeText={(val) => handleInputChange('castrado', val)} 
                placeholder="Sim ou Não" 
              />
            </View>
          </View>
        </View>

        {/* Formulário Clínico */}
        <View style={[styles.formContainer, { marginTop: 16 }]}>
          <Text style={[styles.inputLabel, { fontSize: 15, marginBottom: 14 }]}>Histórico Clínico</Text>

          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <TextInput 
            style={styles.input} 
            value={form.peso} 
            onChangeText={(val) => handleInputChange('peso', val)} 
            placeholder="Ex: 8.5" 
            keyboardType="decimal-pad"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Última Vacina</Text>
              <TextInput 
                style={styles.input} 
                value={form.ultimaVacina} 
                onChangeText={(val) => handleInputChange('ultimaVacina', val)} 
                placeholder="DD/MM/AAAA" 
                maxLength={10}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Última Consulta</Text>
              <TextInput 
                style={styles.input} 
                value={form.ultimaConsulta} 
                onChangeText={(val) => handleInputChange('ultimaConsulta', val)} 
                placeholder="DD/MM/AAAA" 
                maxLength={10}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.btnSalvar, processando && { opacity: 0.7 }]} 
            onPress={salvarDadosPet}
            disabled={processando}
          >
            {processando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnSalvarText}>
                {modoCriacao || !petAtualId ? 'Cadastrar Novo Pet' : 'Salvar Alterações'}
              </Text>
            )}
          </TouchableOpacity>

          {!modoCriacao && petAtualId && (
            <TouchableOpacity 
              style={styles.btnExcluir} 
              onPress={confirmarExclusao}
              disabled={processando}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
              <Text style={styles.btnExcluirText}>Remover Pet</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#718096', fontWeight: '500' },
  carrosselContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', backgroundColor: '#FFF' },
  listaDePets: { paddingHorizontal: 20, gap: 15, alignItems: 'center' },
  itemPetCarrossel: { alignItems: 'center', width: 64 },
  miniAvatarBorda: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniAvatarSelecionado: { borderColor: '#0066FF' },
  miniAvatarImg: { width: '100%', height: '100%' },
  miniAvatarTexto: { fontSize: 12, color: '#718096', marginTop: 4, fontWeight: '600' },
  miniAvatarTextoSelecionado: { color: '#0066FF', fontWeight: 'bold' },
  botaoNovoPet: { backgroundColor: '#F0F8FF', borderStyle: 'dashed' },
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  petImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFF' },
  avatarList: { paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  avatarOption: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: 'transparent', padding: 2 },
  avatarOptionSelected: { borderColor: '#0066FF' },
  avatarOptionImage: { width: '100%', height: '100%', borderRadius: 30 },
  formContainer: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#EDF2F7', elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 15, fontSize: 15, color: '#2D3748' },
  btnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnExcluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 5 },
  btnExcluirText: { color: '#FF3B30', fontWeight: '600', fontSize: 14 }
});