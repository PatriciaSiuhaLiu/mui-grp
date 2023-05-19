import React from 'react';
import { TextInput, Select, SelectItem } from 'carbon-components-react';
// import { validate } from '../../../validation/validate.js';

const AddWorkspaceTeams = (props) =>{
    const workspaceRegionList = props.teamsData.workspaceRegions;//["EU", "NA", "AP"];
    return (
        <>
            <Select className="labelFont" id="region" name='region' 
                labelText={<> Region <b className="fontRed">*</b> </>}
                defaultValue={props.teamsData.region} 
                onChange={(e) => props.onChange(e)} required>
                {!props.teamsData.region && 
                    <SelectItem hidden
                        value=""
                        text="Choose an option"
                    />
                }
                {
                workspaceRegionList.map(region => {
                    return (<SelectItem
                    selected={props.teamsData.region===region}
                    text={region}
                    value={region}
                    />);
                })}  
            </Select>
            <TextInput className="bx--text-input bx--text__input" id="teamName" name="teamName" 
                labelText={ <> Team Name <b className="fontRed">*</b> </> } 
                placeholder="Team Name"  
                onBlur={(e) => props.onBlur(e)} onChange={(e) => props.onChange(e)}
                defaultValue={props.teamsData.teamName}
                required />
            <TextInput className="bx--text-input bx--text__input" id="teamId" name="teamId" 
                labelText={ <> 
                    Team Id <b className="fontRed">*</b> 
                    <a className="addWorkspaceLink" href={`/mui/extract-team-ids`} target="_blank" rel="noreferrer">Get Team Id</a>
                </> } 
                placeholder="Team Id"  
                onBlur={(e) => props.onBlur(e)} onChange={(e) => props.onChange(e)}
                defaultValue={props.teamsData.teamId}
                required />
        </>
    );
}

export default AddWorkspaceTeams;