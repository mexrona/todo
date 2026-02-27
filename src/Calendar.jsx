import { useState } from "react";

export default function Calendar({ todos, onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForComparison = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getTodosForDate = (date) => {
    const dateStr = formatDateForComparison(date);
    return todos.filter((todo) => todo.dueDate === dateStr || todo.createdAt === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
          >
            ← Пред.
          </button>
          <button
            onClick={handleToday}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            Сегодня
          </button>
          <button
            onClick={handleNextMonth}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
          >
            След. →
          </button>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дат */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateStr = formatDateForComparison(date);
          const todosForDate = getTodosForDate(date);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === formatDateForComparison(new Date());

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              className={`p-2 rounded-lg text-sm transition ${
                isSelected
                  ? "bg-indigo-600 text-white font-bold"
                  : isToday
                  ? "bg-yellow-100 border-2 border-yellow-400 text-gray-800 font-bold"
                  : "bg-gray-50 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <div className="font-semibold">{day}</div>
              {todosForDate.length > 0 && (
                <div className={`text-xs mt-1 ${isSelected ? "text-indigo-100" : "text-indigo-600"}`}>
                  {todosForDate.length} {todosForDate.length === 1 ? "задача" : "задач"}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Информация о выбранной дате */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-900">
            <span className="font-bold">Выбранная дата:</span> {selectedDate}
          </p>
        </div>
      )}
    </div>
  );
}
