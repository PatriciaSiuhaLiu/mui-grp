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
import Key from "./Key";
import APIKeyForm from "./ApiKeyForm";
import EventStreamApiKey from "./EventStreamApiKey";
import { Link } from "react-router-dom";

class APIKeys extends Component {
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
    this.setState({
      ...retrievedData,
    });
  };

  afterAddingNewKey = () => {
    trackPromise(this.getAndSaveKeys());
    this.handleFormClose();
  };

  handleFormClose = async () => {
    this.setState({
      navigate: "list",
    });
    const res = await fetch(
        `/mui/APIKeys/${this.props.match.params.id}`
      );
      const { retrievedData } = await res.json();
      this.setState({
        ...retrievedData,
      });
    // trackPromise(this.getAndSaveKeys());

  };

  getKeyInfo = async (index) => {
    const { appKeys } = this.state;
    this.setState({
      modalData: appKeys[index],
      modalOpen: true,
    });
  };

  reGenerateKey = async (keyValue, index) => {
    const { appKeys } = this.state;
    appKeys[index].keyValue = keyValue;

    this.setState({
      appKeys: appKeys,
    });
  };

  deleteKey = async (keyName) => {
    const { accountCode } = this.state;
    const payload = {
      accCode: accountCode,
      keyName: keyName,
    };

    try {
      var res = fetch("/mui/deleteCKKey", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      trackPromise(res);

      res = await res;

      if (res.status == 200) trackPromise(this.getAndSaveKeys());
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { allowApi, navigate } = this.state;
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
              <Link to="/mui/api-keys">API Keys</Link>
            </BreadcrumbItem>
          </Breadcrumb>
          <h2 className="headerText">API Keys</h2>
          <h4 className="headerText">
            <b className="mx-5">Account Code: {this.state.accountCode}</b>
            <b className="mx-5">Account Name: {this.state.accountName}</b>
          </h4>
        </div>
        <section>

          <Grid>
            <Row>
                <Column>
                    <Button className="mx-2 apiKeyBtn" onClick={() => this.setState({ navigate: "keyForm" })} >
                        Generate API Key
                    </Button>                      
                </Column>
            </Row>
            
            {navigate == "eventStream" ? (
              <EventStreamApiKey stream={this.state.EventStreamAPIData} />
            ) : (
              allowApi &&
              (navigate == "keyForm" ? (
                <APIKeyForm
                  accountCode={this.state.accountCode}
                  onClose={this.handleFormClose}
                  onSubmit={this.afterAddingNewKey}
                />
              ) : (
                this.state.appKeys &&
                this.state.appKeys.map((keyObj, index) => (
                  <div className="my-2" key={index}>
                    <Key
                      accountCode={this.state.accountCode}
                      keyObj={keyObj}
                      keyValue={keyObj.keyValue}
                      onRegenerateKey={(newKey) =>
                        this.reGenerateKey(newKey, index)
                      }
                      getInfo={() => this.getKeyInfo(index)}
                      onDelete={() => this.deleteKey(keyObj.keyName)}
                    />
                  </div>
                ))
              ))
            )}
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

export default APIKeys;
