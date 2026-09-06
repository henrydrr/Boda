import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient.js';
import './InvitationAnimated.css';

import foto01 from './scene-01-hero-castillo.jpg';
import foto02 from './scene-02-paseo.jpg';
import foto03 from './scene-03-propuesta.jpg';
import foto04 from './scene-04-pregunta.webp';
import foto05 from './scene-05-anillo.webp';
import foto06 from './scene-06-promesa.webp';
import foto07 from './scene-07-dijesi.webp';
import foto08 from './scene-08-beso.jpg';
import foto09 from './scene-09-detalles.jpg';
import foto10 from './scene-10-footer.webp';
import sobreImg from './sobre.webp';
import cancionMp3 from './cancion.mp3';

const BODA_FECHA = new Date('2027-01-09T13:30:00-06:00').getTime();

export default function Invitation() {
  const { slug } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState('');

  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const audioRef = useRef(null);
  const audioStartedRef = useRef(false);
  const mutedRef = useRef(false);
  const openedRef = useRef(false);
  const motionDoneRef = useRef(false);

  // Cargar datos del invitado
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('invitados')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setGuest(data);
        setCantidad(data.cupo);
        if (data.rsvp_estado && data.rsvp_estado !== 'pendiente') {
          setDone(true);
          setChoice(data.rsvp_estado);
        }
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Countdown — actualiza directamente el DOM (fuera del ciclo de React,
  // igual que el original) para no re-renderizar todo el árbol cada segundo.
  useEffect(() => {
    function tick() {
      const diff = BODA_FECHA - Date.now();
      const p = (n) => String(n).padStart(2, '0');
      const vals = diff <= 0
        ? { d: '0', h: '00', m: '00', s: '00' }
        : {
            d: String(Math.floor(diff / 86400000)),
            h: p(Math.floor(diff / 3600000) % 24),
            m: p(Math.floor(diff / 60000) % 60),
            s: p(Math.floor(diff / 1000) % 60),
          };
      const elD = document.getElementById('cd-d');
      const elH = document.getElementById('cd-h');
      const elM = document.getElementById('cd-m');
      const elS = document.getElementById('cd-s');
      if (elD) elD.textContent = vals.d;
      if (elH) elH.textContent = vals.h;
      if (elM) elM.textContent = vals.m;
      if (elS) elS.textContent = vals.s;
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function burstDust(container) {
    if (!container) return;
    const r = container.getBoundingClientRect();
    const cx = r.width / 2;
    const cy = r.height / 2 - 10;
    const colors = ['#f6e0a8', '#e9c979', '#cfe0d3', '#ffffff', '#c9b8e8', '#a8c2ad'];
    const particleCount = window.innerWidth <= 520 ? 38 : 58;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const ang = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 340;
      const size = (Math.random() * 4 + 1.6).toFixed(1);
      const c = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText =
        'position:absolute;left:' + cx + 'px;top:' + cy + 'px;width:' + size + 'px;height:' + size +
        'px;border-radius:50%;background:' + c + ';box-shadow:0 0 ' + (size * 3) + 'px ' + (size * 1.2) +
        'px ' + c + 'aa;transform:translate(-50%,-50%) scale(1);opacity:1;transition:transform 1.25s cubic-bezier(.08,.7,.2,1), opacity 1.35s ease-out;pointer-events:none;z-index:5;';
      container.appendChild(p);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 50;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        p.style.transform = 'translate(calc(-50% + ' + dx.toFixed(0) + 'px), calc(-50% + ' + dy.toFixed(0) + 'px)) scale(.3)';
        p.style.opacity = '0';
      }));
      setTimeout(() => { try { p.remove(); } catch (e) {} }, 1700);
    }
  }

  function startMusic() {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    try {
      const a = new Audio(cancionMp3);
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      audioRef.current = a;
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => {});
      let v = 0;
      const fade = setInterval(() => {
        v = Math.min(0.85, v + 0.035);
        a.volume = mutedRef.current ? 0 : v;
        if (v >= 0.85) clearInterval(fade);
      }, 110);
    } catch (e) {}
  }

  function toggleMute() {
    const muted = !mutedRef.current;
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (!muted && audioRef.current.paused) {
        try { audioRef.current.play(); } catch (e) {}
      }
    }
    const btn = document.getElementById('music-toggle-btn');
    if (btn) btn.textContent = '♪ ' + (muted ? 'Silencio' : 'Música');
  }

  function setupMotion() {
    const root = rootRef.current;
    if (!root || motionDoneRef.current) return;
    motionDoneRef.current = true;

    // Apariciones con fade al hacer scroll (simple y confiable)
    const items = Array.from(root.querySelectorAll('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('shown'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));

    // Resalta la escena activa (solo agrega una clase, no toca el zoom)
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('scene-active');
        else entry.target.classList.remove('scene-active');
      });
    }, { threshold: 0.28 });
    root.querySelectorAll('[data-scene]').forEach((scene) => {
      scene.classList.add('motion-ready');
      sceneObserver.observe(scene);
    });

    // Destellos ambientales de fondo (decorativo, no crítico)
    const layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden;';
    const ambientSparkles = window.innerWidth <= 520 ? 8 : 14;
    for (let i = 0; i < ambientSparkles; i++) {
      const sp = document.createElement('div');
      const sz = (Math.random() * 2.4 + 1.3).toFixed(1);
      const dur = (Math.random() * 3 + 4).toFixed(1);
      const dl = (Math.random() * 5).toFixed(1);
      sp.style.cssText =
        'position:absolute;left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) +
        '%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:radial-gradient(circle,#fff,rgba(231,240,231,.5));box-shadow:0 0 ' +
        (sz * 4) + 'px ' + (sz * 1.3) + 'px rgba(240,246,238,.6);animation:sparkle ' + dur + 's ease-in-out ' + dl + 's infinite;';
      layer.appendChild(sp);
    }
    root.appendChild(layer);
  }

  useEffect(() => {
    if (!loading && !notFound) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      const t = setTimeout(() => setupMotion(), 90);
      return () => clearTimeout(t);
    }
  }, [loading, notFound]);

  function openCard() {
    if (openedRef.current) return;
    openedRef.current = true;
    const ov = overlayRef.current;
    const snitch = ov && ov.querySelector('.snitch-flight');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timing = reduceMotion
      ? { reveal: 40, bloom: 60, fade: 220, remove: 360 }
      : { reveal: 1180, bloom: 3300, fade: 3600, remove: 4200 };

    if (ov) ov.classList.add('is-opening');
    if (snitch) {
      const current = getComputedStyle(snitch).transform;
      snitch.style.animation = 'none';
      snitch.style.transform = current === 'none' ? 'translate3d(-32vw,-16vh,0)' : current;
      if (!reduceMotion && typeof snitch.animate === 'function') {
        snitch.animate([
          { transform: snitch.style.transform, opacity: 1, filter: 'drop-shadow(0 0 8px rgba(255,205,68,.82))', offset: 0 },
          { transform: 'translate3d(-28vw,-24vh,0) rotate(-13deg) scale(.94)', opacity: 1, offset: 0.16 },
          { transform: 'translate3d(24vw,-8vh,0) rotate(12deg) scale(1.08)', opacity: 1, offset: 0.42 },
          { transform: 'translate3d(-9vw,10vh,0) rotate(-8deg) scale(1.38)', opacity: 1, offset: 0.66 },
          { transform: 'translate3d(4vw,-3vh,0) rotate(3deg) scale(2.25)', opacity: 1, filter: 'drop-shadow(0 0 18px rgba(255,222,112,.98))', offset: 0.82 },
          { transform: 'translate3d(0,0,0) rotate(0) scale(14)', opacity: 0, filter: 'drop-shadow(0 0 42px rgba(255,248,211,1))', offset: 1 },
        ], { duration: 1540, easing: 'cubic-bezier(.4,.02,.12,1)', fill: 'forwards' });
      } else {
        snitch.style.opacity = '0';
      }
    }

    setTimeout(() => burstDust(ov), timing.reveal);
    if (ov) {
      setTimeout(() => ov.classList.add('is-revealing'), timing.reveal);
      setTimeout(() => { ov.style.opacity = '0'; }, timing.fade);
      setTimeout(() => { ov.style.display = 'none'; }, timing.remove);
    }
    // El scroll se libera pronto (el overlay sigue tapando la pantalla mientras se desvanece,
    // así que no hace falta esperar a que termine toda la animación del título)
    setTimeout(() => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }, timing.reveal);
    setTimeout(() => {
      if (rootRef.current) rootRef.current.classList.add('invitation-opened');
    }, timing.bloom);

    startMusic();
    const musicBtn = document.getElementById('music-toggle-wrap');
    if (musicBtn) musicBtn.style.display = 'flex';
  }

  async function enviarRSVP(resp) {
    if (!guest) return;
    setSaving(true);
    const cantidadFinal = resp === 'si' ? cantidad : 0;
    const { error } = await supabase
      .from('invitados')
      .update({
        rsvp_estado: resp,
        rsvp_cantidad_confirmada: cantidadFinal,
        respondido_en: new Date().toISOString(),
      })
      .eq('slug', slug);
    setSaving(false);
    if (!error) {
      setChoice(resp);
      setDone(true);
    } else {
      alert('Hubo un problema guardando tu respuesta. Por favor intentá de nuevo.');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#5f7a67' }}>
        Cargando invitación…
      </div>
    );
  }
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#5f7a67' }}>
        Esta invitación no fue encontrada.<br />Verificá el link que recibiste.
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="invitation-root"
      style={{ position: 'relative', background: 'linear-gradient(165deg,#eef0e9 0%,#e4e8de 55%,#dde3d7 100%)', minHeight: '100vh', color: '#3c4038', fontFamily: "'Mulish',sans-serif", overflowX: 'hidden' }}
    >
      {/* ======= SOBRE PERSONALIZADO (intro) ======= */}
      <div ref={overlayRef} onClick={openCard} className="invitation-gate">
        <div className="opening-vignette"></div>
        <div className="portal-rings" aria-hidden="true"><i></i><i></i><i></i></div>
        <div className="opening-light"></div>
        <div className="opening-title">El siguiente capítulo comienza aquí…</div>
        <div className="gate-kicker">Toda gran historia tiene un momento que lo cambia todo</div>
        <div className="gate-invite">El nuestro nos trajo hasta aquí</div>
        <div className="gate-guest-name">{guest.nombre_familia}</div>
        <div className="bespoke-envelope-wrap">
          <div className="envelope-glow"></div>
          <img src={sobreImg} alt="Sobre artesanal de Henry y Joselyn con sello H y J" className="bespoke-envelope" />
        </div>
        <div className="snitch-flight" aria-hidden="true">
          <div className="golden-snitch">
            <span className="snitch-wing snitch-wing-left"></span>
            <span className="snitch-core"></span>
            <span className="snitch-wing snitch-wing-right"></span>
          </div>
          <span className="snitch-spark snitch-spark-one"></span>
          <span className="snitch-spark snitch-spark-two"></span>
          <span className="snitch-spark snitch-spark-three"></span>
        </div>
        <div className="gate-names">Henry <span>&amp;</span> Joselyn</div>
        <button type="button" className="open-cue" aria-label="Abrir la invitación">
          <span>Abrir nuestra invitación</span><i>✦</i>
        </button>
      </div>

      {/* ======= BOTÓN DE MÚSICA ======= */}
      <div id="music-toggle-wrap" style={{ display: 'none', position: 'fixed', right: 16, bottom: 16, zIndex: 70 }}>
        <button
          id="music-toggle-btn"
          onClick={toggleMute}
          aria-label="Música"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none', borderRadius: 30, background: 'rgba(79,107,87,.85)', backdropFilter: 'blur(8px)', color: '#f0ece1', fontFamily: "'Mulish'", fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 20px -8px rgba(0,0,0,.4)' }}
        >
          ♪ Música
        </button>
      </div>

      {/* HERO */}
      <section data-scene="" data-screen-label="Hero" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto01} alt="El castillo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 34%', animation: 'kb 24s ease-in-out infinite alternate', transformOrigin: '50% 30%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.2) 0%, rgba(20,24,21,0) 40%, rgba(20,24,21,.55) 72%, rgba(20,24,21,.9) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '0 26px 12vh', maxWidth: 440 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: 'clamp(46px,13vw,68px)', lineHeight: 1.02, margin: 0, textShadow: '0 3px 30px rgba(8,12,9,.9)' }}>Henry <span style={{ fontStyle: 'italic', color: '#dfe7df' }}>&amp;</span> Joselyn</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '22px 0 14px' }}>
            <span style={{ height: 1, width: 44, background: 'rgba(255,255,255,.7)' }}></span>
            <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: '#fff' }}></span>
            <span style={{ height: 1, width: 44, background: 'rgba(255,255,255,.7)' }}></span>
          </div>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 500, fontSize: 'clamp(11px,3.2vw,13px)', letterSpacing: 4, textTransform: 'uppercase', color: '#fff' }}>Nuestra historia continúa, y queremos celebrarla contigo</div>
          <div style={{ marginTop: 30, fontFamily: "'Mulish'", fontWeight: 400, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', animation: 'cue 2s ease-in-out infinite' }}>Desliza para vivirla ↓</div>
        </div>
      </section>

      {/* EL PASEO */}
      <section data-scene="" data-screen-label="El paseo" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto02} alt="Henry y Joselyn caminando tomados de la mano" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 62%', animation: 'kb 22s ease-in-out infinite alternate', transformOrigin: '50% 62%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.88) 0%, rgba(20,24,21,.45) 26%, rgba(20,24,21,0) 56%, rgba(20,24,21,.35) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '15vh 28px 0', maxWidth: 440 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(24px,7vw,34px)', lineHeight: 1.4, margin: 0, textShadow: '0 3px 26px rgba(8,12,9,.95)' }}>Pensábamos que era un paseo más. Solo uno de nosotros sabía que ese día cambiaría nuestra historia.</p>
        </div>
      </section>

      {/* LA PROPUESTA */}
      <section data-scene="" data-screen-label="La propuesta" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto03} alt="Henry arrodillado frente al castillo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 62%', animation: 'kb 20s ease-in-out infinite alternate', transformOrigin: '50% 62%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.9) 0%, rgba(20,24,21,.5) 24%, rgba(20,24,21,0) 55%, rgba(20,24,21,.35) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '15vh 28px 0', maxWidth: 440 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: 'clamp(26px,7.5vw,38px)', lineHeight: 1.2, margin: 0, textShadow: '0 3px 26px rgba(8,12,9,.95)' }}>Frente al castillo, por un instante, el mundo se detuvo.</h2>
        </div>
      </section>

      {/* LA PREGUNTA */}
      <section data-scene="" data-screen-label="La pregunta" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto04} alt="Henry arrodillado frente a Joselyn durante la propuesta" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 32%', animation: 'kbzoom 18s ease-in-out infinite alternate', transformOrigin: '62% 42%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.2) 0%, rgba(20,24,21,0) 42%, rgba(20,24,21,.55) 70%, rgba(20,24,21,.9) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '0 26px 13vh', maxWidth: 440 }}>
          <div style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(30px,9vw,42px)', lineHeight: 1.2, color: '#fff', textShadow: '0 4px 30px rgba(8,12,9,.95)' }}>Y entonces llegó la pregunta que cambiaría nuestros planes para siempre.</div>
        </div>
      </section>

      {/* narración */}
      <section style={{ padding: '15vh 30px', textAlign: 'center', background: 'linear-gradient(180deg,#F1EEF6,#e9ece4)' }}>
        <div data-reveal="" style={{ maxWidth: 380, margin: '0 auto' }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px,6vw,28px)', lineHeight: 1.5, color: '#55496a', margin: 0 }}>Por un instante, solo existíamos nosotros…</p>
        </div>
      </section>

      {/* EL ANILLO */}
      <section data-scene="" data-screen-label="El anillo" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto05} alt="Henry colocando el anillo en el dedo de Joselyn" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 42%', animation: 'kbzoom 18s ease-in-out infinite alternate', transformOrigin: '50% 46%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.2) 0%, rgba(20,24,21,0) 40%, rgba(20,24,21,.55) 68%, rgba(20,24,21,.9) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '0 28px 13vh', maxWidth: 440 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: 'clamp(28px,8vw,42px)', lineHeight: 1.15, margin: '0 0 6px', textShadow: '0 3px 28px rgba(8,12,9,.95)' }}>Y llegó el sí que cambió nuestra historia.</h2>
          <div style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(26px,7.5vw,38px)', color: '#eef0ea', textShadow: '0 2px 22px rgba(8,12,9,.9)' }}>La respuesta fue sí.</div>
        </div>
      </section>

      {/* LA PROMESA */}
      <section data-scene="" data-screen-label="La promesa" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto06} alt="Joselyn con el anillo, abrazando a Henry" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', animation: 'kb 19s ease-in-out infinite alternate', transformOrigin: '55% 40%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.9) 0%, rgba(20,24,21,.45) 26%, rgba(20,24,21,0) 56%, rgba(20,24,21,.35) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '14vh 28px 0', maxWidth: 440 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(23px,6.6vw,32px)', lineHeight: 1.4, margin: 0, textShadow: '0 3px 28px rgba(8,12,9,.95)' }}>Ese sí nos trajo hasta aquí: al día en que comenzaremos una nueva vida juntos.</p>
        </div>
      </section>

      {/* DIJE QUE SÍ */}
      <section data-scene="" data-screen-label="Dije que sí" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto07} alt="Henry y Joselyn celebrando con el mensaje I Said Yes" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 52%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.2) 0%, rgba(20,24,21,0) 45%, rgba(20,24,21,.55) 72%, rgba(20,24,21,.9) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '0 28px 13vh', maxWidth: 440 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px,6.4vw,30px)', lineHeight: 1.4, margin: 0, textShadow: '0 3px 28px rgba(8,12,9,.95)' }}>El sí para toda la vida.</p>
        </div>
      </section>

      {/* VERSÍCULO */}
      <section style={{ padding: '16vh 30px', textAlign: 'center', background: '#e9ece4' }}>
        <div data-reveal="" style={{ maxWidth: 440, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 40, color: '#9a86b8', lineHeight: 0, marginBottom: 6 }}>❦</span>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(24px,6.6vw,32px)', lineHeight: 1.45, color: '#40384a', margin: '8px 0 14px' }}>«Por encima de todo, revístanse del amor, que es el vínculo perfecto.»</p>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 600, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#6E8B74' }}>Colosenses 3:14</div>
        </div>
      </section>

      {/* EL BESO */}
      <section data-scene="" data-screen-label="El beso" style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto08} alt="Henry y Joselyn besándose bajo el arco de rosas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 16%', animation: 'kb 20s ease-in-out infinite alternate', transformOrigin: '50% 20%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.14) 0%, rgba(20,24,21,0) 55%, rgba(20,24,21,.25) 100%)' }}></div>
      </section>

      {/* NOS CASAMOS */}
      <section data-screen-label="Nos casamos" style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14vh 28px', background: 'linear-gradient(160deg,#EDE6F4 0%,#EAEFE8 55%,#E7EFEA 100%)' }}>
        <div data-reveal="" style={{ textAlign: 'center', maxWidth: 460 }}>
          <span style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(30px,8vw,44px)', color: '#9a86b8' }}>Nos casamos</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 'clamp(40px,12vw,60px)', margin: '6px 0 12px', color: '#40384a' }}>Reserva la fecha</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '0 0 12px' }}>
            <span style={{ height: 1, width: 40, background: '#c9bcdd' }}></span>
            <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: '#9a86b8' }}></span>
            <span style={{ height: 1, width: 40, background: '#c9bcdd' }}></span>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,6vw,28px)', letterSpacing: 6, color: '#55496a' }}>09 · 01 · 2027</div>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 500, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#7a8a78', marginTop: 6 }}>San José · Costa Rica</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 30 }}>
            <div style={{ width: 66, padding: '16px 0', background: '#fff', borderRadius: 14, boxShadow: '0 14px 30px -20px rgba(120,90,140,.5)' }}>
              <div id="cd-d" style={{ fontFamily: "'Playfair Display'", fontSize: 28, color: '#40384a' }}>—</div>
              <div style={{ fontFamily: "'Mulish'", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9384' }}>días</div>
            </div>
            <div style={{ width: 66, padding: '16px 0', background: '#fff', borderRadius: 14, boxShadow: '0 14px 30px -20px rgba(120,90,140,.5)' }}>
              <div id="cd-h" style={{ fontFamily: "'Playfair Display'", fontSize: 28, color: '#40384a' }}>—</div>
              <div style={{ fontFamily: "'Mulish'", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9384' }}>hrs</div>
            </div>
            <div style={{ width: 66, padding: '16px 0', background: '#fff', borderRadius: 14, boxShadow: '0 14px 30px -20px rgba(120,90,140,.5)' }}>
              <div id="cd-m" style={{ fontFamily: "'Playfair Display'", fontSize: 28, color: '#40384a' }}>—</div>
              <div style={{ fontFamily: "'Mulish'", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9384' }}>min</div>
            </div>
            <div style={{ width: 66, padding: '16px 0', background: '#fff', borderRadius: 14, boxShadow: '0 14px 30px -20px rgba(120,90,140,.5)' }}>
              <div id="cd-s" style={{ fontFamily: "'Playfair Display'", fontSize: 28, color: '#9a86b8' }}>—</div>
              <div style={{ fontFamily: "'Mulish'", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9384' }}>seg</div>
            </div>
          </div>
        </div>
      </section>

      {/* DETALLES */}
      <section data-screen-label="Detalles" style={{ padding: '14vh 28px 8vh', background: '#e9ece4' }}>
        <div data-reveal="" style={{ maxWidth: 440, margin: '0 auto 40px' }}>
          <div style={{ height: 420, borderRadius: '200px 200px 20px 20px', overflow: 'hidden', boxShadow: '0 26px 54px -30px rgba(90,110,95,.6)' }}>
            <img src={foto09} alt="Henry y Joselyn abrazados frente al castillo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 42%' }} />
          </div>
        </div>
        <div data-reveal="" style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto 36px' }}>
          <span style={{ fontFamily: "'Great Vibes',cursive", fontSize: 34, color: '#9a86b8' }}>Te esperamos</span>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: 'clamp(24px,7vw,34px)', margin: '4px 0 0', color: '#40384a' }}>Los detalles del gran día</h3>
        </div>
        <div style={{ maxWidth: 440, margin: '0 auto', display: 'grid', gap: 18 }}>
          <div data-reveal="" style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 18px 40px -30px rgba(90,110,95,.5)' }}>
            <div style={{ fontFamily: "'Mulish'", fontWeight: 600, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6E8B74' }}>Ceremonia religiosa</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 25, color: '#40384a', margin: '8px 0 4px' }}>Llegada · 1:30 p.m.</div>
            <div style={{ fontFamily: "'Mulish'", fontSize: 11, letterSpacing: 1.4, color: '#9a86b8', margin: '0 0 8px', textTransform: 'uppercase' }}>Ceremonia · 2:00 p.m.</div>
            <div style={{ fontFamily: "'Mulish'", fontWeight: 300, fontSize: 14, color: '#6f6878', lineHeight: 1.55 }}>Iglesia Nuestra Señora del Perpetuo Socorro<br />Sabana Sur, San José</div>
            <a href="https://www.google.com/maps/search/?api=1&query=Iglesia+Nuestra+Se%C3%B1ora+del+Perpetuo+Socorro+Sabana+Sur" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 14, padding: '10px 22px', borderRadius: 22, background: '#EEE9F5', fontFamily: "'Mulish'", fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#7a679e', textDecoration: 'none' }}>Ver ubicación</a>
          </div>
          <div data-reveal="" style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 18px 40px -30px rgba(90,110,95,.5)' }}>
            <div style={{ fontFamily: "'Mulish'", fontWeight: 600, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6E8B74' }}>Recepción</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 25, color: '#40384a', margin: '8px 0 4px' }}>4:00 p.m.</div>
            <div style={{ fontFamily: "'Mulish'", fontWeight: 300, fontSize: 14, color: '#6f6878', lineHeight: 1.55 }}>Vista Capital<br />Alajuelita, San José</div>
            <a href="https://www.google.com/maps/search/?api=1&query=Vista+Capital+Alajuelita+Costa+Rica" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 14, padding: '10px 22px', borderRadius: 22, background: '#EEE9F5', fontFamily: "'Mulish'", fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#7a679e', textDecoration: 'none' }}>Ver ubicación</a>
          </div>
        </div>
      </section>

      {/* VESTIMENTA */}
      <section style={{ padding: '2vh 28px 10vh', background: '#e9ece4' }}>
        <div data-reveal="" style={{ maxWidth: 440, margin: '0 auto', padding: '40px 28px', background: 'linear-gradient(135deg,#EDE6F4,#E7EFEA)', borderRadius: 22, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 600, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7a679e' }}>Código de vestimenta</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0 4px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,6.5vw,28px)', color: '#40384a' }}>• Formal</span>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,6.5vw,28px)', color: '#40384a' }}>• Tonos pastel</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '18px 0' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E4DBF2', border: '2px solid #fff', boxShadow: '0 4px 10px -4px rgba(0,0,0,.15)' }}></span>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#F5D9E0', border: '2px solid #fff', boxShadow: '0 4px 10px -4px rgba(0,0,0,.15)' }}></span>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#EAE3CF', border: '2px solid #fff', boxShadow: '0 4px 10px -4px rgba(0,0,0,.15)' }}></span>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#CFE0EC', border: '2px solid #fff', boxShadow: '0 4px 10px -4px rgba(0,0,0,.15)' }}></span>
          </div>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 300, fontSize: 14, color: '#5f5870', lineHeight: 1.55 }}>
            Con cariño te pedimos evitar{' '}
            <em style={{ color: '#6E8B74', fontStyle: 'italic', fontWeight: 600 }}>todos los tonos de verde</em> y el{' '}
            <em style={{ color: '#6E8B74', fontStyle: 'italic', fontWeight: 600 }}>blanco</em>, colores reservados para los novios.
          </div>
        </div>
      </section>

      {/* RSVP PERSONAL — conectado a Supabase */}
      <section data-screen-label="RSVP" style={{ padding: '2vh 28px 13vh', background: '#e9ece4' }}>
        <div data-reveal="" style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto 26px' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: 'clamp(24px,7vw,32px)', margin: '4px 0 6px', color: '#40384a' }}>¿Nos acompañarás?</h3>
          <p style={{ fontFamily: "'Mulish'", fontWeight: 300, fontSize: 13, color: '#6f6878', margin: 0, lineHeight: 1.6 }}>Nos hará muy felices compartir este día contigo. Por favor, confirma tu asistencia antes del 1 de diciembre de 2026.</p>
        </div>
        <div data-reveal="" style={{ margin: '0 auto', maxWidth: 400 }}>
          {done ? (
            <div style={{ padding: '40px 26px', borderRadius: 22, background: '#fff', textAlign: 'center', boxShadow: '0 20px 46px -30px rgba(90,110,95,.5)' }}>
              <div style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,#9a86b8,#6E8B74)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {choice === 'si' ? '✓' : '♡'}
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#40384a' }}>
                {choice === 'si' ? '¡Nos vemos en la boda!' : 'Te vamos a extrañar'}
              </div>
              <div style={{ fontFamily: "'Mulish'", fontWeight: 300, fontSize: 14, color: '#6f6878', marginTop: 8, lineHeight: 1.5 }}>
                {choice === 'si'
                  ? 'Gracias por confirmar. Será un día inolvidable y no podemos esperar a celebrarlo contigo.'
                  : 'Gracias por avisarnos. Estarás presente en nuestros corazones ese día tan especial.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="rsvp-guest-name">{guest.nombre_familia}</div>
              {guest.mensaje_personalizado && (
                <p style={{ fontFamily: "'Mulish'", fontSize: 13, color: '#6f6878', margin: '-8px 0 4px' }}>{guest.mensaje_personalizado}</p>
              )}
              <div className="rsvp-guest-cupo">Cupo reservado: {guest.cupo} persona{guest.cupo > 1 ? 's' : ''}</div>
              {guest.cupo > 1 && (
                <select
                  className="rsvp-select"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                >
                  {Array.from({ length: guest.cupo }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''} asistirá{n > 1 ? 'n' : ''}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => enviarRSVP('si')}
                disabled={saving}
                style={{ padding: 18, border: 'none', borderRadius: 26, background: 'linear-gradient(135deg,#9a86b8,#7d6aa8)', color: '#fff', fontFamily: "'Mulish'", fontWeight: 700, fontSize: 14, letterSpacing: 1, cursor: 'pointer', boxShadow: '0 14px 30px -14px rgba(125,90,168,.7)' }}
              >
                Sí, ahí estaré ✦
              </button>
              <button
                onClick={() => enviarRSVP('no')}
                disabled={saving}
                style={{ padding: 18, border: '1px solid #cdd6cb', borderRadius: 26, background: '#fff', color: '#6E8B74', fontFamily: "'Mulish'", fontWeight: 600, fontSize: 14, letterSpacing: 1, cursor: 'pointer' }}
              >
                Lo siento, no podré asistir
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <section data-scene="" style={{ position: 'relative', height: '94svh', minHeight: 540, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#1a1f1c' }}>
        <img src={foto10} alt="Henry y Joselyn celebrando frente al castillo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 50%', animation: 'kb 21s ease-in-out infinite alternate', transformOrigin: '50% 50%' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(20,24,21,.9) 0%, rgba(20,24,21,.45) 26%, rgba(20,24,21,0) 56%, rgba(20,24,21,.4) 100%)' }}></div>
        <div data-cap="" style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#fff', padding: '13vh 28px 0' }}>
          <div style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(44px,15vw,72px)', lineHeight: 1, textShadow: '0 3px 32px rgba(8,12,9,.95)' }}>Henry &amp; Joselyn</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px 0 12px' }}>
            <span style={{ height: 1, width: 40, background: 'rgba(255,255,255,.7)' }}></span>
            <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: '#fff' }}></span>
            <span style={{ height: 1, width: 40, background: 'rgba(255,255,255,.7)' }}></span>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(17px,5.5vw,22px)', letterSpacing: 5 }}>09 · 01 · 2027</div>
          <div style={{ fontFamily: "'Mulish'", fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', marginTop: 16 }}>Gracias por ser parte de nuestra historia</div>
        </div>
      </section>
    </div>
  );
}
