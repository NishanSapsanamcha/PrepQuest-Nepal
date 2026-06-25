import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { BadgeCelebrationProvider } from "./context/BadgeCelebrationContext";

function App() {
  return (
    <BrowserRouter>
      <BadgeCelebrationProvider>
        <AppRoutes />
      </BadgeCelebrationProvider>
    </BrowserRouter>
  );
}

export default App;
