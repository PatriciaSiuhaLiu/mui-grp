import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAGlobalAssignmentsList extends React.Component {
    constructor() {
        super();
        this.state = { 
            showPopup: false,
            globalAssignmentsData: [],
            globalAssignmentsId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
        // this.loadAssignments = this.loadAssignments.bind(this);
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchGlobalAssignmentsData")
            .then((res) => {
                return res.json();
            })
            .then((globalAssignmentsData) => {
                this.setState({ globalAssignmentsData });
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
        var GAToDel = e.target.getAttribute("data-name");
        this.setState({
            globalAssignmentID: e.target.id,
            globalAssignmentsNameToDelete: GAToDel
        })
    };
    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };
    deleteGlobalAssignments = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            showPopup: false,
        });
        const assistantsData = {
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.globalAssignmentID
        };
        trackPromise(
            fetch("/mui/deleteGlobalAssignments", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify(assistantsData),
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400)  {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                    this.setState({resErrMsg: object.globalAssignmentErr});
                    })
                } else if (result.status === 409) {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.globalAssignmentErr});
                    })
                } else if(result.status == 200){
                    e.preventDefault();
                    this.setState({
                        showPopup: false,
                    });
                    this.loadAssignments();
                }
           })
        );
    }
    loadAssignments = () => {
        this.props.history.push("/mui/globalAssignments");
        trackPromise(
            fetch('/mui/fetchGlobalAssignmentsData')
            .then(res => {
                return res.json()
            })
            .then(globalAssignmentsData => { 
                this.setState({ globalAssignmentsData })
            })
        )
    }
    render() {
        var stateSet = this.state;
        var globalAssignmentsitem ='';
        const itemsGlobalAssignments = [];
        var globalAssignmentsIdToDelete = '';
        var globalAssignmentsNameToDelete = '';
        if(this.state.globalAssignmentID){
            globalAssignmentsIdToDelete = this.state.globalAssignmentID
            globalAssignmentsNameToDelete = this.state.globalAssignmentsNameToDelete
        }
        if(stateSet.globalAssignmentsData){
            var globalAssignmentsFromState = stateSet.globalAssignmentsData;
            var globalAssignmentsStateData = globalAssignmentsFromState.globalAssignmentsData;
            var deleteItem = '';
            if(globalAssignmentsStateData != undefined){
                for(var i=0; i< globalAssignmentsStateData.length; i++){
                    var redirectUrl = "/mui/addGlobalAssignments?"+globalAssignmentsStateData[i]._id;
                    if(globalAssignmentsStateData[i].name != "primary"){
                        deleteItem = <p className="actionItem" data-name={globalAssignmentsStateData[i].name} id={globalAssignmentsStateData[i]._id}>DELETE</p>
                    }else{
                        deleteItem = '';
                    }
                    globalAssignmentsitem = (
                        <div className="col3">
                            <div className="cardMain">
                                <p className="cardTitle">{globalAssignmentsStateData[i].name}</p>
                                <p class="cardTitleSub">Group: {globalAssignmentsStateData[i].groups}</p>
                                <p class="cardTitleSubRule">rule: {globalAssignmentsStateData[i].rule}</p>
                                <div className="actionDiv">
                                <Link  id={globalAssignmentsStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={globalAssignmentsStateData[i]._id}>EDIT</p>
                                </Link>
                                <a className="deleteWorkspaceLink" data-name={globalAssignmentsStateData[i].name} onClick={(e) => {this.showModal(e);}} id={globalAssignmentsStateData[i]._id} >
                                    {deleteItem}
                                </a>
                                </div>
                            </div>
                        </div>
                    );
                    itemsGlobalAssignments.push(globalAssignmentsitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addGlobalAssignments">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addGlobalAssignments">Add Global Assignment</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13">
                {itemsGlobalAssignments}
            </div>
            {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete Global Assignment?</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete Assignment <span className="modalSpanClass">{globalAssignmentsNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={globalAssignmentsIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Assignment" onBlur={this.handleInputChange} />
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
                    <Button kind='danger' onClick={this.deleteGlobalAssignments} type="submit" className="btnSACss" >Delete </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
                </div>
            ) : null}
        </div>

    );
  }
}
export default withRouter(SAGlobalAssignmentsList);