#!/usr/bin/env node

import { existsSync } from 'node:fs';

if (!existsSync('game/index.html')) {
  throw new Error('Build input missing: game/index.html');
}

console.log('INDOFARM web assets are ready for Capacitor.');