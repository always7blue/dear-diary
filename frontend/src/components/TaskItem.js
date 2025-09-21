const TaskItem = ({ task, fetchTasks }) => {
  const toggleDone = async () => {
    await fetch(`/tasks/${task.id}`, { method: 'PATCH' }); // backend endpoint
    fetchTasks();
  };

  return (
    <div className={`flex justify-between items-center p-2 rounded-lg mb-1 ${task.done?'bg-green-100':'bg-white'}`}>
      <span>{task.text}</span>
      <button onClick={toggleDone} className="text-sm bg-gray-200 rounded px-2">{task.done?'✔':'✖'}</button>
    </div>
  );
};

export default TaskItem;
