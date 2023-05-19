import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput, Select, SelectItem  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { Close32 } from "@carbon/icons-react";
import { withRouter } from 'react-router-dom';
class SAIndexChannelList extends React.Component {
    constructor() {
        super();
        this.state = { 
            showPopup: false,
            inedexChannelData: [],
            inedexChannelId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
        // this.loadIndexChannel = this.loadIndexChannel.bind(this);
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/fetchIndexChannelData")
            .then((res) => {
                return res.json();
            })
            .then((inedexChannelData) => {
                this.setState({ inedexChannelData });
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
        var indexChannelToDel = e.target.getAttribute("data-name");
        this.setState({
            indexChannelId: e.target.id,
            indexChannelNameToDelete: indexChannelToDel
        })
    };
    cancelModal = (e) => {
        e.preventDefault();
        this.setState({
            showPopup: false,
        });
    };
    deleteIndexChannel = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            showPopup: false,
        });
        const indexChannelData = {
            toDeleteField:'indexChannel',
            deleteConfirm: this.state.delete,
            toDeleteID: this.state.indexChannelId
        };
        trackPromise(
            fetch("/mui/deleteIndexChannel", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify(indexChannelData),
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400)  {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                    this.setState({resErrMsg: object.indexChannelError});
                    })
                } else if (result.status === 409) {
                    this.setState({
                        showPopup: true,
                    });
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.indexChannelError});
                    })
                } else if(result.status == 200){
                    e.preventDefault();
                    this.setState({
                        showPopup: false,
                    });
                    this.loadIndexChannel();
                }
           })
        );
    }
    loadIndexChannel = (collabTool='') => {
        this.props.history.push("/mui/indexChannels");
        trackPromise(
            fetch('/mui/fetchIndexChannelData')
            .then(res => {
                return res.json()
            })
            .then(inedexChannelData => { 
                let filteredData = [];
                if(collabTool){
                    filteredData = inedexChannelData.inedexChannelData.filter(data => {
                        if(collabTool.toLowerCase() === 'teams'){
                            return data.workspaceType && data.workspaceType.toLowerCase() === collabTool.toLowerCase();
                        }
                        else {
                            return data.workspaceType === undefined || data.workspaceType.toLowerCase() === collabTool.toLowerCase();
                        }
                    })
                }
                if(filteredData){
                    inedexChannelData = {
                        inedexChannelData: filteredData
                    };
                }
                this.setState({ inedexChannelData });
            })
        )
    }
    changeWorkSpace = (e) => {
        const collabTool = e.target.value;
        this.loadIndexChannel(collabTool);
    }
    render() {
        var stateSet = this.state;
        var indexChannelitem ='';
        const itemsIndexChannel = [];
        var indexChannelIdToDelete = '';
        var indexChannelNameToDelete = '';
        if(this.state.indexChannelId){
            indexChannelIdToDelete = this.state.indexChannelId
            indexChannelNameToDelete = this.state.indexChannelNameToDelete
        }
        if(stateSet.inedexChannelData){
            var indexChannelFromState = stateSet.inedexChannelData;
            var indexChannelStateData = indexChannelFromState.inedexChannelData;
            var deleteItem = '';
            var minifyItem = '';
            var test = []
            if(indexChannelStateData != undefined){
                for(var i=0; i< indexChannelStateData.length; i++){
                    var redirectUrl = "/mui/addIndexChannel?"+indexChannelStateData[i].channel;
                    if(indexChannelStateData[i].minify != undefined){
                        if(indexChannelStateData[i].minify == true || indexChannelStateData[i].minify == 'true'){
                            minifyItem = <p class="cardTitleSub">minify: true</p>
                        }else{
                            minifyItem = <p class="cardTitleSub">minify: false</p>
                        }
                    }else{
                        minifyItem = ''
                    }
                    indexChannelitem = (
                        <div className="col3-Large">
                            <div className="cardLarge">
                                <p className="cardTitle">{indexChannelStateData[i].channel}</p>
                                <p class="cardTitleSub">workspaceName: {indexChannelStateData[i].workspaceName}</p>
                                <p class="cardTitleSubRule">rule: {indexChannelStateData[i].rule}</p>
                                {minifyItem}
                                <div className="actionDiv">
                                    <Link  id={indexChannelStateData[i].channel} to={redirectUrl} >
                                        <p className="actionItem" id={indexChannelStateData[i].channel}>EDIT</p>
                                    </Link>
                                    <a className="deleteWorkspaceLink" data-name={indexChannelStateData[i].channel} onClick={(e) => {this.showModal(e);}} id={indexChannelStateData[i].channel} >
                                        <p className="actionItem" data-name={indexChannelStateData[i].channel} id={indexChannelStateData[i].channel}>DELETE</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                    itemsIndexChannel.push(indexChannelitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addIndexChannel">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addIndexChannel">Add Index Channel</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13" style={{width:"33%",paddingLeft:"10px"}}>
            <Select className="labelFont" id="collabTool" 
                labelText={<><b>Collaboration tool</b> </>}
                defaultValue="" 
                    onChange={(e) => this.changeWorkSpace(e)}>
                    <SelectItem hidden
                            value=""
                            text="Choose an option"
                        />
                    <SelectItem
                        value="SLACK"
                        text="SLACK"
                    />
                    <SelectItem
                        value="TEAMS"
                        text="TEAMS"
                    />
            </Select>
            </div>
            
            <div className="rowWidthDiv row13">
                {itemsIndexChannel}
            </div>
            {this.state.showPopup ? (
                <div className="popup">
                <div className="bx--modal-container modal-css">
                    <div className="bx--modal-header modalHeaderCss">
                    <p className="bx--modal-header__heading bx--type-beta modalHeaderTitlePadd" id="modal-addWorkspace-heading" >Do you want to delete Index Channel?</p>
                    <button className="bx--modal-close" type="button" data-modal-close aria-label="close modal" > 
                        <Close32 className="iconEditSize" onClick={this.cancelModal} />
                    </button>
                    </div>
                    <div className="bx--modal-content modalContentCss">
                    <p className="modalContentPara">About to delete Index Channel <span className="modalSpanClass">{indexChannelNameToDelete}</span>. Any saved data will also be deleted</p>
                    <p className="modalContentPara">This deletion cannot be undone.</p>
                    <Form>
                        <TextInput className="bx--text-input bx--text__input labelDeleteCSS" id={indexChannelIdToDelete} name="delete" defaultValue='' labelText="Please type DELETE to complete this action" placeholder="Delete Index Channel" onBlur={this.handleInputChange} />
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
                    <Button kind='danger' onClick={this.deleteIndexChannel} type="submit" className="btnSACss" >Delete </Button>
                    </div>
                </div>
                <span tabindex="0"></span>
                </div>
            ) : null}
        </div>

    );
  }
}
export default withRouter(SAIndexChannelList);