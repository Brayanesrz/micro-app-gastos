import React, { useState, useEffect } from 'react';

export default function App() {
  const [gastosFijos, setGastosFijos] = useState(() => {
    const saved = localStorage.getItem('gastosFijos');
    return saved ? JSON.parse(saved) : [
      { id: 1, nombre: 'Renta Auto / Cuota', montoTotal: 2500, abonado: 0, fechaVencimiento: '2026-10-18' },
      { id: 2, nombre: 'Seguro', montoTotal: 1200, abonado: 0, fechaVencimiento: '2026-10-31' }
    ];
  });

  const [gastosOperativos, setGastosOperativos] = useState(() => {
    const saved = localStorage.getItem('gastosOperativos');
    return saved ? JSON.parse(saved) : [];
  });

  const [historialAbonos, setHistorialAbonos] = useState(() => {
    const saved = localStorage.getItem('historialAbonos');
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevoGasto, setNuevoGasto] = useState({ nombre: '', montoTotal: '', fechaVencimiento: '' });
  const [nuevoAbono, setNuevoAbono] = useState({ gastoId: '', monto: '' });
  const [nuevoOp, setNuevoOp] = useState({ concepto: 'Gasolina', monto: '' });
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }, [gastosFijos]);

  useEffect(() => {
    localStorage.setItem('gastosOperativos', JSON.stringify(gastosOperativos));
  }, [gastosOperativos]);

  useEffect(() => {
    localStorage.setItem('historialAbonos', JSON.stringify(historialAbonos));
  }, [historialAbonos]);

  const calcularDiasRestantes = (fechaVenc) => {
    if (!fechaVenc) return 1;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [year, month, day] = fechaVenc.split('-').map(Number);
    const vencimiento = new Date(year, month - 1, day);
    const diferenciaMs = vencimiento - hoy;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 1;
  };

  const gastosFijosOrdenados = [...gastosFijos].sort((a, b) => {
    if (!a.fechaVencimiento) return 1;
    if (!b.fechaVencimiento) return -1;
    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
  });

  const metaDiariaTotal = gastosFijos.reduce((acc, g) => {
    const pendiente = Math.max(0, g.montoTotal - g.abonado);
    const diasRem = calcularDiasRestantes(g.fechaVencimiento);
    return acc + (pendiente / diasRem);
  }, 0);

  const totalGastosOpHoy = gastosOperativos.reduce((acc, g) => acc + Number(g.monto), 0);

  const agregarGastoFijo = (e) => {
    e.preventDefault();
    if (!nuevoGasto.nombre || !nuevoGasto.montoTotal || !nuevoGasto.fechaVencimiento) return;
    setGastosFijos([...gastosFijos, {
      id: Date.now(),
      nombre: nuevoGasto.nombre,
      montoTotal: Number(nuevoGasto.montoTotal),
      abonado: 0,
      fechaVencimiento: nuevoGasto.fechaVencimiento
    }]);
    setNuevoGasto({ nombre: '', montoTotal: '', fechaVencimiento: '' });
  };

  const registrarAbono = (e) => {
    e.preventDefault();
    if (!nuevoAbono.gastoId || !nuevoAbono.monto) return;
    const monto = Number(nuevoAbono.monto);
    const id = Number(nuevoAbono.gastoId);

    setGastosFijos(gastosFijos.map(g => g.id === id ? { ...g, abonado: g.abonado + monto } : g));

    const gastoRef = gastosFijos.find(g => g.id === id);
    setHistorialAbonos([{
      id: Date.now(),
      gastoNombre: gastoRef ? gastoRef.nombre : 'Gasto',
      monto,
      fecha: new Date().toLocaleString()
    }, ...historialAbonos]);

    setNuevoAbono({ gastoId: '', monto: '' });
  };

  const agregarGastoOp = (e) => {
    e.preventDefault();
    if (!nuevoOp.monto) return;
    setGastosOperativos([{
      id: Date.now(),
      concepto: nuevoOp.concepto,
      monto: Number(nuevoOp.monto),
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...gastosOperativos]);
    setNuevoOp({ concepto: 'Gasolina', monto: '' });
  };

  const eliminarGastoFijo = (id) => setGastosFijos(gastosFijos.filter(g => g.id !== id));
  const eliminarAbono = (id) => setHistorialAbonos(historialAbonos.filter(a => a.id !== id));

  // Estilos Base Inline
  const S = {
    app: { backgroundColor: '#111827', color: '#ffffff', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif', maxWidth: '420px', margin: '0 auto' },
    card: { backgroundColor: '#1f2937', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #374151' },
    header: { background: 'linear-[#2563eb]', backgroundColor: '#2563eb', padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' },
    input: { backgroundColor: '#374151', color: '#ffffff', border: '1px solid #4b5563', padding: '10px', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    btnGreen: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    btnBlue: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' },
    btnOrange: { backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    flexRow: { display: 'flex', gap: '8px' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  };

  return (
    <div style={S.app}>
      {/* Target Meta Diaria */}
      <div style={S.header}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Meta Diaria Fija Requerida</span>
        <h1 style={{ fontSize: '36px', margin: '8px 0 0 0', fontWeight: 'bold' }}>${metaDiariaTotal.toFixed(2)}</h1>
        <p style={{ fontSize: '12px', opacity: '0.9', marginTop: '4px' }}>Calculada según las fechas de vencimiento más próximas</p>
      </div>

      {/* Registrar Abono */}
      <div style={S.card}>
        <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '12px', color: '#4ade80' }}>💵 Registrar Abono a Gasto Fijo</h3>
        <form onSubmit={registrarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select 
            value={nuevoAbono.gastoId} 
            onChange={e => setNuevoAbono({...nuevoAbono, gastoId: e.target.value})}
            style={S.input}
          >
            <option value="">Selecciona Gasto (Ordenado por Vencimiento)...</option>
            {gastosFijosOrdenados.map(g => (
              <option key={g.id} value={g.id}>
                {g.nombre} - Falta: ${(g.montoTotal - g.abonado).toFixed(0)} (Vence: {g.fechaVencimiento || 'S/F'})
              </option>
            ))}
          </select>
          <div style={S.flexRow}>
            <input 
              type="number" 
              placeholder="Monto $" 
              value={nuevoAbono.monto}
              onChange={e => setNuevoAbono({...nuevoAbono, monto: e.target.value})}
              style={S.input}
            />
            <button type="submit" style={S.btnGreen}>Abonar</button>
          </div>
        </form>
      </div>

      {/* Gastos Operativos */}
      <div style={S.card}>
        <div style={S.flexBetween}>
          <h3 style={{ fontSize: '14px', margin: 0, color: '#fb923c' }}>⛽ Operativos de Hoy</h3>
          <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(234, 88, 12, 0.2)', padding: '4px 8px', borderRadius: '4px', color: '#fb923c' }}>
            Total: ${totalGastosOpHoy.toFixed(2)}
          </span>
        </div>
        <form onSubmit={agregarGastoOp} style={{ ...S.flexRow, marginTop: '12px', marginBottom: '12px' }}>
          <select 
            value={nuevoOp.concepto}
            onChange={e => setNuevoOp({...nuevoOp, concepto: e.target.value})}
            style={{ ...S.input, width: '35%' }}
          >
            <option value="Gasolina">Gasolina</option>
            <option value="Lavado">Lavado</option>
            <option value="Taller/Ref">Taller</option>
            <option value="Comida">Comida</option>
          </select>
          <input 
            type="number" 
            placeholder="Monto $" 
            value={nuevoOp.monto}
            onChange={e => setNuevoOp({...nuevoOp, monto: e.target.value})}
            style={{ ...S.input, width: '35%' }}
          />
          <button type="submit" style={{ ...S.btnOrange, width: '30%' }}>+ Registro</button>
        </form>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {gastosOperativos.map(op => (
            <div key={op.id} style={{ ...S.flexBetween, padding: '6px 8px', backgroundColor: '#374151', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
              <span>{op.concepto} <span style={{ color: '#9ca3af' }}>({op.fecha})</span></span>
              <span style={{ color: '#fb923c', fontWeight: 'bold' }}>-${op.monto.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gastos Fijos por Vencimiento */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#d1d5db' }}>📅 Gastos Fijos por Vencimiento</h3>
        {gastosFijosOrdenados.map(gasto => {
          const porcentaje = Math.min(100, Math.round((gasto.abonado / gasto.montoTotal) * 100));
          const restante = Math.max(0, gasto.montoTotal - gasto.abonado);
          const diasRem = calcularDiasRestantes(gasto.fechaVencimiento);
          const cuotaDiaria = (restante / diasRem).toFixed(2);
          const esUrgente = diasRem <= 3 && porcentaje < 100;

          return (
            <div key={gasto.id} style={{ ...S.card, borderColor: esUrgente ? '#ef4444' : '#374151', backgroundColor: esUrgente ? '#2c1517' : '#1f2937' }}>
              <div style={S.flexBetween}>
                <div>
                  <strong style={{ fontSize: '16px' }}>{gasto.nombre}</strong>
                  {esUrgente && <span style={{ marginLeft: '8px', fontSize: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>¡PRÓXIMO!</span>}
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Vence: <strong style={{ color: '#fff' }}>{gasto.fechaVencimiento || 'Sin fecha'}</strong> ({diasRem} días rem.)
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Cuota recomendada: <strong style={{ color: '#60a5fa' }}>${cuotaDiaria}/día</strong>
                  </div>
                </div>
                <button onClick={() => eliminarGastoFijo(gasto.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
              </div>

              <div style={{ ...S.flexBetween, fontSize: '12px', marginTop: '12px', marginBottom: '4px' }}>
                <span>Abonado: ${gasto.abonado}</span>
                <span>Meta: ${gasto.montoTotal}</span>
              </div>

              {/* Barra de Progreso */}
              <div style={{ width: '100%', backgroundColor: '#374151', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${porcentaje}%`, 
                  height: '100%', 
                  backgroundColor: porcentaje >= 100 ? '#22c55e' : esUrgente ? '#ef4444' : '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{porcentaje}% completado</div>
            </div>
          );
        })}
      </div>

      {/* Nuevo Gasto Fijo */}
      <div style={S.card}>
        <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '12px', color: '#60a5fa' }}>➕ Crear Nuevo Gasto Fijo</h3>
        <form onSubmit={agregarGastoFijo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Nombre (Ej: Renta vehículo)" 
            value={nuevoGasto.nombre}
            onChange={e => setNuevoGasto({...nuevoGasto, nombre: e.target.value})}
            style={S.input}
          />
          <div style={S.flexRow}>
            <input 
              type="number" 
              placeholder="Monto Total $" 
              value={nuevoGasto.montoTotal}
              onChange={e => setNuevoGasto({...nuevoGasto, montoTotal: e.target.value})}
              style={S.input}
            />
            <input 
              type="date" 
              value={nuevoGasto.fechaVencimiento}
              onChange={e => setNuevoGasto({...nuevoGasto, fechaVencimiento: e.target.value})}
              style={S.input}
            />
          </div>
          <button type="submit" style={S.btnBlue}>+ Guardar Gasto</button>
        </form>
      </div>

      {/* Historial */}
      <div style={S.card}>
        <button 
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#d1d5db', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', ...S.flexBetween }}
        >
          <span>Historial de Abonos ({historialAbonos.length})</span>
          <span>{mostrarHistorial ? '▲' : '▼'}</span>
        </button>

        {mostrarHistorial && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151' }}>
            {historialAbonos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>No hay abonos registrados aún.</p>
            ) : (
              historialAbonos.map(abono => (
                <div key={abono.id} style={{ ...S.flexBetween, padding: '6px 0', borderBottom: '1px solid #374151', fontSize: '12px' }}>
                  <div>
                    <div><strong>{abono.gastoNombre}</strong></div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{abono.fecha}</div>
                  </div>
                  <div>
                    <span style={{ color: '#4ade80', fontWeight: 'bold', marginRight: '8px' }}>+${abono.monto}</span>
                    <button onClick={() => eliminarAbono(abono.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}