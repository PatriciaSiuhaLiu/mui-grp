import React from 'react';
import { Row, Column } from 'carbon-components-react';

const ChatPlatformList = (props) => {
    return (
        // <section className="formSectionMain">
            <Row>
                {props.chatPlatformData.map( (data,index) => {
                    return(
                        <Column lg={3}>
                            <div className="chatPlatformCardMain">
                                <div className="chatPlatformCardContainer">
                                    <div className="cardContentMain">
                                        <p className="chatPlatformContentTitle">{data.platformName}</p>
                                    </div>
                                    <div>
                                        <p>
                                            <span className='chatPlatformContentLabel'>Type:</span> 
                                            <span className='chatPlatformContent'> {data.platformType}</span>
                                        </p>
                                        <p>
                                        <span className='chatPlatformContentLabel'>Channel Type:</span>
                                        <span className='chatPlatformContent'> {data.channelType}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Column>
                    )
                })}
            </Row>
        // </section>
    )
}

export default ChatPlatformList;