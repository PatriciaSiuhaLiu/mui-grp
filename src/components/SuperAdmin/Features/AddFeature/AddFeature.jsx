import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextInput, Select, SelectItem, TextArea ,Dropdown, FormGroup,Grid, Row, Checkbox,Column } from 'carbon-components-react';
import SAAddFeatureBreadCrump from './AddFeatureBreadcrump';
import SALandingSidebar from '../../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import { validate } from '../../../../validation/validate.js';
class SAAddFeature extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                featureDataFromDB:[],
                verifiedfeatureFetched:[],
                featureNameElement: '',
                name: '',
                publish: false,
                publishType:'',
                publishToSpecificAcount: [],
                category: '',
                description: '',
                resErrMsg: '',
                publishToAcount: false,
                publishDisable: false,
            }
        );
        // this.saveWorkspace = this.saveWorkspace.bind(this);
    }
    componentDidMount() {
        trackPromise(fetch('/mui/addFeature')
            .then(res => {
                return res.json()
            })
            .then(featureData => { 
                this.setState({ featureData })
            })
        )
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
    updateValue = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handlePublishChange = e => {

        const {name, value } = e.target;
        let publishToSpecificAcount = false;
        if(value === 'publishToSpecificAcount'){
            publishToSpecificAcount = true;
        }
        this.setState({
          [name] : value,
          publish: !publishToSpecificAcount,
          publishToAcount: publishToSpecificAcount
        });
      };
    
    handleAccounts = () => (e) => {
        const {publishToSpecificAcount} = this.state;
        let checkedAccounts = [];
        checkedAccounts = [...publishToSpecificAcount]

        const {value, checked} = e.target;
        if (checked){
            checkedAccounts.push(value)
        }else{
            const index = checkedAccounts.indexOf(value);
            if (index > -1) {
                checkedAccounts.splice(index, 1);
            }
        }

        this.setState({publishToSpecificAcount : checkedAccounts})
       
    };
    
    formSubmit= (e) => {
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        });
        var editFlag = false;
        if(this.state.featureData?.featureDataToEdit){
            editFlag = true;
        }else{
            editFlag = false;
        }
        const eventStreamData = {
            name : this.state.name ,
            publishToAll : this.state.publish ,
            publishToSpecificAcount : this.state.publishToSpecificAcount ,
            category : this.state.category ,
            description : this.state.description ,
            editFlag: editFlag,
        };
         // SpecialCharacter validation
        var validateFields = validate(eventStreamData);
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
                fetch('/mui/saveFeature' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(eventStreamData)
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400 || result.status === 500)  {
                    result.json().then((object)=> {
                        console.log(object);
                        this.setState({resErrMsg: object.fetchErrorfromFeature});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.fetchErrorfromFeature});
                    })
                } else if(result.status == 200){
                    this.props.history.push("/mui/features");
                }
           })
            .catch(err => { 
              this.setState({errorMessage: err.message});
            })
            )
        }
          
    }

    isDisabled = () => {
        const {publishToAcount, publishToSpecificAcount} = this.state;
        let disabled = false
        if(publishToAcount && publishToSpecificAcount.length === 0){
            disabled = true
        }
        return disabled;
    }

    render() {
        var eventStreamConfigElement = '';
        var featureNameElement = '';
        var name = '';
        var publish = '';
        var publishToAllAccount = '';
        var publishToAcount = '';
        var category = '';
        var description = '';
        var disabledLabel = false;
        var diabledLabelForAllAcc = false;
        if(this.state.publishDisable == true){
            disabledLabel = true
        }else{
            disabledLabel = false
        }
        if(this.state.publishToAcount == true){
            diabledLabelForAllAcc = true
        }else{
            diabledLabelForAllAcc = false
        }
        console.log(this.state);
        var accountCodeItem = ''
        const itemsAccCode = [];
        if (this.state?.featureData?.accountCodes){
            var accountCodes = this.state.featureData.accountCodes;
            for (var i=0; i < accountCodes.length; i++) {
                accountCodeItem = (
                    <option
                    className="bx--select-option"
                    value={accountCodes[i]}
                    // selected={value.name == workspaceNameFromDB}
                    >
                    {accountCodes[i]}
                    </option>
                );
                itemsAccCode.push(accountCodeItem);
            }
        }
        if(this.state.featureData){
            // EDIT FLOW------
            var dataToFEtch = this.state.featureData.featureDataToEdit;
        }else{
            // CREATE FLOW-------
            name = '';
            publish = '';
            publishToAllAccount = '';
            publishToAcount = '';
            category = '';
            description = '';
        }
        console.log(this.state);
        return (
            <div className="divContainer">
                <section className="sectionGrid">
                    <div class="bx--grid padding0">
                        <div class="rowWidth">
                            <div class="gridColulmnWidth3">
                                <SALandingSidebar />
                            </div>
                            <div class="gridColumn13" style={{maxWidth: '20% !important', paddingRight: '0 !important'}}>
                                <SAAddFeatureBreadCrump />
                                <div className="formDivSA">
                                    <Form  onSubmit={this.formSubmit}>
                                        <TextInput className="bx--text-input bx--text__input" id="name" name="name" labelText={ <> Feature Name <b className="fontRed">*</b> </> }  placeholder="Feature Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={name} required />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.validateFeatureMsgNew}</b>
                                            </small>
                                        }
                                        <div className="checkbox">
                                            <label className="bx--checkbox-label-text checkboxClass">
                                            <input type="radio" name="publishType" value="publish" className="checkboxInput" 
                                            onChange={this.handlePublishChange} checked={this.state.publishType === 'publish'}/>
                                              Publish
                                            </label>
                                        </div>  
                                       <div className="checkbox">
                                            <label className="bx--checkbox-label-text checkboxClass">
                                            <input type="radio"  name="publishType" value="publishToSpecificAcount"  
                                            className="checkboxInput"  checked={this.state.publishType === 'publishToSpecificAcount'}  onChange={this.handlePublishChange} />
                                                Publish to Specific Account
                                            </label>
                                        </div> 
                                        {
                                            
                                            this.state.publishToAcount && 
                                            <FormGroup
                                                name="accounts"
                                                legendText={
                                                <>
                                                    Accounts <b className="fontRed">*</b>
                                                </>
                                                }
                                                onChange={this.handleAccounts()}
                                            >
                                                <Grid className="mx-height-200">
                                                <Row>
                                                    {this.state.featureData.accountForAddFeature.map((acc_code, i) => (
                                                    <Column key={acc_code} lg={6}>
                                                        <Checkbox
                                                        id={acc_code}
                                                        name={i}
                                                        value={acc_code}
                                                        labelText={acc_code}
                                                        />
                                                    </Column>
                                                    ))}
                                                </Row>
                                                </Grid>
                                            </FormGroup>
                                            
                                        }
                                        <Select className="labelFont" id="category" name="category" labelText="Category" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} >
                                            <option
                                                className="bx--select-option"
                                                value=""
                                                // selected={value.name == workspaceNameFromDB}
                                                >
                                                Choose an option
                                            </option>
                                            <option
                                                className="bx--select-option"
                                                value="Incident Management"
                                                // selected={value.name == workspaceNameFromDB}
                                                >
                                                Incident Management
                                            </option>
                                            <option
                                                className="bx--select-option"
                                                value="Knowledge Management"
                                                // selected={value.name == workspaceNameFromDB}
                                                >
                                                Knowledge Management
                                            </option>
                                            <option
                                                className="bx--select-option"
                                                value="Change Management"
                                                // selected={value.name == workspaceNameFromDB}
                                                >
                                                Change Management
                                            </option>
                                            <option
                                                className="bx--select-option"
                                                value="Problem Management"
                                                // selected={value.name == workspaceNameFromDB}
                                                >
                                                Problem Management
                                            </option>
                                            {/* <SelectItem
                                                selected={category == "Incident Management"}
                                                value="Incident Management"
                                                text="Incident Management"
                                            />
                                            <SelectItem
                                                selected={category == "Knowledge Management"}
                                                value="KnowledgeManagement"
                                                text="Knowledge Management"
                                            /> */}
                                            {/* <SelectItem
                                                selected={category == "Change Management"}
                                                value="ChangeManagement"
                                                text="Change Management"
                                            />
                                            <SelectItem
                                                selected={category == "Problem Management"}
                                                value="ProblemManagement"
                                                text="Problem Management"
                                            /> */}
                                        </Select>
                                        <TextArea className="labelFont" style={{marginBottom: "16px"}} cols={50} rows={5} labelText={<>Description <b style={{ color: "red" }}>*</b> <span className="specialCharacterLabel">(Special characters &lt; &gt; # $ ^ & * \ = {} ; \\ | ? ~ are not allowed)</span></>} placeholder="Description" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} name="description" defaultValue={description} />
                                        <br></br>
                                        {
                                            this.state['specialCharacterErr'] &&
                                            <small className="fontRed">
                                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                            </small>
                                        }
                                        <br></br>
                                        <Button kind="primary" type="submit" className="addWorkspace" disabled={this.isDisabled()} >Submit</Button>
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
export default withRouter(SAAddFeature);

