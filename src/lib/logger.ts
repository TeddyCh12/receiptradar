type Level = 'debug' | 'info' | 'warn' | 'error';

const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel: Level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (order[level] < order[currentLevel]) return;
  const line = JSON.stringify({
    level,
    msg,
    ...meta,
    ts: new Date().toISOString(),
  });
  // Use console methods so platforms capture severity correctly
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else if (level === 'info') console.info(line);
  else console.debug(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
};
