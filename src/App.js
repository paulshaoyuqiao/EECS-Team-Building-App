import * as React from "react";
import {BrowseView} from "./BrowseView"
import {BrowserRouter, Switch, Route} from "react-router-dom";
import ApiManager from "./api/api";
import {FormTemplateView} from "./FormTemplateView";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTemplates: null,
    };
  }

  componentDidMount() {
    ApiManager.get("/all_templates").then((response) => {
      const templates = response.data["templates"];
      const allTemplates = (
        <Switch>
          <Route path="/" exact={true} key={"index"} render={() => <BrowseView />} />
          {templates.map((template, index) => {
            const formName = template["formName"].toLowerCase();
            const formCourse = template["course"].toLowerCase().split(" ")[1];
            const formPath = `/${formCourse}/${formName.replaceAll(" ", "-")}`;
            return (
              <Route 
                path={formPath}
                exact={true}
                key={`${formCourse}-${index}`}
                render={() => <FormTemplateView template={template} />}
              />
            );
          })}
        </Switch>
      );
      this.setState({allTemplates});
    })
  }
  

  render() {
    const allTemplates = this.state.allTemplates;
    return (
      <BrowserRouter>
        <div className="App">
          {allTemplates ? allTemplates : <div></div>}
        </div>
      </BrowserRouter>
    );
  }
  
}

export default App;
