import { Column, Row, TextInput } from "carbon-components-react";
import { AddAlt32 } from "@carbon/icons-react";
import { TrashCan32 } from "@carbon/icons-react";
import "../form.scss";
import React, { useState } from "react";
import { Tooltip } from "carbon-components-react/lib/components/Tooltip/Tooltip";
const AdditionalProp = (props) => {
  const [additionalProp, setAdditionalProp] = useState([
    { additionalPropKey: "", additionalPropVal: "" }
  ]);
  const { rules } = props;

  const addParamField = (e) => {
    e.preventDefault();
    const addProp = [...additionalProp];
    addProp.push({ additionalPropKey: "", additionalPropVal: "" });
    setAdditionalProp(addProp);
  };

  const addParam = (field, index, value) => {
   additionalProp[index][field] = value.trim();
  };
  const handleParam = (e) => {
    const { id, value } = e.target;
    const [field, i] = id.split("-");
    if (field === "additionalPropVal") {
      addParam(field, +i, value);
    } else if (field === "additionalPropKey") {
      addParam(field, +i, value);
    } else if (field === "delParam") {
      deleteParamField(+i);
    }
  };

  const deleteParamField = (index) => {
    const addProp = [...additionalProp];
    if (additionalProp.filter((param) => param !== undefined).length <= 1)
      return;
    delete addProp[index];
    setAdditionalProp(addProp);
  };
  return (
    <>
      <Row>
        <Column lg={12}>
          <div className="paramsInlineDiv">
            <h4 className="bx--label paramsLabel">Additional Properties&nbsp;<Tooltip>Enter a search key and value for adding a rule eg: Priority = 1</Tooltip></h4>
            <AddAlt32 className="addParam" onClick={addParamField} />
          </div>
        </Column>
      </Row>
      <Row>
        <Column>
          <div
            className="rulesDivStyle"
            style={{ marginTop: "0" }}
            onChange={handleParam}
            onClick={handleParam}
          >
            <Row>
              <Column lg={5}>
                <h4 className="bx--label paramsLabel">
                  Additional Properties Key
                </h4>
              </Column>
              <Column lg={1}></Column>
              <Column lg={5} style={{ padding: "0" }}>
                <h4 className="bx--label paramsLabel">
                  Additional Properties Value
                </h4>
              </Column>
            </Row>
            {additionalProp.map(
              (param, i) =>
                (param !== undefined) && (
                  
                  <div className="rulesSubDiv" key={"additionalProp" + i}>
                    <Column lg={5} style={{ padding: "0" }} key={"colsProp" + i}>
                      <TextInput
                        key={"additionalPropKey-" + i}
                        id={"additionalPropKey-" + i}
                        name={"additionalPropKey-" + i}
                        className="bx--text-input bx--text__input"
                        placeholder="Add Additional Properties Key"
                        defaultValue={
                          param["additionalPropKey"]
                            ? param["additionalPropKey"]
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value)
                            rules.ADDITIOANLPROPERTY[e.target.name] =
                              e.target.value;
                        }}
                      />
                    </Column>
                    <Column lg={1}>
                      <h4 className="bx--label paramsLabel iconMargin">=</h4>
                    </Column>
                    <Column lg={5} style={{ paddingRight: "0" }}>
                      <TextInput
                        key={"additionalPropVal-" + i}
                        id={"additionalPropVal-" + i}
                        name={"additionalPropVal-" + i}
                        className="bx--text-input bx--text__input"
                        placeholder="Add Additional Properties Value"
                        defaultValue={
                          param["additionalPropVal"]
                            ? param["additionalPropVal"]
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value)
                            rules.ADDITIOANLPROPERTY[e.target.name] =
                              e.target.value;
                        }}
                      />
                    </Column>
                    <div className="iconDiv1">
                      <TrashCan32
                        id={"delParam-" + i}
                        className="iconEditSize1"
                        aria-label="Delete Rule"
                        title="Delete Rule"
                      />
                    </div>
                  </div>
                )
            )}
          </div>
        </Column>
      </Row>
    </>
  );
};

export default AdditionalProp;
