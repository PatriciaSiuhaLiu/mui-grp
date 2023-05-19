// AddCommandRegistration.jsx >>> WORKING WITH JUST ADDD DELETE
import React, { Component } from "react";
import {
  Modal,
  Button,
  Column,
  Grid,
  Row,
  Select,
  SelectItem,
  TextInput,
  Form,
} from "carbon-components-react";
import "../../../forms/form.scss";
import { AddAlt32 } from "@carbon/icons-react";
import { TrashCan32 } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";
import { useParams, withRouter } from "react-router-dom";
import { validate } from '../../../../validation/validate.js';
class AddCommandRegistration extends Component {
  state = {
    _id: "",
    isNLP: true,
    default: false,
    group: "",
    command: "",
    params: [""],
    global: false,
    processMessage: false,
    msUrl: "",
    helpMessage: "",
    inValid: false,
  };
  async componentDidMount() {
    const { location } = this.props;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) return;
    const res$ = fetch("/mui/fetchCommand?id=" + id);
    trackPromise(res$);
    const res = await res$;
    if (res.status != 200)
      return this.setState({ inValid: "Command is not found by given id" });
    const { command } = await res.json();

    if ("params" in command) command.params = Object.keys(command.params);

    this.setState({
      isNLP: !!command.isNLP,
      ...command,
    });
  }
  checkCmd = async (command) => {
    const res = await fetch("/mui/check-command", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    if (res.status != 200) return false;

    const { unique } = await res.json();
    return unique;
  };

  timer = (cb, time) => {
    let timer;
    return function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        cb(e);
      }, time);
    };
  };

  updateGlobal = (value) => {
    this.state.global = !!value;
  };
  updateProcessMessage = (value) => {
    this.state.processMessage = value;
  };
  updateMsUrl = (value) => {
    this.state.msUrl = value.trim();
  };
  updateType = (isNLP) => {
    if (isNLP) {
      this.state.processMessage = false;
      this.state.helpMessage = "";
    }
    this.setState({
      isNLP,
      default: !isNLP,
    });
  };
  updateCommandName = (name) => {
    this.state.command = name;
  };
  updateGroup = (groupName) => {
    this.state.group = groupName;
  };
  addParamField = () => {
    const { params } = this.state;
    params.push("");
    this.setState({
      params,
    });
  };
  deleteParamField = (index) => {
    const { params } = this.state;
    if (params.filter((param) => param != undefined).length <= 1) return;
    params[index] = undefined;
    this.setState({
      params,
    });
  };
  addParam = (index, value) => {
    const { params } = this.state;
    params[index] = value.trim();
  };
  handleParam = (e) => {
    const { id, value } = e.target;
    const [field, i] = id.split("-");
    if (field === "inputParam") {
      this.addParam(+i, value);
    } else if (field === "delParam") {
      this.deleteParamField(+i);
    }
  };

  validateCmd = async (e) => {
    const { value } = e.target;
    if (!value) return e.target.setCustomValidity("");
    const trimmed = value.trim();
    if (!trimmed) return e.target.setCustomValidity("Invalid input...");

    const isUnique = await this.checkCmd(trimmed);
    if (!isUnique)
      return e.target.setCustomValidity("Command Name already exists...");
    this.updateCommandName(trimmed);
    e.target.setCustomValidity("");
  };

  validateCmdTimer = this.timer(this.validateCmd, 1000);
  handleCmd = (e) => {
    e.target.setCustomValidity("Verifying...");
    this.validateCmdTimer(e);
  };
  handleFields = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      this.updateType(value === "true");
    } else if (name === "group") {
      this.updateGroup(value);
    } else if (name === "global") {
      this.updateGlobal(value);
    }
  };
  submit = async (e) => {
    e.preventDefault();
    var payload;
    if (this.state.isNLP) {
      payload = {
        _id: this.state._id || undefined,
        isNLP: this.state.isNLP,
        command: this.state.command,
      };
    } else {
      payload = {
        _id: this.state._id || undefined,
        default: false,
        command: this.state.command,
        global: this.state.global,
        group: this.state.group,
        params: this.state.params,
      };
    }
    // SpecialCharacter validation
    var validateFields = validate(payload);
    if(validateFields.length > 0){
        var message = "";
        for(var i =0; i<validateFields.length; i++){
            var element = document.querySelector(`input[name=${validateFields[i]}]`);
            if(element){

                message += element.title + ", ";
            }else{
                message += validateFields[i] + ', '
            }
        }
        this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
    }else{
        const res$ = fetch("/mui/command", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
        });

        trackPromise(res$);

        const res = await res$;

        if (res.status == 200) {
        this.props.history.push("/mui/commands");
        }
    }
  };
  render() {
    return (
      <div className="divContainer" style={{ width: "70%" }}>
        <section className="sectionMargin mainMargin paddingCostom">
            {
                this.state.inValid && <b style={{ color: "red" }}>{this.state.inValid}</b>
            }
          <Form onSubmit={this.submit} onChange={this.handleFields}>
            <Grid>
              <Row>
                <Column>
                  <Select
                    name="type"
                    labelText="Command"
                    defaultValue={!!this.state.isNLP}
                  >
                    <SelectItem value={true} label="NLP" />
                    <SelectItem
                      selected={!this.state.isNLP}
                      value={false}
                      label="Other"
                    />
                  </Select>
                  {!this.state.isNLP && (
                    <TextInput
                      name="group"
                      labelText="Group Name"
                      placeholder="Group Name"
                      defaultValue={this.state.group}
                    />
                  )}
                  <TextInput
                    name="command"
                    labelText={
                      <>
                        Command Name <b style={{ color: "red" }}>*</b>
                      </>
                    }
                    placeholder="Add Command"
                    defaultValue={this.state.command}
                    onChange={this.handleCmd}
                    required
                  />
                  {!this.state.isNLP && (
                    <>
                      <Select
                        name="global"
                        labelText="Global"
                        defaultValue={this.state.global}
                      >
                        <SelectItem value={true} label="Yes" />
                        <SelectItem value={false} label="No" />
                      </Select>

                      <div className="paramsInlineDiv">
                        <h4 className="bx--label paramsLabel">
                          Params
                          {/* {!this.state.isNLP && (
                            <b style={{ color: "red" }}>*</b>
                          )} */}
                        </h4>
                        <AddAlt32
                          className="addParam"
                          onClick={this.addParamField}
                        />
                      </div>
                    </>
                  )}
                </Column>
              </Row>
              {!this.state.isNLP && (
                <Row>
                  <Column>
                    <div
                      className="rulesDivStyle"
                      style={{ marginTop: "0" }}
                      onChange={this.handleParam}
                      onClick={this.handleParam}
                    >
                      {this.state.params.map(
                        (param, i) =>
                          param != undefined && (
                            <div className="rulesSubDiv" key={i}>
                              <TextInput
                                id={"inputParam-" + i}
                                defaultValue={this.state.params[i]}
                                name={i}
                                className="bx--text-input bx--text__input"
                                placeholder="Add Params"
                                // required={!this.state.isNLP}
                              />
                              <div className="iconDiv1">
                                <TrashCan32
                                  id={"delParam-" + i}
                                  className="iconEditSize1"
                                  aria-label="Delete Rule"
                                  title="Delete Rule"
                                />
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </Column>
                </Row>
              )}
                <Row>
                    <Column>
                        {
                            this.state['specialCharacterErr'] &&
                            <small className="fontRed">
                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                            </small>
                        }
                    </Column>
                </Row>
              <Row>
                <Column>
                  <Button
                    className="btnMargin btnCmd"
                    type="submit"
                    disabled={this.state.inValid}
                  >
                    Submit
                  </Button>
                </Column>
              </Row>
            </Grid>
          </Form>
        </section>
      </div>
    );
  }
}

export default withRouter(AddCommandRegistration);
