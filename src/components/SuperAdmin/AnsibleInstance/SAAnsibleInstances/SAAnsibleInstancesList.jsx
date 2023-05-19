import React from 'react';
import ReactDOM from 'react-dom';
import { Button,Form, TextInput  } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { trackPromise } from "react-promise-tracker";
import { withRouter } from 'react-router-dom';
class SAAnsibleInstancesList extends React.Component {
    constructor() {
        super();
        this.state = { 
            showPopup: false,
            ansibleInstancesData: [],
            ansibleInstancesId: '',
            deleteConfirm: '',
            toDeleteID: ''
        };
    }
    componentDidMount() {
        trackPromise(
            fetch("/mui/ansibleInstance/list")
            .then((res) => {
                return res.json();
            })
            .then((ansibleInstancesData) => {
                this.setState({ ansibleInstancesData });
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

    loadAnsibleInstance = () => {
        this.props.history.push("/mui/ansibleInstance");
        trackPromise(
            fetch('/mui/ansibleInstance/list')
            .then(res => {
                return res.json()
            })
            .then(ansibleInstancesData => { 
                this.setState({ ansibleInstancesData })
            })
        )
    }

    render() {
        var stateSet = this.state;
        var ansibleInstancesitem ='';
        const itemsAnsibleInstances = [];
        if(stateSet.ansibleInstancesData){
            var ansibleInstancesFromState = stateSet.ansibleInstancesData;
            var ansibleInstancesStateData = ansibleInstancesFromState.ansibleInstancesData;
            if(ansibleInstancesStateData != undefined){
                for(var i=0; i< ansibleInstancesStateData.length; i++){
                    var redirectUrl = "/mui/addAnsibleIntances?"+ansibleInstancesStateData[i]._id;
                    ansibleInstancesitem = (
                        <div className="col3 cacf-list-card">
                            <div className="cardMain">
                                <p className="cardTitle">{ansibleInstancesStateData[i].name}</p>
                                <p class="cardTitleSub">URL : {ansibleInstancesStateData[i].url}</p>
                                <p class="cardTitleSub">X-Instance-id : {ansibleInstancesStateData[i].instanceId}</p>
                                <div className="actionDiv">
                                <Link  id={ansibleInstancesStateData[i]._id} to={redirectUrl} >
                                    <p className="actionItem" id={ansibleInstancesStateData[i]._id}>EDIT</p>
                                </Link>
                            </div>
                            </div>
                        </div>
                    );
                    itemsAnsibleInstances.push(ansibleInstancesitem)
                }
            }
        }
    return (
        <div className="col13Main">
            <div className="rowWidthDiv1">
                <Link className="addBtnDivCss" to="/mui/addAnsibleIntances">
                    <Button className="addAccBtn addBtnMargin addBtnCss addBtnPACss">
                        <Link to="/mui/addAnsibleIntances">Add CACF Ansible Instance</Link>
                    </Button>
                </Link>
            </div>
            <div className="rowWidthDiv row13">
                {itemsAnsibleInstances}
            </div>
        </div>

    );
  }
}
export default withRouter(SAAnsibleInstancesList);