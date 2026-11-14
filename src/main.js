/**
 * School of Creativity — kinetic typography & motion
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ——— Hero: spherical warp text grid ——— */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let dpr = 1
  let mouse = { x: 0.62, y: 0.38 }
  let target = { x: 0.62, y: 0.38 }
  let t = 0
  let raf = 0

  const words = ['on', 'think', 'create', 'on', 'idea', 'craft']

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
    mouse.x += (target.x - mouse.x) * 0.06
    mouse.y += (target.y - mouse.y) * 0.06

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#c6ff1a'
    ctx.fillRect(0, 0, w, h)

    const cols = Math.ceil(w / 78) + 2
    const rows = Math.ceil(h / 52) + 2
    const cx = mouse.x * w
    const cy = mouse.y * h
    const radius = Math.min(w, h) * 0.42
    const pulse = 1 + Math.sin(t * 1.4) * 0.04

    ctx.fillStyle = '#0c0c0c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${Math.max(18, Math.min(w, h) * 0.045)}px "Archivo Black", sans-serif`

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = (col - 0.5) * 78
        const baseY = (row - 0.5) * 52
        const dx = baseX - cx
        const dy = baseY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - dist / (radius * pulse))
        const bulge = influence * influence * radius * 0.55
        const angle = Math.atan2(dy, dx)
        const x = baseX + Math.cos(angle) * bulge
        const y = baseY + Math.sin(angle) * bulge
        const scale = 1 + influence * 1.35
        const word = words[(row * 3 + col) % words.length]

        ctx.save()
        ctx.translate(x, y)
        ctx.scale(scale, scale * (1 - influence * 0.15))
        ctx.globalAlpha = 0.28 + influence * 0.72
        ctx.fillText(word, 0, 0)
        ctx.restore()
      }
    }

    raf = requestAnimationFrame(draw)
  }

  resize()
  draw()

  window.addEventListener('resize', resize)
  if (!reducedMotion) {
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect()
      target.x = (e.clientX - rect.left) / rect.width
      target.y = (e.clientY - rect.top) / rect.height
    })
  }

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}

/* ——— Wave letter grid ——— */
function initWaveGrid() {
  const grid = document.getElementById('wave-grid')
  if (!grid) return

  const letters = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const frag = document.createDocumentFragment()
  ;[...letters].forEach((ch) => {
    const span = document.createElement('span')
    span.textContent = ch
    frag.appendChild(span)
  })
  grid.appendChild(frag)

  const cells = [...grid.children]
  let raf = 0
  let t = 0

  function tick() {
    t += 0.045
    cells.forEach((cell, i) => {
      const col = i % 12
      const row = Math.floor(i / 12)
      const wave = Math.sin(t + col * 0.45 + row * 0.25)
      const wave2 = Math.cos(t * 0.7 + row * 0.35)
      const scaleX = 0.55 + (wave + 1) * 0.55
      const scaleY = 0.75 + (wave2 + 1) * 0.35
      const skew = wave * 12
      cell.style.transform = `scale(${scaleX}, ${scaleY}) skewX(${skew}deg)`
    })
    raf = requestAnimationFrame(tick)
  }

  if (!reducedMotion) tick()
  else {
    cells.forEach((cell, i) => {
      const col = i % 12
      cell.style.transform = `scale(${0.7 + (col % 5) * 0.12}, 1)`
    })
  }

  return () => cancelAnimationFrame(raf)
}

/* ——— Glitch / slit-scan typography ——— */
function initGlitchCanvas() {
  const canvas = document.getElementById('glitch-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let dpr = 1
  let t = 0
  let raf = 0
  const word = 'BLOOM'

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function drawWord(offsetX = 0, alpha = 1) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#fff8e8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const size = Math.min(w * 0.22, h * 0.42)
    ctx.font = `800 ${size}px "Anybody", "Archivo Black", sans-serif`
    ctx.fillText(word, w / 2 + offsetX, h * 0.42)
    ctx.restore()
  }

  function draw() {
    t += 0.05
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ff4d1a'
    ctx.fillRect(0, 0, w, h)

    // base
    drawWord(0, 1)

    // slit-scan slices
    const slices = 18
    const sliceH = (h * 0.55) / slices
    const startY = h * 0.18

    for (let i = 0; i < slices; i++) {
      const y = startY + i * sliceH
      const wobble =
        Math.sin(t * 2.2 + i * 0.55) * (8 + (i % 4) * 4) +
        Math.sin(t * 5 + i) * 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, y, w, sliceH + 1)
      ctx.clip()
      ctx.clearRect(0, y, w, sliceH + 1)
      ctx.fillStyle = '#ff4d1a'
      ctx.fillRect(0, y, w, sliceH + 1)
      drawWord(wobble, 1)
      ctx.restore()
    }

    // occasional hard glitch bars
    if (Math.sin(t * 3) > 0.92) {
      const gy = h * (0.25 + Math.random() * 0.35)
      ctx.fillStyle = '#0c0c0c'
      ctx.fillRect(0, gy, w, 3 + Math.random() * 8)
    }

    raf = requestAnimationFrame(draw)
  }

  resize()
  if (reducedMotion) {
    ctx.fillStyle = '#ff4d1a'
    ctx.fillRect(0, 0, w, h)
    drawWord(0, 1)
  } else {
    draw()
  }

  window.addEventListener('resize', () => {
    resize()
    if (reducedMotion) {
      ctx.fillStyle = '#ff4d1a'
      ctx.fillRect(0, 0, w, h)
      drawWord(0, 1)
    }
  })

  return () => cancelAnimationFrame(raf)
}

/* ——— Orbit / torus-like kinetic ring of type ——— */
function initOrbitCanvas() {
  const canvas = document.getElementById('orbit-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let dpr = 1
  let t = 0
  let raf = 0
  const phrase = 'ON · CREATE · THINK · CRAFT · '

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    t += 0.012
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2
    const rx = Math.min(w, h) * 0.38
    const ry = Math.min(w, h) * 0.18

    // background eye grid
    ctx.fillStyle = 'rgba(198,255,26,0.12)'
    for (let y = 30; y < h; y += 36) {
      for (let x = 30; x < w; x += 36) {
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = 'rgba(12,12,12,0.85)'
        ctx.arc(x, y, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(198,255,26,0.12)'
      }
    }

    const chars = phrase.repeat(4).split('')
    const n = chars.length

    ctx.font = `800 ${Math.max(14, Math.min(w, h) * 0.035)}px "Archivo Black", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t
      const x = cx + Math.cos(a) * rx
      const y = cy + Math.sin(a) * ry
      const depth = (Math.sin(a) + 1) / 2
      const scale = 0.65 + depth * 0.9

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a + Math.PI / 2)
      ctx.scale(scale, scale)
      ctx.fillStyle = depth > 0.45 ? '#c6ff1a' : 'rgba(198,255,26,0.35)'
      ctx.fillText(chars[i], 0, 0)
      ctx.restore()
    }

    // inner torus hint
    ctx.strokeStyle = 'rgba(255,77,26,0.85)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2)
    ctx.stroke()

    raf = requestAnimationFrame(draw)
  }

  resize()
  if (reducedMotion) {
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(0, 0, w, h)
  } else {
    draw()
  }

  window.addEventListener('resize', resize)
  return () => cancelAnimationFrame(raf)
}

/* ——— Modules accordion ——— */
function initModules() {
  const modules = document.querySelectorAll('[data-module]')
  modules.forEach((mod) => {
    const btn = mod.querySelector('.module__trigger')
    if (!btn) return
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      modules.forEach((other) => {
        other.querySelector('.module__trigger')?.setAttribute('aria-expanded', 'false')
      })
      btn.setAttribute('aria-expanded', open ? 'false' : 'true')
    })
  })
}

/* ——— Count-up facts ——— */
function initCounters() {
  const facts = document.querySelectorAll('.fact__value[data-count]')
  if (!facts.length) return

  const animate = (el) => {
    const target = Number(el.dataset.count)
    const duration = 1200
    const start = performance.now()

    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(target * eased).toLocaleString('nl-BE')
      if (p < 1) requestAnimationFrame(step)
    }

    if (reducedMotion) el.textContent = target.toLocaleString('nl-BE')
    else requestAnimationFrame(step)
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

/* ——— Scroll reveal for displays ——— */
function initReveals() {
  const els = document.querySelectorAll('.display, .why__item, .module, .roles__list li')
  els.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
  })

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'none'
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 5) * 40}ms`
    io.observe(el)
  })
}

initHeroCanvas()
initWaveGrid()
initGlitchCanvas()
initOrbitCanvas()
initModules()
initCounters()
if (!reducedMotion) initReveals()
