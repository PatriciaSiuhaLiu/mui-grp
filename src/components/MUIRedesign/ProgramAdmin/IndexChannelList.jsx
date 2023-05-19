import React from 'react';
import {
    Column,
    Row,
    Select,
    SelectItem,
    TextInput
  } from "carbon-components-react";
import { TrashCan32 } from "@carbon/icons-react";
import AddRules from './AddRules';
const IndexChannelList = (props) => {
    return(
        props.channelData.map((data, index) => {
            return(
                      data && (
                        <div key={"ch" + index}>
                            <Row>
                                <Column>
                                <div className="RulesDiv2">
                                    <div className="rulesSubDiv">
                                    <TextInput
                                        style={{ margin: "13px 10px" }}
                                        className="labelFont"
                                        id={"channel-groupName" + index}
                                        name={"indexChannelName"}
                                        placeholder={`Workspace ${data.collabTool.toLowerCase()} Channel that will act as index channel`}
                                        labelText=""
                                        onChange={(e) => props.handleChange(index,e)}
                                        defaultValue={
                                        data.indexChannelName
                                        }
                                        value={data.indexChannelName}
                                        required
                                    />
                                    <TextInput
                                        style={{ margin: "13px 10px",background: "#f4f4f4" }}
                                        className="labelFont ruleTitle"
                                        name="channelRules"
                                        onChange={(e) => props.handleChange(index,e)}
                                        labelText=""
                                        readOnly
                                        id={"channelRules" + index}
                                        placeholder="No Rules applied"
                                        value={data.rules}
                                        defaultValue={data.rules}
                                        required
                                    />
                                    <Select
                                        style={{
                                        margin: "10px !important",
                                        padding: "0 !important",
                                        }}
                                        className="labelFont ruleTitle"
                                        id="workspace"
                                        labelText=""
                                        name="collabTool"
                                        onChange={(e) => props.handleChange(index,e)}
                                        defaultValue={data.collabTool}
                                        value={data.collabTool}
                                        required
                                    >
                                        <SelectItem
                                        value=""
                                        hidden
                                        text="Choose an option"
                                        />
                                        {props.itemsWorkspace.map(workspace => {
                                        return <SelectItem
                                        value={workspace.name}
                                        name={workspace.name}
                                        text={workspace.name}
                                        />
                                        })}
                                    </Select>
                                    </div>
                                    <div className="iconDiv">
                                    <AddRules
                                        key={"channel" + index}
                                        index={"channel" + index}
                                        rulesFor="channel"
                                        accountsData={
                                        props.accountsData
                                        }
                                        onAddRules={ rules => props.onAddRules(index, rules)}
                                    />
                                    <TrashCan32
                                        className="iconEditSize"
                                        aria-label="Delete Rule"
                                        title="Delete Rule"
                                        onClick={() => props.deleteChannel(index)}
                                    />
                                    </div>
                                </div>
                                </Column>
                            </Row>
                        </div>
                      )
            );
        })
    );
}

export default IndexChannelList;