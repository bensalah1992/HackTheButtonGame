import { Switch, Route } from "wouter";
import GamePage from "./pages/GamePage";

function App() {
  return (
    <Switch>
      <Route path="/" component={GamePage} />
    </Switch>
  );
}

export default App;
