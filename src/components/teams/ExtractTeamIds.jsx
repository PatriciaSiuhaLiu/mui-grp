import React, { useState } from "react";
import { TextInput, Button } from "carbon-components-react";
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { Copy16 } from "@carbon/icons-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "carbon-components-react";

const ExtractTeamIds = () => {
  const [ids, setIds] = useState({});
  const handleUrlChange = async (event) => {
    event.preventDefault();
    // Validations
    if (isValidUrl(event.target.value)) {
      const extractedIds = getIDsFromTeamChannelUrl(event.target.value);
      setIds(extractedIds);
    } else {
      setIds({});
    }
  };
  const isValidUrl = (inputUrl) => {
    let urlString;
    try {
      urlString = new URL(inputUrl);
    } catch (_) {
      return false;
    }
    return urlString.protocol === "http:" || urlString.protocol === "https:";
  };

  function getIDsFromTeamChannelUrl(url) {
    const ids = {
      groupId: "teamsId",
      channel: "channelId",
      tenantId: "tenantId",
    };
    const extractedIds = {};
    url = decodeURI(url);
    const urlParts = url.split("?");
    if (urlParts.length === 3) {
      urlParts.shift();
    }
    let missedIds = [];
    const searchParams = new URLSearchParams(urlParts[1]);

    Object.keys(ids).forEach((id) => {
      const val = searchParams.get(id);
      if (val) {
        extractedIds[ids[id]] = val;
      } else {
        missedIds.push(id);
      }
    });

    const pathParams = urlParts[0].split("/");
    missedIds.forEach((id) => {
      const found = pathParams.find((a) => a.includes(`${id}=`));
      if (found) {
        const sp = found.split("=");
        sp[1] = sp[1].endsWith("#") ? sp[1].substr(0, sp[1].length - 1) : sp[1];
        extractedIds[sp[0]] = sp[1];
      } else {
        const index = pathParams.indexOf(id);
        if (index !== -1) console.log("found - ", pathParams[index]);
        if (index !== -1 && pathParams[index + 1]) {
          extractedIds[ids[id]] = pathParams[index + 1];
          if (id === "channel" && pathParams[index + 2]) {
            extractedIds["channelName"] = pathParams[index + 2];
          }
        }
      }
    });
    /*missedIds = [];
    Object.keys(ids).forEach((key) => {
      if (!extractedIds[ids[key]]) {
        missedIds.push(key);
      }
    });*/

    if (!extractedIds["channelId"]) {
      if (
        searchParams.get("threadId") &&
        searchParams.get("ctx") === "channel"
      ) {
        const index = pathParams.indexOf("conversations");
        if (index !== -1) {
          extractedIds["channelId"] = searchParams.get("threadId");
          extractedIds["channelName"] = pathParams[index + 1];
        }
      }
    }
    Object.keys(extractedIds).forEach(
      (key) => (extractedIds[key] = decodeURIComponent(extractedIds[key]))
    );
    return extractedIds;
  }

  return (
    <div className="divContainer">
      <div className="headerDiv sectionMargin  mainMargin">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/mui/home">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Link to="/mui/onboardAccount">Accounts</Link>
          </BreadcrumbItem>
        </Breadcrumb>
        <h2 className="headerText">Extract Teams Ids</h2>
      </div>
      <section className="sectionMargin mainMargin">
        <TextInput
          labelText={
            <>
              {" "}
              URL <b style={{ color: "red" }}>*</b>
            </>
          }
          onChange={handleUrlChange}
          placeholder="Enter URL"
          name="url"
          id="url"
          required
        />
        {Object.entries(ids).length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                {["Key", "Value", ""].map((key) => (
                  <TableHeader key={key}>{key}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody scrollIntoView={true}>
              {Object.entries(ids).map((entry) => (
                <TableRow>
                  <TableCell>{entry[0]}</TableCell>
                  <TableCell>{entry[1]}</TableCell>
                  <TableCell>
                    <Button
                      kind="ghost"
                      renderIcon={Copy16}
                      iconDescription={`Copy ${entry[0]} to Clipboard`}
                      hasIconOnly
                      onClick={() => {
                        navigator.clipboard.writeText(entry[1]);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <br />
        <br />
        <br />
        <p style={{ fontSize: ".810rem" }}>
          Instruction to Fetch Teams and Channel Id{" "}
          <a
            className="bx--link"
            href={`https://kyndryl.sharepoint.com/sites/ChatOps/SitePages/MS-Teams.aspx`}
            target="_blank"
            rel="noreferrer"
          >
            MS Teams (sharepoint.com)
          </a>
        </p>
      </section>
    </div>
  );
};

export default withRouter(ExtractTeamIds);
