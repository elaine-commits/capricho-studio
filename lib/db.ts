import {Pool} from 'pg';
const globalDb=globalThis as unknown as {studioPool?:Pool};
export function db(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_NOT_CONFIGURED');return globalDb.studioPool??=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});}
