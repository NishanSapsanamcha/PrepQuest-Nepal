import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login", { replace: true });
	};

	return (
		<main style={{ minHeight: "100vh", padding: "32px", color: "#fff", background: "#0f172a" }}>
			<div style={{ maxWidth: 960, margin: "0 auto" }}>
				<h1 style={{ fontSize: "2.5rem", marginBottom: 12 }}>Dashboard</h1>
				<p style={{ marginBottom: 24, color: "#cbd5e1" }}>
					Logged in as {user?.fullName || user?.email || "student"}.
				</p>
				<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
					<button type="button" onClick={handleLogout} style={{ padding: "12px 18px", borderRadius: 12 }}>
						Logout
					</button>
					<Link to="/forgot-password" style={{ padding: "12px 18px", borderRadius: 12, color: "#fff" }}>
						Reset Password
					</Link>
				</div>
			</div>
		</main>
	);
}

export default Dashboard;
