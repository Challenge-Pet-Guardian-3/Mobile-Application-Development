import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useUsuario } from '../../hooks/useUsuario';
import { useHome } from '../../hooks/useHome';
import { useFamily } from '../../hooks/useFamily';
import { api } from '../../services/api';
import { STORAGE_KEYS } from '../../constants/Keys';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Funções de Máscara
const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const maskCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const maskUF = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
};

const ARTIGOS_EDUCACAO = [
  {
    id: '1',
    icone: 'nutrition',
    cor: '#10B981',
    titulo: 'Alimentos Tóxicos e Perigos Ocultos',
    categoria: 'NUTRIÇÃO & SEGURANÇA',
    conteudo: 'Nunca ofereça chocolate, cebola, alho, uvas/passas, cafeína ou adoçantes com xilitol. Mantenha lixeiras sempre fechadas.'
  },
  {
    id: '2',
    icone: 'shield-checkmark',
    cor: '#0066FF',
    titulo: 'Protocolo de Imunização Preventiva',
    categoria: 'SAÚDE CLÍNICA',
    conteudo: 'Vacinas múltiplas (V8/V10 para cães ou V4/V5 para gatos) e a Antirrábica exigem reforço anual contínuo ao longo de toda a vida.'
  },
  {
    id: '3',
    icone: 'heart-half',
    cor: '#F59E0B',
    titulo: 'Linguagem Corporal e Sinais de Dor',
    categoria: 'BEM-ESTAR & COMPORTAMENTO',
    conteudo: 'Bocejos fora de hora, lambedura excessiva de patas e isolamento repentino são os primeiros indicativos de dor ou sobrecarga emocional.'
  },
  {
    id: '4',
    icone: 'medkit',
    cor: '#EF4444',
    titulo: 'Primeiros Socorros em Emergências',
    categoria: 'ATENDIMENTO EMERGENCIAL',
    conteudo: 'Em casos de engasgo, hipertermia (calor extremo) ou picadas de insetos, não tente automedicar. Mantenha o animal ventilado e procure o hospital.'
  }
];

const normalizarTexto = (texto: string): string => {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

interface FAQItem {
  id: string;
  categoria: string;
  icone: any;
  cor: string;
  pergunta: string;
  resposta: string;
  palavrasChave: string[];
  destaque?: string;
}

const FAQ_CATEGORIAS = ['Todas', 'Família', 'Pets & Saúde', 'Tarefas & XP', 'Conta & App'];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    categoria: 'Família',
    icone: 'people',
    cor: '#0066FF',
    pergunta: 'Como convidar familiares para cuidar dos pets?',
    resposta: 'Na aba "Family Pet", copie o código exclusivo da sua família e compartilhe com os outros membros. Ao entrarem no app e inserirem o código, todos poderão gerenciar os mesmos pets de forma sincronizada.',
    palavrasChave: ['familia', 'familiares', 'convidar', 'convite', 'codigo', 'membros', 'compartilhar', 'tutor'],
    destaque: 'Código único disponível na aba "Family Pet".'
  },
  {
    id: '2',
    categoria: 'Família',
    icone: 'heart-circle',
    cor: '#EC4899',
    pergunta: 'Mais de uma pessoa pode registrar cuidados do mesmo pet?',
    resposta: 'Sim! Todos os membros da mesma família têm acesso aos pets cadastrados, podendo registrar refeições, passeios, remédios e acompanhar o histórico de saúde em tempo real.',
    palavrasChave: ['tutores', 'multiplos cuidadores', 'duas pessoas', 'cuidar juntos', 'sincronizacao', 'compartilhado', 'familia', 'membros']
  },
  {
    id: '3',
    categoria: 'Pets & Saúde',
    icone: 'paw',
    cor: '#10B981',
    pergunta: 'Como cadastrar um pet ou atualizar suas informações?',
    resposta: 'Acesse a aba "Pets" no menu inferior. Você pode cadastrar um novo companheiro informando nome, espécie, raça, idade, peso e foto, ou editar os dados a qualquer momento tocando no perfil dele.',
    palavrasChave: ['cadastrar pet', 'novo pet', 'cachorro', 'gato', 'editar pet', 'peso', 'raca', 'idade', 'foto', 'animal']
  },
  {
    id: '4',
    categoria: 'Pets & Saúde',
    icone: 'medkit',
    cor: '#EF4444',
    pergunta: 'Como funcionam os lembretes de vacinas e medicamentos?',
    resposta: 'No perfil do pet, acesse a seção de Saúde. Ao registrar vacinas, vermífugos ou remédios com data de reforço/horário, o aplicativo envia alertas preventivos para você não perder prazos.',
    palavrasChave: ['vacina', 'vacinas', 'medicamento', 'medicamentos', 'remedio', 'remedios', 'lembrete', 'dose', 'reforco', 'alarme', 'notificacao', 'saude', 'vermifugo'],
    destaque: 'Lembretes automáticos para vacinas e medicações.'
  },
  {
    id: '5',
    categoria: 'Tarefas & XP',
    icone: 'trophy',
    cor: '#F59E0B',
    pergunta: 'Como ganhar XP e subir no ranking da família?',
    resposta: 'Ao concluir tarefas diárias na tela inicial (alimentação, higiene, passeio, remédio) ou finalizar lições nas Trilhas de Aprendizado, você ganha pontos de XP que contabilizam no ranking familiar.',
    palavrasChave: ['xp', 'pontos', 'pontuacao', 'ranking', 'subir nivel', 'lideranca', 'competicao', 'nivel', 'familia']
  },
  {
    id: '6',
    categoria: 'Tarefas & XP',
    icone: 'flame',
    cor: '#F97316',
    pergunta: 'O que é a Ofensiva (Streak) e como mantê-la?',
    resposta: 'A ofensiva mede a sua constância nos cuidados. Realize pelo menos uma tarefa de cuidado diário com seu pet para manter o fogo aceso e somar dias consecutivos sem quebrar a sequência!',
    palavrasChave: ['ofensiva', 'streak', 'dias seguidos', 'chama', 'fogo', 'sequencia', 'constancia', 'dias'],
    destaque: 'Conclua ao menos 1 tarefa por dia para manter a chama.'
  },
  {
    id: '7',
    categoria: 'Tarefas & XP',
    icone: 'school',
    cor: '#8B5CF6',
    pergunta: 'O que são as Trilhas de Aprendizado?',
    resposta: 'São módulos educativos interativos elaborados para tutores aprenderem sobre nutrição, comportamento, adestramento e bem-estar animal, garantindo a melhor rotina para seu bichinho.',
    palavrasChave: ['trilhas', 'aprendizado', 'cursos', 'aulas', 'dicas', 'adestramento', 'comportamento', 'artigos', 'educacao', 'licoes']
  },
  {
    id: '8',
    categoria: 'Conta & App',
    icone: 'person-circle',
    cor: '#6366F1',
    pergunta: 'Como alterar meus dados cadastrais, endereço ou senha?',
    resposta: 'Nesta tela de Perfil, toque em "Gerenciar Perfil & Endereço". Você pode atualizar seu telefone, cadastrar o endereço com busca por CEP e definir uma nova senha de acesso.',
    palavrasChave: ['perfil', 'senha', 'mudar senha', 'trocar senha', 'cep', 'endereco', 'rua', 'telefone', 'celular', 'email', 'dados']
  },
  {
    id: '9',
    categoria: 'Conta & App',
    icone: 'shield-checkmark',
    cor: '#0D9488',
    pergunta: 'Meus dados e os dados dos meus pets estão seguros?',
    resposta: 'Sim! Utilizamos autenticação segura e comunicação criptografada para proteger todos os dados dos tutores e dos animais cadastrados.',
    palavrasChave: ['seguranca', 'privacidade', 'dados seguros', 'criptografia', 'protecao', 'nuvem', 'seguro']
  },
  {
    id: '10',
    categoria: 'Conta & App',
    icone: 'chatbubbles',
    cor: '#0284C7',
    pergunta: 'Não encontrei minha dúvida. Como falar com o suporte?',
    resposta: 'Toque na opção "Contato / Suporte" no menu ou use o botão "Falar com Suporte" ao final desta lista para enviar uma mensagem diretamente para nossa equipe técnica.',
    palavrasChave: ['suporte', 'ajuda', 'atendimento', 'contato', 'problema', 'bug', 'falar', 'mensagem']
  }
];

export default function UserProfileScreen({ navigation }: any) {
  const { signOut, userData, updateUserData } = useAuth();
  const { usuario, isLoading: carregandoUsuario, updateUsuario, isUpdating } = useUsuario();
  const { xpTotal, ofensivaTotal, temFamilia } = useHome();
  const { familia } = useFamily();

  const [nome, setNome] = useState(userData?.nome || 'Tutor PetGuardian');
  const [email, setEmail] = useState(userData?.email || '');

  const [janelaAberta, setJanelaAberta] = useState<'nenhum' | 'editar' | 'faq' | 'contato' | 'educacao'>('nenhum');

  // Estados de Busca e Filtro do FAQ
  const [faqBusca, setFaqBusca] = useState('');
  const [faqCategoria, setFaqCategoria] = useState('Todas');
  const [faqExpandido, setFaqExpandido] = useState<string | null>('1');

  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [editErros, setEditErros] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgContato, setMsgContato] = useState('');

  const rankingPosicao = useMemo(() => {
    if (!temFamilia) return '---';
    const listaCuidadores = familia?.cuidadores || [];
    if (listaCuidadores.length === 0) return xpTotal > 0 ? '1º' : '---';

    const cuidadoresComPontos = listaCuidadores.map((c: any) => {
      const nomeLimpo = (c.nome || '').replace(' (Você)', '').trim().toLowerCase();
      const isEu =
        (userData?.id && (c.usuarioId === userData.id || c.id === userData.id)) ||
        (userData?.nome && nomeLimpo === userData.nome.trim().toLowerCase());

      const pontosMembro = isEu ? Number(xpTotal || c.xp || c.pontos || 0) : Number(c.xp || c.pontos || 0);

      return {
        ...c,
        isEu,
        pontosCalculados: pontosMembro
      };
    });

    cuidadoresComPontos.sort((a: any, b: any) => b.pontosCalculados - a.pontosCalculados);
    const index = cuidadoresComPontos.findIndex((c: any) => c.isEu);
    return index >= 0 ? `${index + 1}º` : (xpTotal > 0 ? '1º' : '---');
  }, [temFamilia, xpTotal, familia, userData]);

  const buscarEnderecoPorCep = useCallback(async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      setBuscandoCep(true);
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        showAlert('CEP não encontrado', 'Verifique o número digitado ou preencha o endereço manualmente.');
        return;
      }

      setEditForm(prev => ({
        ...prev,
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        estado: maskUF(dados.uf || prev.estado),
        numero: '',
        complemento: '',
      }));
      setEditErros(prev => ({ ...prev, cep: '', logradouro: '', cidade: '', estado: '' }));
    } catch {
      showAlert('Erro de conexão', 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.');
    } finally {
      setBuscandoCep(false);
    }
  }, []);

  const handleEditChange = useCallback((campo: keyof typeof editForm, valor: string) => {
    let valorFormatado = valor;

    if (campo === 'telefone') valorFormatado = maskPhone(valor);
    if (campo === 'cep') valorFormatado = maskCEP(valor);
    if (campo === 'estado') valorFormatado = maskUF(valor);

    setEditForm(prev => ({ ...prev, [campo]: valorFormatado }));
    setEditErros(prev => ({ ...prev, [campo]: '' }));

    if (campo === 'cep') {
      const digits = valorFormatado.replace(/\D/g, '');
      if (digits.length === 8) {
        buscarEnderecoPorCep(valorFormatado);
      }
    }
  }, [buscarEnderecoPorCep]);

  useEffect(() => {
    if (userData) {
      setNome(userData.nome || 'Tutor PetGuardian');
      setEmail(userData.email || '');
    }
  }, [userData]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }, [signOut]);

  const handleAbrirEdicao = useCallback(async () => {
    const formBase = {
      nome: userData?.nome || usuario?.nome || '',
      email: userData?.email || usuario?.email || '',
      telefone: maskPhone(usuario?.telefone || ''),
      senha: '',
      confirmarSenha: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    };

    try {
      const { data: end } = await api.get('/enderecos/me');
      if (end) {
        formBase.cep = maskCEP(end.cep || '');
        formBase.logradouro = end.logradouro || '';
        formBase.numero = end.numero || '';
        formBase.complemento = end.complemento || '';
        formBase.bairro = end.bairro || '';
        formBase.cidade = end.cidade || '';
        formBase.estado = maskUF(end.estado || '');
      }
    } catch {
      // 404 inicial é normal caso o usuário não tenha endereço cadastrado ainda
    }

    setEditForm(formBase);
    setJanelaAberta('editar');
  }, [userData, usuario]);

  // ----- FAQ: busca -----
  const faqsFiltradas = useMemo(() => {
    const termoBusca = normalizarTexto(faqBusca);

    return FAQ_ITEMS.filter((item) => {
      const correspondeCategoria =
        faqCategoria === 'Todas' ||
        normalizarTexto(item.categoria) === normalizarTexto(faqCategoria);

      if (!correspondeCategoria) return false;
      if (!termoBusca) return true;

      const tokens = termoBusca.split(/\s+/).filter(Boolean);
      const categoriaNorm = normalizarTexto(item.categoria);
      const perguntaNorm = normalizarTexto(item.pergunta);
      const palavrasChaveNorm = (item.palavrasChave || []).map(normalizarTexto);
      const respostaNorm = normalizarTexto(item.resposta);
      const destaqueNorm = normalizarTexto(item.destaque || '');

      return tokens.every((token) => {
        if (categoriaNorm.includes(token)) return true;
        if (perguntaNorm.includes(token)) return true;
        if (palavrasChaveNorm.some((pc) => pc.includes(token))) return true;
        if (respostaNorm.includes(token)) return true;
        if (destaqueNorm.includes(token)) return true;
        return false;
      });
    });
  }, [faqCategoria, faqBusca]);

  const handleFecharModal = useCallback(() => {
    setJanelaAberta('nenhum');
    setEditErros({});
    setMsgContato('');
    setFaqBusca('');
    setFaqCategoria('Todas');
    setFaqExpandido(null);
  }, []);

  const salvarEdicao = useCallback(async () => {
    const novosErros: Record<string, string> = {};

    if (!editForm.nome.trim()) novosErros.nome = 'O nome é obrigatório.';
    if (!editForm.email.trim()) novosErros.email = 'O e-mail é obrigatório.';
    if (editForm.senha && editForm.senha.length < 6) {
      novosErros.senha = 'A nova senha deve ter no mínimo 6 dígitos.';
    }
    if (editForm.senha && editForm.senha !== editForm.confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    }

    const preencheuEndereco = editForm.logradouro.trim() || editForm.cidade.trim() || editForm.cep.trim() || editForm.estado.trim();

    if (preencheuEndereco) {
      if (!editForm.cep.trim() || editForm.cep.replace(/\D/g, '').length < 8) {
        novosErros.cep = 'Informe um CEP válido com 8 dígitos.';
      }
      if (!editForm.logradouro.trim()) {
        novosErros.logradouro = 'O logradouro é obrigatório.';
      }
      if (!editForm.cidade.trim()) {
        novosErros.cidade = 'A cidade é obrigatória.';
      }
      if (!editForm.estado.trim() || editForm.estado.length < 2) {
        novosErros.estado = 'Informe a UF (2 letras).';
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setEditErros(novosErros);
      return;
    }

    try {
      setSalvandoTudo(true);

      const payloadUsuario = {
        nome: editForm.nome.trim(),
        email: editForm.email.trim().toLowerCase(),
        senha: editForm.senha.trim() ? editForm.senha : null,
        telefone: editForm.telefone.trim() ? editForm.telefone.trim() : null
      };

      const resposta = await updateUsuario(payloadUsuario);

      // Se o backend renovou o token (mudança de e-mail/senha), atualiza no
      // MESMO lugar que o interceptor do axios lê — senão o app continua
      // mandando o token antigo e a sessão quebra na próxima requisição.
      if (resposta?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${resposta.token}`;
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, resposta.token);
      }

      if (preencheuEndereco) {
        await api.put('/enderecos/me', {
          logradouro: editForm.logradouro.trim(),
          numero: editForm.numero.trim() || null,
          complemento: editForm.complemento.trim() || null,
          bairro: editForm.bairro.trim() || null,
          cidade: editForm.cidade.trim(),
          estado: editForm.estado.trim().toUpperCase(),
          cep: editForm.cep.trim()
        });
      }

      const novoUserData = {
        ...userData,
        nome: editForm.nome.trim(),
        email: editForm.email.trim().toLowerCase()
      };
      await updateUserData(novoUserData as any);

      showAlert('Sucesso', 'Perfil e endereço atualizados com sucesso!');
      setJanelaAberta('nenhum');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Não foi possível salvar os dados no servidor. Verifique os campos preenchidos.';
      showAlert('Erro na API', msg);
    } finally {
      setSalvandoTudo(false);
    }
  }, [editForm, userData, updateUsuario, updateUserData]);

  const enviarContato = useCallback(() => {
    if (!msgContato.trim()) {
      showAlert('Aviso', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    showAlert('Mensagem Enviada!', 'A equipe PetGuardian entrará em contato em breve.');
    setMsgContato('');
    setJanelaAberta('nenhum');
  }, [msgContato]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg} />

        {/* Avatar e Identificação */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarIconWrapper}>
              <Ionicons name="person" size={50} color="#FFF" />
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={handleAbrirEdicao}>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <StatCard icon="fire" label="Ofensiva" value={`${ofensivaTotal} dias`} color="#FF9600" />
          <StatCard icon="star" label="Meu XP" value={xpTotal} color="#1CB0F6" />
          <StatCard icon="medal" label="Ranking" value={rankingPosicao} color="#58CC02" />
        </View>

        {!temFamilia && (
          <Text style={styles.avisoSemFamilia}>Entre ou crie uma família para começar a pontuar no ranking!</Text>
        )}

        {/* Menu de Configurações */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Conta & Aprendizado</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbrirEdicao}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="person-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Gerenciar Perfil & Endereço</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('educacao')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="school-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.menuText}>Guia Educativo & Saúde Pet</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Clinics')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="medkit-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.menuText}>Clínicas Veterinárias</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AiAssistant')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Assistente de IA</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('faq')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="help-buoy-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Perguntas Frequentes</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('contato')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="chatbubbles-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Contato / Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
            </View>
            <Text style={[styles.menuText, { color: '#E53E3E' }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Editar Perfil e Endereço */}
      {janelaAberta === 'editar' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Perfil</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.secaoTitulo}>Dados Pessoais</Text>

              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput
                style={[styles.modalInput, editErros.nome ? styles.inputErro : null]}
                value={editForm.nome}
                onChangeText={(t) => handleEditChange('nome', t)}
              />
              {editErros.nome && <Text style={styles.erroTexto}>{editErros.nome}</Text>}

              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={[styles.modalInput, editErros.email ? styles.inputErro : null]}
                value={editForm.email}
                onChangeText={(t) => handleEditChange('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {editErros.email && <Text style={styles.erroTexto}>{editErros.email}</Text>}

              <Text style={styles.inputLabel}>Telefone / Celular</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="(11) 98765-4321"
                placeholderTextColor="#A0AEC0"
                value={editForm.telefone}
                onChangeText={(t) => handleEditChange('telefone', t)}
                keyboardType="phone-pad"
                maxLength={15}
              />

              <Text style={styles.inputLabel}>Nova Senha (opcional)</Text>
              <TextInput
                style={[styles.modalInput, editErros.senha ? styles.inputErro : null]}
                value={editForm.senha}
                placeholder="Deixe em branco para manter a atual"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => handleEditChange('senha', t)}
                secureTextEntry
              />
              {editErros.senha && <Text style={styles.erroTexto}>{editErros.senha}</Text>}

              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <TextInput
                style={[styles.modalInput, editErros.confirmarSenha ? styles.inputErro : null]}
                value={editForm.confirmarSenha}
                onChangeText={(t) => handleEditChange('confirmarSenha', t)}
                secureTextEntry
              />
              {editErros.confirmarSenha && <Text style={styles.erroTexto}>{editErros.confirmarSenha}</Text>}

              <Text style={[styles.secaoTitulo, { marginTop: 15 }]}>Endereço Residencial</Text>

              <Text style={styles.inputLabel}>CEP</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.modalInput, editErros.cep ? styles.inputErro : null]}
                  placeholder="00000-000"
                  placeholderTextColor="#A0AEC0"
                  value={editForm.cep}
                  onChangeText={(t) => handleEditChange('cep', t)}
                  keyboardType="numeric"
                  maxLength={9}
                />
                {buscandoCep && (
                  <ActivityIndicator
                    size="small"
                    color="#0066FF"
                    style={{ position: 'absolute', right: 14, top: 16 }}
                  />
                )}
              </View>
              {editErros.cep && <Text style={styles.erroTexto}>{editErros.cep}</Text>}

              <Text style={styles.inputLabel}>Logradouro (Rua / Avenida)</Text>
              <TextInput
                style={[styles.modalInput, editErros.logradouro ? styles.inputErro : null]}
                placeholder="Ex: Av. Paulista"
                placeholderTextColor="#A0AEC0"
                value={editForm.logradouro}
                onChangeText={(t) => handleEditChange('logradouro', t)}
              />
              {editErros.logradouro && <Text style={styles.erroTexto}>{editErros.logradouro}</Text>}

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Número</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="100"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.numero}
                    onChangeText={(t) => handleEditChange('numero', t)}
                    maxLength={10}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Apto 42"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.complemento}
                    onChangeText={(t) => handleEditChange('complemento', t)}
                    maxLength={60}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Bairro</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Bela Vista"
                placeholderTextColor="#A0AEC0"
                value={editForm.bairro}
                onChangeText={(t) => handleEditChange('bairro', t)}
                maxLength={80}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Cidade</Text>
                  <TextInput
                    style={[styles.modalInput, editErros.cidade ? styles.inputErro : null]}
                    placeholder="São Paulo"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.cidade}
                    onChangeText={(t) => handleEditChange('cidade', t)}
                  />
                  {editErros.cidade && <Text style={styles.erroTexto}>{editErros.cidade}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>UF</Text>
                  <TextInput
                    style={[styles.modalInput, editErros.estado ? styles.inputErro : null]}
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.estado}
                    onChangeText={(t) => handleEditChange('estado', t)}
                  />
                  {editErros.estado && <Text style={styles.erroTexto}>{editErros.estado}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalBtnSalvar, (salvandoTudo || isUpdating || carregandoUsuario) && { opacity: 0.7 }]}
                onPress={salvarEdicao}
                disabled={salvandoTudo || isUpdating || carregandoUsuario}
              >
                {salvandoTudo || isUpdating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalBtnSalvarText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Modal: Educação & Saúde Pet */}
      {janelaAberta === 'educacao' && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="school" size={24} color="#10B981" />
                <Text style={styles.modalTitle}>Educação & Cuidados</Text>
              </View>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 15, gap: 12 }}>
              <Text style={styles.educacaoIntro}>
                Artigos práticos de saúde preventiva e manejo ético curados pela equipe PetGuardian:
              </Text>

              {ARTIGOS_EDUCACAO.map((artigo) => (
                <View key={artigo.id} style={styles.artigoCard}>
                  <View style={styles.artigoHeaderRow}>
                    <View style={[styles.artigoIconBox, { backgroundColor: artigo.cor + '15' }]}>
                      {/* @ts-ignore */}
                      <Ionicons name={artigo.icone} size={20} color={artigo.cor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.artigoCategoria, { color: artigo.cor }]}>{artigo.categoria}</Text>
                      <Text style={styles.artigoTitulo}>{artigo.titulo}</Text>
                    </View>
                  </View>
                  <Text style={styles.artigoConteudo}>{artigo.conteudo}</Text>
                </View>
              ))}

              <View style={styles.disclaimerCard}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.disclaimerTitulo}>Aviso de Responsabilidade e Saúde Animal</Text>
                  <Text style={styles.disclaimerTexto}>
                    O conteúdo disponibilizado possui finalidade exclusivamente educativa e preventiva de bem-estar animal. Ele não substitui, em nenhuma hipótese, consultas, diagnósticos clínicos, exames ou tratamentos prescritos por um Médico Veterinário habilitado.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal: FAQ */}
      {janelaAberta === 'faq' && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '88%', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.faqHeaderIconBox}>
                  <Ionicons name="help-buoy" size={22} color="#0066FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Dúvidas Frequentes</Text>
                  <Text style={styles.faqHeaderSubtitle}>Tudo sobre cuidados, família e o app</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#718096" />
              </TouchableOpacity>
            </View>

            <View style={styles.faqSearchContainer}>
              <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.faqSearchInput}
                placeholder="Buscar dúvida ou palavra-chave..."
                placeholderTextColor="#94A3B8"
                value={faqBusca}
                onChangeText={setFaqBusca}
                autoCorrect={false}
                {...(Platform.OS === 'web' ? { style: [styles.faqSearchInput, { outlineStyle: 'none' as any }] } : {})}
              />
              {faqBusca.length > 0 && (
                <TouchableOpacity onPress={() => setFaqBusca('')} style={styles.faqSearchClearBtn}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginBottom: 12 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.faqCategoriasScroll}
                keyboardShouldPersistTaps="handled"
              >
                {FAQ_CATEGORIAS.map((cat) => {
                  const ativa = faqCategoria === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.faqCategoriaChip, ativa && styles.faqCategoriaChipAtiva]}
                      onPress={() => setFaqCategoria(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.faqCategoriaChipText, ativa && styles.faqCategoriaChipTextAtiva]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {faqBusca.trim().length > 0 && faqsFiltradas.length > 0 && (
              <View style={styles.faqResultCountRow}>
                <Ionicons name="filter-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.faqResultCountText}>
                  {faqsFiltradas.length === 1
                    ? '1 pergunta encontrada'
                    : `${faqsFiltradas.length} perguntas encontradas`}
                </Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16, gap: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              {faqsFiltradas.length === 0 ? (
                <View style={styles.faqEmptyContainer}>
                  <Ionicons name="search-outline" size={44} color="#CBD5E1" />
                  <Text style={styles.faqEmptyTitulo}>Nenhuma dúvida encontrada</Text>
                  <Text style={styles.faqEmptyTexto}>
                    Não encontramos resultados para "{faqBusca}". Tente pesquisar com outros termos ou fale com nossa equipe.
                  </Text>
                  {(faqBusca.length > 0 || faqCategoria !== 'Todas') && (
                    <TouchableOpacity
                      style={styles.faqLimparBuscaBtn}
                      onPress={() => {
                        setFaqBusca('');
                        setFaqCategoria('Todas');
                      }}
                    >
                      <Text style={styles.faqLimparBuscaText}>Limpar Pesquisa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                faqsFiltradas.map((item) => {
                  const estaAberto = faqExpandido === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.faqCard, estaAberto && styles.faqCardAtivo]}
                      onPress={() => setFaqExpandido(estaAberto ? null : item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.faqCardHeader}>
                        <View style={[styles.faqIconBox, { backgroundColor: item.cor + '15' }]}>
                          <Ionicons name={item.icone} size={18} color={item.cor} />
                        </View>
                        <View style={{ flex: 1, paddingRight: 6 }}>
                          <View style={styles.faqBadgeRow}>
                            <Text style={[styles.faqBadgeText, { color: item.cor }]}>{item.categoria}</Text>
                          </View>
                          <Text style={[styles.faqQuestion, estaAberto && { color: '#0066FF' }]}>
                            {item.pergunta}
                          </Text>
                        </View>
                        <Ionicons
                          name={estaAberto ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={estaAberto ? '#0066FF' : '#94A3B8'}
                        />
                      </View>

                      {estaAberto && (
                        <View style={styles.faqRespostaContainer}>
                          <Text style={styles.faqAnswer}>{item.resposta}</Text>
                          {item.destaque && (
                            <View style={styles.faqDestaqueBox}>
                              <Ionicons name="information-circle-outline" size={16} color="#0066FF" />
                              <Text style={styles.faqDestaqueTexto}>{item.destaque}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}

              <View style={styles.faqSuporteCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.faqSuporteIconBox}>
                    <Ionicons name="headset" size={20} color="#0066FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.faqSuporteTitulo}>Ainda precisa de ajuda?</Text>
                    <Text style={styles.faqSuporteSubtitulo}>Nossa equipe de suporte está pronta para te atender.</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.faqSuporteBtn}
                  onPress={() => setJanelaAberta('contato')}
                >
                  <Ionicons name="chatbubbles-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.faqSuporteBtnText}>Falar com o Suporte</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal: Contato */}
      {janelaAberta === 'contato' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suporte Técnico</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.contatoDesc}>Envie sua mensagem para a equipe de suporte do PetGuardian.</Text>
              <TextInput
                style={[styles.modalInput, { height: 120, textAlignVertical: 'top', paddingTop: 16 }]}
                placeholder="Descreva sua dúvida ou problema..."
                placeholderTextColor="#A0AEC0"
                value={msgContato}
                onChangeText={setMsgContato}
                multiline
              />
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.modalBtnSalvarText}>Enviar Mensagem</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBg: { height: 120, backgroundColor: '#0A1628', width: '100%' },
  profileInfo: { alignItems: 'center', marginTop: -50 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F8FAFC', backgroundColor: '#E2E8F0', elevation: 4 },
  avatarIconWrapper: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#A0AEC0', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0066FF', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F8FAFC' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginTop: 15 },
  userEmail: { fontSize: 15, color: '#718096', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 25 },
  avisoSemFamilia: { textAlign: 'center', color: '#718096', fontSize: 13, marginTop: 15, paddingHorizontal: 40 },
  menuContainer: { marginTop: 35, paddingHorizontal: 20 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#2D3748', fontWeight: '600' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10, 22, 40, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  secaoTitulo: { fontSize: 16, fontWeight: '800', color: '#0066FF', marginBottom: 12, marginTop: 5 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginBottom: 6, marginLeft: 2 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 14, marginBottom: 14, fontSize: 15, color: '#2D3748' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -10, marginBottom: 12, marginLeft: 4, fontWeight: '500' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, flexDirection: 'row', justifyContent: 'center' },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  educacaoIntro: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 4 },
  artigoCard: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  artigoHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  artigoIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  artigoCategoria: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  artigoTitulo: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  artigoConteudo: { fontSize: 12, color: '#475569', lineHeight: 18 },
  disclaimerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F1F5F9', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 6, gap: 10 },
  disclaimerTitulo: { fontSize: 12, fontWeight: '800', color: '#334155', marginBottom: 3 },
  disclaimerTexto: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  faqHeaderIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  faqHeaderSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  faqSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 14, paddingHorizontal: 12, height: 42, marginVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  faqSearchInput: { flex: 1, fontSize: 13, color: '#1E293B', paddingVertical: 0 },
  faqSearchClearBtn: { padding: 4 },
  faqCategoriasScroll: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  faqResultCountRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 8 },
  faqResultCountText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  faqCategoriaChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  faqCategoriaChipAtiva: { backgroundColor: '#0066FF', borderColor: '#0066FF' },
  faqCategoriaChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  faqCategoriaChipTextAtiva: { color: '#FFFFFF', fontWeight: '700' },
  faqCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  faqCardAtivo: { borderColor: '#93C5FD', backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  faqCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  faqBadgeRow: { flexDirection: 'row', marginBottom: 2 },
  faqBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18 },
  faqRespostaContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  faqAnswer: { fontSize: 12.5, color: '#475569', lineHeight: 18 },
  faqDestaqueBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8, marginTop: 8, gap: 6 },
  faqDestaqueTexto: { fontSize: 11.5, color: '#1D4ED8', flex: 1, fontWeight: '600' },
  faqEmptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 6 },
  faqEmptyTitulo: { fontSize: 14, fontWeight: '700', color: '#334155' },
  faqEmptyTexto: { fontSize: 12, color: '#64748B', textAlign: 'center', paddingHorizontal: 16, lineHeight: 17 },
  faqLimparBuscaBtn: { marginTop: 6, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#EFF6FF', borderRadius: 10 },
  faqLimparBuscaText: { fontSize: 12, fontWeight: '600', color: '#0066FF' },
  faqSuporteCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginTop: 6, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  faqSuporteIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  faqSuporteTitulo: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  faqSuporteSubtitulo: { fontSize: 11.5, color: '#64748B' },
  faqSuporteBtn: { backgroundColor: '#0066FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
  faqSuporteBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  contatoDesc: { color: '#718096', marginBottom: 16, fontSize: 14, lineHeight: 20 },
});