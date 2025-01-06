import { Routes, Route } from "react-router-dom";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Footer from "./components/Footer";

function App() {
  const appStyle = {
    backgroundColor: '#f4f4fb',  // Background color for the entire app
    minHeight: '100vh',  // Full viewport height
    display: 'flex',
    flexDirection: 'column',
  };

  const mainStyle = {
    flexGrow: 1,
    backgroundColor: 'white', // Default background color
    transition: 'background-color 0.3s ease', // Smooth transition for dark mode change
  };

  // Detecting dark mode (if applicable)
  const isDarkMode = false; // You can update this flag depending on the theme (e.g., user settings)

  if (isDarkMode) {
    mainStyle.backgroundColor = 'black'; // Dark mode background
    mainStyle.color = 'white';  // Text color in dark mode
  }

  return (
    <div style={appStyle}>
      <div style={mainStyle}>
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
