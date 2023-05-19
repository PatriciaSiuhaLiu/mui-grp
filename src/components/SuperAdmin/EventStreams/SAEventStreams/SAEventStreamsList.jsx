import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAEventStreamsList extends React.Component {
    constructor() {
        super();
        this.state = { 
            eventStreamData: [],
            showPopup: false,
        };
        this.loadEventStreams = this.loadEventStreams.bind(this);
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchEventStreamData")
            .then((res) => {
                return res.json();
            })
            .then((eventStreamData) => {
                this.setState({ eventStreamData });
            })
        );
    }
    handleInputChange = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            this.setState({
                ["inValid_" + e.target.name]: "Invalid Input.",
            });
            return;
        }
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    showModal = (e) => {
        this.setState({
            showPopup: true,
        });
        this.setState({resErrMsg: ''});
        var eventStreamToDel = e.target.getAttribute("data-name")
        this.setState({
            eventStreamId: e.target.id,
            eventStreamToDelete: eventStreamToDel
        })
    };
    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };
    deleteEventStream = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            showPopup: false,
        });
        const eventStreamData = {
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.eventStreamId
        };
        trackPromise(
            fetch("/mui/deleteEventStream", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify(eventStreamData),
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400)  {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                    this.setState({resErrMsg: object.eventSteamError});
                    })
                } else if (result.status === 409) {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.eventSteamError});
                    })
                } else if(result.status == 200){
                    e.preventDefault();
                    this.setState({
                        showPopup: false,
                    });
                    this.loadEventStreams();
                }
           })
        );
    }
    loadEventStreams = () => {
        this.props.history.push("/mui/eventStreams");
        trackPromise(
            fetch('/mui/fetchEventStreamData')
            .then(res => {
                return res.json()
            })
            .then(eventStreamData => { 
                this.setState({ eventStreamData })
            })
        )
    }
    render() {
        var stateSet = this.state;
        var eventStreamitem ='';
        const itemsEventStream = [];
        var eventStreamIdToDelete = '';
        var eventStreamNameToDelete = '';
        if(this.state.eventStreamId){
            eventStreamIdToDelete = this.state.eventStreamId
            eventStreamNameToDelete = this.state.eventStreamToDelete
        }
        if(stateSet.eventStreamData){
            var eventStramFromState = stateSet.eventStreamData;
            var eventStreamStateData = eventStramFromState.eventStreamData;
            if(eventStreamStateData != undefined){
                for(var i=0; i< eventStreamStateData.length; i++){
                    var redirectUrl = "/mui/addEventStreams?"+eventStreamStateData[i]._id;
                    eventStreamitem = (
                        <div className="col3">
                            <div className="cardMain">
                                <p className="cardTitle">{eventStreamStateData[i].name}</p>
                                <div className="actionDiv">
                                <Link  id={eventStreamStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={eventStreamStateData[i]._id}>EDIT</p>
                                </Link>
                                <a className="deleteWorkspaceLink" data-name={eventStreamStateData[i].name} onClick={(e) => {this.showModal(e);}} id={eventStreamStateData[i]._id} >
                                    <p className="actionItem" data-name={eventStreamStateData[i].name} id={eventStreamStateData[i]._id}>DELETE</p>
                                </a>
                                </div>
                            </div>
                        </div>
                    );
                    itemsEventStream.push(eventStreamitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addEventStreams">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addEventStreams">Add Event Streams</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13">
                {itemsEventStream}
            </div>
            {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete EventStreams</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete eventStream <span className="modalSpanClass">{eventStreamNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={eventStreamIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Event Stream" onBlur={this.handleInputChange} />
                    </Form>
                    {
                        this.state['resErrMsg'] && 
                        <small className="fontRed">
                        <b className="blgrperrorMsg">{this.state.resErrMsg}</b>
                        </small>
                    }
                    </div>
                    <div className="bx--modal-content--overflow-indicator"></div>
                    <div className="bx--modal-footer">
                    <Button kind="secondary" className="btnSACss" onClick={this.cancelModal} >Cancel</Button>
                    <Button kind='danger' onClick={this.deleteEventStream} type="submit" className="btnSACss" >Delete </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
                </div>
            ) : null}
        </div>
        
    );
  }
}
export default withRouter(SAEventStreamsList);









