import {
  Accordion,
  AccordionItem,
  Button,
  Column,
  ComposedModal,
  CopyButton,
  Grid,
  ModalBody,
  ModalHeader,
  Row,
  Tag,
  TextInput,
  Checkbox
} from "carbon-components-react";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  Copy32,
  Information32,
  Reset32,
  TrashCan32,
} from "@carbon/icons-react";
import BreadCrumb from "../SuperAdmin/SACommands/CommandsBreadCrumb";
import qs from "qs";
import { trackPromise } from "react-promise-tracker";

class ServiceKeys extends Component {
  header = "Service Keys";
  links = {
    Home: "/mui/home",
    Services: "/mui/services",
    "Service Keys": "/mui/service-keys",
  };
  color = {
    approved: "green",
    pending: "cyan",
    rejected: "red",
  };
  state = {
    id: "",
    service: {},
    modalOpen: false,
    modalData: {},
    allowPlainAuth: false
  };
  async componentDidMount() {
    const { id } = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({
      id,
    });
    const res$ = fetch("/mui/registeredService/" + id);
    trackPromise(res$);
    const res = await res$;
    if (res.status == 200) {
      const { serviceData } = await res.json();
      this.setState({
        service: serviceData,
      });
    }
  }
  copyHandler = (payload) => () => {
    navigator.clipboard.writeText(payload);
  };
  gotoAddKeyForm = () => {

    let url =
      "/mui/add-serviceKey" +
      "?" +
      "serviceId=" +
      this.state.id +
      "&sourceCode=" +
      this.state.service.SourceIdentificationCode;
    this.props.history.push(url);
  };
  saveAuth(name, event) {
    this.setState({
        [event.target.name]: event.target.checked,
      });
      const saveAuthData = {
        allowApi: event.target.checked,
        serviceName: this.state.service.SourceIdentificationCode,
        keyName: event.target.name
      };
      trackPromise( fetch("/mui/saveAuthServices",
      {
        method: "POST",
        headers: {
                "Content-type": "application/json",
              },
        body: JSON.stringify(saveAuthData),
      }).then(async (result) => {
            if (result.status == 200) {
              const { serviceData }  = await result.json();
              this.setState({
                service: serviceData,
              });
            }
      })
       
      );
  
      
  };
  getKeyInfo = (name) => () => {
    this.setState({
      modalOpen: true,
      modalData: {
        name,
        ...this.state.service.keySpecifications[name],
      },
    });
  };
  closeModal = () => this.setState({ modalOpen: false });
  render() {
    const { keys, keySpecifications, SourceIdentificationCode } =
      this.state.service;
    return (
      <div className="divContainer">
        <div className="headerDiv sectionMargin  mainMargin">
          <BreadCrumb header={this.header} links={this.links} />
          <div className="breadCrumpDiv">
            <h4>Service: {SourceIdentificationCode}</h4>
          </div>
        </div>
        <section className="sectionMargin mainMargin">
          <Grid>
            <Row>
              <Column>
                <div className="searchDivMain">
                  <Button
                    className="addAccBtn addBtnCss addBtnPACss"
                    onClick={this.gotoAddKeyForm}
                  >
                    Add Key
                  </Button>
                </div>
              </Column>
            </Row>
            {!keys && (
              <Row>

                <Column>
                <p style={{textAlign: "center",}}>No Keys Found.</p>

                </Column>
              </Row>
            )}
            <Row>
                <Column>
                    <p className="externalLink" >
                        Click <a className="externalLinkClass" href="https://kyndryl.sharepoint.com/sites/ChatOps/SitePages/ChatOps-APIS.aspx" target="_blank" rel="noopener noreferrer" >HERE</a> to know more about using signed payload
                    </p>                      
                </Column>
            </Row>
            {keys &&
              Object.entries(keys).map(([keyName, value]) => (
                <div className="my-2" key={keyName}>
                  <Row>
                    <Column>
                      <div className="p-2 shadow center">
                        <Accordion
                          disabled={
                            (keySpecifications[keyName].status == "rejected")
                          }
                        >
                          <AccordionItem
                            title={
                              <>
                                {keyName}{" "}
                                <Tag type="green">
                                  type {keySpecifications[keyName].type}
                                </Tag>{" "}
                                {keySpecifications[keyName] && (
                                  <Tag
                                    type={
                                      this.color[
                                        keySpecifications[keyName].status
                                      ]
                                    }
                                  >
                                    {keySpecifications[keyName].status}
                                  </Tag>
                                )}
                              </>
                            }
                            disabled={keySpecifications[keyName].status === 'approved' ? false : true}
                          >
                            <Grid>
                              <Row>
                                <Column lg={3}>
                                  <div className="display-inline-flex">
                                    <TextInput
                                      labelText="Service Name"
                                      defaultValue={keyName}
                                      readOnly
                                    />
                                    <div className="mx-2 pt-18">
                                      <CopyButton
                                        onClick={this.copyHandler(
                                            keyName
                                        )}
                                      />
                                    </div>
                                  </div>
                                </Column>
                                <Column lg={3}>
                                  <div className="display-inline-flex">
                                    <TextInput
                                      labelText="Service"
                                      defaultValue={SourceIdentificationCode}
                                      readOnly
                                    />
                                    <div className="mx-2 pt-18">
                                      <CopyButton
                                        onClick={this.copyHandler(
                                          SourceIdentificationCode
                                        )}
                                      />
                                    </div>
                                  </div>
                                </Column>
                                <Column lg={3}>
                                  <TextInput
                                    labelText="Service key"
                                    defaultValue={value}
                                    readOnly
                                  />
                                </Column>
                                <Column lg={2}>
                                  <div>
                                    <br />
                                  </div>
                                  <div className="display-inline-flex pt-25">
                                    <Button
                                      kind="ghost"
                                      renderIcon={Copy32}
                                      iconDescription="Copy to clipboard"
                                      hasIconOnly
                                      onClick={this.copyHandler(value)}
                                    />
                                    {/* <Button
                                    kind="ghost"
                                    renderIcon={Reset32}
                                    iconDescription="Regenerate Key"
                                    hasIconOnly
                                  />
                                      <Button
                                        kind="ghost"
                                        renderIcon={TrashCan32}
                                        iconDescription="Delete"
                                        hasIconOnly
                                      /> */}
                                    <Button
                                      kind="ghost"
                                      renderIcon={Information32}
                                      iconDescription="Click to see more information"
                                      hasIconOnly
                                      onClick={this.getKeyInfo(keyName)}
                                    />
                                    <Checkbox
                                        labelText="Allow auth via API key [Less Secure]"
                                        id={"allowPlainAuth_" + keyName}
                                        name={keyName}
                                        checked={keySpecifications[keyName].allowPlainAuth || this.state.allowPlainAuth} 
                                        onClick={(event) => { this.saveAuth('checkbox-1', event)}}
                                    />
                                  </div>
                                </Column>
                              </Row>
                            </Grid>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </Column>
                  </Row>
                </div>
              ))}
          </Grid>
        </section>
        {this.state.service.keySpecifications && typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <ComposedModal
                open={this.state.modalOpen}
                onClose={this.closeModal}
              >
                <ModalBody className="my-2 py-2" hasScrollingContent={true}>
                  <div>
                    <p>Issued To:</p>
                    <Tag>{this.state.modalData.issuedTo}</Tag>
                  </div>
                  <br />
                  <div>
                    <p>Issued By:</p>
                    <Tag>{this.state.modalData.issuedBy}</Tag>
                  </div>
                  <br />
                  <div>
                    <p>Selected Scopes:</p>
                    {this.state.modalData.scopes &&
                      this.state.modalData.scopes.map((scope) => (
                        <Tag key={scope}>{scope}</Tag>
                      ))}
                  </div>
                  <br />
                  {this.state.modalData.associatedAccounts && (
                    <div>
                      <p>Approved Accounts:</p>
                      {this.state.modalData.scopes &&
                        this.state.modalData.associatedAccounts.map((acc) => (
                          <Tag key={acc}>{acc}</Tag>
                        ))}
                    </div>
                  )}
                  <br />
                  {this.state.modalData.rejectedAccount && this.state.modalData.type === "2" && (
                    <div>
                      <p>Rejected Accounts:</p>
                      {this.state.modalData.scopes &&
                        this.state.modalData.rejectedAccount.map((acc) => (
                          <Tag key={acc}>{acc}</Tag>
                        ))}
                    </div>
                  )}
                </ModalBody>
              </ComposedModal>,
              document.body
            )}
      </div>
    );
  }
}

export default ServiceKeys;
