const MoodCard = ({ mood, note }) => (
  <div className="bg-pink-100 rounded-xl p-2 mb-2 shadow-sm">
    <span className="text-2xl">{mood}</span>
    <p className="text-sm">{note}</p>
  </div>
);

export default MoodCard;
