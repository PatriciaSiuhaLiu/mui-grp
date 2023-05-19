import React,{useState, useEffect} from 'react';
import ChatPlatformList from './ChatPlatformList';
import PageBanner from "../PageBanner";
import {Grid, Row, Column} from 'carbon-components-react';
import AddChatPlatform from './AddChatPlatform';

const ChatPlatform = (props) =>  {
    const [chatPlatformData, setChatPlatformData] = useState([]);
    
    const addChatPlatform=(data) =>{
        setChatPlatformData([...chatPlatformData, data]);
    }
    const handleChange =(i,e) => {
        const {name, value} = e.target;
        const data = [...chatPlatformData];
        data[i][name] = value;
        setChatPlatformData(data);
    }
    const deleteChatPlatform = (index)=>{
        const data = [...chatPlatformData];
        if(chatPlatformData.length !==1){
            data.splice(index, 1);
            setChatPlatformData(data);
        }
   }

   useEffect(()=>{
    const chatplatformList = [
        {
            platformName:'Kyndryl Teams',
            platformType:'Teams',
            channelType:'Public',
            URL:'',
            token:'',
            defaultWorkspace:'',
        },
        {
            platformName:'Kyndryl Slack',
            platformType:'Slack',
            channelType:'Private',
            URL:'',
            token:'',
            defaultWorkspace:'',
        },
        {
            platformName:'Dow Teams',
            platformType:'Teams',
            channelType:'Public',
            URL:'',
            token:'',
            defaultWorkspace:'',
        },
        {
            platformName:'Dow Slack',
            platformType:'Slack',
            channelType:'Public',
            URL:'',
            token:'',
            defaultWorkspace:'',
        },
        {
            platformName:'Dow Slack',
            platformType:'Slack',
            channelType:'Private',
            URL:'',
            token:'',
            defaultWorkspace:'',
        },
    ];
    setChatPlatformData(chatplatformList);
   },[]);

   
   const header = "gsmaAccount";
    const header1 = "NA Shared";
    return(<div className="divContainer">
        <PageBanner header={header} header1={header1} />
        <section className="bodySectionMain">
            <Grid>
                {/* <Row>
                    <Column lg={12} className="chatplatformHeader">Chat platforms</Column>
                </Row> */}
                <Row>
                    <Column lg={12} className="chatplatform-align-right">
                    <AddChatPlatform addChatPlatform={addChatPlatform}/>
                    </Column>
                </Row>
                <ChatPlatformList chatPlatformData={chatPlatformData} handleChange={handleChange} deleteChatPlatform={deleteChatPlatform} />
            </Grid>
        </section>
        
    </div>)
}

export default ChatPlatform;