import type {Levels} from './types';

function convertLogNumber(level: number): Levels | 'userlvl' {
  if (level === 10) return 'trace';
  if (level === 20) return 'debug';
  if (level === 30) return 'info';
  if (level === 40) return 'warn';
  if (level === 50) return 'error';
  if (level === 60) return 'fatal';
  return 'userlvl';
}

export default convertLogNumber;
