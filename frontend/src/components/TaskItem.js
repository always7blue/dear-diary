import { toggleTask, deleteTask } from '../api/api';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskItem = ({ task, fetchTasks }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = async () => {
    await toggleTask(task.id);
    fetchTasks();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    fetchTasks();
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex justify-between items-center bg-green-50 p-2 rounded-lg mb-2 shadow cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg' : ''}`}
    >
      <label className={`flex-1 ${task.done ? 'line-through text-gray-400' : ''}`}>
        <input type="checkbox" checked={task.done} onChange={handleToggle} className="mr-2" />
        {task.text}
      </label>
      <button onClick={handleDelete} className="text-red-500 hover:text-red-700">Sil</button>
    </div>
  );
};

export default TaskItem;
