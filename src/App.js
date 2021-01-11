import * as React from "react";
import {BrowseView} from "./BrowseView"
import {BrowserRouter, Switch, Route} from "react-router-dom";
import ApiManager from "./api/api";
import {FormTemplateView} from "./FormTemplateView";
import {FormUpdateView} from "./FormUpdateView";
import {FormResponseSummaryView} from "./FormResponseSummaryView";
import {getFormPath} from "./data/utils";

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
          <Route path="/" exact={true} key="index" render={() => <BrowseView />} />
          {templates.map((template, index) => {
            const {formName, course, formUrl, formId} = template;
            const formPath = getFormPath(formName, course, formUrl, true);
            const editPath = `${formPath}/edit`;
            const vizPath = `${formPath}/viz`;
            return (
              <>
                <Route
                  path={formPath}
                  exact={true}
                  key={formId}
                  render={() => <FormTemplateView template={template} />}
                />
                <Route
                  path={editPath}
                  exact={true}
                  key={`${formId}-edit`}
                  render={
                    (props) => 
                      <FormUpdateView 
                        {...props} 
                        template={template["template"]} 
                        formName={formName} 
                        formUrl={formUrl}
                        formId={formId} 
                        course={course}
                      />
                  }
                />
                <Route
                  path={vizPath}
                  exact={true}
                  key={`${formId}-viz`}
                  render={
                    (props) => 
                      <FormResponseSummaryView
                        {...props}
                        formName={formName}
                        formId={formId}
                      />
                  }
                />
              </>
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
