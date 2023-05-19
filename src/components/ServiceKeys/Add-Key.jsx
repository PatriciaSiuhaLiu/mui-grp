import {
  Button,
  Checkbox,
  Column,
  Form,
  FormGroup,
  ComposedModal,
  ModalBody,
  Grid,
  Row,
  Select,
  SelectItem,
  TextInput,
  Tooltip,
} from "carbon-components-react";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import qs from "qs";
import BreadCrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import { trackPromise } from "react-promise-tracker";
import { validate } from '../../validation/validate.js';

class AddKey extends Component {
  header = "Add Service Key";
  links = {
    Home: "/mui/home",
    Services: "/mui/services",
    "Service Keys": "/mui/services",
    "Add Service Key": "/mui/add-serviceKey",
  };
  state = {
    serviceId: "",
    sourceCode: "",
    name: "",
    issuedTo: "",
    type: "",
    scopes: [],
    accounts: [],
    allScopes: [],
    filteredScopes: [],
    allAccounts: [],
    errMsg: "",
    modalOpen: false,
    serviceDetails: {}
  };

  async componentDidMount() {
    const accRes$ = fetch("/mui/muiaccounts");
    const { serviceId, sourceCode } = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.state.sourceCode = sourceCode;
    this.state.serviceId = serviceId;
    this.links["Service Keys"] = "/mui/service-keys?id=" + serviceId;
    const res = await fetch("/mui/serviceKeyScopes");
    if (res.status !== 200)
      return this.setState({ errMsg: "failed to fetch scopes" });

    const { scopes } = await res.json();
    if (!scopes) return this.setState({ errMsg: "failed to fetch scopes" });

    const { config_value } = scopes;
    this.setState({
      allScopes: Object.values(config_value),
    });

    const accRes = await accRes$;
    if (accRes.status !== 200)
      return this.setState({ errMsg: "failed to fetch accounts" });

    const { accounts } = await accRes.json();

    const resServiceDet = await fetch("/mui/serviceKeyDetail/"+sourceCode);
    const  { sourceSystemsData }  = await resServiceDet.json();
    console.log(`sourceSystemsData---${JSON.stringify(sourceSystemsData)}`);
    this.setState({
      allAccounts: accounts,
      serviceDetails: sourceSystemsData
    });
  }

  updateValue = (e) => {
    this.setState({
      [e.target.name]: e.target.value.trim(),
    });
    if (e.target.name === "type") this.selectType(e.target.value);
  };

  selectType = (type) => {
    const { scopes, accounts, allScopes } = this.state;
    scopes.length = 0;
    accounts.length = 0;
    this.setState({
      filteredScopes: allScopes.filter((scope) =>
        scope.type?.includes("" + type)
      ),
    });
  };

  handleCheckBox = (name) => (e) => {
    const prop = this.state[name];
    let value = undefined;
    if (e.target.checked) value = e.target.value;
    const i = +e.target.name;
    prop[i] = value;
  };
  emailHandler = (e) => {
    e.target.setCustomValidity("");
    if (e.target.value.length == 0) return (this.state.collaborators = "");
    const email = e.target.value;
    const allowedDomains =
      process.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || [];
    const validDomain = allowedDomains.find((domain) =>
      email.toLowerCase().includes(domain + ".")
    );

    if (validDomain) {
      this.updateValue(e);
    } else e.target.setCustomValidity("Please provide valid email...");
  };


  submit = async (e = new Event()) => {
    e.preventDefault();
    // creating payload
    const { sourceCode, name, issuedTo, type, scopes, accounts } = this.state;
    const payload = {
      sourceCode,
      name,
      issuedTo,
      type,
      scopes: scopes.filter(Boolean),
    };

    if (!payload.scopes.length) {
      return this.setState({
        errMsg: "Select atleast one scope...",
      });
    }
    if (type == 2) {
      payload.accounts = accounts.filter(Boolean);
      if (!payload.accounts.length) {
        return this.setState({
          errMsg: "Select atleast one account with type 2 key...",
        });
      }
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
        const res$ = fetch("/mui/createServiceKey", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        trackPromise(res$);
    
        const res = await res$;
    
        if (res.status !== 200) {
          return this.setState({
            errMsg: "Could not created.",
          });
        }
        if (res.status === 200) {
          if(type == 2 || type == 3){
            this.setState({
              modalOpen: true,
              modalData: {
                name,
              },
            });
          }
          if(!this.state.modalOpen)
            this.props.history.push("/mui/service-keys?id=" + this.state.serviceId);
        }
      } 
  };
  closeModal = (e) => {
    e.preventDefault();
    this.setState({
        showPopup: false,
    });
    this.props.history.push("/mui/service-keys?id=" + this.state.serviceId);
};

isUnique = async (name) => {
  try {
    const res = await fetch(`/mui/uniqueServiceKeys/${this.state.serviceId}/${name}`);

    if (res.status == 200) {
      const { unique } = await res.json();
      return unique;
    } else return false;
  } catch (error) {
    return false;
  }
};

generateNameHandler = (time) => {
  let timer;
  return async (e = new Event()) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const { value } = e.target;
      if (!value) {
        e.target.setCustomValidity("");
        return;
      }
      e.target.setCustomValidity("Verifying......");
      const unique = await this.isUnique(value);
      if (unique) {
        e.target.setCustomValidity("");
        this.state.name = value;
      } else e.target.setCustomValidity("Service Key name already exists...");
    }, time);
  };
};
  //closeModal = () => this.setState({ modalOpen: false });
  render() {
    return (
      <div className="divContainer">
        <div className="headerDiv sectionMargin">
          <BreadCrumb header={this.header} links={this.links} />
          <div className="breadCrumpDiv">
            <h4>Service: {this.state.sourceCode}</h4>
          </div>
        </div>
        <section className="sectionMargin mainMargin paddingCostom">
          <Form className="formMain" onSubmit={this.submit}>
            <TextInput
              labelText={
                <>
                  Service Key Name <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Service Key Name"
              name="name"
              onChange={this.generateNameHandler(400)}
              required
            />
            <TextInput
              type="email"
              labelText={
                <>
                  Issued To <b style={{ color: "red" }}>*</b>
                </>
              }
              placeholder="Issued To (email)"
              name="issuedTo"
              onChange={this.emailHandler}
              required
            />
            <Select
              labelText={
                <>
                  Type <b className="fontRed">*</b>{" "}
                  <Tooltip align="start">
                    Type 1 – (Service Specific) Tokens can be used for calling
                    the apis on channels that have been associated with the
                    service.
                    <br />
                    Type 2 – (Account Specific) Tokens can be used for calling
                    the apis on channels that has been associated with the
                    account selected, ChatOps admin and the respective account
                    DPE need to authorize the token to be activated for the
                    respective account.
                    <br />
                    Type 3 – (Global) Tokens can be used for any channels,
                    Chatops program authorization is required for issuing this
                    token.
                  </Tooltip>
                </>
              }
              id="type"
              name="type"
              onChange={this.updateValue}
              defaultValue=""
              required
            >
              <SelectItem disabled hidden value="" text="Choose an option" />
              <SelectItem value="1" text="Type 1 - (Service Specific)" />
              <SelectItem value="2" text="Type 2 – (Account Specific)" />
              <SelectItem value="3" text="Type 3 – (Global)" />
            </Select>
            {this.state.type && (
              <FormGroup
                legendText={
                  <>
                    Scopes <b className="fontRed">*</b>
                  </>
                }
                onChange={this.handleCheckBox("scopes")}
              >
                <Grid className="mx-height-200">
                  <Row>
                    {this.state.filteredScopes.map((scope, i) => (
                      <Column key={i + scope.id} lg={6}>
                        <Checkbox
                          id={i + scope.id}
                          name={i}
                          value={scope.id}
                          labelText={scope.label}
                        />
                      </Column>
                    ))}
                  </Row>
                </Grid>
              </FormGroup>
            )}
            {this.state.type == 2 && (
              <FormGroup
                name="accounts"
                legendText={
                  <>
                    Accounts <b className="fontRed">*</b>
                  </>
                }
                onChange={this.handleCheckBox("accounts")}
              >
                <Grid className="mx-height-200">
                  <Row>
                    {this.state.allAccounts.map((acc, i) => (
                      (acc?.collaborationTool && acc?.collaborationTool?.toLowerCase() === this.state.serviceDetails.collabTool ? 
                      <Column key={acc._id} lg={6}>
                        <Checkbox
                          id={acc._id}
                          name={i}
                          value={acc.accountCode}
                          labelText={acc.accountName}
                        />
                      </Column> : '')
                    ))}
                  </Row>
                </Grid>
              </FormGroup>
            )}
            {this.state.errMsg && (
              <b className="fontRed">{this.state.errMsg}</b>
            )}
            <br />
            <br />
            {
                this.state['specialCharacterErr'] &&
                <small className="fontRed">
                    <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                </small>
            }
            <br />
            <Button className="addKeySK" type="submit">Add Key</Button>
            <div><br></br></div>
            { typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <ComposedModal
                open={this.state.modalOpen}
              >
                <ModalBody className="my-2 py-2" hasScrollingContent={true}>
                  <div>
                    <p>Your request for key <b>{this.state.name}</b> is submitted successfully to ChatOps Admin for Approval</p>
                  </div>
                  <br />
                  <Button  className="btnSACss" onClick={this.closeModal} >Ok</Button>
                </ModalBody>
              </ComposedModal>,
              document.body
            )}
          </Form>
        </section>
      </div>
    );
  }
}

export default AddKey;