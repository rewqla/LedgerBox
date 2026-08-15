import { Client } from 'pg';

export function getTestDatabaseUrl() {
  return (
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  );
}

export function createTestDb() {
  return new Client({
    connectionString: getTestDatabaseUrl()
  });
}
