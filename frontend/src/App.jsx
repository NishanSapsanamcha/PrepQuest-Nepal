import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { BadgeCelebrationProvider } from "./context/BadgeCelebrationContext";
import { CoinRewardProvider } from "./context/CoinRewardContext";

function App() {
  return (
    <BrowserRouter>
      <CoinRewardProvider>
        <BadgeCelebrationProvider>
          <AppRoutes />
        </BadgeCelebrationProvider>
      </CoinRewardProvider>
    </BrowserRouter>
  );
}

export default App;
