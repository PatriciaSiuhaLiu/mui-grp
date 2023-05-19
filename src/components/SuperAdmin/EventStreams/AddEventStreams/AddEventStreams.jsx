import React from 'react';
import ReactDOM from 'react-dom';
import { trackPromise } from "react-promise-tracker";
import {  Button, Form, TextArea, TextInput } from 'carbon-components-react';
import SAEventStreamsBreadCrump from './AddEventStreamsBreadcrum';
import SALandingSidebar from '../../SALandingSidebar';
import { withRouter } from 'react-router-dom';
import { validate } from '../../../../validation/validate.js';
class SAAddEventStreams extends React.Component {
    constructor(props) {
        super(props);
        this.state = (
            {
                eventStreamDataFromDB:[],
                verifiedEventStreamFetched:[],
                eventStreamNameElement: '',
                eventStreamConfigElement: '',
                resErrMsg: ''
            }
        );
        // this.saveWorkspace = this.saveWorkspace.bind(this);
    }
    componentDidMount() {
        trackPromise(fetch('/mui/addEventStreams')
        .then(res => {
            return res.json()
        })
        .then(ESData => { 
            this.setState({ ESData })
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
            name: this.state.eventStreamName || this.state.ESData?.ESDataToEdit?.name ,
            configuration: this.state.eventStreamsConfig || this.state.ESData?.ESDataToEdit?.configurations
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
                fetch('/mui/saveEventStreams' , {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(eventStreamData)
            })
            .then((result) => {
                if (result.status === 404 || result.status === 400 || result.status === 500)  {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.eventStreamsError});
                    })
                } else if (result.status === 409) {
                    result.json().then((object)=> {
                        this.setState({resErrMsg: object.eventStreamsError});
                    })
                } else if(result.status == 200){
                    this.props.history.push("/mui/eventStreams");
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
        var eventStreamNameElement = '';
        if(this.state.ESData){
            // EDIT FLOW------
            var dataToFEtch = this.state.ESData.ESDataToEdit;
            var configData = JSON.stringify(dataToFEtch.configurations) ;
            eventStreamConfigElement = configData.replaceAll(",", ", \n")
            eventStreamNameElement = dataToFEtch.name;
        }else{
            // CREATE FLOW-------
            eventStreamConfigElement = '';
            eventStreamNameElement = '';
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
                                <SAEventStreamsBreadCrump />
                                <div className="formDivSATextAres">
                                    <Form  onSubmit={this.formSubmit}>
                                        <TextInput className="bx--text-input bx--text__input" id="eventStreamName" name="eventStreamName" labelText={ <> EventStream Name <b className="fontRed">*</b> </> }  placeholder="EventStream Name" onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} defaultValue={eventStreamNameElement} required />
                                        <TextArea
                                            cols={50}
                                            id="eventStreamsConfig"
                                            name="eventStreamsConfig"
                                            helperText="Provide proper json with name/value pairs, that begins with { left brace and ends with } right brace. Each name should be followed by : colon and the name/value pairs separated by , comma"
                                            onBlur={(e) => this.handleInputChange(e)} onChange={(e) => this.updateValue(e)} 
                                            defaultValue={eventStreamConfigElement} 
                                            required
                                            labelText={ <> Configurations<b className="fontRed">*</b> </> }
                                            placeholder="Enter EveentStream Configurations"
                                            rows={8}
                                        />
                                        {
                                            this.state['resErrMsg'] && 
                                            <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state.resErrMsg.jsonErr}</b>
                                            </small>
                                        }
                                        {
                                            this.state['specialCharacterErr'] &&
                                            <small className="fontRed">
                                                <b className="errorMsg specialCharErr">{this.state['specialCharacterErr']}</b>
                                            </small>
                                        }
                                        <br></br> 
                                        <Button kind="primary" type="submit" className="btnSACss" >Submit</Button>
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
export default withRouter(SAAddEventStreams);









