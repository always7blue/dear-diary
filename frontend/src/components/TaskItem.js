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

  const handleToggle = async (e) => {
    e.stopPropagation();
    await toggleTask(task.id);
    fetchTasks();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteTask(task.id);
    fetchTasks();
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex justify-between items-center bg-green-50 p-2 rounded-lg mb-2 shadow cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex-1">
        <label className={`flex items-center ${task.done ? 'line-through text-gray-400' : ''}`}>
          <input 
            type="checkbox" 
            checked={task.done} 
            onChange={handleToggle}
            onMouseDown={(e) => e.stopPropagation()}
            className="mr-2 cursor-pointer" 
          />
          <span {...listeners} className="flex-1">{task.text}</span>
        </label>
      </div>
      <button 
        onClick={handleDelete} 
        className="text-red-500 hover:text-red-700 cursor-pointer"
        onMouseDown={(e) => e.stopPropagation()}
      >
        Sil
      </button>
    </div>
  );
};

export default TaskItem;
