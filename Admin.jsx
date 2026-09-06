import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';
import { slugify } from './slugify.js';

const ADMIN_PASSWORD = 'HyJ2027';

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('boda_admin') === '1');
  const [pass, setPass] = useState('');
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [cupo, setCupo] = useState(2);
  const [mensaje, setMensaje] = useState('');
  const [copiedSlug, setCopiedSlug] = useState('');

  async function cargarTodo() {
    setLoading(true);
    const [{ data: g }, { data: s }] = await Promise.all([
      supabase.from('invitados').select('*').order('creado_en', { ascending: false }),
      supabase.from('resumen_rsvp').select('*').maybeSingle(),
    ]);
    setGuests(g || []);
    setStats(s || null);
    setLoading(false);
  }

  useEffect(() => {
    if (authed) cargarTodo();
  }, [authed]);

  function login(e) {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('boda_admin', '1');
      setAuthed(true);
    } else {
      alert('Clave incorrecta');
    }
  }

  async function agregarInvitado(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    let baseSlug = slugify(nombre);
    let finalSlug = baseSlug;
    let n = 1;
    while (guests.some((g) => g.slug === finalSlug)) {
      n += 1;
      finalSlug = `${baseSlug}-${n}`;
    }
    const { error } = await supabase.from('invitados').insert({
      slug: finalSlug,
      nombre_familia: nombre.trim(),
      cupo: Number(cupo) || 1,
      mensaje_personalizado: mensaje.trim() || null,
    });
    if (error) {
      alert('Error al agregar: ' + error.message);
      return;
    }
    setNombre('');
    setCupo(2);
    setMensaje('');
    cargarTodo();
  }

  async function borrarInvitado(id) {
    if (!confirm('¿Seguro que querés borrar este invitado?')) return;
    await supabase.from('invitados').delete().eq('id', id);
    cargarTodo();
  }

  function copiarLink(slug) {
    const url = `${window.location.origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 1500);
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <h1 className="serif">Panel de la boda</h1>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="Clave de acceso"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoFocus
          />
          <button className="btn btn-yes" type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <h1>Henry &amp; Joselyn — Panel</h1>
      <p style={{ color: '#888', marginTop: 0 }}>Generador de invitaciones y conteo de asistentes</p>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="n">{stats.total_familias}</div><div className="l">Familias invitadas</div></div>
          <div className="stat-card"><div className="n">{stats.familias_confirmadas}</div><div className="l">Confirmaron</div></div>
          <div className="stat-card"><div className="n">{stats.familias_declinaron}</div><div className="l">Declinaron</div></div>
          <div className="stat-card"><div className="n">{stats.familias_pendientes}</div><div className="l">Pendientes</div></div>
          <div className="stat-card"><div className="n">{stats.personas_confirmadas}</div><div className="l">Personas confirmadas</div></div>
          <div className="stat-card"><div className="n">{stats.personas_invitadas_total}</div><div className="l">Cupo total invitado</div></div>
        </div>
      )}

      <form className="form-row" onSubmit={agregarInvitado}>
        <input
          placeholder="Nombre (ej: Familia Rodríguez)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          min={1}
          placeholder="Cupo"
          value={cupo}
          onChange={(e) => setCupo(e.target.value)}
          style={{ maxWidth: 80 }}
        />
        <input
          placeholder="Mensaje personalizado (opcional)"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button type="submit">+ Generar link</button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cupo</th>
              <th>Estado</th>
              <th>Confirmados</th>
              <th>Alcohol</th>
              <th>Restricciones</th>
              <th>Link</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id}>
                <td>{g.nombre_familia}</td>
                <td>{g.cupo}</td>
                <td><span className={`badge badge-${g.rsvp_estado}`}>{g.rsvp_estado}</span></td>
                <td>{g.rsvp_estado === 'si' ? g.rsvp_cantidad_confirmada : '—'}</td>
                <td>{g.rsvp_estado === 'si' ? (g.rsvp_alcohol_cantidad ?? 0) : '—'}</td>
                <td>{g.rsvp_estado === 'si' ? (g.rsvp_restricciones || '—') : '—'}</td>
                <td>
                  <button className="copy-link" onClick={() => copiarLink(g.slug)}>
                    {copiedSlug === g.slug ? '¡Copiado!' : `/i/${g.slug}`}
                  </button>
                </td>
                <td>
                  <button className="del-btn" onClick={() => borrarInvitado(g.id)}>Borrar</button>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999' }}>Todavía no hay invitados agregados.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
