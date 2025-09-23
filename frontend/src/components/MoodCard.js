const MoodCard = ({ mood, note }) => {
  return (
    <div className="bg-pink-50 p-2 rounded-lg shadow mb-2 flex items-center gap-2">
      <span className="text-2xl">{mood}</span>
      <span className="text-gray-700 text-sm">{note}</span>
    </div>
  );
};

export default MoodCard;
