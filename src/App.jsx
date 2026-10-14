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

  // Sumar días a una fecha YYYY-MM-DD
  const sumarDias = (fechaStr, dias) => {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
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

  // Gasolina pendiente con plazo de 3 días
  const [gasolinasPendientes, setGasolinasPendientes] = useState(() => {
    const saved = localStorage.getItem('gasolinasPendientes');
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

  // Antojos del día
  const [antojosHoy, setAntojosHoy] = useState(() => {
    const savedFecha = localStorage.getItem('fechaAntojos');
    const savedAntojos = localStorage.getItem('antojosHoy');
    if (savedFecha === fechaActual && savedAntojos) {
      return JSON.parse(savedAntojos);
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
  const [nuevoAntojo, setNuevoAntojo] = useState({ descripcion: '', monto: '' });
  
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
    localStorage.setItem('gasolinasPendientes', JSON.stringify(gasolinasPendientes));
  }, [gasolinasPendientes]);

  useEffect(() => {
    localStorage.setItem('gastosOperativos', JSON.stringify(gastosOperativos));
    localStorage.setItem('fechaOperativos', fechaActual);
  }, [gastosOperativos, fechaActual]);

  useEffect(() => {
    localStorage.setItem('antojosHoy', JSON.stringify(antojosHoy));
    localStorage.setItem('fechaAntojos', fechaActual);
  }, [antojosHoy, fechaActual]);

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

  // Gasolinas ordenadas por urgencia (vencimiento a 3 días)
  const gasolinasOrdenadas = [...gasolinasPendientes].sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

  // Verificar si hay alguna gasolina en su último día (o vencida) sin cubrir
  const hayGasolinaCritica = gasolinasPendientes.some(g => {
    const restante = g.montoTotal - g.abonado;
    const diasRem = calcularDiasRestantes(g.fechaVencimiento);
    return restante > 0 && diasRem <= 1; // Si queda 1 día o ya venció
  });

  // Meta Diaria Total = Fijos + Gasolinas Pendientes + Antojos del día a cubrir
  const metaGastosFijos = gastosFijos.reduce((acc, g) => {
    const pendiente = Math.max(0, g.montoTotal - g.abonado);
    const diasRem = calcularDiasRestantes(g.fechaVencimiento);
    return acc + (pendiente / diasRem);
  }, 0);

  const metaGasolinas = gasolinasPendientes.reduce((acc, g) => {
    const pendiente = Math.max(0, g.montoTotal - g.abonado);
    const diasRem = calcularDiasRestantes(g.fechaVencimiento);
    return acc + (pendiente / diasRem);
  }, 0);

  const totalAntojosHoy = antojosHoy.reduce((acc, a) => acc + Number(a.monto), 0);
  const metaDiariaTotal = metaGastosFijos + metaGasolinas + totalAntojosHoy;

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

  const registrarAbonoGastoFijo = (e) => {
    e.preventDefault();
    if (!nuevoAbono.gastoId || !nuevoAbono.monto) return;
    const monto = Number(nuevoAbono.monto);
    const id = Number(nuevoAbono.gastoId);

    if (hayGasolinaCritica) {
      alert('⚠️ Tienes una carga de gasolina en su día límite o vencida. ¡Primero debes cubrir la gasolina antes de abonar a otros gastos fijos!');
      return;
    }

    if (monto > disponibleParaAbonar) {
      alert(`No puedes abonar $${monto}. Tu disponible real de hoy es solo $${disponibleParaAbonar.toFixed(2)}`);
      return;
    }

    setGastosFijos(gastosFijos.map(g => g.id === id ? { ...g, abonado: g.abonado + monto } : g));

    const gastoRef = gastosFijos.find(g => g.id === id);
    setHistorialAbonos([{
      id: Date.now(),
      gastoNombre: gastoRef ? gastoRef.nombre : 'Gasto Fijo',
      monto,
      fecha: new Date().toLocaleString()
    }, ...historialAbonos]);

    setNuevoAbono({ gastoId: '', monto: '' });
  };

  // Abonar a Gasolina Pendiente
  const abonarGasolina = (id, montoAbono) => {
    const monto = Number(montoAbono);
    if (!monto || monto <= 0) return;

    if (monto > disponibleParaAbonar) {
      alert(`No puedes abonar $${monto}. Tu disponible real es $${disponibleParaAbonar.toFixed(2)}`);
      return;
    }

    setGasolinasPendientes(gasolinasPendientes.map(g => {
      if (g.id === id) {
        const nuevoAbonado = g.abonado + monto;
        return { ...g, abonado: nuevoAbonado };
      }
      return g;
    }));

    // Si ya se cubrió totalmente, la eliminamos de pendientes
    const gastoGas = gasolinasPendientes.find(g => g.id === id);
    setHistorialAbonos([{
      id: Date.now(),
      gastoNombre: `⛽ Gasolina (${gastoGas?.fechaVencimiento || 'Carga'})`,
      monto,
      fecha: new Date().toLocaleString()
    }, ...historialAbonos]);
  };

  const agregarGastoOp = (e) => {
    e.preventDefault();
    if (!nuevoOp.monto) return;
    const montoNum = Number(nuevoOp.monto);
    const nuevoItem = {
      id: Date.now(),
      concepto: nuevoOp.concepto,
      monto: montoNum,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha: fechaActual
    };

    setGastosOperativos([nuevoItem, ...gastosOperativos]);
    setHistorialOperativos([nuevoItem, ...historialOperativos]);

    // SI ES GASOLINA, automáticamente crea un apartado con plazo de 3 días
    if (nuevoOp.concepto === 'Gasolina') {
      const fechaVencGas = sumarDias(fechaActual, 3);
      const nuevaGasPendiente = {
        id: Date.now() + Math.random(),
        nombre: `Tanque Gasolina (${fechaActual})`,
        montoTotal: montoNum,
        abonado: 0,
        fechaVencimiento: fechaVencGas
      };
      setGasolinasPendientes([...gasolinasPendientes, nuevaGasPendiente]);
    }

    setNuevoOp({ concepto: 'Gasolina', monto: '' });
  };

  // Agregar Antojos
  const agregarAntojo = (e) => {
    e.preventDefault();
    if (!nuevoAntojo.monto) return;
    const item = {
      id: Date.now(),
      descripcion: nuevoAntojo.descripcion || 'Antojo / Gusto',
      monto: Number(nuevoAntojo.monto),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAntojosHoy([item, ...antojosHoy]);
    setNuevoAntojo({ descripcion: '', monto: '' });
  };

  const guardarCorteIngreso = () => {
    if (!ingresoHoy) return;
    const registroIngreso = {
      id: Date.now(),
      fecha: fechaActual,
      ingresoBruto: Number(ingresoHoy),
      operativos: totalGastosOpHoy,
      antojos: totalAntojosHoy,
      disponible: disponibleParaAbonar
    };
    const filtrados = historialIngresos.filter(item => item.fecha !== fechaActual);
    setHistorialIngresos([registroIngreso, ...filtrados]);
    setIngresoHoy('');
    alert('¡Corte de ingresos de hoy guardado en el historial con éxito!');
  };

  const eliminarGastoFijo = (id) => setGastosFijos(gastosFijos.filter(g => g.id !== id));
  const eliminarNoCumplido = (id) => setGastosNoCumplidos(gastosNoCumplidos.filter(g => g.idNoCumplido !== id));
  const eliminarGasolinaPendiente = (id) => setGasolinasPendientes(gasolinasPendientes.filter(g => g.id !== id));
  
  const eliminarGastoOp = (id) => {
    const listaActualizada = gastosOperativos.filter(op => op.id !== id);
    setGastosOperativos(listaActualizada);
    localStorage.setItem('gastosOperativos', JSON.stringify(listaActualizada));
  };

  const eliminarAntojo = (id) => setAntojosHoy(antojosHoy.filter(a => a.id !== id));
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
        <p style={{ fontSize: '11px', opacity: '0.9', marginTop: '4px' }}>Incluye deudas, gasolina a 3 días y antojos del día</p>
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

        <div style={{ ...S.flexBetween, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px', marginBottom: '4px' }}>
          <span>(-) Operativos hoy:</span>
          <strong style={{ color: '#fb923c' }}>-${totalGastosOpHoy.toFixed(2)}</strong>
        </div>

        <div style={{ ...S.flexBetween, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px', marginBottom: '8px' }}>
          <span>(-) Antojos hoy:</span>
          <strong style={{ color: '#f43f5e' }}>-${totalAntojosHoy.toFixed(2)}</strong>
        </div>

        <div style={{ ...S.flexBetween, padding: '10px 8px', backgroundColor: '#065f46', borderRadius: '8px', marginTop: '8px', fontSize: '14px', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#ecfdf5' }}>Disponible Real para Abonar:</span>
          <strong style={{ color: '#34d399', fontSize: '18px' }}>${disponibleParaAbonar.toFixed(2)}</strong>
        </div>

        <button onClick={guardarCorteIngreso} style={{ width: '100%', backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
          💾 Guardar Corte en Historial de Ingresos
        </button>
      </div>

      {/* GASOLINAS PENDIENTES (Plazo 3 Días) */}
      {gasolinasPendientes.length > 0 && (
        <div style={{ ...S.card, borderColor: hayGasolinaCritica ? '#ef4444' : '#f59e0b', backgroundColor: hayGasolinaCritica ? '#2c1517' : '#292524' }}>
          <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '8px', color: '#fbbf24' }}>⛽ Tanques de Gasolina Pendientes (Plazo 3 Días)</h3>
          {hayGasolinaCritica && (
            <p style={{ fontSize: '11px', color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>
              ⚠️ ¡Gasolina en día límite! Abonos a otros gastos fijos bloqueados hasta cubrirla.
            </p>
          )}
          {gasolinasOrdenadas.map(gas => {
            const pendienteGas = Math.max(0, gas.montoTotal - gas.abonado);
            const diasRemGas = calcularDiasRestantes(gas.fechaVencimiento);
            const cuotaGas = (pendienteGas / diasRemGas).toFixed(2);
            const porcentajeGas = Math.min(100, Math.round((gas.abonado / gas.montoTotal) * 100));

            return (
              <div key={gas.id} style={{ backgroundColor: '#1c1917', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #44403c' }}>
                <div style={S.flexBetween}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>{gas.nombre}</strong>
                    <div style={{ fontSize: '11px', color: '#a8a29e' }}>Límite: {gas.fechaVencimiento} ({diasRemGas} días rem.) | Meta/día: ${cuotaGas}</div>
                  </div>
                  <button onClick={() => eliminarGasolinaPendiente(gas.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                </div>
                <div style={{ ...S.flexBetween, fontSize: '11px', marginTop: '6px', marginBottom: '2px' }}>
                  <span>Abonado: ${gas.abonado} /${gas.montoTotal}</span>
                  <span style={{ color: '#34d399' }}>Falta: ${pendienteGas}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#44403c', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${porcentajeGas}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                </div>
                {pendienteGas > 0 && (
                  <div style={S.flexRow}>
                    <input 
                      type="number" 
                      placeholder={`Abonar (Máx $${Math.min(disponibleParaAbonar, pendienteGas).toFixed(0)})`} 
                      id={`input-gas-${gas.id}`}
                      style={{ ...S.input, fontSize: '12px', padding: '6px' }}
                    />
                    <button 
                      onClick={() => {
                        const val = document.getElementById(`input-gas-${gas.id}`).value;
                        abonarGasolina(gas.id, val);
                        document.getElementById(`input-gas-${gas.id}`).value = '';
                      }} 
                      style={{ ...S.btnGreen, padding: '6px 12px', fontSize: '12px' }}
                    >
                      Abonar Gas
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Registrar Abono a Gasto Fijo */}
      <div style={S.card}>
        <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '12px', color: '#4ade80' }}>💵 Registrar Abono a Gasto Fijo</h3>
        <form onSubmit={registrarAbonoGastoFijo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select 
            value={nuevoAbono.gastoId} 
            onChange={e => setNuevoAbono({...nuevoAbono, gastoId: e.target.value})}
            style={S.input}
          >
            <option value="">Selecciona Gasto Fijo...</option>
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

      {/* NUEVO APARTADO: Antojos del Día */}
      <div style={{ ...S.card, borderColor: '#f43f5e' }}>
        <div style={S.flexBetween}>
          <h3 style={{ fontSize: '14px', margin: 0, color: '#fb7185' }}>🍫 Antojos / Gustos de Hoy</h3>
          <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(244, 63, 94, 0.2)', padding: '4px 8px', borderRadius: '4px', color: '#fb7185' }}>
            Total: ${totalAntojosHoy.toFixed(2)}
          </span>
        </div>
        <form onSubmit={agregarAntojo} style={{ ...S.flexRow, marginTop: '12px', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="Descripción (ej. Café, snack)" 
            value={nuevoAntojo.descripcion}
            onChange={e => setNuevoAntojo({...nuevoAntojo, descripcion: e.target.value})}
            style={{ ...S.input, width: '45%' }}
          />
          <input 
            type="number" 
            placeholder="Monto $" 
            value={nuevoAntojo.monto}
            onChange={e => setNuevoAntojo({...nuevoAntojo, monto: e.target.value})}
            style={{ ...S.input, width: '25%' }}
          />
          <button type="submit" style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', width: '30%', cursor: 'pointer', fontSize: '12px' }}>+ Antojo</button>
        </form>
        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {antojosHoy.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '4px 0' }}>Sin antojos registrados hoy.</p>
          ) : (
            antojosHoy.map(a => (
              <div key={a.id} style={{ ...S.flexBetween, padding: '4px 8px', backgroundColor: '#374151', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
                <span>{a.descripcion} <span style={{ color: '#9ca3af' }}>({a.hora})</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#fb7185', fontWeight: 'bold' }}>-${a.monto.toFixed(2)}</span>
                  <button onClick={() => eliminarAntojo(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
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

      {/* HISTORIAL: Ingresos y Cierres */}
      <div style={S.card}>
        <button 
          onClick={() => setMostrarHistorialIngresos(!mostrarHistorialIngresos)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#6ee7b7', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', ...S.flexBetween }}
        >
          <span>📊 Historial de Ingresos / Cierres ({historialIngresos.length})</span>
          <span>{mostrarHistorialIngresos ? '▲' : '▼'}</span>
        </button>

        {mostrarHistorialIngresos && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151', maxHeight: '180px', overflowY: 'auto' }}>
            {historialIngresos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>No hay cortes de ingresos guardados.</p>
            ) : (
              historialIngresos.map(item => (
                <div key={item.id} style={{ ...S.flexBetween, padding: '8px 0', borderBottom: '1px solid #374151', fontSize: '12px' }}>
                  <div>
                    <div><strong>Fecha: {item.fecha}</strong></div>
                    <div style={{ color: '#9ca3af', fontSize: '11px' }}>Bruto: ${item.ingresoBruto} | Op: -${item.operativos} \vert{} Antojos: -${item.antojos || 0}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>Disp: ${item.disponible}</span>
                    <button onClick={() => eliminarHistorialIngreso(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* HISTORIAL: Operativos */}
      <div style={S.card}>
        <button 
          onClick={() => setMostrarHistorialOps(!mostrarHistorialOps)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#fb923c', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', ...S.flexBetween }}
        >
          <span>⛽ Historial de Gastos Operativos ({historialOperativos.length})</span>
          <span>{mostrarHistorialOps ? '▲' : '▼'}</span>
        </button>

        {mostrarHistorialOps && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151', maxHeight: '180px', overflowY: 'auto' }}>
            {historialOperativos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>No hay registros operativos anteriores.</p>
            ) : (
              historialOperativos.map(op => (
                <div key={op.id} style={{ ...S.flexBetween, padding: '6px 0', borderBottom: '1px solid #374151', fontSize: '12px' }}>
                  <div>
                    <div><strong>{op.concepto}</strong> <span style={{ color: '#9ca3af', fontSize: '10px' }}>({op.fecha} {op.fechaHora})</span></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fb923c', fontWeight: 'bold' }}>-${op.monto}</span>
                    <button onClick={() => eliminarHistorialOp(op.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* HISTORIAL: Abonos */}
      <div style={S.card}>
        <button 
          onClick={() => setMostrarHistorialAbonos(!mostrarHistorialAbonos)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#4ade80', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', ...S.flexBetween }}
        >
          <span>💵 Historial de Abonos ({historialAbonos.length})</span>
          <span>{mostrarHistorialAbonos ? '▲' : '▼'}</span>
        </button>

        {mostrarHistorialAbonos && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151', maxHeight: '180px', overflowY: 'auto' }}>
            {historialAbonos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>No hay abonos registrados aún.</p>
            ) : (
              historialAbonos.map(abono => (
                <div key={abono.id} style={{ ...S.flexBetween, padding: '6px 0', borderBottom: '1px solid #374151', fontSize: '12px' }}>
                  <div>
                    <div><strong>{abono.gastoNombre}</strong></div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{abono.fecha}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+${abono.monto}</span>
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