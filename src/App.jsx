import React, { useState, useEffect } from 'react';

export default function App() {
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  const fechaActual = obtenerFechaHoy();

  const sumarUnMes = (fechaStr) => {
    if (!fechaStr) return fechaActual;
    const [year, month, day] = fechaStr.split('-').map(Number);
    const nuevaFecha = new Date(year, month - 1 + 1, day);
    return nuevaFecha.toISOString().split('T')[0];
  };

  const [gastosFijos, setGastosFijos] = useState(() => {
    const saved = localStorage.getItem('gastosFijos');
    return saved ? JSON.parse(saved) : [
      { id: 1, nombre: 'Renta Auto / Cuota', montoTotal: 2500, abonado: 0, fechaVencimiento: '2026-10-18' },
      { id: 2, nombre: 'Seguro', montoTotal: 1200, abonado: 0, fechaVencimiento: '2026-10-31' }
    ];
  });

  const [gastosNoCumplidos, setGastosNoCumplidos] = useState(() => {
    const saved = localStorage.getItem('gastosNoCumplidos');
    return saved ? JSON.parse(saved) : [];
  });

  const [gastosOperativos, setGastosOperativos] = useState(() => {
    const savedFecha = localStorage.getItem('fechaOperativos');
    const savedOps = localStorage.getItem('gastosOperativos');
    if (savedFecha === fechaActual && savedOps) {
      return JSON.parse(savedOps);
    }
    return [];
  });

  const [historialOperativos, setHistorialOperativos] = useState(() => {
    const saved = localStorage.getItem('historialOperativos');
    return saved ? JSON.parse(saved) : [];
  });

  const [historialAbonos, setHistorialAbonos] = useState(() => {
    const saved = localStorage.getItem('historialAbonos');
    return saved ? JSON.parse(saved) : [];
  });

  const [ingresoHoy, setIngresoHoy] = useState(() => {
    const savedFecha = localStorage.getItem('fechaIngreso');
    const savedIngreso = localStorage.getItem('ingresoHoy');
    if (savedFecha === fechaActual && savedIngreso) {
      return Number(savedIngreso);
    }
    return '';
  });

  const [historialIngresos, setHistorialIngresos] = useState(() => {
    const saved = localStorage.getItem('historialIngresos');
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevoGasto, setNuevoGasto] = useState({ nombre: '', montoTotal: '', fechaVencimiento: '' });
  const [nuevoAbono, setNuevoAbono] = useState({ gastoId: '', monto: '' });
  const [nuevoOp, setNuevoOp] = useState({ concepto: 'Gasolina', monto: '' });
  
  const [mostrarHistorialAbonos, setMostrarHistorialAbonos] = useState(false);
  const [mostrarHistorialOps, setMostrarHistorialOps] = useState(false);
  const [mostrarHistorialIngresos, setMostrarHistorialIngresos] = useState(false);
  const [mostrarNoCumplidos, setMostrarNoCumplidos] = useState(false);

  useEffect(() => {
    let huboCambios = false;
    let nuevosFijos = [...gastosFijos];
    let nuevosNoCumplidos = [...gastosNoCumplidos];

    const hoy = new Date(fechaActual);

    gastosFijos.forEach((gasto) => {
      if (!gasto.fechaVencimiento) return;
      const vencimiento = new Date(gasto.fechaVencimiento);

      if (hoy >= vencimiento) {
        huboCambios = true;
        const cumplido = gasto.abonado >= gasto.montoTotal;

        if (!cumplido) {
          nuevosNoCumplidos.unshift({
            ...gasto,
            idNoCumplido: Date.now() + Math.random(),
            fechaFallida: gasto.fechaVencimiento,
            faltante: gasto.montoTotal - gasto.abonado
          });
        }

        nuevosFijos = nuevosFijos.filter(g => g.id !== gasto.id);
        nuevosFijos.push({
          id: Date.now() + Math.random(),
          nombre: gasto.nombre,
          montoTotal: gasto.montoTotal,
          abonado: 0,
          fechaVencimiento: sumarUnMes(gasto.fechaVencimiento)
        });
      }
    });

    if (huboCambios) {
      setGastosFijos(nuevosFijos);
      setGastosNoCumplidos(nuevosNoCumplidos);
    }
  }, [fechaActual]);

  useEffect(() => {
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }, [gastosFijos]);

  useEffect(() => {
    localStorage.setItem('gastosNoCumplidos', JSON.stringify(gastosNoCumplidos));
  }, [gastosNoCumplidos]);

  useEffect(() => {
    localStorage.setItem('gastosOperativos', JSON.stringify(gastosOperativos));
    localStorage.setItem('fechaOperativos', fechaActual);
  }, [gastosOperativos, fechaActual]);

  useEffect(() => {
    localStorage.setItem('historialOperativos', JSON.stringify(historialOperativos));
  }, [historialOperativos]);

  useEffect(() => {
    localStorage.setItem('historialAbonos', JSON.stringify(historialAbonos));
  }, [historialAbonos]);

  useEffect(() => {
    localStorage.setItem('ingresoHoy', ingresoHoy.toString());
    localStorage.setItem('fechaIngreso', fechaActual);
  }, [ingresoHoy, fechaActual]);

  useEffect(() => {
    localStorage.setItem('historialIngresos', JSON.stringify(historialIngresos));
  }, [historialIngresos]);

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
  const disponibleParaAbonar = Math.max(0, (Number(ingresoHoy) || 0) - totalGastosOpHoy);

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

    if (monto > disponibleParaAbonar) {
      alert(`No puedes abonar $${monto}. Tu disponible real de hoy es solo $${disponibleParaAbonar.toFixed(2)}`);
      return;
    }

    setGastosFijos(gastosFijos.map(g => g.id === id ? { ...g, abonado: g.abonado + monto } : g));

    const gastoRef = gastosFijos.find(g => g.id === id);
    const nuevoRegistroAbono = {
      id: Date.now(),
      gastoNombre: gastoRef ? gastoRef.nombre : 'Gasto',
      monto,
      fecha: new Date().toLocaleString()
    };

    setHistorialAbonos([nuevoRegistroAbono, ...historialAbonos]);
    setNuevoAbono({ gastoId: '', monto: '' });
  };

  const agregarGastoOp = (e) => {
    e.preventDefault();
    if (!nuevoOp.monto) return;
    const nuevoItem = {
      id: Date.now(),
      concepto: nuevoOp.concepto,
      monto: Number(nuevoOp.monto),
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha: fechaActual
    };

    setGastosOperativos([nuevoItem, ...gastosOperativos]);
    setHistorialOperativos([nuevoItem, ...historialOperativos]);
    setNuevoOp({ concepto: 'Gasolina', monto: '' });
  };

  const guardarCorteIngreso = () => {
    if (!ingresoHoy) return;
    const registroIngreso = {
      id: Date.now(),
      fecha: fechaActual,
      ingresoBruto: Number(ingresoHoy),
      operativos: totalGastosOpHoy,
      disponible: disponibleParaAbonar
    };
    const filtrados = historialIngresos.filter(item => item.fecha !== fechaActual);
    setHistorialIngresos([registroIngreso, ...filtrados]);
    setIngresoHoy(''); // Reset del campo tras guardar el corte
    alert('¡Corte de ingresos de hoy guardado en el historial con éxito!');
  };

  const eliminarGastoFijo = (id) => setGastosFijos(gastosFijos.filter(g => g.id !== id));
  const eliminarNoCumplido = (id) => setGastosNoCumplidos(gastosNoCumplidos.filter(g => g.idNoCumplido !== id));
  
  const eliminarGastoOp = (id) => {
    const listaActualizada = gastosOperativos.filter(op => op.id !== id);
    setGastosOperativos(listaActualizada);
    localStorage.setItem('gastosOperativos', JSON.stringify(listaActualizada));
  };

  const eliminarAbono = (id) => setHistorialAbonos(historialAbonos.filter(a => a.id !== id));
  const eliminarHistorialOp = (id) => setHistorialOperativos(historialOperativos.filter(op => op.id !== id));
  const eliminarHistorialIngreso = (id) => setHistorialIngresos(historialIngresos.filter(item => item.id !== id));

  const S = {
    app: { backgroundColor: '#111827', color: '#ffffff', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif', maxWidth: '420px', margin: '0 auto' },
    card: { backgroundColor: '#1f2937', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #374151' },
    header: { backgroundColor: '#2563eb', padding: '18px', borderRadius: '16px', textAlign: 'center', marginBottom: '16px' },
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
        <h1 style={{ fontSize: '34px', margin: '6px 0 0 0', fontWeight: 'bold' }}>${metaDiariaTotal.toFixed(2)}</h1>
        <p style={{ fontSize: '11px', opacity: '0.9', marginTop: '4px' }}>Fecha actual: {fechaActual}</p>
      </div>

      {/* Control de Flujo de Hoy */}
      <div style={{ ...S.card, borderColor: '#10b981', backgroundColor: '#064e3b' }}>
        <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '8px', color: '#6ee7b7' }}>💰 Flujo de Efectivo de Hoy</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: '#a7f3d0', display: 'block', marginBottom: '4px' }}>Ingreso Bruto Generado hoy ($):</label>
          <input 
            type="number" 
            placeholder="Ej: 1000" 
            value={ingresoHoy}
            onChange={e => setIngresoHoy(e.target.value)}
            style={{ ...S.input, backgroundColor: '#047857', borderColor: '#059669', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}
          />
        </div>

        <div style={{ ...S.flexBetween, padding: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px' }}>
          <span>(-) Gastos Operativos hoy:</span>
          <strong style={{ color: '#fb923c' }}>-${totalGastosOpHoy.toFixed(2)}</strong>
        </div>

        <div style={{ ...S.flexBetween, padding: '10px 8px', backgroundColor: '#065f46', borderRadius: '8px', marginTop: '8px', fontSize: '14px', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#ecfdf5' }}>Disponible Real para Abonar:</span>
          <strong style={{ color: '#34d399', fontSize: '18px' }}>${disponibleParaAbonar.toFixed(2)}</strong>
        </div>

        <button onClick={guardarCorteIngreso} style={{ width: '100%', backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
          💾 Guardar Corte en Historial de Ingresos
        </button>
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
              placeholder={`Máx: $${disponibleParaAbonar.toFixed(0)}`} 
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
          {gastosOperativos.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '8px 0' }}>No hay gastos operativos hoy.</p>
          ) : (
            gastosOperativos.map(op => (
              <div key={op.id} style={{ ...S.flexBetween, padding: '6px 8px', backgroundColor: '#374151', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
                <span>{op.concepto} <span style={{ color: '#9ca3af' }}>({op.fechaHora})</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#fb923c', fontWeight: 'bold' }}>-${op.monto.toFixed(2)}</span>
                  <button onClick={() => eliminarGastoOp(op.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
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

      {/* Objetivos No Cumplidos */}
      <div style={{ ...S.card, borderColor: gastosNoCumplidos.length > 0 ? '#ef4444' : '#374151' }}>
        <button 
          onClick={() => setMostrarNoCumplidos(!mostrarNoCumplidos)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#f87171', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', ...S.flexBetween }}
        >
          <span>❌ Objetivos No Cumplidos / Vencidos ({gastosNoCumplidos.length})</span>
          <span>{mostrarNoCumplidos ? '▲' : '▼'}</span>
        </button>

        {mostrarNoCumplidos && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151', maxHeight: '180px', overflowY: 'auto' }}>
            {gastosNoCumplidos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>¡Excelente! No tienes metas vencidas sin cumplir.</p>
            ) : (
              gastosNoCumplidos.map(item => (
                <div key={item.idNoCumplido} style={{ ...S.flexBetween, padding: '8px 0', borderBottom: '1px solid #374151', fontSize: '12px' }}>
                  <div>
                    <div><strong>{item.nombre}</strong> <span style={{ fontSize: '10px', color: '#ef4444' }}>(Venció: {item.fechaFallida})</span></div>
                    <div style={{ color: '#9ca3af', fontSize: '11px' }}>Meta: ${item.montoTotal} \vert{} Cubierto:${item.abonado}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#f87171', fontWeight: 'bold' }}>Faltó: ${item.faltante}</span>
                    <button onClick={() => eliminarNoCumplido(item.idNoCumplido)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
          <div style={S.flexRow