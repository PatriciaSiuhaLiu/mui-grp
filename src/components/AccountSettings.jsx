import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Checkbox,
    Column,
    ComposedModal,
    Grid,
    ModalBody,
    Row,
    Tag,
  } from "carbon-components-react";
  import React, { Component } from "react";
  import ReactDOM from "react-dom";
  import "./APIKeys.scss";
  import { trackPromise } from "react-promise-tracker";
  import ButtonSettings from "./ButtonSettings";
  import APIKeyForm from "./ApiKeyForm";
  import EventStreamApiKey from "./EventStreamApiKey";
  import { Link } from "react-router-dom";
  
  class AccountSettings extends Component {
    state = {
      allowApi: true,
      navigate: "list", // enums[list, eventStream, keyForm]
      modalData: {},
      modalOpen: false,
    };
    componentDidMount() {
      trackPromise(this.getAndSaveKeys());
    }
  
  
    handleCheckbox(name, event) {
      this.setState({
          [event.target.name]: event.target.checked,
        });
        const saveAuthData = {
          allowApi: event.target.checked,
          acc_id: this.props.match.params.id
  
        };
  
        trackPromise( fetch("/mui/saveAuth",
        {
          method: "POST",
          headers: {
                  "Content-type": "application/json",
                },
          body: JSON.stringify(saveAuthData),
        }).then(async (result) => {
              if (result.status == 200) {
                const { retrievedData } = await result.json();
                 this.setState({
                  ...retrievedData,
                });
              }
        })
         
        );
    
        
    };
  
    getAndSaveKeys = async () => {
      // Save keys and all data in state
      const res = await fetch(
        `/mui/APIKeys/${this.props.match.params.id}`
      );
      const { retrievedData } = await res.json();
      console.log(`retrievedData----${JSON.stringify(retrievedData)}`);
      this.setState({
        ...retrievedData,
      });
    };
  
    render() {
      const { allowApi, navigate, itsmMSEnabled, commentsEnabled, statusEnabled, enableOwner, toolInitiateComment } = this.state;
      return (
        <div className="divContainer">
          <div className="headerDiv sectionMargin  mainMargin">
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/mui/home">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <Link to="/mui/onboardAccount">Accounts</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Link to="/mui/api-keys">Account Settings</Link>
              </BreadcrumbItem>
            </Breadcrumb>
            <h2 className="headerText">Account Settings</h2>
            <h4 className="headerText">
              <b className="mx-5">Account Code: {this.state.accountCode}</b>
              <b className="mx-5">Account Name: {this.state.accountName}</b>
            </h4>
          </div>
          <section>
  
            <Grid>
              
              {itsmMSEnabled ? <ButtonSettings
                        accountCode={this.state.accountCode}
                        itsmMSEnabled={this.state.itsmMSEnabled}
                        updateStatus={statusEnabled ? statusEnabled : "enabled"}
                        addComment={commentsEnabled ? commentsEnabled : false}
                        enableOwner={enableOwner ? enableOwner : ""}
                        toolInitiateComment={toolInitiateComment ? toolInitiateComment : false}
                        accId={this.state._id}
                      /> : ''}
                    
            </Grid>
          </section>
          {typeof document === "undefined"
            ? null
            : ReactDOM.createPortal(
                <ComposedModal
                  open={this.state.modalOpen}
                  onClose={() => this.setState({ modalOpen: false })}
                >
                  <ModalBody className="my-2" hasScrollingContent={true}>
                    <div>
                      <p>Issued To:</p>
                      <Tag>{this.state.modalData.issue_to}</Tag>
                    </div>
                    <br />
                    <div>
                      <p>Issued By:</p>
                      <Tag>{this.state.modalData.issue_from}</Tag>
                    </div>
                    <br />
                    <div>
                      <p>Selected Scopes:</p>
                      {this.state.modalData.scopes &&
                        this.state.modalData.scopes.map((scope) => (
                          <Tag key={scope}>{scope}</Tag>
                        ))}
                    </div>
                  </ModalBody>
                </ComposedModal>,
                document.body
              )}
        </div>
      );
    }
  }
  
  export default AccountSettings;
  