import {useState, useEffect} from "react";
import Calendar from "./Calendar";

export default function App() {
    // Состояние для списка задач
    const [todos, setTodos] = useState([]);

    // Состояние для новой задачи в инпуте
    const [inputValue, setInputValue] = useState("");
    // Состояние для даты выполнения новой задачи
    const [dueDateInput, setDueDateInput] = useState("");

    // Состояние для фильтра (все/активные/выполненные)
    const [filter, setFilter] = useState("all");

    // Состояние для редактирования (какая задача редактируется)
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editDueDate, setEditDueDate] = useState("");

    // Состояние для вида (список или календарь)
    const [viewMode, setViewMode] = useState("list"); // "list" или "calendar"
    // Состояние для выбранной даты в календаре
    const [selectedDate, setSelectedDate] = useState(null);

    // Загружаем задачи из localStorage когда компонент впервые монтируется
    useEffect(() => {
        const saved = localStorage.getItem("todos");
        if (saved) {
            try {
                setTodos(JSON.parse(saved));
            } catch (error) {
                console.error("Ошибка загрузки задач:", error);
            }
        }
    }, []);

    // Сохраняем задачи в localStorage каждый раз когда они меняются
    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    // Добавить новую задачу
    const handleAddTodo = (e) => {
        e.preventDefault();

        // Не добавляем пустые задачи
        if (inputValue.trim() === "") return;

        const newTodo = {
            id: Date.now(), // Простой способ создать уникальный ID
            text: inputValue,
            completed: false,
            createdAt: new Date().toLocaleDateString("ru-RU"),
            dueDate: dueDateInput || null,
        };

        setTodos([newTodo, ...todos]); // Добавляем новую задачу в начало
        setInputValue(""); // Очищаем инпут
        setDueDateInput("");
    };

    // Удалить задачу
    const handleDeleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    // Отметить задачу как выполненную/невыполненную
    const handleToggleTodo = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? {...todo, completed: !todo.completed} : todo,
            ),
        );
    };

    // Начать редактирование задачи
    const handleStartEdit = (id, text, dueDate) => {
        setEditingId(id);
        setEditValue(text);
        setEditDueDate(dueDate || "");
    };

    // Сохранить отредактированную задачу
    const handleSaveEdit = (id) => {
        if (editValue.trim() === "") return;

        setTodos(
            todos.map((todo) =>
                todo.id === id ? {...todo, text: editValue, dueDate: editDueDate || null} : todo,
            ),
        );
        setEditingId(null);
        setEditValue("");
        setEditDueDate("");
    };

    // Отменить редактирование
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    // Получить отфильтрованные задачи
    const getFilteredTodos = () => {
        let filtered = todos;

        // Фильтруем по статусу
        switch (filter) {
            case "active":
                filtered = filtered.filter((todo) => !todo.completed);
                break;
            case "completed":
                filtered = filtered.filter((todo) => todo.completed);
                break;
            default:
                break;
        }

        // Если выбрана дата в календаре, фильтруем по дате
        if (selectedDate) {
            filtered = filtered.filter(
                (todo) => todo.dueDate === selectedDate || todo.createdAt === selectedDate
            );
        }

        return filtered;
    };

    const filteredTodos = getFilteredTodos();
    const stats = {
        total: todos.length,
        completed: todos.filter((t) => t.completed).length,
        active: todos.filter((t) => !t.completed).length,
    };

    // Экспорт задачи в файл календаря (ICS)
    const downloadICS = (todo) => {
        const startDate = todo.dueDate || todo.createdAt;
        // формат YYYYMMDD для календаря (без разделителей)
        const formatDate = (d) => d.replace(/[\.\-]/g, "");
        const dtstart = formatDate(startDate);
        const dtend = dtstart; // одно-дневное событие

        const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TODO App//EN\r\nBEGIN:VEVENT\r\nUID:${todo.id}@todoapp\r\nDTSTAMP:${new Date().toISOString().replace(/[-:.]/g,"")}Z\r\nDTSTART;VALUE=DATE:${dtstart}\r\nDTEND;VALUE=DATE:${dtend}\r\nSUMMARY:${todo.text}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
        const blob = new Blob([ics], {type: "text/calendar"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${todo.text}.ics`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Заголовок */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-4xl font-bold text-indigo-600 mb-2">
                        📝 TODO App V1
                    </h1>
                    <p className="text-gray-600">
                        Минимально рабочая версия для обучения
                    </p>
                </div>

                {/* Форма добавления задачи */}
                <form
                    onSubmit={handleAddTodo}
                    className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Добавьте новую задачу..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            value={dueDateInput}
                            onChange={(e) => setDueDateInput(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition">
                            Добавить
                        </button>
                    </div>
                </form>

                {/* Фильтры и статистика */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        {/* Статистика */}
                        <div className="text-sm text-gray-600">
                            <span className="font-bold">Всего:</span>{" "}
                            {stats.total} |
                            <span className="ml-2 font-bold">Активных:</span>{" "}
                            {stats.active} |
                            <span className="ml-2 font-bold">Выполнено:</span>{" "}
                            {stats.completed}
                        </div>

                        {/* Переключение вида */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setViewMode("list");
                                    setSelectedDate(null);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    viewMode === "list"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                📋 Список
                            </button>
                            <button
                                onClick={() => setViewMode("calendar")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    viewMode === "calendar"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                📅 Календарь
                            </button>
                        </div>
                    </div>

                    {/* Кнопки фильтра */}
                    <div className="flex gap-2">
                        {["all", "active", "completed"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === f
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                {f === "all" && "Все"}
                                {f === "active" && "Активные"}
                                {f === "completed" && "Выполненные"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Календарь или список */}
                {viewMode === "calendar" ? (
                    <Calendar todos={todos} onDateSelect={setSelectedDate} selectedDate={selectedDate} />
                ) : null}

                {/* Список задач */}
                <div className="space-y-2">
                    {filteredTodos.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                            {todos.length === 0
                                ? "📭 Задачи не добавлены. Начните с чего-то для себя!"
                                : "📭 Задачи по этому фильтру не найдены"}
                        </div>
                    ) : (
                        filteredTodos.map((todo) => (
                            <div
                                key={todo.id}
                                className="bg-white rounded-lg shadow p-4 flex items-start gap-3 hover:shadow-md transition">
                                {/* Чекбокс для отметки выполнения */}
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggleTodo(todo.id)}
                                    className="w-6 h-6 mt-1 accent-indigo-600 cursor-pointer"
                                />

                                {/* Текст задачи или редактирование */}
                                <div className="flex-1 min-w-0">
                                    {editingId === todo.id ? (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                className="w-full px-3 py-1 border border-indigo-500 rounded-lg focus:outline-none"
                                                autoFocus
                                            />
                                            <input
                                                type="date"
                                                value={editDueDate}
                                                onChange={(e) =>
                                                    setEditDueDate(e.target.value)
                                                }
                                                className="px-3 py-1 border border-indigo-500 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p
                                                className={`break-words text-lg ${
                                                    todo.completed
                                                        ? "line-through text-gray-400"
                                                        : "text-gray-800"
                                                }`}>
                                                {todo.text}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {todo.createdAt}
                                                {todo.dueDate ? ` | срок: ${todo.dueDate}` : ""}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Кнопки действий */}
                                <div className="flex gap-2 flex-shrink-0">
                                    {editingId === todo.id ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleSaveEdit(todo.id)
                                                }
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition">
                                                ✓ Сохр.
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition">
                                                ✕ Отм.
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleStartEdit(
                                                        todo.id,
                                                        todo.text,
                                                        todo.dueDate,
                                                    )
                                                }
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition">
                                                ✎ Ред.
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTodo(todo.id)
                                                }
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition">
                                                🗑 Уд.
                                            </button>
                                            <button
                                                onClick={() => downloadICS(todo)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition">
                                                📅 Календарь
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
