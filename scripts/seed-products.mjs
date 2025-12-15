// Script para popular banco de dados com produtos iniciais
// Uso: node scripts/seed-products.mjs

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema.ts';

// Conectar ao banco de dados
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
  process.exit(1);
}

const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});
const db = drizzle(client, { schema });

// Produtos para inserir
const products = [
  {
    name: 'Arroz Branco Tipo 1',
    brand: 'Bem Casado',
    category: 'Arroz',
    description: 'Kit com 10 unidades. Arroz Branco Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Subgrupo Polido, Classe Longo Fino. Grãos nobres selecionados.',
    price: 23.00,
    stock: 200,
    imageUrl: '/produto-arroz-branco-1kg.webp',
    isActive: true,
  },
  {
    name: 'Arroz Integral Tipo 1',
    brand: 'Bem Casado',
    category: 'Arroz',
    description: 'Kit com 10 unidades. Arroz Integral Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Subgrupo Integral, Classe Longo Fino. Rico em fibras e nutrientes.',
    price: 23.00,
    stock: 150,
    imageUrl: '/produto-arroz-integral-1kg.webp',
    isActive: true,
  },
  {
    name: 'Feijão Carioca Tipo 1',
    brand: 'Bem Casado',
    category: 'Feijão',
    description: 'Kit com 10 unidades. Feijão Carioca Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Feijão Comum, Classe Cores. Grãos selecionados de alta qualidade.',
    price: 39.90,
    stock: 300,
    imageUrl: '/produto-feijao-carioca-1kg.webp',
    isActive: true,
  },
  {
    name: 'Feijão Preto Tipo 1',
    brand: 'Bem Casado',
    category: 'Feijão',
    description: 'Kit com 10 unidades. Feijão Preto Tipo 1 Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Feijão Comum, Classe Preto. Ideal para feijoada e pratos tradicionais.',
    price: 29.90,
    stock: 280,
    imageUrl: '/produto-feijao-preto-1kg.webp',
    isActive: true,
  },
  {
    name: 'Açúcar Cristal',
    brand: 'Bem Casado',
    category: 'Açúcar',
    description: 'Kit com 10 unidades. Açúcar Cristal Bem Casado vendido em fardos de 10kg (10 pacotes de 1kg). Grupo 1, Classe Cristal Branco, Tipo Cristal. Cristais uniformes e brilhantes.',
    price: 29.00,
    stock: 250,
    imageUrl: '/produto-acucar-cristal-1kg.png',
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed de produtos...\n');

    // Verificar se já existem produtos
    const existingProducts = await db.select().from(schema.products);
    
    if (existingProducts.length > 0) {
      console.log(`⚠️  Já existem ${existingProducts.length} produtos no banco de dados.`);
      console.log('   Deseja continuar e adicionar mais produtos? (Ctrl+C para cancelar)\n');
      
      // Aguardar 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Inserir produtos
    let insertedCount = 0;
    
    for (const product of products) {
      // Verificar se produto já existe pelo nome
      const existing = await db
        .select()
        .from(schema.products)
        .where(schema.products.name.eq(product.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Pulando "${product.name}" (já existe)`);
        continue;
      }

      // Inserir produto
      await db.insert(schema.products).values(product);
      console.log(`✅ Inserido: ${product.name} - R$ ${product.price.toFixed(2)} (${product.stock} unidades)`);
      insertedCount++;
    }

    console.log(`\n🎉 Seed concluído! ${insertedCount} produtos inseridos.`);
    console.log(`📊 Total de produtos no banco: ${existingProducts.length + insertedCount}`);

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar seed
seed();
