import {useState, useEffect} from "react";

export default function App() {
    // Состояние для списка задач
    const [todos, setTodos] = useState([]);

    // Состояние для новой задачи в инпуте
    const [inputValue, setInputValue] = useState("");

    // Состояние для фильтра (все/активные/выполненные)
    const [filter, setFilter] = useState("all");

    // Состояние для редактирования (какая задача редактируется)
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

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
        };

        setTodos([newTodo, ...todos]); // Добавляем новую задачу в начало
        setInputValue(""); // Очищаем инпут
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
    const handleStartEdit = (id, text) => {
        setEditingId(id);
        setEditValue(text);
    };

    // Сохранить отредактированную задачу
    const handleSaveEdit = (id) => {
        if (editValue.trim() === "") return;

        setTodos(
            todos.map((todo) =>
                todo.id === id ? {...todo, text: editValue} : todo,
            ),
        );
        setEditingId(null);
        setEditValue("");
    };

    // Отменить редактирование
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    // Получить отфильтрованные задачи
    const getFilteredTodos = () => {
        switch (filter) {
            case "active":
                return todos.filter((todo) => !todo.completed);
            case "completed":
                return todos.filter((todo) => todo.completed);
            default:
                return todos;
        }
    };

    const filteredTodos = getFilteredTodos();
    const stats = {
        total: todos.length,
        completed: todos.filter((t) => t.completed).length,
        active: todos.filter((t) => !t.completed).length,
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
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Добавьте новую задачу..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Статистика */}
                        <div className="text-sm text-gray-600">
                            <span className="font-bold">Всего:</span>{" "}
                            {stats.total} |
                            <span className="ml-2 font-bold">Активных:</span>{" "}
                            {stats.active} |
                            <span className="ml-2 font-bold">Выполнено:</span>{" "}
                            {stats.completed}
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
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) =>
                                                setEditValue(e.target.value)
                                            }
                                            className="w-full px-3 py-1 border border-indigo-500 rounded-lg focus:outline-none"
                                            autoFocus
                                        />
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
