'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SetupPage() {
  const { update } = useSession();
  const [form, setForm]     = useState({ firstName: '', lastName: '' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar.');
        setSaving(false);
        return;
      }
      // Actualizar el JWT con profileComplete=true para que el middleware lo vea
      await update({ profileComplete: true, firstName: form.firstName, lastName: form.lastName });
      window.location.href = '/';
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">Bienvenido</h1>
        <p className="login-subtitle">Completa tu perfil para continuar</p>
        <form onSubmit={handleSubmit} className="setup-form">
          <input
            className="setup-input"
            placeholder="Nombre"
            value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          />
          <input
            className="setup-input"
            placeholder="Apellido"
            value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          />
          {error && <p className="setup-error">{error}</p>}
          <button className="login-btn-google" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
