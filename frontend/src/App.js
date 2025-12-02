import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ExamPage from "./components/ExamPage";
import ExamUpload from "./components/ExamUpload";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Exam App</h1>
        <Switch>
          <Route path="/exam" component={ExamPage} />
          <Route path="/upload" component={ExamUpload} />
          <Route path="/" exact>
            <h2>Welcome to the Exam App</h2>
            <p>Choose an option: Take Exam or Upload Exam</p>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
