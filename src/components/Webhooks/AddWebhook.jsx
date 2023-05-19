import React, { useEffect, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Button,TextInput, Form, Select, SelectItem, ToastNotification, TooltipIcon } from 'carbon-components-react';
import { Link, withRouter, useParams, useHistory } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import validator from 'validator';
import { InformationFilled16 } from "@carbon/icons-react";
import { validate } from '../../validation/validate.js';
const AddWebhook=() => {
    let history = useHistory();
    const [uiData, setUIData] = useState({});
    const [error, setErrorMessage] = useState({});
    const { id } = useParams();
    const [isFormValid, setIsValidForm] = useState(true);
    const [invalidForm, setInvalidForm] = useState({
        toolType: false,
        workspace: false,
        apiKey: false,
        assignedMembers:false,
        serviceAccountEmailId:false,
        webhookName:false,
        specialCharacterPresent: false,
        templateType: false,
      }); 
    const [form, setForm] = useState({
        toolType: '',
        workspace: '',
        apiKey: '',
        assignedMembers:'',
        serviceAccountEmailId:'',
        webhookName:'',
        templateType:''
    }); 
    const [checkBoxInfo, setCheckBoxInfo] = useState({
        channelAutoCreate: true,
        allowUpdates: true,
    });
    const [showToast, setToast] = useState(false);
    useEffect(() => {
        trackPromise(
            fetch("/mui/getWebhookFormData/"+id)
            .then((res) => {
                return res.json();
            })
            .then((webhookData) => {
                setUIData(webhookData.dbData);
            })
        );
    },[]);
    const handleInputChange = (e) => {
        if (
            (e.target.value &&
            e.target.value.includes("script") &&
            e.target.value.includes("<")) ||
            e.target.value.includes(">")
        ){
            setInvalidForm({
                ...invalidForm,
                [e.target.name]: true,
              });
            return;
        }
        setForm({
            ...form,
            [e.target.name]: e.target.value,
          });
    };
    const handleCheckbox=(e) => {
        setCheckBoxInfo({
            ...checkBoxInfo,
            [e.target.name]: e.target.checked,
        });
    };

    useEffect(() => {
        console.log('Calling useeffect');
        let isValidForm = true;
        let isValidserviceAccountEmailId = false;
        let isValidassignedMembers = false;
        if(!validator.isEmpty(form.serviceAccountEmailId) && !validator.isEmail(form.serviceAccountEmailId)) {
            isValidserviceAccountEmailId = true;
             isValidForm = false;
        } 
        if(form.assignedMembers.indexOf(',') > -1){
            const assignedList = form.assignedMembers.split(',');
            for(let i=0;i < assignedList.length; i++) {
                if(!validator.isEmpty(assignedList[i]) && !validator.isEmail(assignedList[i].trim())) {
                    isValidassignedMembers = true;
                    isValidForm = false;
                }
            }
         }else {
            if(!validator.isEmpty(form.assignedMembers) && !validator.isEmail(form.assignedMembers)) {
                isValidassignedMembers = true;
                isValidForm = false;
            }
        }
        setInvalidForm( (invalidForm) => {
            return {
                ...invalidForm,
                serviceAccountEmailId : isValidserviceAccountEmailId,
                assignedMembers: isValidassignedMembers,
            }
          });
        setIsValidForm(isValidForm);
    },[form.assignedMembers, form.serviceAccountEmailId]);
    
    const formSubmit= (e) => {
        e.preventDefault();
        if(!isFormValid) {
            return false;
        }
        const webhookData = {
            toolType: form.toolType,
            workspace: form.workspace,
            channelAutoCreate: checkBoxInfo.channelAutoCreate,
            allowUpdates:checkBoxInfo.allowUpdates,
            apiKey: form.apiKey,
            reqid: id,
            assignedMembers: form.assignedMembers,
            serviceAccountEmailId: form.serviceAccountEmailId,
            isEnabled: true,
            webhookName:form.webhookName,
            templateType:form.templateType
        };
         // SpecialCharacter validation
        var validateFields = validate(webhookData);
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
            setInvalidForm({
                ...invalidForm,
                ["specialCharacterPresent"]: true,
              });
              setErrorMessage({specialCharacterErr: `Special Character not allowed in field ${message}`});
            // setInvalidForm({'specialCharacterErr': `Special Character not allowed in field ${message}`});
        }else{
            trackPromise(
                fetch('/mui/saveWebhooks' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(webhookData)
                })
                .then((result) => {
                    if (result.status === 404 || result.status === 400 || result.status === 500)  {
                        result.json().then((object)=> {
                            setErrorMessage({resErrMsg: object.webhookError});
                        })
                    } else if (result.status === 409) {
                        result.json().then((object)=> {
                            setErrorMessage({errorMessage: object.webhookError});
                        })
                    } else if(result.status === 200){
                        setToast(true);
                        const redirectUrl = "/mui/webhooks/"+id;
                        history.push(redirectUrl);
                    }
                })
                .catch(err => { 
                    setErrorMessage({errorMessage: err.message});
                })
            );
        }
    }
    
    const handleCancel=(e) => {
        const redirectUrl = "/mui/webhooks/"+id;
        history.push(redirectUrl);
    }
    const fieldInfo = {
        webhookName: 'Unique name for a webhook',
        workSpace:'Appropriate slack workspace where channel needs to be created',
        apiKey: 'Pager Duty/Tools API access key',
        serviceAccountEmailId: 'Pager Duty Account Owner email Id',
        assignedMembers: 'Default members who will get added to the Slack channel'
    }
    const divItemStyles = {
        display:'inline',
        width:'90%'
    };
    const toolTipStyle = {
        paddingTop: '50px'
    }
    return (
        <div className="divContainer">
             {showToast?<ToastNotification 
                    title="Add Webhook" 
                    subtitle="Saved webhook details successfully" 
                    timeout={0}
                    caption="" 
                    notificationType='toast'
                    kind='success'
                    role='alert'
                    style={{ marginBottom: '.5rem' }}
                />:""}
            <div className="breadCrumpDiv headerDiv sectionMargin  mainMargin">
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/mui/home">Home</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={"/mui/webhooks/"+id}>Webhooks</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <Link to="/mui/addWebhook" >Add Webhooks</Link>
                    </BreadcrumbItem>
                </Breadcrumb> 
                <h2 className="headerText">Add Webhook</h2>
            </div>
            <section className="sectionMargin mainMargin paddingCostom">
                <div className="formDivSA">
                    <Form  onSubmit={formSubmit}>
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                                <TextInput className="bx--text-input bx--text__input" id="webhookName" name="webhookName" 
                                    labelText= "Webhook Name"  placeholder="Webhook Name" 
                                    onBlur={(e) => handleInputChange(e)} 
                                    onChange={(e) => handleInputChange(e)} 
                                    defaultValue="" required 
                                />
                            </div>
                            <div>
                                <TooltipIcon 
                                renderIcon={InformationFilled16} 
                                direction="bottom" 
                                tabIndex={0} 
                                tooltipText={fieldInfo.webhookName}
                                style={toolTipStyle}
                                >
                                </TooltipIcon>
                            </div>
                        </div>
                        
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                            <Select className="labelFont " id="toolType" name="toolType" labelText="Tool Type" defaultValue="" onBlur={(e) => handleInputChange(e)} onChange={(e) => handleInputChange(e)} required="required"  >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                             {uiData && uiData.toolTypeArr && uiData.toolTypeArr.map((toolType) => {
                                return (<option
                                className="bx--select-option"
                                value={toolType}
                                >
                                    {toolType}
                                </option>
                             )})}
                        </Select>
                            </div>
                            <div></div>
                        </div>
                        
                        
                        {/* <Select className="labelFont " id="ticketTemplates" name="ticketTemplates" labelText="Ticket Template" defaultValue="" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} required="required"  >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                            {itemticketTemplates}
                        </Select> */}
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                            <Select className="labelFont " id="workspace" name="workspace" labelText="Workspace" defaultValue="" onBlur={(e) => handleInputChange(e)} onChange={(e) => handleInputChange(e)} required="required"  >
                            <SelectItem
                                // selected={impactingEvent == true}
                                value=""
                                text="Choose an Option"
                            />
                            {uiData && uiData.workspaceArr && uiData.workspaceArr.map((workspace) => {
                                return (<option
                                className="bx--select-option"
                                value={workspace}
                                >
                                    {workspace}
                                </option>
                            )})}
                        </Select>
                            </div>
                            <div>
                            <TooltipIcon 
                            renderIcon={InformationFilled16} 
                            direction="bottom" 
                            tabIndex={0} 
                            tooltipText={fieldInfo.workSpace}
                            style={toolTipStyle}
                            >
                         </TooltipIcon>
                            </div>
                        </div>
                        
                        
                    <div className="inlineCheckbox" style={{display:'none'}}>
                            <div className="checkbox checkBoxDes">
                                <input type="checkbox" name="channelAutoCreate" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { handleCheckbox(event) }}  defaultChecked={checkBoxInfo.channelAutoCreate} />
                                <label className="bx--checkbox-label-text checkboxClass">
                                    Channel Auto Create
                                </label>
                            </div> 
                            <div className="checkbox checkBoxDes">
                                <input type="checkbox" name="allowUpdates" className="checkboxInput checkboxDisplayInline" onClick={ (event) => { handleCheckbox(event) }}  defaultChecked={checkBoxInfo.allowUpdates} />
                                <label className="bx--checkbox-label-text checkboxClass">
                                    Allow Updates
                                </label>
                            </div> 
                        </div>
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                            { form.toolType !== "NotifyTemplates" ? (
                                <TextInput className="bx--text-input bx--text__input" 
                                    id="apiKey"                                 
                                    name = "apiKey"  
                                    labelText= "API Key"  
                                    placeholder="API Key" 
                                    onBlur={(e) => handleInputChange(e)} 
                                    onChange={(e) => handleInputChange(e)}
                                    defaultValue="" 
                                    required
                                />
                            ) : (
                                <div>
                                    <Select className="labelFont " id="templateType" name="templateType" labelText="Template" defaultValue="" onBlur={(e) => handleInputChange(e)} onChange={(e) => handleInputChange(e)} required="required"  >
                                    <SelectItem
                                        // selected={impactingEvent == true}
                                        value=""
                                        text="Choose an Option"
                                    />
                                    {uiData && uiData.templateArr && uiData.templateArr.map((template) => {
                                        return (<option
                                        className="bx--select-option"
                                        value={template}
                                        >
                                            {template}
                                        </option>
                                    )})}
                                    </Select>
                                </div>
                            ) }
                            </div>
                            <div>
                            <TooltipIcon 
                            renderIcon={InformationFilled16} 
                            direction="bottom" 
                            tabIndex={0} 
                            tooltipText={fieldInfo.apiKey}
                            style={toolTipStyle}
                            >
                         </TooltipIcon>
                            </div>
                        </div>
                        { form.toolType !== "NotifyTemplates" ? (
                        <div>
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                            <TextInput className="bx--text-input bx--text__input" 
                            id="serviceAccountEmailId" name="serviceAccountEmailId" 
                            labelText= "Service Account Email Id"  
                            placeholder="Service Account Email Id" 
                            onBlur={(e) => handleInputChange(e)} 
                            onChange={(e) => handleInputChange(e)}
                            invalidText="Please provide a valid email Id"
                            invalid={invalidForm.serviceAccountEmailId}
                            defaultValue="" required />
                            </div>
                            <div>
                            <TooltipIcon 
                            renderIcon={InformationFilled16} 
                            direction="bottom" 
                            tabIndex={0} 
                            tooltipText={fieldInfo.serviceAccountEmailId}
                            style={toolTipStyle}
                            >
                         </TooltipIcon>
                            </div>
                        </div>
                   
                        <div style={{display : 'flex',flexDirection:'row'}}>
                            <div style={divItemStyles}>
                            <TextInput className="bx--text-input bx--text__input" 
                            id="assignedMembers" name="assignedMembers" 
                            labelText= "Assigned Members"  
                            placeholder="Assigned Members-Use comma to add multiple members" 
                            onBlur={(e) => handleInputChange(e)} 
                            onChange={(e) => handleInputChange(e)} 
                            defaultValue="" required 
                            invalid={invalidForm.assignedMembers}
                            invalidText="Please provide a valid email Ids"
                            />
                            </div>
                            <div>
                            <TooltipIcon 
                            renderIcon={InformationFilled16} 
                            direction="bottom" 
                            tabIndex={0} 
                            tooltipText={fieldInfo.assignedMembers}
                            style={toolTipStyle}
                            >
                         </TooltipIcon>
                            </div>
                        </div>
                        </div> ) : null }
                        <br></br>
                        {
                            invalidForm.specialCharacterPresent &&
                            <small className="fontRed">
                                <b className="errorMsg specialCharErr">{error.specialCharacterErr}</b>
                            </small>
                        }
                        <br></br>
                        <Button kind="primary" type="submit" style={{marginTop: "16px"}} className="addWorkspace">Submit</Button>
                        <Button kind="tertiary" type="button" style={{marginTop: "16px", marginLeft: "16px"}} className="addWorkspace" onClick={(e) => handleCancel(e)}>Cancel</Button>
                        
                    </Form>

                </div>
            </section>
                                    
           
        </div>
        
    );
}
export default withRouter(AddWebhook);