// Rodar uma vez: node scripts/seed.js
// Popula Firestore com obras iniciais e configurações do site.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = require(join(__dirname, '..', 'secrets', 'firebase-admin.json'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const obrasIniciais = [
  {
    slug: 'quando-se-corroi',
    titulo: 'quando se corrói',
    tipo: 'Escultura',
    colecao: '8.092 dias em casa',
    ano: 2025,
    tecnica: 'Cerâmica esmaltada',
    dimensoes: '22 × 20 × 18 cm · 3kg',
    disponibilidade: 'Disponível',
    descricao: '',
    imagens: [],
    destaque: true,
    ordem: 1,
  },
  {
    slug: 'fragil-criatura',
    titulo: 'frágil criatura',
    tipo: 'Escultura',
    colecao: '8.092 dias em casa',
    ano: 2025,
    tecnica: 'Argila terracota com engobo',
    dimensoes: '15 × 12 × 10 cm · 1.2kg',
    disponibilidade: 'Sob consulta',
    descricao: '',
    imagens: [],
    destaque: true,
    ordem: 2,
  },
  {
    slug: 'pouco-antes-de-tudo-desabar',
    titulo: 'pouco antes de tudo desabar',
    tipo: 'Escultura',
    colecao: '8.092 dias em casa',
    ano: 2024,
    tecnica: 'Gesso e grafite',
    dimensoes: '45 × 30 × 25 cm · 7kg',
    disponibilidade: 'Indisponível',
    descricao: '',
    imagens: [],
    destaque: true,
    ordem: 3,
  },
  {
    slug: 'o-que-resta-do-silencio',
    titulo: 'o que resta do silêncio',
    tipo: 'Pintura',
    colecao: 'Anatomia do abandono',
    ano: 2024,
    tecnica: 'Óleo sobre tela',
    dimensoes: '90 × 70 cm',
    disponibilidade: 'Disponível',
    descricao: '',
    imagens: [],
    destaque: true,
    ordem: 4,
  },
  {
    slug: 'corpo-sem-testemunha',
    titulo: 'corpo sem testemunha',
    tipo: 'Pintura',
    colecao: 'Anatomia do abandono',
    ano: 2023,
    tecnica: 'Acrílica e carvão sobre tela',
    dimensoes: '120 × 80 cm',
    disponibilidade: 'Disponível',
    descricao: '',
    imagens: [],
    destaque: false,
    ordem: 5,
  },
  {
    slug: 'enquanto-apodrecemos-juntos',
    titulo: 'enquanto apodrecemos juntos',
    tipo: 'Escultura',
    colecao: '8.092 dias em casa',
    ano: 2025,
    tecnica: 'Porcelana e resina epóxi',
    dimensoes: '18 × 15 × 12 cm · 2.1kg',
    disponibilidade: 'Disponível',
    descricao: '',
    imagens: [],
    destaque: false,
    ordem: 6,
  },
  {
    slug: 'tudo-que-voce-nao-disse',
    titulo: 'tudo que você não disse',
    tipo: 'Pintura',
    colecao: 'Anatomia do abandono',
    ano: 2023,
    tecnica: 'Óleo sobre linho',
    dimensoes: '60 × 50 cm',
    disponibilidade: 'Sob consulta',
    descricao: '',
    imagens: [],
    destaque: false,
    ordem: 7,
  },
  {
    slug: 'a-pele-do-medo',
    titulo: 'a pele do medo',
    tipo: 'Escultura',
    colecao: '8.092 dias em casa',
    ano: 2024,
    tecnica: 'Cerâmica com óxido de ferro',
    dimensoes: '30 × 25 × 22 cm · 4.5kg',
    disponibilidade: 'Indisponível',
    descricao: '',
    imagens: [],
    destaque: false,
    ordem: 8,
  },
  {
    slug: 'entre-o-osso-e-o-nome',
    titulo: 'entre o osso e o nome',
    tipo: 'Pintura',
    colecao: 'Anatomia do abandono',
    ano: 2022,
    tecnica: 'Encáustica sobre madeira',
    dimensoes: '80 × 60 cm',
    disponibilidade: 'Disponível',
    descricao: '',
    imagens: [],
    destaque: false,
    ordem: 9,
  },
];

const configInicial = {
  bio: 'Ayume Andrade é artista visual contemporânea. Sua prática em cerâmica investiga a memória como eixo central, a partir da relação com a matéria. Desenvolve esculturas em cerâmica esmaltada a partir dessas reminiscências.',
  heroImagem: null,
  contato: {
    email: 'ayumeandrade00@gmail.com',
    instagram: '@ayuandrade',
    instagramUrl: 'https://www.instagram.com/ayuandrade/',
    whatsapp: '5585996195880',
  },
  portfolioVisualUrl: 'https://canva.link/ayumeandradeportfolio',
  atualizadoEm: FieldValue.serverTimestamp(),
};

async function seed() {
  console.log('Iniciando seed...');

  // Obras
  const batch = db.batch();
  for (const obra of obrasIniciais) {
    const ref = db.collection('obras').doc(obra.slug);
    const { slug, ...dados } = obra;
    batch.set(ref, {
      ...dados,
      criadoEm: FieldValue.serverTimestamp(),
      atualizadoEm: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`${obrasIniciais.length} obras criadas.`);

  // Configurações
  await db.collection('configuracoes').doc('site').set(configInicial);
  console.log('Configurações do site criadas.');

  // Participação de exemplo
  await db.collection('participacoes').doc('fargo-2026').set({
    titulo: 'FARGO',
    tituloEn: '',
    local: 'Centro Cultural Oscar Niemeyer — GO',
    localEn: '',
    data: '16 e 17 de maio',
    dataEn: 'May 16-17',
    dataInicio: null,
    dataFim: null,
    visivel: true,
    ordem: 1,
    criadoEm: FieldValue.serverTimestamp(),
    atualizadoEm: FieldValue.serverTimestamp(),
  });
  console.log('1 participação de exemplo criada.');

  console.log('Seed concluído!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
