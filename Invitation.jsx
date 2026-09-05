import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient.js';

import foto01 from './foto-01-castillo.jpg';
import foto02 from './foto-02-caminando.jpg';
import foto03 from './foto-03-arrodillado.jpg';
import foto04 from './foto-04-anillo-1.jpg';
import foto05 from './foto-05-anillo-2.jpg';
import foto06 from './foto-06-abrazo.jpg';
import foto07 from './foto-07-said-yes.jpg';
import foto08 from './foto-08-beso.jpg';
import foto09 from './foto-09-abrazados.jpg';
import foto10 from './foto-10-celebrando.jpg';
import sobreImg from './sobre.webp';
import cancionMp3 from './cancion.mp3';

const BODA_FECHA = new Date('2027-01-09T13:30:00-06:00').getTime();

const FOTOS = [
  { src: foto01, alt: 'El castillo', caption: 'Pensábamos que era un paseo más…' },
  { src: foto02, alt: 'Caminando tomados de la mano', caption: 'Solo uno de nosotros sabía que ese día cambiaría nuestra historia.' },
  { src: foto03, alt: 'Henry arrodillado', caption: 'Frente al castillo, por un instante, el mundo se detuvo.' },
  { src: foto04, alt: 'Con el anillo', caption: 'Y entonces llegó la pregunta que cambiaría nuestros planes para siempre.' },
  { src: foto05, alt: 'Colocando el anillo', caption: 'Por un instante, solo existíamos nosotros…' },
  { src: foto06, alt: 'Abrazo', caption: 'Y llegó el sí que cambió nuestra historia.' },
  { src: foto07, alt: 'I said yes', caption: 'La respuesta fue sí.' },
  { src: foto08, alt: 'Beso bajo el arco', caption: 'Ese sí nos trajo hasta aquí.' },
  { src: foto09, alt: 'Abrazados frente al castillo', caption: 'Del sí de aquel día al sí para toda la vida.' },
  { src: foto10, alt: 'Celebrando', caption: '❦' },
];

function useCountdown() {
  const [t, setT] = useState({ d: '—', h: '—', m: '—', s: '—' });
  useEffect(() => {
    const tick = () => {
      const diff = BODA_FECHA - Date.now();
      if (diff <= 0) { setT({ d: '0', h: '00', m: '00', s: '00' }); return; }
      const p = (n) => String(n).padStart(2, '0');
      setT({
        d: String(Math.floor(diff / 86400000)),
        h: p(Math.floor(diff / 3600000) % 24),
        m: p(Math.floor(diff / 60000) % 60),
        s: p(Math.floor(diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Invitation() {
  const { slug } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);
  const audioRef = useRef(null);
  const cd = useCountdown();

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

  function openCard() {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const fade = setInterval(() => {
        v = Math.min(0.7, v + 0.05);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= 0.7) clearInterval(fade);
      }, 120);
    }
  }

  function toggleMute() {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  }

  async function enviarRSVP(resp) {
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

  if (loading) return <div className="loading-screen">Cargando invitación…</div>;
  if (notFound) {
    return (
      <div className="error-screen">
        Esta invitación no fue encontrada.<br />Verificá el link que recibiste.
      </div>
    );
  }

  return (
    <div className="invite">
      <audio ref={audioRef} src={cancionMp3} loop preload="auto" />

      {!opened && (
        <div className="invite-cover" onClick={openCard}>
          <img className="sobre" src={sobreImg} alt="Sobre" />
          <h1 className="serif">Henry &amp; Joselyn</h1>
          <p style={{ color: '#666' }}>
            {guest.mensaje_personalizado || `Querida ${guest.nombre_familia}`}
          </p>
          <span className="cta">✦ Toca para abrir ✦</span>
        </div>
      )}

      {opened && (
        <>
          <button className="music-toggle" onClick={toggleMute}>
            {muted ? '🔇' : '🎵'}
          </button>

          <div className="section">
            <h2 className="serif">Henry &amp; Joselyn</h2>
            <p>Nuestra historia continúa, y queremos celebrarla contigo</p>
          </div>

          {FOTOS.map((f, i) => (
            <div className="gallery-scene" key={i}>
              <img src={f.src} alt={f.alt} loading="lazy" />
              <div className="gallery-caption">{f.caption}</div>
            </div>
          ))}

          <div className="section">
            <p style={{ fontStyle: 'italic' }}>
              «Por encima de todo, revístanse del amor, que es el vínculo perfecto.»<br />
              Colosenses 3:14
            </p>
          </div>

          <div className="section">
            <h2 className="serif">Nos casamos</h2>
            <p>Reserva la fecha</p>
            <p className="serif" style={{ fontSize: 28, color: 'var(--gold-dark)' }}>09 · 01 · 2027</p>
            <p>San José · Costa Rica</p>
            <div className="countdown">
              <div className="box"><span className="num">{cd.d}</span><span className="label">días</span></div>
              <div className="box"><span className="num">{cd.h}</span><span className="label">hrs</span></div>
              <div className="box"><span className="num">{cd.m}</span><span className="label">min</span></div>
              <div className="box"><span className="num">{cd.s}</span><span className="label">seg</span></div>
            </div>
          </div>

          <div className="section">
            <h2 className="serif">Te esperamos</h2>
            <p>Los detalles del gran día</p>

            <div className="detail-card">
              <h3>Ceremonia religiosa</h3>
              <div className="time">Llegada · 1:30 p.m. — Ceremonia · 2:00 p.m.</div>
              <p style={{ margin: 0 }}>Iglesia Nuestra Señora del Perpetuo Socorro<br />Sabana Sur, San José</p>
              <a className="map-link" target="_blank" rel="noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=Iglesia+Nuestra+Se%C3%B1ora+del+Perpetuo+Socorro+Sabana+Sur">
                Ver ubicación
              </a>
            </div>

            <div className="detail-card">
              <h3>Recepción</h3>
              <div className="time">4:00 p.m.</div>
              <p style={{ margin: 0 }}>Vista Capital<br />Alajuelita, San José</p>
              <a className="map-link" target="_blank" rel="noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=Vista+Capital+Alajuelita+Costa+Rica">
                Ver ubicación
              </a>
            </div>

            <div className="detail-card">
              <h3>Código de vestimenta</h3>
              <p style={{ margin: 0 }}>
                Formal · tonos pastel sugeridos.<br />
                Con cariño te pedimos evitar todos los tonos de <strong>verde</strong> y el <strong>blanco</strong>,
                colores reservados para los novios.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="serif">¿Nos acompañarás?</h2>
            <p>Por favor, confirma tu asistencia antes del 1 de diciembre de 2026.</p>

            <div className="rsvp-box">
              {!done ? (
                <>
                  <p style={{ marginTop: 0 }}>
                    {guest.mensaje_personalizado || guest.nombre_familia}
                    <br />
                    <span style={{ fontSize: 13, color: '#999' }}>Cupo reservado: {guest.cupo} persona{guest.cupo > 1 ? 's' : ''}</span>
                  </p>
                  <label style={{ fontSize: 13, color: '#777' }}>
                    ¿Cuántos de ustedes asistirán?
                    <br />
                    <input
                      type="number"
                      min={1}
                      max={guest.cupo}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, Math.min(guest.cupo, Number(e.target.value))))}
                    />
                  </label>
                  <div>
                    <button className="btn btn-yes" disabled={saving} onClick={() => enviarRSVP('si')}>
                      Sí, ahí estaré ✦
                    </button>
                    <br />
                    <button className="btn btn-no" disabled={saving} onClick={() => enviarRSVP('no')}>
                      Lo siento, no podré asistir
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontSize: 40 }}>{choice === 'si' ? '✓' : '♡'}</div>
                  <h3 className="serif" style={{ color: 'var(--sage)' }}>
                    {choice === 'si' ? '¡Nos vemos en la boda!' : 'Te vamos a extrañar'}
                  </h3>
                  <p>
                    {choice === 'si'
                      ? 'Gracias por confirmar. Será un día inolvidable y no podemos esperar a celebrarlo contigo.'
                      : 'Gracias por avisarnos. Estarás presente en nuestros corazones ese día tan especial.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="footer-note">
            Gracias por ser parte de nuestra historia
          </div>
        </>
      )}
    </div>
  );
}
