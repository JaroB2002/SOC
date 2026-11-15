/**
 * School of Creativity — craft pass
 * Type as image · scroll ownership · real atmosphere
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function lerp(a, b, t) {
  return a + (b - a) * t
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n))
}

/* ——— Hero: parallax media + brand letter kinetic ——— */
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
  if (reducedMotion) return

  let mx = 0.42
  let my = 0.5
  let tx = 0.42
  let ty = 0.5
  let scrollP = 0

  const onScroll = () => {
    const rect = hero.getBoundingClientRect()
    scrollP = clamp01(-rect.top / Math.max(rect.height, 1))
  }

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect()
    tx = (e.clientX - rect.left) / rect.width
    ty = (e.clientY - rect.top) / rect.height
  })
  hero.addEventListener('pointerleave', () => {
    tx = 0.42
    ty = 0.5
  })

  const tick = () => {
    mx = lerp(mx, tx, 0.08)
    my = lerp(my, ty, 0.08)

    if (img) {
      const px = (mx - 0.5) * 18
      const py = (my - 0.5) * 12 + scrollP * 40
      const scale = 1.08 + scrollP * 0.04
      img.style.transform = `translate(${px}px, ${py}px) scale(${scale})`
    }

    letters.forEach((letter) => {
      const r = letter.getBoundingClientRect()
      const lx = (r.left + r.width / 2) / window.innerWidth
      const ly = (r.top + r.height / 2) / window.innerHeight
      const dx = lx - mx
      const dy = ly - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      const force = Math.max(0, 1 - dist * 2.4)
      const skew = (mx - lx) * force * 22
      const lift = -force * 22
      const scale = 1 + force * 0.22
      letter.style.transform = `translate3d(0, ${lift}px, 0) skewX(${skew}deg) scale(${scale})`
    })

    requestAnimationFrame(tick)
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  tick()
}

/* ——— Train scroll ownership ——— */
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
    const p = clamp01((-rect.top) / Math.max(total, 1))

    spans.forEach((span, i) => {
      const local = clamp01((p - i * 0.14) / 0.32)
      const eased = 1 - (1 - local) ** 2
      span.style.opacity = String(0.12 + eased * 0.88)
      span.style.transform = `translate3d(0, ${(1 - eased) * 48}px, 0)`
      span.style.letterSpacing = `${-0.04 + (1 - eased) * 0.1}em`
    })

    if (copy) {
      const cp = clamp01((p - 0.48) / 0.32)
      const eased = 1 - (1 - cp) ** 2
      copy.style.opacity = String(eased)
      copy.style.transform = `translate3d(0, ${(1 - eased) * 24}px, 0)`
    }
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

/* ——— Year path with morph ——— */
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
  const morph = document.querySelector('[data-year-morph]')
  const stageEl = document.querySelector('[data-year-stage]')
  const titleEl = document.querySelector('[data-year-title]')
  const bodyEl = document.querySelector('[data-year-body]')
  const dots = [...document.querySelectorAll('[data-year-dot]')]
  const photos = [...document.querySelectorAll('[data-year-photo]')]
  if (!section || !stageEl || !titleEl || !bodyEl) return

  let current = 0
  let pending = null
  let animating = false

  const paint = (index) => {
    const beat = YEAR_BEATS[index]
    stageEl.textContent = beat.stage
    titleEl.innerHTML = beat.title
    bodyEl.textContent = beat.body
    dots.forEach((d, i) => d.classList.toggle('is-on', i === index))
    photos.forEach((p, i) => p.classList.toggle('is-on', i === index))
  }

  const showResting = () => {
    if (!morph) return
    morph.classList.remove('is-leaving', 'is-entering')
    ;[stageEl, titleEl, bodyEl].forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
  }

  const goTo = (index) => {
    if (index === current) return
    if (animating) {
      pending = index
      return
    }
    if (reducedMotion || !morph) {
      current = index
      paint(index)
      showResting()
      return
    }

    animating = true
    morph.classList.remove('is-entering')
    morph.classList.add('is-leaving')
    photos.forEach((p, i) => p.classList.toggle('is-on', i === index))

    window.setTimeout(() => {
      current = index
      paint(index)
      morph.classList.remove('is-leaving')
      morph.classList.add('is-entering')
      void morph.offsetWidth
      requestAnimationFrame(() => {
        morph.classList.remove('is-entering')
        showResting()
        animating = false
        if (pending !== null && pending !== current) {
          const next = pending
          pending = null
          goTo(next)
        } else {
          pending = null
        }
      })
    }, 320)
  }

  paint(0)
  showResting()

  if (reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const total = section.offsetHeight - window.innerHeight
    const p = clamp01((-rect.top) / Math.max(total, 1))
    const index = Math.min(YEAR_BEATS.length - 1, Math.floor(p * (YEAR_BEATS.length - 0.001)))
    goTo(index)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

function initRolesRail() {
  const rail = document.querySelector('[data-roles-rail]')
  const section = document.querySelector('#roles')
  if (!rail || !section || reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const view = window.innerHeight
    const p = 1 - clamp01(rect.bottom / (view + rect.height))
    rail.style.transform = `translate3d(${-p * 35}%, 0, 0)`
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function initApplyCount() {
  const el = document.querySelector('[data-apply-count]')
  const section = document.querySelector('#apply')
  if (!el || !section || reducedMotion) return

  const onScroll = () => {
    const rect = section.getBoundingClientRect()
    const view = window.innerHeight
    const p = clamp01(1 - rect.top / view)
    el.style.transform = `translate3d(${(1 - p) * 4}%, 0, 0) scale(${0.85 + p * 0.28})`
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
      const p = clamp01((now - start) / 1200)
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

initHero()
initTrain()
initYear()
initRolesRail()
initApplyCount()
initModules()
initCounters()
initReveals()
