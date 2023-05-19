import {
  Grid,
  Row,
  Column,
  Button,
  Accordion,
  AccordionItem,
  Select,
  SelectItem,
  Tag,
} from "carbon-components-react";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Edit32 } from "@carbon/icons-react";

class CommandList extends Component {
  state = {
    commands: [],
    filtered: [],
  };
  async componentDidMount() {
    const commands$ = fetch("/mui/fetchCommands").then((res) => res.json());
    const { commands } = await commands$;

    this.setState({
      commands,
      filtered: commands,
    });

    console.log("commands...........", commands);
  }
  applyFilter = (event) => {
    const { value } = event.target;
    console.log("applied filter......", value);
    switch (value) {
      case "nlp":
        this.setState({
          filtered: this.state.commands.filter((cmd) => cmd.isNLP),
        });
        break;

      case "global":
        this.setState({
          filtered: this.state.commands.filter((cmd) => cmd.global),
        });
        break;

      case "acc":
        this.setState({
          filtered: this.state.commands.filter((cmd) => cmd.accountCode),
        });
        break;

      default:
        this.setState({
          filtered: this.state.commands,
        });
        break;
    }
  };
  render() {
    return (
      <section className="sectionMargin mainMargin paddingCostom">
        <Grid>
          <Row>
            <Column>
              <div className="addBtnPA">
                <Link to={"/mui/add-command"}>
                  <Button className="addAccBtn">Add Command</Button>
                </Link>
                <Select
                  className="labelFont"
                  id="accountCodeFilter"
                  labelText="Filter Command with Account Code"
                  defaultValue=""
                  name="accountCodeFilter"
                  onChange={this.applyFilter}
                >
                  <SelectItem value="noFilter" text="No Filter" />
                  <SelectItem value="nlp" text="NLP" />
                  <SelectItem value="global" text="Global" />
                  <SelectItem value="acc" text="Account Specific" />
                </Select>
              </div>
            </Column>
          </Row>
        </Grid>

        <div className="accordionDiv">
          <Accordion align="start">
            {this.state.filtered.map((cmd) => (
              <AccordionItem
                key={cmd._id}
                title={
                  `Command: ${cmd.command}` +
                  (cmd.accountCode ? ` | Account Code: ${cmd.accountCode}` : "")
                }
              >
                <div className="paramsDivMain">
                  {(cmd.global || cmd.isNLP) && (
                    <div className="editDiv">
                      <Link to={"/mui/add-command?id=" + cmd._id}>
                        <Edit32 className="editIconCmd" />
                      </Link>
                    </div>
                  )}
                  <div className="cmdContentDiv">
                    <div className="bgDivCmd">
                      <h6>Group</h6>
                      {cmd.group ? (
                        <Tag type="gray" title="Clear Filter">
                          {cmd.group}
                        </Tag>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <h6>Params</h6>
                    {cmd.params &&
                      Object.keys(cmd.params).map((param) => (
                        <Tag type="gray" key={param}>
                          {param}
                        </Tag>
                      ))}
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    );
  }
}

export default withRouter(CommandList);
