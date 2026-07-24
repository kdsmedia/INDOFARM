// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Visual Battle Simulation
//  Animasi pertempuran pasukan nyata dengan tampilan visual
// ═══════════════════════════════════════════════════════════════

import { ARMY_UNITS, AI_KINGDOMS, RESOURCES } from './data.js';

// ── Battle Simulator ───────────────────────────────────────────
export const BattleSim = {

  // Tampilkan simulasi pertempuran visual full-screen
  // @param myArmy    { soldier:N, archer:N, ... }
  // @param kingdom   AI_KINGDOMS entry
  // @param result    { won, log, reward, power, casualties }
  // @param onClose   callback when done
  show(myArmy, kingdom, result, onClose) {
    const el = document.createElement('div');
    el.id = 'battle-sim';
    el.innerHTML = `
      <div class="bsim-bg"></div>
      <div class="bsim-header">
        <div class="bsim-title">⚔️ PERTEMPURAN</div>
        <div class="bsim-vs">
          <span class="bsim-side-name mine">🏰 Pasukanmu</span>
          <span class="bsim-vs-badge">VS</span>
          <span class="bsim-side-name enemy">${kingdom.icon} ${kingdom.name}</span>
        </div>
      </div>

      <div class="bsim-field">
        <!-- MY ARMY (left) -->
        <div class="bsim-army bsim-mine" id="bsim-mine"></div>

        <!-- BATTLE FX CENTER -->
        <div class="bsim-center">
          <div class="bsim-clash" id="bsim-clash"></div>
          <div class="bsim-pow" id="bsim-pow"></div>
        </div>

        <!-- ENEMY ARMY (right) -->
        <div class="bsim-army bsim-enemy" id="bsim-enemy"></div>
      </div>

      <div class="bsim-log-wrap">
        <div class="bsim-log" id="bsim-log"></div>
      </div>

      <div class="bsim-bottom" id="bsim-bottom" style="display:none">
        <div class="bsim-result" id="bsim-result"></div>
        <button class="bsim-close-btn" id="bsim-close">OK — Lanjutkan</button>
      </div>
    `;
    document.body.appendChild(el);
    this._run(el, myArmy, kingdom, result, onClose);
  },

  _run(el, myArmy, kingdom, result, onClose) {
    const mineEl  = document.getElementById('bsim-mine');
    const enemyEl = document.getElementById('bsim-enemy');
    const logEl   = document.getElementById('bsim-log');
    const clashEl = document.getElementById('bsim-clash');
    const powEl   = document.getElementById('bsim-pow');

    // Render initial armies
    this._renderArmy(mineEl,  myArmy,       false);
    this._renderArmy(enemyEl, kingdom.army, true);

    // Animate battle log line by line
    const lines = result.log ?? [];
    let   li    = 0;

    const addLog = (text, cls = '') => {
      const d = document.createElement('div');
      d.className = 'bsim-logline ' + cls;
      d.textContent = text;
      if (logEl) { logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight; }
    };

    const clashFX = () => {
      const fxs = ['💥', '⚡', '🔥', '✨', '💫', '🌟'];
      const f = document.createElement('div');
      f.className = 'bsim-clash-fx';
      f.textContent = fxs[Math.floor(Math.random() * fxs.length)];
      f.style.cssText = `left:${20+Math.random()*60}%;top:${10+Math.random()*80}%;`;
      if (clashEl) { clashEl.appendChild(f); setTimeout(() => f.remove(), 800); }
    };

    const powFX = (text) => {
      if (powEl) {
        powEl.textContent = text;
        powEl.classList.add('bsim-pow-show');
        setTimeout(() => powEl.classList.remove('bsim-pow-show'), 600);
      }
    };

    // Run through log with delays
    const runLine = () => {
      if (li >= lines.length) {
        setTimeout(() => this._showResult(el, result, onClose), 400);
        return;
      }
      const line = lines[li++];
      addLog(line, line.includes('menyerang') ? 'log-attack' :
                   line.includes('jatuh')     ? 'log-fall'   :
                   line.includes('Menang')    ? 'log-win'    :
                   line.includes('Kalah')     ? 'log-lose'   : '');
      clashFX();
      if (line.includes('jatuh') || line.includes('tewas')) powFX('💀');
      else if (line.includes('menyerang')) powFX('⚔️');

      // Reduce army visuals as battle progresses
      const pct = li / lines.length;
      if (pct > 0.3 && mineEl)  this._dimArmy(mineEl,  result.won ? 0.2 : 0.6);
      if (pct > 0.3 && enemyEl) this._dimArmy(enemyEl, result.won ? 0.7 : 0.2);

      const delay = line.includes('Ronde') ? 500 : 180;
      setTimeout(runLine, delay);
    };

    // Advance effect — armies move toward each other
    if (mineEl && enemyEl) {
      setTimeout(() => {
        mineEl.classList.add('bsim-advance');
        enemyEl.classList.add('bsim-advance-enemy');
      }, 600);
    }

    setTimeout(runLine, 1200);

    document.getElementById('bsim-close')?.addEventListener('click', () => {
      el.remove();
      onClose?.();
    });
  },

  _renderArmy(container, army, isEnemy) {
    if (!container) return;
    let html = '';
    for (const [uid, cnt] of Object.entries(army)) {
      if (!cnt || cnt <= 0) continue;
      const def  = ARMY_UNITS[uid];
      if (!def) continue;
      const show = Math.min(cnt, 8); // max 8 icons per unit type
      const icons = Array(show).fill(def.icon).join('');
      html += `<div class="bsim-unit-row ${isEnemy ? 'enemy-row' : ''}">
        <span class="bsim-unit-icons">${icons}</span>
        <span class="bsim-unit-cnt">×${cnt}</span>
      </div>`;
    }
    container.innerHTML = html || '<div class="bsim-empty-army">👻</div>';
  },

  _dimArmy(container, fallPct) {
    const rows = container.querySelectorAll('.bsim-unit-icons');
    rows.forEach(row => {
      const icons = row.textContent;
      const keep  = Math.max(1, Math.floor(icons.length * (1 - fallPct)));
      // Grey out fallen icons
      row.innerHTML = `<span class="icons-alive">${icons.slice(0, keep)}</span>` +
                      `<span class="icons-dead">${icons.slice(keep)}</span>`;
    });
  },

  _showResult(el, result, onClose) {
    const bottomEl = document.getElementById('bsim-bottom');
    const resultEl = document.getElementById('bsim-result');
    if (!bottomEl || !resultEl) return;

    const rewardStr = Object.entries(result.reward ?? {})
      .map(([r, a]) => `${RESOURCES[r]?.icon ?? r}${a}`)
      .join(' ');

    resultEl.innerHTML = result.won
      ? `<div class="bsim-won">
           <div class="bsim-won-badge">🏆 MENANG!</div>
           <div class="bsim-won-detail">Pasukan kamu: ${result.power?.mine ?? '-'} &gt; Musuh: ${result.power?.enemy ?? '-'}</div>
           <div class="bsim-reward">💰 Reward: ${rewardStr}</div>
         </div>`
      : `<div class="bsim-lost">
           <div class="bsim-lost-badge">💀 KALAH!</div>
           <div class="bsim-lost-detail">Kekuatan musuh terlalu besar. Rekrut lebih banyak pasukan!</div>
           <div class="bsim-lost-tip">💡 Tingkatkan pasukan & upgrade taktik perang</div>
         </div>`;

    // Highlight entire sim result
    el.classList.add(result.won ? 'bsim-victory' : 'bsim-defeat');
    bottomEl.style.display = 'flex';
  },
};
