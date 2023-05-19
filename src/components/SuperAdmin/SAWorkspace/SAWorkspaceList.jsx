import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAWorkspaceList extends React.Component {
    constructor() {
        super();
        this.state = { 
            showPopup: false,
            workspaceData: [],
            workspaceId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
        this.loadWorkspaces = this.loadWorkspaces.bind(this);
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchWorkspaceData")
            .then((res) => {
                return res.json();
            })
            .then((workspaceData) => {
                this.setState({ workspaceData });
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
        var workspaceToDel = e.target.getAttribute("data-name")
        this.setState({
            workspaceId: e.target.id,
            workspaceNameToDelete: workspaceToDel
        })
    };
    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };
    deleteWorkspace = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            showPopup: false,
        });
        const workspaceData = {
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.workspaceId
        };
        trackPromise(
            fetch("/mui/deleteWorkspace", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify(workspaceData),
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400)  {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                    this.setState({resErrMsg: object.workspaceError});
                    })
                } else if (result.status === 409) {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.workspaceError});
                    })
                } else if(result.status == 200){
                    e.preventDefault();
                    this.setState({
                        showPopup: false,
                    });
                    this.loadWorkspaces();
                }
           })
        );
    }
    loadWorkspaces = () => {
        this.props.history.push("/mui/workspaces");
        trackPromise(
            fetch('/mui/fetchWorkspaceData')
            .then(res => {
                return res.json()
            })
            .then(workspaceData => { 
                this.setState({ workspaceData })
            })
        )
    }
    render() {
        var stateSet = this.state;
        var workspaceitem ='';
        const itemsWorkspace = [];
        const itemsBreak = [];
        var workspaceIdToDelete = '';
        var workspaceNameToDelete = '';
        if(this.state.workspaceId){
            workspaceIdToDelete = this.state.workspaceId
            workspaceNameToDelete = this.state.workspaceNameToDelete
        }
        if(stateSet.workspaceData){
            var workspaceFromState = stateSet.workspaceData;
            var workspaceStateData = workspaceFromState.workspaceData;
            if(workspaceStateData != undefined){
                for(var i=0; i< workspaceStateData.length; i++){
                    var redirectUrl = "/mui/addWorkspaces?"+workspaceStateData[i]._id;
                    // var redirectUrl = "/mui/deleteWorkspaces?"+workspaceStateData[i]._id;
                    workspaceitem = (
                        <div className="col3">
                            <div className="cardMain">
                                <p className="cardTitle">{workspaceStateData[i].name}</p>
                                <div className="actionDiv">
                                <Link  id={workspaceStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={workspaceStateData[i]._id}>EDIT</p>
                                </Link>
                                <a className="deleteWorkspaceLink" data-name={workspaceStateData[i].name} onClick={(e) => {this.showModal(e);}} id={workspaceStateData[i]._id} >
                                    <p className="actionItem" data-name={workspaceStateData[i].name} id={workspaceStateData[i]._id}>DELETE</p>
                                </a>
                                </div>
                            </div>
                        </div>
                    );
                    itemsWorkspace.push(workspaceitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addWorkspaces">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addWorkspaces">Add Workspace</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13">
                {itemsWorkspace}
            </div>
            {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete Slack App</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete slack App <span className="modalSpanClass">{workspaceNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={workspaceIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Workspace" onBlur={this.handleInputChange} />
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
                    <Button kind='danger' onClick={this.deleteWorkspace} type="submit" className="btnSACss" >Delete </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
                </div>
            ) : null}
        </div>
        
    );
  }
}
export default withRouter(SAWorkspaceList);









