import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';
import { Link } from 'react-router-dom';

const WebhookBreadCrump = (props) => {
    let forService = "";
    let serviceCode = "";
    if(props.data.serviceID !== ""){
        forService = "Service: ";
        serviceCode = props.data.serviceName;
    }
    if(props.data.accountID !== "" ){
        forService = "Account: ";
        serviceCode = props.data.accountName;
    }
    return (
        <div className="breadCrumpDiv headerDiv sectionMargin  mainMargin">
             <Breadcrumb>
               <BreadcrumbItem>
                    <Link to="/mui/home">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <Link to="/mui/webhooks">Webhooks</Link>
                </BreadcrumbItem>
            </Breadcrumb> 
            <h2 className="headerText">Webhook | {forService}{serviceCode}</h2>
        </div>
    );
  }

  export default WebhookBreadCrump;