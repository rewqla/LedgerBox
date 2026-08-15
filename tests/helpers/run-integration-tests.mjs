import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const fakeHome = path.join(workspaceRoot, '.tmp', 'supabase-home');

mkdirSync(fakeHome, { recursive: true });

const sharedEnv = {
  ...process.env,
  HOME: fakeHome,
  USERPROFILE: fakeHome,
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
};

function commandName(base) {
  return process.platform === 'win32' ? `${base}.cmd` : base;
}

function run(command, args, env = sharedEnv) {
  const result = spawnSync(
    process.platform === 'win32' ? 'cmd.exe' : command,
    process.platform === 'win32' ? ['/c', command, ...args] : args,
    {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env,
    shell: false
    }
  );

  if (result.error) {
    console.error(`Failed to run ${command} ${args.join(' ')}.`);
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(commandName('supabase'), ['start']);
run(commandName('supabase'), ['db', 'reset', '--local', '--yes']);
run(commandName('vitest'), ['run', 'tests/integration']);
