#!/usr/bin/env node

import { existsSync } from 'node:fs';

if (!existsSync('game/index.html')) {
  throw new Error('Build input missing: game/index.html');
}

console.log('INDOFARM native Android bundle is ready for Capacitor.');