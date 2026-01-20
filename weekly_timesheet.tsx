import React, { useState } from 'react';
import { Calendar, Mail, Plus, Trash2, Check, X } from 'lucide-react';

const WeeklyTimesheetApp = () => {
  const [currentStep, setCurrentStep] = useState('selectWeek');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [activities, setActivities] = useState({
    'Reunion Diaria': [],
    'Ausführungsplan': [],
    'Entwurfsplan': [],
    'Konstruktionsplan y Stückliste': [],
    'Gesamtstückliste': [],
    'Radio Elektro': [],
    'Speedboat': [],
    'RaceCard': [],
    '2ndPL': [],
    'Revision de TI Dokumentation': [],
    'TI Dokumentacion': [],
    'Nokia Dokumentation': [],
    'CW Dokumentation': [],
    'AS Built': []
  });
  const [customActivities, setCustomActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState('');
  const [pd, setPd] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const isHoliday = (dateString) => {
    return holidays.includes(dateString);
  };

  const toggleHoliday = (dateString) => {
    setHolidays(prev => 
      prev.includes(dateString)
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
  };

  const generateCalendarMonths = () => {
    const months = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(selectedYear, month, 1);
      const lastDay = new Date(selectedYear, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      
      // Calcular días del mes anterior para completar la primera semana
      const prevMonthLastDay = new Date(selectedYear, month, 0).getDate();
      const prevMonthDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      
      const calendarDays = [];
      
      // Días del mes anterior (en gris)
      for (let i = prevMonthDays - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDay - i;
        calendarDays.push({
          date: dayNum,
          isCurrentMonth: false,
          dateString: null,
          dayOfWeek: null
        });
      }
      
      // Días del mes actual
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, month, day);
        const dayOfWeek = date.getDay();
        const dateString = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        calendarDays.push({
          date: day,
          isCurrentMonth: true,
          dateString: dateString,
          dayOfWeek: dayOfWeek,
          isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5
        });
      }
      
      // Días del mes siguiente para completar la última semana
      const remainingDays = 7 - (calendarDays.length % 7);
      if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
          calendarDays.push({
            date: i,
            isCurrentMonth: false,
            dateString: null,
            dayOfWeek: null
          });
        }
      }
      
      months.push({
        name: monthNames[month],
        days: calendarDays
      });
    }
    return months;
  };

  const getWeekDates = (weekString) => {
    const [year, week] = weekString.split('-W');
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const dateString = currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      // Verificar si NO es festivo antes de agregarlo
      if (!isHoliday(dateString)) {
        dates.push({
          day: dayNames[i],
          date: dateString
        });
      }
    }
    return dates;
  };

  const handleWeekSelect = (e) => {
    const week = e.target.value;
    setSelectedWeek(week);
    const dates = getWeekDates(week);
    setWeekDates(dates);
  };

  const handleAllDaysWorked = (worked) => {
    if (worked) {
      setWorkDays(weekDates);
      setCurrentStep('selectActivities');
    } else {
      setCurrentStep('selectDays');
    }
  };

  const toggleWorkDay = (day) => {
    setWorkDays(prev => 
      prev.find(d => d.day === day.day)
        ? prev.filter(d => d.day !== day.day)
        : [...prev, day]
    );
  };

  const toggleActivityDay = (activity, day) => {
    setActivities(prev => ({
      ...prev,
      [activity]: prev[activity].find(d => d.day === day.day)
        ? prev[activity].filter(d => d.day !== day.day)
        : [...prev[activity], day]
    }));
  };

  const addCustomActivity = () => {
    if (newActivityName.trim()) {
      setCustomActivities(prev => [...prev, newActivityName.trim()]);
      setActivities(prev => ({ ...prev, [newActivityName.trim()]: [] }));
      setNewActivityName('');
    }
  };

  const removeCustomActivity = (activityName) => {
    setCustomActivities(prev => prev.filter(a => a !== activityName));
    const newActivities = { ...activities };
    delete newActivities[activityName];
    setActivities(newActivities);
  };

  const generateGroupedTable = () => {
    const grouped = {};
    
    // Agrupar actividades por día
    Object.entries(activities).forEach(([activity, days]) => {
      days.forEach(day => {
        if (!grouped[day.day]) {
          grouped[day.day] = {
            day: day.day,
            date: day.date,
            tasks: []
          };
        }
        grouped[day.day].tasks.push(activity);
      });
    });

    // Convertir a array y ordenar por día de la semana
    return dayNames
      .map(dayName => grouped[dayName])
      .filter(item => item !== undefined);
  };

  const copyTableToClipboard = async () => {
    const rows = generateGroupedTable();
    let html = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; width: 100%; max-width: 800px;">
      <thead>
        <tr style="background-color: #2563eb; color: white;">
          <th style="padding: 12px; text-align: left; width: 15%;">Día de la semana</th>
          <th style="padding: 12px; text-align: left; width: 15%;">Fecha</th>
          <th style="padding: 12px; text-align: left; width: 15%;">PD</th>
          <th style="padding: 12px; text-align: left; width: 55%;">Tareas</th>
        </tr>
      </thead>
      <tbody>`;
    
    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#f3f4f6' : '#ffffff';
      html += `<tr style="background-color: ${bgColor};">
        <td style="padding: 10px; border: 1px solid #d1d5db;"><strong>${row.day}</strong></td>
        <td style="padding: 10px; border: 1px solid #d1d5db;">${row.date}</td>
        <td style="padding: 10px; border: 1px solid #d1d5db;">${pd}</td>
        <td style="padding: 10px; border: 1px solid #d1d5db;">
          ${row.tasks.map(task => `• ${task}`).join('<br>')}
        </td>
      </tr>`;
    });
    
    html += '</tbody></table>';
    
    // Crear versión texto plano también
    let textVersion = 'Día de la semana\tFecha\tPD\tTareas\n';
    rows.forEach(row => {
      textVersion += `${row.day}\t${row.date}\t${pd}\t${row.tasks.join(', ')}\n`;
    });
    
    try {
      // Intentar copiar HTML y texto
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([textVersion], { type: 'text/plain' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
      ]);
      
      alert('¡Tabla copiada! Ahora puedes pegarla directamente en tu correo (Ctrl+V o Cmd+V).');
    } catch (err) {
      // Fallback: copiar solo el HTML
      try {
        await navigator.clipboard.writeText(html);
        alert('Tabla copiada como HTML. Pégala en tu correo.');
      } catch (err2) {
        alert('Error al copiar. Por favor, intenta de nuevo o usa el navegador Chrome/Edge.');
      }
    }
  };

  const allActivities = [...Object.keys(activities)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                Gestor de Imputaciones Semanales
              </h1>
              <p className="mt-2 text-blue-100 text-sm sm:text-base">Automatiza tus reportes semanales de forma sencilla</p>
            </div>
            <button
              onClick={() => setShowHolidayCalendar(!showHolidayCalendar)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-white/30 font-semibold"
            >
              🗓️ Festivos
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {showHolidayCalendar && (
            <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📅 Gestión de Festivos {selectedYear}</h2>
                <button
                  onClick={() => setShowHolidayCalendar(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los días festivos de tu empresa. Los días marcados no aparecerán en las imputaciones semanales.
                Total festivos marcados: <strong>{holidays.length}</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {generateCalendarMonths().map((month, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <h3 className="font-bold text-lg mb-3 text-center text-gray-800">{month.name} {selectedYear}</h3>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day, i) => (
                        <div key={i} className="text-xs font-bold text-center text-gray-600 p-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {month.days.map((day, dayIdx) => (
                        <button
                          key={dayIdx}
                          onClick={() => day.isCurrentMonth && day.isWeekday && toggleHoliday(day.dateString)}
                          disabled={!day.isCurrentMonth || !day.isWeekday}
                          className={`p-2 text-xs rounded transition-all ${
                            !day.isCurrentMonth
                              ? 'text-gray-300 cursor-default'
                              : !day.isWeekday
                              ? 'bg-gray-200 text-gray-400 cursor-default'
                              : isHoliday(day.dateString)
                              ? 'bg-red-500 text-white font-bold shadow-md hover:bg-red-600'
                              : 'bg-gray-100 hover:bg-blue-100 text-gray-700 cursor-pointer'
                          }`}
                          title={day.dateString || ''}
                        >
                          {day.date}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setHolidays([])}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Limpiar todos
                </button>
              </div>
            </div>
          )}

          {currentStep === 'selectWeek' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <label className="block text-lg font-semibold mb-3 text-gray-800">📅 Selecciona la semana:</label>
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={handleWeekSelect}
                  className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <label className="block text-lg font-semibold mb-3 text-gray-800">🏢 PD (Proyecto/Departamento):</label>
                <input
                  type="text"
                  value={pd}
                  onChange={(e) => setPd(e.target.value)}
                  placeholder="Introduce el código del proyecto"
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                />
              </div>

              {selectedWeek && weekDates.length > 0 && pd && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <p className="text-lg font-semibold mb-4 text-gray-800">💼 ¿Has asistido todos los días al trabajo esta semana?</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleAllDaysWorked(true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Check className="w-6 h-6" />
                      Sí, todos los días
                    </button>
                    <button
                      onClick={() => handleAllDaysWorked(false)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-semibold"
                    >
                      <X className="w-6 h-6" />
                      No, faltaron días
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'selectDays' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Selecciona los días que sí asististe:</h2>
              <div className="space-y-3">
                {weekDates.map(day => (
                  <button
                    key={day.day}
                    onClick={() => toggleWorkDay(day)}
                    className={`w-full p-5 rounded-xl border-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      workDays.find(d => d.day === day.day)
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 shadow-blue-200'
                        : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{day.day}</span>
                      <span className="text-gray-600">{day.date}</span>
                    </div>
                  </button>
                ))}
              </div>
              {workDays.length > 0 && (
                <button
                  onClick={() => setCurrentStep('selectActivities')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                >
                  Continuar →
                </button>
              )}
            </div>
          )}

          {currentStep === 'selectActivities' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Selecciona las actividades realizadas:</h2>
              
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-300 shadow-md">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg text-gray-800">
                  <Plus className="w-6 h-6 text-green-600" />
                  Añadir actividad personalizada
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="Nombre de la nueva actividad"
                    className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomActivity()}
                  />
                  <button
                    onClick={addCustomActivity}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {allActivities.map(activity => (
                  <div key={activity} className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{activity}</h3>
                      {customActivities.includes(activity) && (
                        <button
                          onClick={() => removeCustomActivity(activity)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {workDays.map(day => (
                        <button
                          key={day.day}
                          onClick={() => toggleActivityDay(activity, day)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                            activities[activity]?.find(d => d.day === day.day)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {day.day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep('viewTable')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold text-lg"
              >
                📊 Generar Tabla
              </button>
            </div>
          )}

          {currentStep === 'viewTable' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">📋 Tabla de Imputaciones</h2>
              
              <div className="overflow-x-auto border-2 border-gray-300 rounded-xl shadow-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="p-4 text-left font-bold">Día de la semana</th>
                      <th className="p-4 text-left font-bold">Fecha</th>
                      <th className="p-4 text-left font-bold">PD</th>
                      <th className="p-4 text-left font-bold">Tareas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateGroupedTable().map((row, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                        <td className="p-4 border-t border-gray-200 font-semibold text-gray-800">{row.day}</td>
                        <td className="p-4 border-t border-gray-200 text-gray-700">{row.date}</td>
                        <td className="p-4 border-t border-gray-200 text-gray-700">{pd}</td>
                        <td className="p-4 border-t border-gray-200">
                          <ul className="space-y-1">
                            {row.tasks.map((task, taskIdx) => (
                              <li key={taskIdx} className="text-gray-700">• {task}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={copyTableToClipboard}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold text-lg"
                >
                  <Mail className="w-6 h-6" />
                  Copiar para Email
                </button>
                <button
                  onClick={() => {
                    setCurrentStep('selectWeek');
                    setSelectedWeek('');
                    setWorkDays([]);
                    setActivities({
                      'Reunion Diaria': [],
                      'Ausführungsplan': [],
                      'Entwurfsplan': [],
                      'Konstruktionsplan y Stückliste': [],
                      'Gesamtstückliste': [],
                      'Radio Elektro': [],
                      'Speedboat': [],
                      'RaceCard': [],
                      '2ndPL': [],
                      'Revision de TI Dokumentation': [],
                      'TI Dokumentacion': [],
                      'Nokia Dokumentation': [],
                      'CW Dokumentation': [],
                      'AS Built': []
                    });
                    setPd('');
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold text-lg"
                >
                  🔄 Nueva Imputación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimesheetApp;