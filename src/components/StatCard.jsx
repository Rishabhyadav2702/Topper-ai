function StatCard({ icon, label, value, description }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{description}</span>
      </div>
    </div>
  );
}

export default StatCard;