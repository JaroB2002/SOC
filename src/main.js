/**
 * School of Creativity — kinetic typography & motion
 * Dense ON-sphere, wave canvas, slit-scan, orbit torus.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const LIME = '#c8ff00'
const INK = '#0a0a0a'
const ORANGE = '#ff3b00'
const COBALT = '#1b3cff'

async function whenFontsReady() {
  try {
    await document.fonts.load('800 48px "Archivo Black"')
    await document.fonts.load('800 48px Anybody')
    await document.fonts.ready
  } catch {
    /* fallback system font */
  }
}

/* ——— Hero: dense "on" spherical warp (inspiration panel 1) ——— */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const hero = canvas.closest('.hero')
  let w = 0
  let h = 0
  let dpr = 1
  let mouse = { x: 0.68, y: 0.42 }
  let target = { x: 0.68, y: 0.42 }
  let t = 0
  let raf = 0
  let hovering = false

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    t += 0.016

    if (!hovering && !reducedMotion) {
      target.x = 0.62 + Math.sin(t * 0.45) * 0.18
      target.y = 0.4 + Math.cos(t * 0.35) * 0.14
    }

    mouse.x += (target.x - mouse.x) * 0.085
    mouse.y += (target.y - mouse.y) * 0.085

    ctx.fillStyle = LIME
    ctx.fillRect(0, 0, w, h)

    // Reference-style spherize: flat dense "on" grid + convex bulge.
    // Letters push outward and grow toward the lens center — stay sharp.
    const cellX = Math.max(48, Math.min(w, h) * 0.055)
    const cellY = Math.max(40, Math.min(w, h) * 0.046)
    const cols = Math.ceil(w / cellX) + 2
    const rows = Math.ceil(h / cellY) + 2
    const cx = mouse.x * w
    const cy = mouse.y * h
    const radius = Math.min(w, h) * 0.38
    const fontSize = Math.min(cellX, cellY) * 0.72

    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${fontSize}px "Archivo Black", sans-serif`
    ctx.globalAlpha = 1

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = col * cellX + cellX * 0.5
        const baseY = row * cellY + cellY * 0.5
        const dx = baseX - cx
        const dy = baseY - cy
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001
        const n = Math.min(1, dist / radius)

        // Spherize: map onto sphere, project back (Photoshop-style)
        const theta = n * Math.PI * 0.5
        const spherize = n === 0 ? 0 : Math.sin(theta) / n
        const bulge = 1 + (spherize - 1) * 0.85
        const x = cx + dx * bulge
        const y = cy + dy * bulge
        const scale = 1 + (1 - n) * (1 - n) * 0.85

        ctx.save()
        ctx.translate(x, y)
        ctx.scale(scale, scale * (0.92 + n * 0.08))
        ctx.fillText('on', 0, 0)
        ctx.restore()
      }
    }

    raf = requestAnimationFrame(draw)
  }

  resize()
  draw()
  window.addEventListener('resize', resize)

  if (!reducedMotion && hero) {
    hero.addEventListener('pointerenter', () => {
      hovering = true
    })
    hero.addEventListener('pointerleave', () => {
      hovering = false
    })
    hero.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect()
      target.x = (e.clientX - rect.left) / rect.width
      target.y = (e.clientY - rect.top) / rect.height
    })
  }
}

/* ——— Wave canvas: dense "a" fluid grid (inspiration panel 2) ——— */
function initWaveCanvas() {
  const canvas = document.getElementById('wave-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const wrap = canvas.parentElement
  let w = 0
  let h = 0
  let dpr = 1
  let t = 0
  let raf = 0
  let mouse = { x: 0.5, y: 0.5 }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth || wrap.clientWidth
    h = canvas.clientHeight || wrap.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    t += 0.04
    ctx.fillStyle = COBALT
    ctx.fillRect(0, 0, w, h)

    const cols = 16
    const rows = 12
    const gapX = w / (cols - 1)
    const gapY = h / (rows - 1)
    const base = Math.min(gapX, gapY) * 0.7

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${base}px "Archivo Black", sans-serif`

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = col / (cols - 1)
        const ny = row / (rows - 1)
        const wave =
          Math.sin(t + col * 0.55 + row * 0.2) * 0.55 +
          Math.cos(t * 0.7 + row * 0.4) * 0.35
        const mx = (nx - mouse.x) * 2.2
        const my = (ny - mouse.y) * 2.2
        const mDist = Math.min(1, Math.sqrt(mx * mx + my * my))
        const push = (1 - mDist) * 28

        const x = col * gapX + Math.sin(t + row * 0.35) * (10 + wave * 18) + mx * push
        const y = row * gapY + Math.cos(t * 0.8 + col * 0.25) * (4 + wave * 8) + my * push * 0.4
        const scaleX = 0.45 + (wave + 1) * 0.65
        const scaleY = 0.7 + (1 - Math.abs(wave)) * 0.55
        const skew = wave * 18

        ctx.save()
        ctx.translate(x, y)
        ctx.transform(scaleX, 0, Math.tan((skew * Math.PI) / 180), scaleY, 0, 0)
        ctx.globalAlpha = 0.75 + wave * 0.2
        ctx.fillText('a', 0, 0)
        ctx.restore()
      }
    }

    raf = requestAnimationFrame(draw)
  }

  resize()
  if (reducedMotion) {
    ctx.fillStyle = COBALT
    ctx.fillRect(0, 0, w, h)
  } else {
    draw()
  }

  window.addEventListener('resize', resize)
  if (wrap && !reducedMotion) {
    wrap.addEventListener('pointermove', (e) => {
      const rect = wrap.getBoundingClientRect()
      mouse.x = (e.clientX - rect.left) / rect.width
      mouse.y = (e.clientY - rect.top) / rect.height
    })
  }
}

/* ——— Glitch / slit-scan "BLOOM" (inspiration panel 4) ——— */
function initGlitchCanvas() {
  const canvas = document.getElementById('glitch-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let dpr = 1
  let t = 0
  let raf = 0
  let mouseX = 0.5
  const word = 'BLOOM'

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function paintWord(offsetX, fill) {
    ctx.fillStyle = fill
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const size = Math.min(w * 0.28, h * 0.5)
    ctx.font = `800 ${size}px Anybody, "Archivo Black", sans-serif`
    ctx.fillText(word, w / 2 + offsetX, h * 0.4)
  }

  function draw() {
    t += 0.055
    ctx.fillStyle = ORANGE
    ctx.fillRect(0, 0, w, h)

    const slices = 28
    const band = h * 0.58
    const startY = h * 0.12
    const sliceH = band / slices
    const intensity = 10 + Math.abs(mouseX - 0.5) * 40

    for (let i = 0; i < slices; i++) {
      const y = startY + i * sliceH
      const wobble =
        Math.sin(t * 2.4 + i * 0.65) * intensity +
        Math.sin(t * 6.5 + i * 1.7) * (intensity * 0.25) +
        ((i % 5) - 2) * 2

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, y, w, sliceH + 1.5)
      ctx.clip()
      ctx.fillStyle = ORANGE
      ctx.fillRect(0, y, w, sliceH + 1.5)
      paintWord(wobble, '#fff8e8')
      ctx.restore()
    }

    // hard sync bars
    if (Math.sin(t * 4.2) > 0.88) {
      const gy = startY + Math.random() * band
      ctx.fillStyle = INK
      ctx.globalAlpha = 0.85
      ctx.fillRect(0, gy, w, 2 + Math.random() * 10)
      ctx.globalAlpha = 1
    }

    // RGB split flash
    if (Math.sin(t * 2.1) > 0.93) {
      ctx.globalCompositeOperation = 'screen'
      paintWord(-8, 'rgba(0,80,255,0.35)')
      paintWord(8, 'rgba(255,0,60,0.3)')
      ctx.globalCompositeOperation = 'source-over'
    }

    raf = requestAnimationFrame(draw)
  }

  resize()
  if (reducedMotion) {
    ctx.fillStyle = ORANGE
    ctx.fillRect(0, 0, w, h)
    paintWord(0, '#fff8e8')
  } else {
    draw()
  }

  window.addEventListener('resize', () => {
    resize()
    if (reducedMotion) {
      ctx.fillStyle = ORANGE
      ctx.fillRect(0, 0, w, h)
      paintWord(0, '#fff8e8')
    }
  })

  const section = canvas.closest('.statement')
  if (section && !reducedMotion) {
    section.addEventListener('pointermove', (e) => {
      const rect = section.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) / rect.width
    })
  }
}

/* ——— Orbit: torus-like type ring on eye grid (inspiration panel 3) ——— */
function initOrbitCanvas() {
  const canvas = document.getElementById('orbit-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let dpr = 1
  let t = 0
  let raf = 0
  const phrase = 'on create think craft idea · '

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    t += 0.014
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2

    // eye / circle grid background
    const step = 34
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.arc(x, y, 11, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = INK
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // textured torus band
    const rx = Math.min(w, h) * 0.36
    const ry = Math.min(w, h) * 0.16
    const chars = phrase.repeat(6).split('')
    const n = chars.length

    ctx.font = `800 ${Math.max(13, Math.min(w, h) * 0.032)}px "Archivo Black", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // draw back half then front half for depth
    const items = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t
      items.push({
        char: chars[i],
        a,
        x: cx + Math.cos(a) * rx,
        y: cy + Math.sin(a) * ry,
        depth: Math.sin(a),
      })
    }
    items.sort((a, b) => a.depth - b.depth)

    for (const item of items) {
      const depth = (item.depth + 1) / 2
      const scale = 0.55 + depth * 1.05
      ctx.save()
      ctx.translate(item.x, item.y)
      ctx.rotate(item.a + Math.PI / 2)
      ctx.scale(scale, scale)
      ctx.fillStyle = depth > 0.5 ? LIME : 'rgba(200,255,0,0.35)'
      ctx.fillText(item.char, 0, 0)
      ctx.restore()
    }

    // orange torus outline
    ctx.strokeStyle = ORANGE
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 0.62, ry * 0.62, t * 0.2, 0, Math.PI * 2)
    ctx.stroke()

    raf = requestAnimationFrame(draw)
  }

  resize()
  if (!reducedMotion) draw()
  else {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)
  }
  window.addEventListener('resize', resize)
}

function initModules() {
  document.querySelectorAll('[data-module]').forEach((mod) => {
    const btn = mod.querySelector('.module__trigger')
    if (!btn) return
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      document.querySelectorAll('[data-module] .module__trigger').forEach((b) => {
        b.setAttribute('aria-expanded', 'false')
      })
      btn.setAttribute('aria-expanded', open ? 'false' : 'true')
    })
  })
}

function initCounters() {
  const facts = document.querySelectorAll('.fact__value[data-count]')
  const animate = (el) => {
    const target = Number(el.dataset.count)
    if (reducedMotion) {
      el.textContent = target.toLocaleString('nl-BE')
      return
    }
    const start = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - start) / 1200)
      el.textContent = Math.round(target * (1 - (1 - p) ** 3)).toLocaleString('nl-BE')
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target)
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 },
  )
  facts.forEach((el) => io.observe(el))
}

function initReveals() {
  if (reducedMotion) return
  const els = document.querySelectorAll('.display, .why__item, .module, .roles__list li')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
  )
  els.forEach((el, i) => {
    el.classList.add('reveal')
    el.style.transitionDelay = `${(i % 6) * 40}ms`
    io.observe(el)
  })
}

whenFontsReady().then(() => {
  initHeroCanvas()
  initWaveCanvas()
  initGlitchCanvas()
  initOrbitCanvas()
  initModules()
  initCounters()
  initReveals()
})
