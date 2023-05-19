import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextInput  } from 'carbon-components-react';
import SAAddAssistantsBreadCrump from './AddAssistantsBreadcrump';
import SALandingSidebar from '../../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import { validate } from '../../../../validation/validate.js';
class SAAddAssistants extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                assistantsDataFromDB:[],
                verifiedAssistantsFetched:[],
                assistantsNameElement: '',
                name: '',
                url: '',
                version: '',
                groups: '',
                apiKey: '',
                resErrMsg: ''
            }
        );
        // this.saveWorkspace = this.saveWorkspace.bind(this);
    }
    componentDidMount() {
        trackPromise(fetch('/mui/addAssistants')
        .then(res => {
            return res.json()
        })
        .then(assistantsData => { 
            this.setState({ assistantsData })
        })
        )
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
    updateValue = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    saveWorkspace = (e) => {

    }

    formSubmit= (e) => {
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        });
        const eventStreamData = {
            name: this.state.name || this.state.assistantsData?.assistantsDataToEdit?.name ,
            url: this.state.url || this.state.assistantsData?.assistantsDataToEdit?.url,
            version: this.state.version || this.state.assistantsData?.assistantsDataToEdit?.version,
            groups: this.state.groups || this.state.assistantsData?.assistantsDataToEdit?.groups,
            apiKey: this.state.apiKey || this.state.assistantsData?.assistantsDataToEdit?.apiKey,

        };
         // SpecialCharacter validation
        var validateFields = validate(eventStreamData);
        if(validateFields.length > 0){
            var message = "";
            for(var i =0; i<validateFields.length; i++){
                var element = document.querySelector(`input[name=${validateFields[i]}]`);
                message += element.title + ", ";
            }
            this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            trackPromise(
                fetch('/mui/saveAssistants' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(eventStreamData)
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400 || result.status === 500)  {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.assistantsError});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.assistantsError});
                    })
                } else if(result.status == 200){
                    this.props.history.push("/mui/assistants");
                }
           })
            .catch(err => { 
              this.setState({errorMessage: err.message});
            })
            )
        }
        
          
    }
    render() {
        var eventStreamConfigElement = '';
        var assistantsNameElement = '';
        var name = '';
        var url = '';
        var apiKey = '';
        var version = '';
        var groups = '';
        if(this.state.assistantsData){
            // EDIT FLOW------
            var dataToFEtch = this.state.assistantsData.assistantsDataToEdit;
            name = dataToFEtch.name;
            url = dataToFEtch.url;
            apiKey = dataToFEtch.apiKey;
            version = dataToFEtch.version;
            groups = dataToFEtch.groups;
        }else{
            // CREATE FLOW-------
            name = '';
            url = '';
            apiKey = '';
            version = '';
            groups = '';
        }
        return (
            <div className="divContainer">
                <section className="sectionGrid">
                    <div class="bx--grid padding0">
                        <div class="rowWidth">
                            <div class="gridColulmnWidth3">
                                <SALandingSidebar />
                            </div>
                            <div class="gridColumn13" style={{maxWidth: '20% !important', paddingRight: '0 !important'}}>
                                <SAAddAssistantsBreadCrump />
                                <div className="formDivSA">
                                    <Form  onSubmit={this.formSubmit}>
                                        <TextInput className="bx--text-input bx--text__input" id="name" name="name" labelText={ <> Assistant Name <b className="fontRed">*</b> </> }  placeholder="Assistant Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={name} required />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.assistantNameErr}</b>
                                            </small>
                                        }
                                        <TextInput className="bx--text-input bx--text__input" id="url" name="url" labelText={ <> Assistant URL <b className="fontRed">*</b> </> }  placeholder="Assistant URL" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={url} required />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.assistantURLErr}</b>
                                            </small>
                                        }
                                        <TextInput className="bx--text-input bx--text__input" id="apiKey" name="apiKey" labelText={ <> API Key<b className="fontRed">*</b> </> }  placeholder="API Key" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={apiKey} required />
                                        <TextInput className="bx--text-input bx--text__input" id="version" name="version" labelText={ <> Version <b className="fontRed">*</b> </> } helperText="Version should be of format 'version=<value>'" placeholder="Version" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={version} required />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.assistantVersionErr}</b>
                                            </small>
                                        }
                                        <TextInput className="bx--text-input bx--text__input" id="groups" name="groups" labelText={ <> Group Name<b className="fontRed">*</b> </> }  placeholder="Group Name " onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={groups} />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.assistantSaveErr}</b>
                                            </small>
                                        }
                                        {
                                            this.state['specialCharacterErr'] &&
                                            <small className="fontRed">
                                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                            </small>
                                        }
                                        <Button kind="primary" type="submit" className="addWorkspace" >Submit</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        );
    }
}
export default withRouter(SAAddAssistants);

