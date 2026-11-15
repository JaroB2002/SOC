const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp01 = (n) => Math.min(1, Math.max(0, n))
const lerp = (a, b, t) => a + (b - a) * t
const easeOut = (t) => 1 - (1 - t) ** 2

function sectionProgress(section) {
  const rect = section.getBoundingClientRect()
  const total = Math.max(section.offsetHeight - window.innerHeight, 1)
  return clamp01(-rect.top / total)
}

/* Hero: staggered slam + cursor kinetic + parallax */
function initHero() {
  const hero = document.querySelector('.hero')
  const brand = document.querySelector('[data-kinetic-brand]')
  const img = document.querySelector('[data-hero-img]')
  if (!hero || !brand) return

  const words = [...brand.querySelectorAll('[data-word]')]
  words.forEach((word) => {
    const text = word.textContent
    word.textContent = ''
    ;[...text].forEach((ch) => {
      const span = document.createElement('span')
      span.className = 'hero__letter'
      span.textContent = ch
      word.appendChild(span)
    })
  })

  const letters = [...brand.querySelectorAll('.hero__letter')]

  if (reducedMotion) {
    letters.forEach((l) => l.classList.add('is-in'))
    return
  }

  letters.forEach((letter, i) => {
    letter.style.transitionDelay = `${120 + i * 28}ms`
    requestAnimationFrame(() => letter.classList.add('is-in'))
  })

  let mx = 0.5
  let my = 0.5
  let tx = 0.5
  let ty = 0.5
  let hovering = false
  let scrollP = 0

  const onScroll = () => {
    const rect = hero.getBoundingClientRect()
    scrollP = clamp01(-rect.top / Math.max(rect.height, 1))
  }

  hero.addEventListener('pointerenter', () => {
    hovering = true
  })
  hero.addEventListener('pointermove', (e) => {
    hovering = true
    const r = hero.getBoundingClientRect()
    tx = (e.clientX - r.left) / r.width
    ty = (e.clientY - r.top) / r.height
  })
  hero.addEventListener('pointerleave', () => {
    hovering = false
    tx = 0.5
    ty = 0.5
  })

  const tick = () => {
    mx = lerp(mx, tx, 0.12)
    my = lerp(my, ty, 0.12)

    if (img) {
      const driftX = hovering ? (mx - 0.5) * 24 : 0
      const driftY = hovering ? (my - 0.5) * 16 : 0
      img.style.transform = `translate(${driftX}px, ${driftY + scrollP * 48}px) scale(${1.1 + scrollP * 0.05})`
      img.style.filter = `brightness(${1 - scrollP * 0.22})`
    }

    letters.forEach((letter) => {
      if (!letter.classList.contains('is-in')) return
      if (!hovering) {
        letter.style.transform = ''
        return
      }
      const r = letter.getBoundingClientRect()
      const lx = (r.left + r.width / 2) / window.innerWidth
      const ly = (r.top + r.height / 2) / window.innerHeight
      const dist = Math.hypot(lx - mx, ly - my)
      const force = Math.max(0, 1 - dist * 2.5)
      letter.style.transform = `translate3d(0, ${-force * 20}px, 0) skewX(${(mx - lx) * force * 18}deg) scale(${1 + force * 0.18})`
    })

    requestAnimationFrame(tick)
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  tick()
}

/* Train: pre fades out, MUSCLE scales up to dominate */
function initTrain() {
  const section = document.querySelector('[data-train]')
  const pre = document.querySelector('[data-train-pre]')
  const muscle = document.querySelector('[data-train-muscle]')
  const copy = document.querySelector('[data-train-copy]')
  if (!section || !muscle) return

  if (reducedMotion) return

  const onScroll = () => {
    const p = sectionProgress(section)

    if (pre) {
      const preP = easeOut(clamp01(1 - p / 0.28))
      pre.style.opacity = String(preP)
      pre.style.transform = `translate3d(0, ${-(1 - preP) * 40}px, 0)`
    }

    // Muscle grows through mid scroll
    const grow = easeOut(clamp01((p - 0.08) / 0.55))
    const scale = 0.55 + grow * 1.15
    const x = (1 - grow) * -4
    muscle.style.transform = `translate3d(${x}%, 0, 0) scale(${scale})`
    muscle.style.opacity = String(0.35 + grow * 0.65)

    if (copy) {
      const cp = easeOut(clamp01((p - 0.62) / 0.28))
      copy.style.opacity = String(cp)
      copy.style.transform = `translate3d(0, ${(1 - cp) * 28}px, 0)`
    }
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

/* Year: vertical scroll owns horizontal track */
function initYear() {
  const section = document.querySelector('[data-year]')
  const track = document.querySelector('[data-year-track]')
  const fill = document.querySelector('[data-year-fill]')
  if (!section || !track) return

  if (reducedMotion) return

  const onScroll = () => {
    const p = sectionProgress(section)
    const maxX = Math.max(track.scrollWidth - window.innerWidth + 48, 0)
    track.style.transform = `translate3d(${-maxX * p}px, 0, 0)`
    if (fill) fill.style.width = `${p * 100}%`
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

/* Roles: hotspot follows scroll through list */
function initRoles() {
  const list = document.querySelector('[data-roles-list]')
  const section = document.querySelector('#roles')
  if (!list || !section) return
  const items = [...list.children]
  if (reducedMotion) {
    items.forEach((li) => li.classList.add('is-hot'))
    return
  }

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const view = window.innerHeight
    const mid = view * 0.55
    let best = 0
    let bestDist = Infinity
    items.forEach((li, i) => {
      const r = li.getBoundingClientRect()
      const dist = Math.abs(r.top + r.height / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    // also advance by section progress
    const p = clamp01(1 - (rect.bottom - view * 0.3) / (rect.height + view * 0.4))
    const byProgress = Math.min(items.length - 1, Math.floor(p * items.length))
    const index = Math.abs(rect.top) < view ? best : byProgress
    items.forEach((li, i) => li.classList.toggle('is-hot', i === index))
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function initApply() {
  const el = document.querySelector('[data-apply-count]')
  const section = document.querySelector('#apply')
  if (!el || !section || reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const p = clamp01(1 - rect.top / window.innerHeight)
    el.style.transform = `translate3d(${(1 - p) * 5}%, 0, 0) scale(${0.82 + p * 0.32})`
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
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
      const p = clamp01((now - start) / 1100)
      el.textContent = Math.round(target * easeOut(p)).toLocaleString('nl-BE')
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
  const els = document.querySelectorAll('.display, .module')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 },
  )
  els.forEach((el, i) => {
    el.classList.add('reveal')
    el.style.transitionDelay = `${(i % 5) * 40}ms`
    io.observe(el)
  })
}

initHero()
initTrain()
initYear()
initRoles()
initApply()
initModules()
initCounters()
initReveals()
