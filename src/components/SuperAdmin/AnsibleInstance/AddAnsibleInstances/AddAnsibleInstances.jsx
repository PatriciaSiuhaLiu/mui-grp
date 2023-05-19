import React, {Component} from 'react';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextInput, TextArea, Checkbox, Select, SelectItem, } from 'carbon-components-react';
import AddAnsibleInstancesBreadcrump from './AddAnsibleInstancesBreadcrump';
import SALandingSidebar from '../../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import { validate } from '../../../../validation/validate.js';
class SAAddAnsibleInstances extends Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                name: '',
                url: '',
                key: '',
                resErrMsg: '',
                resSuccessMsg:  '',
                kafkaStream: '',
                kafkaStreamEnabled: '',
                autoStatus:'',
                data:{}
            }
        );
    }

    componentDidMount() {
        trackPromise(fetch('/mui/ansibleInstance/add')
        .then(res => {
            return res.json()
        })
        .then(data => { 

            this.setState({ data });
            if(this.state.data.edit){
                let name = this.state.data.ansibleInstanceObject.name;
                let url = this.state.data.ansibleInstanceObject.url;
                let key = this.state.data.ansibleInstanceObject.userKey;
                let autoStatus = this.state.data.ansibleInstanceObject.autoStatus;
                let kafkaStream = {};
                if(autoStatus == 'kafka'){
                    kafkaStream = this.state.data.ansibleInstanceObject.kafkaStream;
                }
                this.setState({'name':name});
                this.setState({'url':url});
                this.setState({'key':key});
                this.setState({'autoStatus':autoStatus});
                this.setState({'kafkaStream':JSON.stringify(kafkaStream)})
            }
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

    handleChangeDropDown(name, e) {
        this.setState({[e.target.name]: e.target.value });
    };
    
    handleChangeCheckBox(name, event) {
        this.setState({ [name]: event.target.checked });
    };

    updateValue = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    isValidURL = (urlString) => {
        let url;
        try {
          url = new URL(urlString);
        } catch (_) {
          return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
      };

    formSubmit= (e) => {
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        });
        const edit = (this.state.data.edit)?true:false;
        this.setState({resErrMsg: ''});
        this.setState({resSuccessMsg: ''});
        if(this.state.name.length < 1){
            this.setState({resErrMsg: 'Invalid Name!!'});
            return;
        }else if(this.state.url.length < 8){
            this.setState({resErrMsg: 'Invalid Url!!'});
            return;
        }else if(!this.isValidURL(this.state.url)){
            this.setState({resErrMsg:'Invalid Url!!'});
            return;
        }else if(this.state.key.length < 1){
            this.setState({resErrMsg: 'Invalid key!!'});
            return;
        }
 
        let foundEdit = [];
        let found = [];
        if(edit){
            foundEdit = this.state.data.ansibleList.filter(
                (a) => a.name.toLowerCase() == this.state.name.toLowerCase() && 
                 a._id != this.state.data.ansibleInstanceObject._id
            );
        }else{
            found = this.state.data.ansibleList.filter(
                (a) => a.name.toLowerCase() == this.state.name.toLowerCase()
            );
        }
        if((found && found.length > 0 && edit == false ) || (foundEdit && foundEdit.length > 0 && edit == true)){
            this.setState({resErrMsg:'Ansible instance name already exists!!'});
            return;
        }   
        if( this.state.autoStatus == 'kafka' && this.state.kafkaStream == ''){
            this.setState({resErrMsg:'Invalid Kafka Stream!!'});
            return;
        }    

        let validJson = this._validateJson();
        if(!validJson){
            this.setState({resErrMsg:'Invalid Kafka Stream configuration!!'});
            return;
        } 

        let ansibleInstanceData = {
            name: this.state.name,
            userKey: this.state.key,
            threeScale: true,
            url: this.state.url,
            autoStatus : (this.state.autoStatus),
            kafkaStream: {}
        }
        
        if(this.state.autoStatus == 'kafka'){
            ansibleInstanceData['kafkaStream'] = ( this.state.kafkaStream || '')
        }

        if(edit){
            ansibleInstanceData['_id'] = this.state.data.ansibleInstanceObject._id;
        }
        // SpecialCharacter validation
        var validateFields = validate(ansibleInstanceData);
        if(validateFields.length > 0){
            var message = "";
            for(var i =0; i<validateFields.length; i++){
                var element = document.querySelector(`input[name=${validateFields[i]}]`);
                if(element){
                    message += element.title + ", ";
                }else{
                    message += validateFields[i] + ', '
                }
            }
            this.setState({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            trackPromise(
                fetch('/mui/ansibleInstance' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ ansibleInstanceData , edit })
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400 || result.status === 500)  {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.fetchErrorfromansibleInstance});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.fetchErrorfromansibleInstance});
                    })
                } else if(result.status == 200){
                    result.json().then((object)=> {
                        if(object.success){
                            this.setState({resErrMsg:''})
                            this.setState({resSuccessMsg:'Ansible Instance Saved!!'});
                            setTimeout(() => {
                                this.props.history.push("/mui/ansibleInstance");
                            }, 2000);
                        }else{
                            this.setState({resErrMsg:'Error Saving Instance!!'});
                            this.setState({resSuccessMsg:''});
                        }
                    })
                  
                }
           })
            .catch(err => { 
              this.setState({errorMessage: err.message});
            })
            )
        }
          
    }

    _validateJson(){
        
        try{
           
            let success = true;
            if(this.state.autoStatus != 'kafka' ){
                return success;
            }
            let data = JSON.parse(this.state.kafkaStream);
            if(!data['service_id'] || !data['role_id'] || !data['secret_id']){
                success =  false;
            }else if(!data['api_url'] || !data['topic']){
                success = false;
            }
            return success;
        }catch(e){
            return false;
        }
    }

     render() {

        let name = '';
        let url = '';
        let key = '';
        let kafkaStream = '';
        let autoStatus = 'no';

        if(this.state.data.edit){
            name = this.state.data.ansibleInstanceObject.name;
            url = this.state.data.ansibleInstanceObject.url;
            key = this.state.data.ansibleInstanceObject.userKey;
            autoStatus = this.state.data.ansibleInstanceObject.autoStatus;
            if(this.state.data.ansibleInstanceObject.autoStatus == 'kafka'){
                let configData = JSON.stringify(this.state.data.ansibleInstanceObject.kafkaStream);
                kafkaStream = configData.replaceAll(",", ", \n");
            }
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
                                 <AddAnsibleInstancesBreadcrump />
                                 <div className="formDivSA formDivSALg">
                                     <Form  onSubmit={this.formSubmit}>
                                        <TextInput className="bx--text-input bx--text__input" id="name" name="name" labelText={ <> Name <b className="fontRed">*</b> </> }  placeholder="Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={name} required />
                                        <TextInput className="bx--text-input bx--text__input" id="url" name="url" labelText={ <> Url <b className="fontRed">*</b> </> }  placeholder="Url" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={url} required />
                                        <TextInput className="bx--text-input bx--text__input" id="key" name="key" labelText={ <> Key <b className="fontRed">*</b> </> }  placeholder="Key" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={key} required />
                                        
                                        <Select
                                            className="labelFont"
                                            id="autoStatus"
                                            labelText={<>Auto Job Status <b className="fontRed">*</b></>}
                                            name="autoStatus"
                                            onChange={ (event) => { this.handleChangeDropDown('autoStatus', event) }}
                                            defaultValue={autoStatus || "no"}
                                            required
                                            >
                                            <SelectItem value="no" text="none" selected={autoStatus == "no"} /> 
                                            <SelectItem value="cron" text="cron" selected={autoStatus == "cron"} />
                                            <SelectItem value="kafka" text="kafka" selected={autoStatus == "kafka"} />
                                        </Select>
                                        
                                        {/* <div class="addAccBtn">
                                            <label className="displayInlineLabel"><b>Enable Kafka Stream</b>
                                                <input
                                                    type="checkbox"
                                                    className="kafkaStreamEnabled"
                                                    name="kafkaStreamEnabled"
                                                    id="kafkaStreamEnabled"
                                                    onChange={ (event) => { this.handleChangeCheckBox('kafkaStreamEnabled', event) }}
                                                    checked={(this.state.kafkaStreamEnabled != '')?this.state.kafkaStreamEnabled:kafkaStreamEnabled}
                                                    />
                                            </label>
                                        </div> */}

                                        {this.state.autoStatus == 'kafka' ? (
                                        <TextArea
                                            cols={50}
                                            id="kafkaStream"
                                            name="kafkaStream"
                                            helperText="Provide proper json with name/value pairs, that begins with { left brace and ends with } right brace. Each name should be followed by : colon and the name/value pairs separated by , comma"
                                            onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} 
                                            defaultValue={kafkaStream} 
                                            required
                                            labelText={ <> Configurations<b className="fontRed">*</b> </> }
                                            placeholder="Enter kafkaStream Configurations"
                                            rows={8}
                                        />
                                        )  : null }
                                        <div class="cacf-instance-submit-div">
                                            <br></br>
                                            {
                                                this.state['specialCharacterErr'] &&
                                                <small className="fontRed">
                                                    <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                                </small>
                                            }
                                            <br></br>
                                            <div class="cacf-float-left">
                                                <Button kind="primary" type="submit" className="btnGeneral addWorkspace" >Submit</Button>
                                            </div>
                                            <div class="cacf-instance-submit cacf-float-left">
                                            {
                                                this.state['resErrMsg'] && 
                                                <small className="fontRed">
                                                <b className="blgrperrorMsg">{this.state.resErrMsg}</b>
                                                </small>
                                            }
                                            {
                                                this.state['resSuccessMsg'] && 
                                                <small className="fontGreen">
                                                <b className="successMsg">{this.state.resSuccessMsg}</b>
                                                </small>
                                            }
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
           
        )
      
    }
}
export default withRouter(SAAddAnsibleInstances);

