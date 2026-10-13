import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Trash2, DollarSign, Fuel, 
  ChevronDown, ChevronUp, Calendar, AlertCircle 
} from 'lucide-react';

export default function App() {
  // Estado principal
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

  // Formularios
  const [nuevoGasto, setNuevoGasto] = useState({ nombre: '', montoTotal: '', fechaVencimiento: '' });
  const [nuevoAbono, setNuevoAbono] = useState({ gastoId: '', monto: '' });
  const [nuevoOp, setNuevoOp] = useState({ concepto: 'Gasolina', monto: '' });
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Guardar en LocalStorage
  useEffect(() => {
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }, [gastosFijos]);

  useEffect(() => {
    localStorage.setItem('gastosOperativos', JSON.stringify(gastosOperativos));
  }, [gastosOperativos]);

  useEffect(() => {
    localStorage.setItem('historialAbonos', JSON.stringify(historialAbonos));
  }, [historialAbonos]);

  // Función para calcular días restantes a la fecha de vencimiento
  const calcularDiasRestantes = (fechaVenc) => {
    if (!fechaVenc) return 1;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [year, month, day] = fechaVenc.split('-').map(Number);
    const vencimiento = new Date(year, month - 1, day);
    const diferenciaMs = vencimiento - hoy;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 1; // Mínimo 1 día para evitar división por cero
  };

  // Gastos Fijos ORDENADOS automáticamente por fecha de vencimiento (del más próximo al más lejano)
  const gastosFijosOrdenados = [...gastosFijos].sort((a, b) => {
    if (!a.fechaVencimiento) return 1;
    if (!b.fechaVencimiento) return -1;
    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
  });

  // Meta diaria global basada en días restantes reales a cada fecha de vencimiento
  const metaDiariaTotal = gastosFijos.reduce((acc, g) => {
    const pendiente = Math.max(0, g.montoTotal - g.abonado);
    const diasRem = calcularDiasRestantes(g.fechaVencimiento);
    return acc + (pendiente / diasRem);
  }, 0);

  const totalGastosOpHoy = gastosOperativos.reduce((acc, g) => acc + Number(g.monto), 0);

  // Acciones
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

    setGastosFijos(gastosFijos.map(g => {
      if (g.id === id) {
        return { ...g, abonado: g.abonado + monto };
      }
      return g;
    }));

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

  const eliminarGastoFijo = (id) => {
    setGastosFijos(gastosFijos.filter(g => g.id !== id));
  };

  const eliminarAbono = (id) => {
    setHistorialAbonos(historialAbonos.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-md mx-auto font-sans">
      {/* Header & Meta Diaria Global */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg mb-6 text-center">
        <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase mb-1">Meta Diaria Fija Requerida</p>
        <h1 className="text-4xl font-extrabold">${metaDiariaTotal.toFixed(2)}</h1>
        <p className="text-xs text-blue-100 mt-2">Calculada según las fechas de vencimiento más próximas</p>
      </header>

      {/* Registrar Abono Rápido */}
      <section className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-green-400" /> Registrar Abono a Gasto Fijo
        </h2>
        <form onSubmit={registrarAbono} className="flex flex-col gap-2">
          <select 
            value={nuevoAbono.gastoId} 
            onChange={e => setNuevoAbono({...nuevoAbono, gastoId: e.target.value})}
            className="bg-gray-700 text-white p-2.5 rounded-lg border border-gray-600 text-sm"
          >
            <option value="">Selecciona Gasto (Ordenado por Vencimiento)...</option>
            {gastosFijosOrdenados.map(g => (
              <option key={g.id} value={g.id}>
                {g.nombre} - Falta: ${(g.montoTotal - g.abonado).toFixed(0)} (Vence: {g.fechaVencimiento || 'S/F'})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Monto $" 
              value={nuevoAbono.monto}
              onChange={e => setNuevoAbono({...nuevoAbono, monto: e.target.value})}
              className="bg-gray-700 text-white p-2.5 rounded-lg border border-gray-600 w-full text-sm"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-500 font-bold px-4 py-2.5 rounded-lg text-sm">
              Abonar
            </button>
          </div>
        </form>
      </section>

      {/* Gastos Operativos del Día */}
      <section className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Fuel size={16} className="text-orange-400" /> Operativos de Hoy
          </h2>
          <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
            Total: ${totalGastosOpHoy.toFixed(2)}
          </span>
        </div>
        <form onSubmit={agregarGastoOp} className="flex gap-2 mb-3">
          <select 
            value={nuevoOp.concepto}
            onChange={e => setNuevoOp({...nuevoOp, concepto: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs w-1/3"
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
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs w-1/3"
          />
          <button type="submit" className="bg-orange-600 hover:bg-orange-500 font-bold px-3 py-2 rounded-lg text-xs w-1/3">
            + Registro
          </button>
        </form>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {gastosOperativos.map(op => (
            <div key={op.id} className="flex justify-between text-xs bg-gray-700/50 p-2 rounded">
              <span>{op.concepto} <span className="text-gray-400">({op.fecha})</span></span>
              <span className="font-bold text-orange-300">-${op.monto.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de Gastos Fijos (Ordenados Automáticamente) */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-300">Gastos Fijos por Vencimiento</h2>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar size={12} /> Próximos primero
          </span>
        </div>

        <div className="space-y-3">
          {gastosFijosOrdenados.map(gasto => {
            const porcentaje = Math.min(100, Math.round((gasto.abonado / gasto.montoTotal) * 100));
            const restante = Math.max(0, gasto.montoTotal - gasto.abonado);
            const diasRem = calcularDiasRestantes(gasto.fechaVencimiento);
            const cuotaDiaria = (restante / diasRem).toFixed(2);

            const esUrgente = diasRem <= 3 && porcentaje < 100;

            return (
              <div 
                key={gasto.id} 
                className={`bg-gray-800 p-4 rounded-xl border relative transition-all ${
                  esUrgente ? 'border-red-500/80 bg-red-950/20' : 'border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{gasto.nombre}</h3>
                      {esUrgente && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle size={10} /> ¡Próximo!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Vence: <span className="text-gray-200 font-medium">{gasto.fechaVencimiento || 'Sin fecha'}</span> ({diasRem} días rem.)
                    </p>
                    <p className="text-xs text-gray-400">
                      Cuota recomendada: <span className="text-blue-400 font-bold">${cuotaDiaria}/día</span>
                    </p>
                  </div>
                  <button onClick={() => eliminarGastoFijo(gasto.id)} className="text-gray-500 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span>Abonado: ${gasto.abonado}</span>
                  <span>Meta: ${gasto.montoTotal}</span>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full transition-all duration-300 ${porcentaje >= 100 ? 'bg-green-500' : esUrgente ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
                <div className="text-right text-[10px] text-gray-400">{porcentaje}% completado</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agregar Nuevo Gasto Fijo con Fecha de Vencimiento */}
      <section className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <PlusCircle size={16} className="text-blue-400" /> Crear Nuevo Gasto Fijo
        </h2>
        <form onSubmit={agregarGastoFijo} className="space-y-2">
          <input 
            type="text" 
            placeholder="Nombre (Ej: Renta vehículo)" 
            value={nuevoGasto.nombre}
            onChange={e => setNuevoGasto({...nuevoGasto, nombre: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs w-full"
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Monto Total $" 
              value={nuevoGasto.montoTotal}
              onChange={e => setNuevoGasto({...nuevoGasto, montoTotal: e.target.value})}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs w-1/2"
            />
            <input 
              type="date" 
              value={nuevoGasto.fechaVencimiento}
              onChange={e => setNuevoGasto({...nuevoGasto, fechaVencimiento: e.target.value})}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs w-1/2"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-2 rounded-lg text-xs">
            + Guardar Gasto
          </button>
        </form>
      </section>

      {/* Desplegable de Historial de Abonos */}
      <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <button 
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
          className="w-full p-4 flex justify-between items-center text-sm font-bold text-gray-300"
        >
          <span>Historial de Abonos ({historialAbonos.length})</span>
          {mostrarHistorial ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {mostrarHistorial && (
          <div className="p-4 border-t border-gray-700 space-y-2 max-h-48 overflow-y-auto">
            {historialAbonos.length === 0 ? (
              <p className="text-xs text-gray-500 text-center">No hay abonos registrados aún.</p>
            ) : (
              historialAbonos.map(abono => (
                <div key={abono.id} className="flex justify-between items-center bg-gray-700/40 p-2 rounded text-xs">
                  <div>
                    <p className="font-bold text-white">{abono.gastoNombre}</p>
                    <p className="text-[10px] text-gray-400">{abono.fecha}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-400">+${abono.monto}</span>
                    <button onClick={() => eliminarAbono(abono.id)} className="text-gray-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}