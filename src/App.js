// Import useState and useEffect hooks from React
import { useState, useEffect } from 'react';

// Import the CSS file
import './App.css';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    // State variable to store task name input
    const [task_name, setTask_name] = useState("");

    // State variable to store list of tasks
    const [tasks, setTasks] = useState([]);

    // State variable for loading state
    const [isLoading, setIsLoading] = useState(false);

    // State variable for error messages
    const [error, setError] = useState("");

    // Function to fetch all tasks
    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await fetch(`${API_BASE_URL}/allTasks`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Failed to load tasks. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle form submission
    const onSubmitForm = async e => {
        // Prevent default form submission behavior
        e.preventDefault();

        if (!task_name.trim()) {
            setError("Please enter a task name");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            
            // Create request body with task_name
            const body = { task_name: task_name.trim() };
            const response = await fetch(`${API_BASE_URL}/task`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTask = await response.json();
            // Add the new task to the existing tasks without page reload
            setTasks(prevTasks => [...prevTasks, newTask]);
            setTask_name(""); // Clear the input field
        } catch (err) {
            console.error("Error adding task:", err.message);
            setError("Failed to add task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Function to delete a task by its ID
    const deleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            setError("");
            const response = await fetch(`${API_BASE_URL}/task/${taskId}`, { 
                method: "DELETE" 
            });
            
            if (response.ok) {
                // Remove the deleted task from the state
                setTasks(prevTasks => prevTasks.filter(task => task.TaskID !== taskId));
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting task:", error.message);
            setError("Failed to delete task. Please try again.");
        }
    };

    // Effect hook to fetch all tasks when the component mounts
    useEffect(() => {
        fetchTasks();
    }, []);

    // Function to handle input key press (Enter to submit)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            onSubmitForm(e);
        }
    };

    return (
        <div className="app-container">
            <div className="todo-container">
                {/* Header */}
                <div className="todo-header">
                    <h1>✨ My Tasks</h1>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="error-message">
                        {error}
                        <button 
                            onClick={() => setError("")}
                            className="error-close"
                            aria-label="Close error"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Form for adding a new task */}
                <form onSubmit={onSubmitForm} className="task-form">
                    <input 
                        type="text" 
                        value={task_name} 
                        className="task-input" 
                        placeholder="What needs to be done?" 
                        onChange={(e) => setTask_name(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        aria-label="Task input"
                    />
                    <button 
                        type="submit" 
                        className="add-button"
                        disabled={isLoading || !task_name.trim()}
                        aria-label="Add task"
                    >
                        {isLoading ? "Adding..." : "Add Task"}
                    </button>
                </form>

                {/* Task list */}
                <ul className="task-list">
                    {isLoading && tasks.length === 0 ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading tasks...</div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <div className="empty-state-text">No tasks yet. Add one to get started!</div>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <li key={task.TaskID} className="task-item">
                                <span className="task-text">{task.Task}</span>
                                <button 
                                    className="trash-button"
                                    onClick={() => deleteTask(task.TaskID)}
                                    title="Delete task"
                                    aria-label={`Delete task: ${task.Task}`}
                                    disabled={isLoading}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))
                    )}
                </ul>

                {/* Tasks counter */}
                {tasks.length > 0 && (
                    <div className="tasks-counter">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;