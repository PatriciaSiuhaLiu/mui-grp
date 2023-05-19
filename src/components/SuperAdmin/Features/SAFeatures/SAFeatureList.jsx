import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAFeaturesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            showPopup: false,
            featureData: [],
            featureId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
        this.loadAssistants = this.loadAssistants.bind(this);
        
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchfeatureData")
            .then((res) => {
                return res.json();
            })
            .then((featureData) => {
                this.setState({ featureData });
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
            featureId: e.target.id,
            featureNameToDelete: assistantsToDel
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
        const featureData = {
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.featureId
        };
        trackPromise(
            fetch("/mui/deleteAssistants", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify(featureData),
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
            fetch('/mui/fetchfeatureData')
            .then(res => {
                return res.json()
            })
            .then(featureData => { 
                this.setState({ featureData })
            })
        )
    }
    render() {
        console.log(this.props.searchVal,"----searchVal");
        var stateSet = this.state;
        var featuresitem ='';
        const itemsFeatures = [];
        var featureIdToDelete = '';
        var featureNameToDelete = '';
        if(this.state.featureId){
            featureIdToDelete = this.state.featureId
            featureNameToDelete = this.state.featureNameToDelete
        }
        if(stateSet.featureData){
            var featureFromState = stateSet.featureData;
            let featuresStateData = featureFromState.featureData;

            //check for Search Value from Program Admin
            if(this.props.searchVal && this.props.searchVal !== 'all'){
                featuresStateData = featuresStateData.filter(features => features.publishToSpecificAcount.includes(this.props.searchVal))
            }
            if(featuresStateData != undefined){
                for(var i=0; i< featuresStateData.length; i++){
                    var redirectUrl = "/mui/addFeature?"+featuresStateData[i]._id;
                    
                    featuresitem = (
                        <div className="col3">
                            <div className="cardMain">
                                <p className="cardTitle">{featuresStateData[i].name}</p>
                                <p class="cardTitleSub">Category: {featuresStateData[i].category}</p>
                                {/* <p class="cardTitleSub">publish: {featuresStateData[i].publish}</p> */}
                                <p class="cardTitleSub descriptionDiv">Description: {featuresStateData[i].description}</p>
                                <div className="actionDiv">
                                {/* <Link  id={featuresStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={featuresStateData[i]._id}>EDIT</p>
                                </Link>
                                <a className="deleteWorkspaceLink" data-name={featuresStateData[i].name} onClick={(e) => {this.showModal(e);}} id={featuresStateData[i]._id} >
                                    <p className="actionItem" data-name={featuresStateData[i].name} id={featuresStateData[i]._id}>DELETE</p>
                                </a> */}
                                </div>
                            </div>
                        </div>
                    );
                    itemsFeatures.push(featuresitem)
                }
            }
        }
    return (
        <div className="col13Main">
            {this.props.type !== 'program_admin' && (
                <div className="rowWidthDiv1">
                    <Link className="addBtnDivCss" to="/mui/addFeature">
                        <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                            <Link to="/mui/addFeature">Add Feature</Link>
                        </Button>
                    </Link>
                </div>
            )}
            <div className="rowWidthDiv row13">
                {itemsFeatures}
            </div>
            {/* {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete Feature?</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete Feature <span className="modalSpanClass">{featureNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={featureIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Feature" onBlur={this.handleInputChange} />
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
            ) : null} */}
        </div>

    );
  }
}
export default withRouter(SAFeaturesList);