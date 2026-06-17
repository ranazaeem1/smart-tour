export default function UserDashboardLoading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: '3px solid rgba(255,255,255,0.2)',
        borderTopColor: '#FFFFFF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading SmartTour...</p>
    </div>
  );
}
