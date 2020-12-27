import {BrowseView} from "./BrowseView"
import {BrowserRouter} from "react-router-dom";

function App() {
  return (
      <BrowserRouter>
        <div className="App">
          <BrowseView />
        </div>
      </BrowserRouter>
  );
}

export default App;


