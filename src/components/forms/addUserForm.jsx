import {
    Button,
    Checkbox,
    Select,
    SelectItem,
    Form,
    FormGroup,
    TextInput,
    Row,
    Column,
    Grid
} from "carbon-components-react";


import React, { Component } from "react";
import { trackPromise } from "react-promise-tracker";
import { withRouter } from "react-router-dom";
import "./form.scss";
import qs from 'qs';
class AddUserForm extends Component {
    constructor() {
        super()
        this.state = {
            username: '',
            password: '',
        }

    }

    componentDidMount() {

        //const {id} = this.props.match.params.id;
        let id1 = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).id       

       trackPromise(fetch('/mui/addUserRegistration/' + id1)
            .then(res => {
                return res.json()
            }).then(response => {
                if(response.expired){
                    this.props.history.push("/mui/thankyou");
                    return;
                }
                this.setState({ "key": response.key, "accountName": response.serviceUsed.accountName ,"service" :response.serviceUsed.service,"ansibleInstance" :response.serviceUsed.ansibleInstanceName,"userEmail": response.userEmail })
            })


       )
    }

    handleInputChange = e => {
        e.preventDefault();
        // Validations
        if (e.target.value && e.target.value.includes('script') && e.target.value.includes('<') || e.target.value.includes('>')) {
            this.setState({
                ['inValid_' + e.target.name]: 'Invalid Input.'
            })
            return
        }
        this.setState({
            ['inValid_' + e.target.name]: undefined
        })

        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    ///
    formSubmit = (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        let id = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).id
        //const { id } = this.props.match.params.id;
        trackPromise(
            fetch('/mui/submitUserRegistration/' + id, {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })
                .then((result) => { // Revisit fr password validation
                        if (result.status === 404 || result.status === 400)  {
                            result.json().then((object)=> {
                              this.setState({resErrMsg:object.errMsg});
                            })
                        } else if (result.status === 409) {
                            result.json().then((object)=> {
                                this.setState({resErrMsg:object.errMsg[0]});
                            })
                        } else if(result.status == 200){
                            let queryParam = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
                           if(queryParam.token){
                                this.props.history.push("/mui/thankyou");
                            }else{
                                this.props.history.push("/mui/home");
                            }
                      }
                })
                .catch(err => {
                    this.setState({ errorMessage: err.message });
                })
        )
    }
    render() {

        let userEmail =  this.state.userEmail;
        let queryParam = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
        let inputFieldPasswordCaption = 'Password';
        let inputFieldUserName = <TextInput labelText={<>User Name <b style={{ color: 'red' }}>*</b></>} onChange={this.handleInputChange} placeholder="User Name" name="username" id="username" required />
        let serviceType = 'service';
        let service = this.state.service;
        if(queryParam.token){
            inputFieldPasswordCaption ='Token';
            serviceType = 'Ansible Intance';
            inputFieldUserName = <TextInput labelText={<>User Name <b style={{ color: 'red' }}>*</b></>} onChange={this.handleInputChange} placeholder="User Name" name="username" id="username" value={userEmail} readOnly={true} required />
            this.state.username = userEmail;
            service = this.state.ansibleInstance;
        }
        const inputFieldPassword = <TextInput labelText={<>{inputFieldPasswordCaption} <b style={{ color: 'red' }}>*</b></>} onChange={this.handleInputChange} type="password" placeholder="*********" name="password" id="password" required />

        return (
            <div className="divContainer" style={{ width: '100%' }}>
                <div className="headerDiv sectionMargin  mainMargin">
                    <h2 className="headerText">User Registration Details</h2>
                </div>
                <section className="sectionMargin mainMargin paddingCostom">
                    <div id="serviceDiv" class="serviceDivMain">
                        <p class="pService">You are entering credentials for <strong>{service}</strong> {serviceType}, for the account <strong>{this.state.accountName}</strong></p> 
                        {/* <p class="pService">You are entering credentials for <strong>ICD</strong> service, for the account <strong>234</strong></p> */}

                    </div>
                    <Grid>
                        <Row>
                            <br></br>
                            <br></br>
                            <br></br>
                            <Column>
                                <Column>
                                </Column>
                                <Column>
                                </Column>

                                <Column>
                                </Column>
                                <Form onSubmit={this.formSubmit} className="formMain">



                                    {
                                        this.state['resErrMsg'] &&
                                        <small className="fontRed">
                                            <b className="blgrperrorMsg">{this.state['resErrMsg']}</b>
                                        </small>
                                    }
                                    <br></br>
                                    <br></br>
                                    {inputFieldUserName}
                                    {
                                        this.state['inValid_userName'] &&
                                        <small className="danger">
                                            <b className="errorMsg">{this.state['inValid_userName']}</b>
                                        </small>
                                    }
                                    {inputFieldPassword}
                                    <Button className="PAbtnCommon" type="submit"  >Submit</Button>
                                    <br></br>
                                    <br></br>
                                    <br></br>
                                    <Column>
                                    </Column>       
                                </Form>
                            </Column>
                            <Column>
                            </Column>
                        </Row>
                    </Grid>
                    <p class="disclaimerText">Disclaimer: These credentials would be stored in the ChatOps knight password vault for more information <a target="_blank"  rel="noopener noreferrer" href="https://kyndryl.sharepoint.com/sites/ChatOps/SitePages/Vault.aspx">click here</a></p>

                </section>
            </div>

        );
    }
}
export default withRouter(AddUserForm);
 