import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAAssistatnsList extends React.Component {
    constructor() {
        super();
        this.state = { 
            showPopup: false,
            assistantsData: [],
            assistantsId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
        this.loadAssistants = this.loadAssistants.bind(this);
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchAssistantsData")
            .then((res) => {
                return res.json();
            })
            .then((assistantsData) => {
                this.setState({ assistantsData });
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
        var assistantsToDel = e.target.getAttribute("data-name");
        this.setState({
            assistantsId: e.target.id,
            assistantsNameToDelete: assistantsToDel
        })
    };
    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };
    deleteAssistants = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            showPopup: false,
        });
        const assistantsData = {
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.assistantsId
        };
        trackPromise(
            fetch("/mui/deleteAssistants", {
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
                    this.setState({resErrMsg: object.assistantsError});
                    })
                } else if (result.status === 409) {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.assistantsError});
                    })
                } else if(result.status == 200){
                    e.preventDefault();
                    this.setState({
                        showPopup: false,
                    });
                    this.loadAssistants();
                }
           })
        );
    }
    loadAssistants = () => {
        this.props.history.push("/mui/assistants");
        trackPromise(
            fetch('/mui/fetchAssistantsData')
            .then(res => {
                return res.json()
            })
            .then(assistantsData => { 
                this.setState({ assistantsData })
            })
        )
    }
    render() {
        var stateSet = this.state;
        var assistantsitem ='';
        const itemsAssistants = [];
        var assistantsIdToDelete = '';
        var assistantsNameToDelete = '';
        if(this.state.assistantsId){
            assistantsIdToDelete = this.state.assistantsId
            assistantsNameToDelete = this.state.assistantsNameToDelete
        }
        if(stateSet.assistantsData){
            var assistantsFromState = stateSet.assistantsData;
            var assistantsStateData = assistantsFromState.assistantsData;
            var deleteItem = '';
            if(assistantsStateData != undefined){
                for(var i=0; i< assistantsStateData.length; i++){
                    var redirectUrl = "/mui/addAssistants?"+assistantsStateData[i]._id;
                    if(assistantsStateData[i].name != "primary"){
                        deleteItem = <p className="actionItem" data-name={assistantsStateData[i].name} id={assistantsStateData[i]._id}>DELETE</p>
                    }else{
                        deleteItem = '';
                    }
                    assistantsitem = (
                        <div className="col3">
                            <div className="cardMain">
                                <p className="cardTitle">{assistantsStateData[i].name}</p>
                                <div className="actionDiv">
                                <Link  id={assistantsStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={assistantsStateData[i]._id}>EDIT</p>
                                </Link>
                                <a className="deleteWorkspaceLink" data-name={assistantsStateData[i].name} onClick={(e) => {this.showModal(e);}} id={assistantsStateData[i]._id} >
                                    {deleteItem}
                                </a>
                                </div>
                            </div>
                        </div>
                    );
                    itemsAssistants.push(assistantsitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addAssistants">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addAssistants">Add Assistants</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13">
                {itemsAssistants}
            </div>
            {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete Assistant?</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete Assistant <span className="modalSpanClass">{assistantsNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={assistantsIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Assistant" onBlur={this.handleInputChange} />
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
                    <Button kind='danger' onClick={this.deleteAssistants} type="submit" className="btnSACss" >Delete </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
                </div>
            ) : null}
        </div>

    );
  }
}
export default withRouter(SAAssistatnsList);