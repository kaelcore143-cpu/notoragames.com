// Enhanced neon cursor with long trail
const cursor = document.getElementById('cursor');
const TRAIL_LENGTH = 18;
const trailColors = ['#FFE600','#FFD000','#FFB300','#FF9500','#FF6B00','#FF4500','#FF2D78','#E0206A','#C0185C','#A0104E','#800840','#600030','#400020','#300018','#200010','#150008','#0D0004','#080002'];

const dots = [];
for (let i = 0; i < TRAIL_LENGTH; i++) {
  const d = document.createElement('div');
  d.className = 'trail-dot';
  const t = i / TRAIL_LENGTH;
  const size = Math.round(6 * (1 - t * 0.75));
  d.style.width = size + 'px';
  d.style.height = size + 'px';
  d.style.background = trailColors[i] || '#080002';
  d.style.opacity = (1 - t * 0.85).toFixed(2);
  d.style.filter = i < 6 ? `drop-shadow(0 0 ${4 - i*0.5}px ${trailColors[i]})` : 'none';
  document.body.appendChild(d);
  dots.push({ el: d, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;
const positions = Array(TRAIL_LENGTH).fill({ x: 0, y: 0 });

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateTrail() {
  positions.unshift({ x: mouseX, y: mouseY });
  if (positions.length > TRAIL_LENGTH + 1) positions.pop();
  dots.forEach((dot, i) => {
    const pos = positions[Math.min(i + 1, positions.length - 1)];
    dot.el.style.left = pos.x + 'px';
    dot.el.style.top = pos.y + 'px';
  });
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

// Floating pixels
const colors = ['#FFE600','#FF2D78','#00F5FF','#FF6B00'];
for (let i = 0; i < 20; i++) {
  const px = document.createElement('div');
  px.className = 'pixel';
  px.style.left = Math.random() * 100 + 'vw';
  px.style.background = colors[Math.floor(Math.random() * colors.length)];
  px.style.animationDuration = (8 + Math.random() * 15) + 's';
  px.style.animationDelay = (Math.random() * 10) + 's';
  document.body.appendChild(px);
}

// Animate stats on scroll
const statNums = document.querySelectorAll('.stat-num');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.textContent);
      const suffix = el.textContent.replace(/[0-9]/g,'');
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => observer.observe(el));

// ===== GAME MODAL =====
const modal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const gameSplash = document.getElementById('gameSplash');

function openGame() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeGame() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // Stop game when closing
  gameFrame.src = '';
  gameFrame.style.display = 'none';
  gameSplash.classList.remove('hidden');
}

function startGame() {
  // Point to your GDevelop exported game folder
  // When you deploy, change this path to where your game files live
  gameFrame.src = 'ppt-game/index.html';
  gameFrame.style.display = 'block';
  gameSplash.classList.add('hidden');

  // Simulate score updating (replace with real score from GDevelop via postMessage)
  let score = 0;
  const scoreEl = document.getElementById('modalScore');
  const scoreInterval = setInterval(() => {
    if (!modal.classList.contains('active')) { clearInterval(scoreInterval); return; }
  }, 1000);
}

function toggleFullscreen() {
  const gameArea = document.getElementById('gameArea');
  if (!document.fullscreenElement) {
    gameArea.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Close modal clicking outside
modal.addEventListener('click', e => {
  if (e.target === modal) closeGame();
});

// ESC key closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeGame();
});

// Listen for score from GDevelop via postMessage
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'NOTORA_SCORE') {
    const scoreEl = document.getElementById('modalScore');
    const val = String(e.data.score).padStart(6, '0');
    scoreEl.textContent = 'SCORE: ' + val;
  }
});