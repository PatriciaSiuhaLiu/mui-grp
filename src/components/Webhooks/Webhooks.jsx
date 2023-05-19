import React, {useState, useEffect} from 'react';
import { 
    Table, TableBody, TableHead, TableHeader, TableRow, Button, TooltipIcon, Toggle
} from "carbon-components-react";
import { Link, useParams } from 'react-router-dom';
import "react-datetime/css/react-datetime.css";
import LazyLoad from "react-lazyload";
import { Copy16, Checkmark16, UserMultiple16 } from "@carbon/icons-react";
import { trackPromise } from "react-promise-tracker";


const Webhooks=(props) => {
    const webhookInfo = props.data;
    const [error, setErrorMessage] = useState({});
    const [isCopied, setIsCopied] = useState({});
    const [webhookList, setWebhookList] = useState([]);
    const { id } = useParams();
    let btnRedirect='';
    if(webhookInfo){
        if(webhookInfo.accountID !== ""){
            btnRedirect = "/mui/addWebhook/"+webhookInfo.accountID
        }
        if(webhookInfo.serviceID !== ""){
            btnRedirect = "/mui/addWebhook/"+webhookInfo.serviceID
        }
    }
    useEffect(() => {
        setWebhookList(webhookInfo.tableData);
    }, [webhookInfo.tableData])
    const headers = [
        "Webhook Name",
        "Webhook URL",
        "",
        "Tool Name",
        "Channel Id",
        "WorkSpace Name",
        // "Channel Auto Create",
        // "Allow Updates",
        "Assigned Members",
        "Enable/Disable",
    ];
    const onCopied=(copyText, uniqueId)=> {
        navigator.clipboard.writeText(copyText);
        setIsCopied( prevCopied => {
            return {
                ...prevCopied,
                [uniqueId]:true,
            }
        });
        setTimeout(()=>{
            setIsCopied( prevCopied => {
                return {
                    ...prevCopied,
                    [uniqueId]:false,
                };
            });
        }, 1000);
    }
    const getWebhooks=()=> {
        trackPromise(
            fetch("/mui/getWebhook/"+id)
            .then((res) => {
                return res.json();
            })
            .then((webhookData) => {
                setWebhookList(webhookData.dbData.tableData);
            })
            );
    };
    const handleEnableDisable=(checked, id)=>{
        console.log(checked);
        const webhooks = {
            id : id,
            isEnabled: checked,
        }
        trackPromise(
            fetch('/mui/webhooks' , {
            method: "PATCH",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(webhooks)
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
                    getWebhooks();
                }
            })
            .catch(err => { 
                setErrorMessage({errorMessage: err.message});
            })
        );
    }
    return (
        <LazyLoad>
            <div>
            <Link class="addBtnPACss" to={btnRedirect}>
                <Button className="addAccBtn addBtnCss addBtnPACss btnMarginNew">
                    <Link to={btnRedirect}>Add Webhook</Link>
                </Button>
            </Link>
                <Table style={{margin: "0 0 4% 0"}}>
                    <TableHead>
                        <TableRow>
                        {headers.map((header) => (
                            <TableHeader key={header}>{header}</TableHeader>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {webhookList && webhookList.map((value) => {
                            let assignedMembers = "";
                             assignedMembers = value.assignedMembers.join(', ');
                            return (
                                <tr key={value.uniqueId}>
                                    <td>{value.webhookName}</td>
                                    <td>{value.webhookURL}
                                    </td>
                                    <td>{ !isCopied[value.uniqueId] ? 
                                    <TooltipIcon 
                                    renderIcon={Copy16} 
                                    onClick={() => {onCopied(value.webhookURL, value.uniqueId)}} 
                                    tooltipText="Click here to copy the URL"
                                    style={{marginLeft:"10px"}}
                                    />
                                  :""
                                    }
                                   { isCopied[value.uniqueId] ?
                                   <TooltipIcon 
                                    renderIcon={Checkmark16}
                                    style={{marginLeft:"10px", fill:"green"}}
                                    tooltipText="Copied the URL"
                                   />
                                   : ""}</td>
                                    <td>{value.toolName}</td>
                                    <td>{value.channelId}</td>
                                    <td>{value.workSpaceName}</td>
                                    {/* <td>{value.ChannelAutoCreate?"Yes":"No"}</td>
                                    <td>{value.allowUpdates?"Yes":"No"}</td> */}
                                    <td>
                                        <TooltipIcon 
                                            renderIcon={UserMultiple16} 
                                            direction="bottom" 
                                            tabIndex={0} 
                                            tooltipText={assignedMembers}
                                            >
                                        </TooltipIcon>
                                    </td>
                                    <td>
                                    <Toggle
                                        labelText=""
                                        size="sm"
                                        toggled={value.isEnabled?true:false}
                                        labelA='Disabled'
                                        labelB='Enabled'
                                        id={value.uniqueId}
                                        onToggle={(checked)=>handleEnableDisable(checked,value._id)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </LazyLoad>
    );
}

export default Webhooks;