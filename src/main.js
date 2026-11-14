/**
 * School of Creativity — purposeful kinetic motion
 * Principles: type as image · scroll ownership · motion serves story
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ——— Hero: brand letters react to cursor (type as image) ——— */
function initHeroBrand() {
  const brand = document.querySelector('[data-kinetic-brand]')
  const hero = document.querySelector('.hero')
  if (!brand || !hero) return

  const words = [...brand.querySelectorAll('[data-word]')]
  // Split each word into letter spans for proximity reaction
  words.forEach((word) => {
    const text = word.textContent
    word.textContent = ''
    ;[...text].forEach((ch) => {
      const span = document.createElement('span')
      span.className = 'hero__letter'
      span.textContent = ch
      span.style.display = 'inline-block'
      span.style.willChange = 'transform'
      word.appendChild(span)
    })
  })

  const letters = [...brand.querySelectorAll('.hero__letter')]

  if (reducedMotion) return

  let mx = 0.5
  let my = 0.5
  let raf = 0

  const tick = () => {
    letters.forEach((letter) => {
      const r = letter.getBoundingClientRect()
      const lx = (r.left + r.width / 2) / window.innerWidth
      const ly = (r.top + r.height / 2) / window.innerHeight
      const dx = lx - mx
      const dy = ly - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      const force = Math.max(0, 1 - dist * 2.2)
      const skew = (mx - lx) * force * 18
      const lift = -force * 18
      const scale = 1 + force * 0.18
      letter.style.transform = `translateY(${lift}px) skewX(${skew}deg) scale(${scale})`
    })
    raf = requestAnimationFrame(tick)
  }

  hero.addEventListener('pointermove', (e) => {
    mx = e.clientX / window.innerWidth
    my = e.clientY / window.innerHeight
  })

  hero.addEventListener('pointerleave', () => {
    mx = 0.5
    my = 0.45
  })

  tick()
  return () => cancelAnimationFrame(raf)
}

/* ——— Train: scroll owns the manifesto type ——— */
function initTrain() {
  const section = document.querySelector('[data-train]')
  const line = document.querySelector('[data-train-line]')
  const copy = document.querySelector('[data-train-copy]')
  if (!section || !line) return

  const spans = [...line.children]
  if (reducedMotion) {
    if (copy) {
      copy.style.opacity = '1'
      copy.style.transform = 'none'
    }
    return
  }

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const total = section.offsetHeight - window.innerHeight
    const scrolled = Math.min(Math.max(-rect.top, 0), total)
    const p = total > 0 ? scrolled / total : 0

    spans.forEach((span, i) => {
      const local = Math.min(1, Math.max(0, (p - i * 0.12) / 0.35))
      const y = (1 - local) * 40
      const op = 0.15 + local * 0.85
      const track = (1 - local) * 0.08
      span.style.opacity = String(op)
      span.style.transform = `translateY(${y}px)`
      span.style.letterSpacing = `${-0.04 + track}em`
    })

    if (copy) {
      const cp = Math.min(1, Math.max(0, (p - 0.45) / 0.35))
      copy.style.opacity = String(cp)
      copy.style.transform = `translateY(${(1 - cp) * 20}px)`
    }
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

/* ——— Year path: scroll-owned year story ——— */
const YEAR_BEATS = [
  {
    stage: '01 · Theory',
    title: 'You don’t learn creativity.<br />You become it.',
    body: 'Zes weken fundament: technieken, immersie in sterk werk, echte client briefings.',
  },
  {
    stage: '02 · Practice',
    title: 'We build a studio.<br />You build a portfolio.',
    body: 'Twaalf weken creative studio: briefings, spark days, weekly review op idea én craft.',
  },
  {
    stage: '03 · Drills',
    title: 'Real agencies.<br />Real Creative Directors.',
    body: 'Zes weken, zes Belgische agencies. Echte briefing, echte client, echte feedback.',
  },
  {
    stage: '04 · Internship',
    title: 'Ten weeks inside<br />the industry.',
    body: 'Stage bij Belgium’s creative agencies. Directors en seniors coachen je portfolio.',
  },
  {
    stage: '05 · Graduation',
    title: 'Your work on stage.<br />Graduation Night.',
    body: 'Een jury van professionals beoordeelt je portfolio — en viert het in de spotlight.',
  },
]

function initYear() {
  const section = document.querySelector('[data-year]')
  const stageEl = document.querySelector('[data-year-stage]')
  const titleEl = document.querySelector('[data-year-title]')
  const bodyEl = document.querySelector('[data-year-body]')
  const dots = [...document.querySelectorAll('[data-year-dot]')]
  if (!section || !stageEl || !titleEl || !bodyEl) return

  let current = 0

  const applyBeat = (index, animate) => {
    const beat = YEAR_BEATS[index]
    if (!beat) return
    current = index
    stageEl.textContent = beat.stage
    titleEl.innerHTML = beat.title
    bodyEl.textContent = beat.body
    dots.forEach((d, i) => d.classList.toggle('is-on', i === index))

    if (animate && !reducedMotion) {
      titleEl.style.opacity = '0'
      titleEl.style.transform = 'translateY(18px)'
      bodyEl.style.opacity = '0'
      requestAnimationFrame(() => {
        titleEl.style.opacity = '1'
        titleEl.style.transform = 'none'
        bodyEl.style.opacity = '1'
      })
    }
  }

  applyBeat(0, false)

  if (reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const total = section.offsetHeight - window.innerHeight
    const scrolled = Math.min(Math.max(-rect.top, 0), total)
    const p = total > 0 ? scrolled / total : 0
    const index = Math.min(YEAR_BEATS.length - 1, Math.floor(p * YEAR_BEATS.length))
    if (index !== current) applyBeat(index, true)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

/* ——— Roles: giant type rail tied to scroll ——— */
function initRolesRail() {
  const rail = document.querySelector('[data-roles-rail]')
  const section = document.querySelector('#roles')
  if (!rail || !section || reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const view = window.innerHeight
    const p = 1 - Math.min(1, Math.max(0, rect.bottom / (view + rect.height)))
    rail.style.transform = `translateX(${-p * 35}%)`
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

/* ——— Apply: giant 24 reacts to scroll ——— */
function initApplyCount() {
  const el = document.querySelector('[data-apply-count]')
  const section = document.querySelector('#apply')
  if (!el || !section || reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const view = window.innerHeight
    const p = Math.min(1, Math.max(0, 1 - rect.top / view))
    const scale = 0.85 + p * 0.25
    const x = (1 - p) * 4
    el.style.transform = `translateX(${x}%) scale(${scale})`
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
  const els = document.querySelectorAll('.display, .why__item, .module')
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

initHeroBrand()
initTrain()
initYear()
initRolesRail()
initApplyCount()
initModules()
initCounters()
initReveals()
