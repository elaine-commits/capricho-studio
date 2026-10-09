import pg from 'pg';
import {readdir,readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL necessária');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();
try{await client.query('SELECT pg_advisory_lock(742951)');await client.query('CREATE TABLE IF NOT EXISTS studio_migrations(name text PRIMARY KEY,applied_at timestamptz DEFAULT now())');for(const name of (await readdir('db/migrations')).sort()){if(!(await client.query('SELECT 1 FROM studio_migrations WHERE name=$1',[name])).rowCount){await client.query(await readFile('db/migrations/'+name,'utf8'));await client.query('INSERT INTO studio_migrations(name) VALUES($1)',[name]);console.log('Aplicada:',name);}}}finally{await client.end()}
