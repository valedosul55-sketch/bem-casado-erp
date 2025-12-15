import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { stores } from './drizzle/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('Seeding stores...');

  try {
    // Inserir Matriz
    await db.insert(stores).values({
      name: 'BEM CASADO ALIMENTOS - MATRIZ',
      cnpj: '14295537000130',
      ie: '645342314116',
      address: 'ESTRADA MUNICIPAL SANTO ANTONIO DO ALTO, 257',
      city: 'São José dos Campos',
      state: 'SP',
      zipCode: '12225810',
      phone: '(12) 98194-9314',
      email: 'CONTROLADORIA@ARROZVALEDOSUL.COM.BR',
      active: 1
    }).onConflictDoNothing();

    console.log('✅ Matriz cadastrada com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar lojas:', error);
  } finally {
    await client.end();
  }
}

seed();
