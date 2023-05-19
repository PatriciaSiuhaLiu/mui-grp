import React,{useState} from 'react';
import {
    
    Column,
    Grid,
    Row,
    Tooltip,
    Link
  } from "carbon-components-react";
  import PageBanner from "../PageBanner";
  import IndexChannelList from './IndexChannelList';

const MUIIndexChannel = () => {
    const [channelData, setChannelData] = useState([{
        indexChannelName:'',
        rules:'',
        collabTool:''
    }]);
    const [accountData, setAccountData] = useState(
       { geoList: [
            {geo:'APAC'},
            {geo:'Americas'},
            {geo:'EMEA'},
            {geo:'Japan'}
        ],
        marketList: [
           'ASEAN',
           'AUSTRALIA/NEW ZEALAND',
           'BENELUX'
        ],
        sectorList: [
            {desc:'Communications Sector'},
            {desc:'Computer services industry'},
            {desc:'Distribution factor'},
            {desc:'Financial services sector'}
         ],
         industryList: [
            {desc:'Aerospace and Defence'},
            {desc:'Automotive'},
            {desc:'Banking'},
            {desc:'Chemical and Petroleum'}
         ],
         countryList: [
            {desc:'United States'},
            {desc:'India'},
            {desc:'China'},
            {desc:'UAE'}
         ],
         ticketPriority: [1, 2, 3, 4],
         ticketImpact: [
            'Critical',
            'High',
            'Major',
            'Medium',
            'Minor',
            'Low'
         ],
         ticketTemplates:['incident','gsmaevent']

    }
    );
    const [itemsWorkspace, setItemsWorkspace] = useState(
        [{name:'Test - Global'},{name:'Chatops - Teams'}]
    );
    const addChannel=(e) =>{
        e.preventDefault();
        const channelList = {
            indexChannelName:'',
            rules:'',
            collabTool:''
        };
        setChannelData([...channelData, channelList]);
    }
    const handleChange =(i,e) => {
        const {name, value} = e.target;
        const data = [...channelData];
        data[i][name] = value;
        setChannelData(data);
    }
    const setRules =(i,rules) => {
        const data = [...channelData];
        data[i]['rules'] = rules;
        setChannelData(data);
    }
    const deleteChannel = (index)=>{
        const data = [...channelData];
        if(channelData.length !==1){
            data.splice(index, 1);
            setChannelData(data);
        }
   }
    const header = "gsmaAccount";
    const header1 = "NA Shared";
    return(<div className="divContainer">
        <PageBanner header={header} header1={header1} />
        {/* <section className="formSectionMain"> */}
        <div  className="indexChannelDiv">
            <Grid>
                <Row>
                    <Column>
                        <h4 className="bx--label">
                        <span>
                            Workspace Slack/Teams  channels that will act as index channel{" "}
                        </span>
                        <b className="fontRed">*</b>{" "}
                        <Tooltip>
                            Index channel displays consolidated Ticket details.
                        </Tooltip>
                        </h4>
                    </Column>
                    <Column>
                    <Link href='#' className="addBGBtn addWorkspaceLink" onClick={addChannel}>
                    Add Channel
                    </Link>
                </Column>
                </Row>
                <IndexChannelList channelData={channelData} deleteChannel={deleteChannel} handleChange={handleChange} accountsData={accountData} itemsWorkspace={itemsWorkspace} onAddRules={setRules} />
            </Grid>
        </div>
        {/* </section> */}
    </div>);
}

export default MUIIndexChannel;