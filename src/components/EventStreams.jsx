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
// import APIKeyForm from "./ApiKeyForm";
import EventStreamApiKey from "./EventStreamApiKey";
import { Link } from "react-router-dom";
class EventStreams extends Component {
  state = {
    allowApi: true,
    navigate: "list", // enums[list, eventStream, keyForm]
    modalData: {},
    modalOpen: false,
    EventStreamAPIData: ""
  };

  componentDidMount() {
    trackPromise(this.getEventStream());
    trackPromise(this.getAndSaveKeys());
  }

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

  getEventStream = async () => {  
    const accId = window.location.pathname.split("/")[3];     
    let res = fetch(`/mui/fetchEventStreamsKey?id=` + accId);

    try {
      trackPromise(res);
      res = await res;
      const { EventStreamAPIData } = await res.json();
      if(EventStreamAPIData){
        this.setState({
          navigate: "eventStream",
          EventStreamAPIData,
        });
      }else{
        this.setState({
          navigate: "eventStream"          
        });
      }      
    } catch (e) {
      this.setState({
        navigate: "eventStream"          
      });
    }
  };

  handleFormClose = () => {
    this.setState({
      navigate: "list",
    });
  };

  render() {
    const { allowApi, navigate } = this.state;
    let accountCode, accountName;
    if(this.state.EventStreamAPIData){
      accountCode = this.state.EventStreamAPIData.accountData.accountCode;
      accountName = this.state.EventStreamAPIData.accountData.accountName;
    }
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
              <Link to="/mui/api-keys">Event Stream</Link>
            </BreadcrumbItem>
          </Breadcrumb>
          <h2 className="headerText">Event Stream</h2>
          <h4 className="headerText">
            <b className="mx-5">Account Code: {accountCode}</b>
            <b className="mx-5">Account Name: {accountName}</b>
          </h4>
        </div>
        <section>
          <Grid>           
            {navigate == "eventStream" ? (
              <EventStreamApiKey stream={this.state.EventStreamAPIData} />
            ) : ""}
          </Grid>
        </section>        
      </div>
    );
  }
}

export default EventStreams;
