// ═══════════════════════════════════════════════════════════════
//  INDOFARM ADVENTURE — Lobby Manager
//  Flow: Splash → Login (Google) → Character Select → Game
// ═══════════════════════════════════════════════════════════════

import { FirebaseService } from './firebase.js';
import { HEROES }          from './data.js';

export class LobbyManager {
  constructor(onComplete) {
    this.onComplete = onComplete; // onComplete({ heroId, user })
    this.el         = null;
    this._authUnsub = null;
  }

  show() {
    this._build();
    this._showSplash();
  }

  // ── DOM Build ─────────────────────────────────────────────────
  _build() {
    const el = document.createElement('div');
    el.id = 'lobby-overlay';
    el.innerHTML = `
      <!-- ══ SPLASH ══ -->
      <div id="lscr-splash" class="lscr active">
        <div class="splash-bg">
          <div class="splash-stars" id="splash-stars"></div>
        </div>
        <div class="splash-center">
          <div class="splash-castle">🏰</div>
          <div class="splash-brand">INDOFARM</div>
          <div class="splash-brandtwo">ADVENTURE</div>
          <div class="splash-genre">✦ Idle Farm RPG Medieval ✦</div>
          <div class="splash-loadbar">
            <div class="splash-loadfill" id="splash-fill"></div>
          </div>
          <div class="splash-loadtxt" id="splash-txt">Memuat dunia...</div>
        </div>
        <div class="splash-particles" id="splash-parts"></div>
      </div>

      <!-- ══ LOGIN ══ -->
      <div id="lscr-login" class="lscr">
        <div class="login-bg"></div>
        <div class="login-wrap">
          <div class="login-logo-block">
            <div class="login-castle-big">🏰</div>
            <h1 class="login-h1">INDOFARM ADVENTURE</h1>
            <p class="login-genre">Idle Farm · RPG · Medieval</p>
          </div>
          <div class="login-card">
            <h2 class="login-card-h2">Mulai Petualangan</h2>
            <p class="login-card-p">Login untuk simpan progres ke cloud dan bermain di semua perangkat.</p>
            <button class="btn-login-google" id="btn-glogin">
              <span class="glogin-icon-wrap">
                <svg class="glogin-g" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              </span>
              <span class="glogin-label">Sign in with Google</span>
            </button>
            <div class="login-or"><span>atau</span></div>
            <button class="btn-login-guest" id="btn-guest">
              🎮 Main Tanpa Akun
            </button>
            <p class="login-note">Mode tamu: progres tersimpan hanya di perangkat ini</p>
            <div class="login-err" id="login-err" style="display:none"></div>
          </div>
        </div>
      </div>

      <!-- ══ CHARACTER SELECT ══ -->
      <div id="lscr-chars" class="lscr">
        <div class="cs-bg"></div>
        <div class="cs-wrap">
          <div class="cs-header">
            <div class="cs-user-bar" id="cs-user"></div>
            <h1 class="cs-h1">⚔️ Pilih Tokoh Utama</h1>
            <p class="cs-sub">Karakter ini menjadi pemimpin & tokoh yang bisa kamu kendalikan dalam game</p>
          </div>
          <div class="cs-grid" id="cs-grid"></div>
          <div class="cs-bottom">
            <div class="cs-hint" id="cs-hint">Pilih salah satu karakter di atas</div>
            <button class="cs-start-btn" id="cs-start" disabled>
              🚀 Mulai Petualangan!
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    this.el = el;

    this._spawnStars();
    this._spawnParticles();
  }

  _spawnStars() {
    const c = document.getElementById('splash-stars');
    if (!c) return;
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;
        animation-delay:${Math.random()*3}s;opacity:${0.4+Math.random()*0.6}`;
      c.appendChild(s);
    }
  }

  _spawnParticles() {
    const c = document.getElementById('splash-parts');
    if (!c) return;
    const icons = ['🌾','⚔️','💎','🏰','🔮','🪓','🏹','💰','🛡️','🗡️'];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'lobby-particle';
      p.textContent = icons[i % icons.length];
      p.style.cssText = `left:${Math.random()*100}%;
        animation-delay:${Math.random()*6}s;
        animation-duration:${6+Math.random()*6}s;
        font-size:${1+Math.random()*1.2}rem`;
      c.appendChild(p);
    }
  }

  // ── Splash Loading Animation ──────────────────────────────────
  _showSplash() {
    const fill = document.getElementById('splash-fill');
    const txt  = document.getElementById('splash-txt');
    const steps = [
      [15,  'Memuat asset...'],
      [40,  'Menyiapkan dunia 3D...'],
      [65,  'Memuat karakter pahlawan...'],
      [85,  'Memeriksa akun...'],
      [100, 'Siap bertualang! 🚀'],
    ];
    let pct = 0, si = 0;
    const iv = setInterval(() => {
      pct = Math.min(pct + 1.5, 100);
      if (fill) fill.style.width = pct + '%';
      while (si < steps.length && pct >= steps[si][0]) {
        if (txt) txt.textContent = steps[si][1];
        si++;
      }
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(() => this._afterSplash(), 800);
      }
    }, 25);
  }

  async _afterSplash() {
    if (FirebaseService.isConfigured) {
      this._authUnsub = FirebaseService.onAuthChange((user) => {
        if (user) {
          this._goCharSelect(user);
        } else {
          this._goLogin();
        }
      });
    } else {
      // Firebase belum dikonfigurasi — langsung ke char select
      this._goCharSelect(null);
    }
  }

  // ── Login Screen ──────────────────────────────────────────────
  _goLogin() {
    this._switch('lscr-login');

    const _googleBtnHTML = () => `
      <span class="glogin-icon-wrap">
        <svg class="glogin-g" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
      </span>
      <span class="glogin-label">Sign in with Google</span>`;

    document.getElementById('btn-glogin')?.addEventListener('click', async () => {
      const btn   = document.getElementById('btn-glogin');
      const errEl = document.getElementById('login-err');
      if (errEl) errEl.style.display = 'none';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="glogin-icon-wrap"><svg class="glogin-g" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg></span><span class="glogin-label">⏳ Masuk...</span>`;
      }
      const r = await FirebaseService.signInWithGoogle();
      if (r.ok) {
        this._goCharSelect(r.user);
      } else {
        if (errEl) { errEl.textContent = '⚠️ ' + r.msg; errEl.style.display = 'block'; }
        if (btn)   { btn.disabled = false; btn.innerHTML = _googleBtnHTML(); }
      }
    });

    document.getElementById('btn-guest')?.addEventListener('click', () => {
      this._goCharSelect(null);
    });
  }

  // ── Character Select ──────────────────────────────────────────
  _goCharSelect(user) {
    this._switch('lscr-chars');

    // User info bar
    const userEl = document.getElementById('cs-user');
    if (userEl) {
      userEl.innerHTML = user
        ? `<img src="${user.photoURL||''}" class="cs-avatar" onerror="this.style.display='none'">
           <span class="cs-uname">${user.displayName || user.email || 'Petualang'}</span>
           <button class="cs-signout-btn" id="cs-signout">🔄 Ganti Akun</button>`
        : `<span class="cs-guest-badge">🎮 Mode Tamu</span>`;
      document.getElementById('cs-signout')?.addEventListener('click', async () => {
        if (this._authUnsub) { this._authUnsub(); this._authUnsub = null; }
        await FirebaseService.signOut();
        this._goLogin();
      });
    }

    // Build character cards
    const grid = document.getElementById('cs-grid');
    if (!grid) return;
    let selected = null;

    grid.innerHTML = Object.entries(HEROES).map(([id, h]) => `
      <div class="cs-card${h.unlocked ? '' : ' cs-locked'}" data-cid="${id}">
        <div class="cs-model-wrap">
          <div class="cs-hero-art" role="img" aria-label="${h.name}">${h.icon}</div>
        </div>
        <div class="cs-info">
          <div class="cs-hero-name">${h.icon} ${h.name}</div>
          <div class="cs-hero-title">${h.title}</div>
          <div class="cs-hero-stats">
            <span class="cs-stat cs-atk">⚔️${h.atk}</span>
            <span class="cs-stat cs-def">🛡️${h.def}</span>
            <span class="cs-stat cs-hp">❤️${h.hp}</span>
          </div>
          <div class="cs-hero-desc">${h.description}</div>
          ${!h.unlocked
            ? `<div class="cs-lock-tag">🔒 Butuh 💎${h.unlockCost?.gem ?? '?'} Permata</div>`
            : ''}
        </div>
        ${!h.unlocked ? '<div class="cs-lock-veil"><span>🔒</span></div>' : ''}
      </div>
    `).join('');

    grid.querySelectorAll('.cs-card:not(.cs-locked)').forEach(card => {
      card.addEventListener('click', () => {
        selected = card.dataset.cid;
        grid.querySelectorAll('.cs-card').forEach(c => c.classList.remove('cs-selected'));
        card.classList.add('cs-selected');
        const startBtn = document.getElementById('cs-start');
        const hint     = document.getElementById('cs-hint');
        const heroDef  = HEROES[selected];
        if (startBtn) startBtn.disabled = false;
        if (hint && heroDef) hint.textContent = `${heroDef.icon} ${heroDef.name} dipilih — ${heroDef.description}`;
      });
    });

    document.getElementById('cs-start')?.addEventListener('click', () => {
      if (!selected) return;
      this._launch(selected, user);
    });
  }

  _switch(id) {
    this.el?.querySelectorAll('.lscr').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  }

  _launch(heroId, user) {
    if (this._authUnsub) { this._authUnsub(); this._authUnsub = null; }
    const overlay = this.el;
    if (overlay) {
      overlay.style.transition = 'opacity 0.7s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        this.el = null;
        this.onComplete({ heroId, user });
      }, 700);
    } else {
      this.onComplete({ heroId, user });
    }
  }
}
