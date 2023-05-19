import {
  Button,
  Checkbox,
  Column,
  Form,
  FormGroup,
  FormLabel,
  Grid,
  Row,
  TextInput,
  Tooltip,
} from "carbon-components-react";
import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import { validate } from '../validation/validate.js';
class APIKeyForm extends Component {
  state = {
    keyNameField: "keyName",
    issuedTo: "issuedTo",
    incidents: [],
    plateformScopes: [],
    selectAll: false,
  };

  componentDidMount = () => {
    trackPromise(
      fetch("/mui/scopes")
        .then((res) => res.json())
        .then((scopes) => {
          this.setState({
            incidents: scopes.tickets,
            plateformScopes: scopes.collaborators,
          });
        })
    );
  };

  handleTextInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  handleTextIssuedToInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSelectAll = (isChecked, scopeName) => {
    const scope = this.state[scopeName];
    scope.forEach((value) => (value.checked = isChecked));

    this.setState({
      [scopeName]: scope,
      [scopeName + "SelectAll"]: isChecked,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const issuedToEmail = this.state[this.state.issuedTo];
    const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || []
    const validDomain = allowedDomains.find(domain => issuedToEmail.toLowerCase().includes(domain + "."))
    if (!validDomain) {
      this.setState({
        inValidEmail: true,
      });
      return;
    }
    const { incidents, plateformScopes } = this.state;
    const { accountCode, onSubmit } = this.props;
    const selectedIncidents = incidents
      .filter((incident) => incident.checked)
      .map((incident) => incident.id);
    const selectedPlateformScopes = plateformScopes
      .filter((scope) => scope.checked)
      .map((scope) => scope.id);

    const scopes = [...selectedIncidents, ...selectedPlateformScopes];
    if (scopes.length < 1) {
      this.setState({
        inValidScope: true,
      });
      return;
    }
    const payload = {
      accCode: accountCode,
      keyName: this.state[this.state.keyNameField],
      issuedTo: issuedToEmail,
      apiScopes: scopes,
    };
    // SpecialCharacter validation
    var validateFields = validate(payload);
    if(validateFields.length > 0){
        var message = "";
        for(var i =0; i<validateFields.length; i++){
            var element = document.querySelector(`input[name=${validateFields[i]}]`);
            message += element.title + ", ";
        }
        this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
    }else{
        trackPromise(
        fetch("/mui/fetchCKKey", {
            method: "POST",
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((res) => {
            if (res.status == 200) {
                return res.json();
            }
            })
            .then((res) => {
            console.log(res);
            onSubmit();
            })
        );
    }
  };

  render() {
    return (
      <div className="width80 p-2 shadow center">
        <Grid>
          <Form className="my-2" onSubmit={this.handleSubmit}>
            <Row>
              <Column>
                <TextInput
                  required
                  name={this.state.keyNameField}
                  onChange={this.handleTextInputChange}
                  placeholder="Api Key Name"
                  labelText={
                    <FormLabel>
                      Api Key Name <b className="fontRed">*</b>
                      <Tooltip>Unique API Key Name</Tooltip>
                    </FormLabel>
                  }
                />
              </Column>
              <Column>
                <TextInput
                  type="email"
                  required
                  placeholder="Issued To"
                  name={this.state.issuedTo }
                  onChange={this.handleTextInputChange }
                  onBlur={this.handleTextIssuedToInput}
                  labelText={
                    <FormLabel>
                      Issued To <b className="fontRed">*</b>
                      <Tooltip>User id requesting for access</Tooltip>
                      {this.state.inValidEmail && (
                        <small className="fontRed">
                          <br />
                          <b>
                            Please provide a valid email. Only IBM id allowed
                          </b>
                        </small>
                      )}
                    </FormLabel>
                  }
                />
              </Column>
            </Row>
            <br />
            <br />
            <Row>
              <Column>
                <FormGroup
                  legendText={
                    <FormLabel>
                      Scopes
                      <Tooltip>
                        Select API's for which access is required
                      </Tooltip>
                      {this.state.inValidScope && (
                        <b className="fontRed">
                          <br />
                          <small>!!Please select atleast one scope</small>
                        </b>
                      )}
                    </FormLabel>
                  }
                >
                  <Row>
                    <Column>
                      <FormGroup
                        legendText="Incident"
                        onClick={(e) => {
                          if (e.target.value == undefined) return;
                          const { incidents } = this.state;
                          incidents[e.target.value].checked = e.target.checked;
                          this.setState({
                            incidents,
                            incidentsSelectAll: false,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      >
                        <div className="box">
                          <Checkbox
                            id="selectAllIncidents"
                            labelText="Select All"
                            onChange={(isChecked) =>
                              this.handleSelectAll(isChecked, "incidents")
                            }
                            checked={this.state.incidentsSelectAll}
                          />
                          {this.state.incidents &&
                            this.state.incidents.map((incident, i) => (
                              <Checkbox
                                key={incident.id}
                                value={i}
                                id={incident.id}
                                labelText={incident.label}
                                checked={this.state.incidents[i].checked}
                              />
                            ))}
                        </div>
                      </FormGroup>
                    </Column>
                    <Column>
                      <FormGroup
                        legendText="Chat Platform"
                        onClick={(e) => {
                          if (e.target.value == undefined) return;
                          const { plateformScopes } = this.state;
                          plateformScopes[e.target.value].checked =
                            e.target.checked;
                          this.setState({
                            plateformScopes,
                            plateformScopesSelectAll: false,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      >
                        <div className="box">
                          <Checkbox
                            id="selectAllplateformScopes"
                            labelText="Select All"
                            onChange={(isChecked) =>
                              this.handleSelectAll(isChecked, "plateformScopes")
                            }
                            checked={this.state.plateformScopesSelectAll}
                          />
                          {this.state.plateformScopes &&
                            this.state.plateformScopes.map((scope, i) => (
                              <Checkbox
                                key={scope.id}
                                value={i}
                                id={scope.id}
                                labelText={scope.label}
                                checked={this.state.plateformScopes[i]?.checked}
                              />
                            ))}
                        </div>
                      </FormGroup>
                    </Column>
                  </Row>
                </FormGroup>
              </Column>
            </Row>
            <Row>
              <Column>
                {(this.state.inValidEmail || this.state.inValidScope) && (
                  <small>
                    <b className="fontRed">
                      ! Please fill all the mandatory fields before proceeding.
                    </b>
                  </small>
                )}
                {
                  this.state['specialCharacterErr'] &&
                  <small className="fontRed">
                      <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                  </small>
              }
              </Column>
              <Column>
                <Button
                  kind="secondary"
                  className="mx-2"
                  onClick={this.props.onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" className="mx-2">
                  Submit
                </Button>
              </Column>
            </Row>
          </Form>
        </Grid>
      </div>
    );
  }
}

export default APIKeyForm;
