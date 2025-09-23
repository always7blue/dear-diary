import { toggleTask, deleteTask } from '../api/api';

const TaskItem = ({ task, fetchTasks }) => {
  const handleToggle = async () => {
    await toggleTask(task.id);
    fetchTasks();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    fetchTasks();
  };

  return (
    <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg mb-2 shadow">
      <label className={`flex-1 ${task.done ? 'line-through text-gray-400' : ''}`}>
        <input type="checkbox" checked={task.done} onChange={handleToggle} className="mr-2" />
        {task.text}
      </label>
      <button onClick={handleDelete} className="text-red-500 hover:text-red-700">Sil</button>
    </div>
  );
};

export default TaskItem;
