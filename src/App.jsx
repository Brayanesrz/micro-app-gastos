import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [gastos, setGastos] = useState(() => {
    const saved = localStorage.getItem('gastos_fijos');
    return saved ? JSON.parse(saved) : [
      { id: 1, nombre: 'Renta / Auto', monto: 3500, abonado: 0, fechaLimite: '2026-10-30', pagado: false },
      { id: 2, nombre: 'Seguro de Vehículo', monto: 1200, abonado: 0, fechaLimite: '2026-10-25', pagado: false }
    ];
  });

  const [ingresos, setIngresos] = useState(() => {
    const saved = localStorage.getItem('historial_ingresos');
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevoGasto, setNuevoGasto] = useState({ nombre: '', monto: '', fechaLimite: '' });
  const [montoIngreso, setMontoIngreso] = useState('');
  const [gastoSeleccionado, setGastoSeleccionado] = useState('');

  useEffect(() => {
    localStorage.setItem('gastos_fijos', JSON.stringify(gastos));
  }, [gastos]);

  useEffect(() => {
    localStorage.setItem('historial_ingresos', JSON.stringify(ingresos));
  }, [ingresos]);

  // Cálculo dinámico de metas diarias
  const calcularMetas = (gasto) => {
    if (gasto.pagado) return { diasRestantes: 0, cuotaDiaria: 0, saldoPendiente: 0 };
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(gasto.fechaLimite + 'T00:00:00');
    
    const diffTiempo = limite.getTime() - hoy.getTime();
    const diasRestantes = Math.max(1, Math.ceil(diffTiempo / (1000 * 3600 * 24)));
    
    const saldoPendiente = Math.max(0, gasto.monto - gasto.abonado);
    const cuotaDiaria = (saldoPendiente / diasRestantes).toFixed(2);
    
    return { diasRestantes, cuotaDiaria, saldoPendiente };
  };

  const agregarGasto = (e) => {
    e.preventDefault();
    if (!nuevoGasto.nombre || !nuevoGasto.monto || !nuevoGasto.fechaLimite) return;
    
    const item = {
      id: Date.now(),
      nombre: nuevoGasto.nombre,
      monto: parseFloat(nuevoGasto.monto),
      abonado: 0,
      fechaLimite: nuevoGasto.fechaLimite,
      pagado: false
    };
    
    setGastos([...gastos, item]);
    setNuevoGasto({ nombre: '', monto: '', fechaLimite: '' });
  };

  const registrarIngreso = (e) => {
    e.preventDefault();
    const ingresoNum = parseFloat(montoIngreso);
    if (!ingresoNum || !gastoSeleccionado) return;

    setGastos(gastos.map(g => {
      if (g.id === parseInt(gastoSeleccionado)) {
        const nuevoAbono = g.abonado + ingresoNum;
        return {
          ...g,
          abonado: nuevoAbono,
          pagado: nuevoAbono >= g.monto
        };
      }
      return g;
    }));

    setIngresos([{ id: Date.now(), monto: ingresoNum, fecha: new Date().toLocaleDateString(), gastoId: gastoSeleccionado }, ...ingresos]);
    setMontoIngreso('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Encabezado */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Control de Gastos</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Modo Conductor de Plataforma</p>
        </div>
        <Wallet color="#2563eb" size={28} />
      </header>

      {/* Formulario para Ingresos Rápidos */}
      <section style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={18} color="#16a34a" /> Registrar Ingreso / Abono
        </h2>
        <form onSubmit={registrarIngreso} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select 
            value={gastoSeleccionado} 
            onChange={(e) => setGastoSeleccionado(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required
          >
            <option value="">Abonar a gasto...</option>
            {gastos.filter(g => !g.pagado).map(g => (
              <option key={g.id} value={g.id}>{g.nombre} (Faltan: ${(g.monto - g.abonado).toFixed(2)})</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              placeholder="Monto generado ($)" 
              value={montoIngreso} 
              onChange={(e) => setMontoIngreso(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              required 
            />
            <button type="submit" style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Abonar
            </button>
          </div>
        </form>
      </section>

      {/* Tarjetas de Gastos Fijos */}
      <section style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Metas de Gastos Fijos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {gastos.map(g => {
            const { diasRestantes, cuotaDiaria, saldoPendiente } = calcularMetas(g);
            return (
              <div key={g.id} style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px', borderLeft: g.pagado ? '4px solid #16a34a' : '4px solid #2563eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{g.nombre}</span>
                  {g.pagado ? (
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> ¡PAGADO!
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>
                      {diasRestantes} días restantes
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b' }}>Saldo Pendiente</div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>${saldoPendiente.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Generar x Día</div>
                    <div style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '15px' }}>
                      ${cuotaDiaria} /día
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agregar Nuevo Gasto Fijo */}
      <section style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={18} color="#2563eb" /> Nuevo Gasto Fijo
        </h2>
        <form onSubmit={agregarGasto} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Nombre (ej. Renta, Mantenimiento)" 
            value={nuevoGasto.nombre} 
            onChange={(e) => setNuevoGasto({ ...nuevoGasto, nombre: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required 
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              placeholder="Total ($)" 
              value={nuevoGasto.monto} 
              onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              required 
            />
            <input 
              type="date" 
              value={nuevoGasto.fechaLimite} 
              onChange={(e) => setNuevoGasto({ ...nuevoGasto, fechaLimite: e.target.value })}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              required 
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar Gasto
          </button>
        </form>
      </section>
    </div>
  );
}