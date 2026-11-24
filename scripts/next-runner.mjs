import { spawn } from 'node:child_process';
import path from 'node:path';

const [command = 'dev', ...rawArgs] = process.argv.slice(2);
let port = '3000';
let host = '0.0.0.0';

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  if ((arg === '--port' || arg === '-p') && rawArgs[i + 1]) {
    port = rawArgs[i + 1];
    i += 1;
  } else if (arg.startsWith('--port=')) {
    port = arg.slice('--port='.length);
  } else if ((arg === '--host' || arg === '-H' || arg === '--hostname') && rawArgs[i + 1]) {
    host = rawArgs[i + 1];
    i += 1;
  } else if (arg.startsWith('--host=')) {
    host = arg.slice('--host='.length);
  } else if (arg.startsWith('--hostname=')) {
    host = arg.slice('--hostname='.length);
  }
}

const nextBin = path.resolve(process.cwd(), 'node_modules/next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, command, '-p', port, '-H', host], {
  stdio: 'inherit',
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
