import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react";

const TabularlData = (props) => {
  const headers = props.headers;
  const rows = props.data;
  return (
    <Table stickyHeader>
      <TableHead>
        <TableRow style={{ position: "sticky", top: 0 }}>
          {Object.keys(headers).map((key) => (
            <TableHeader key={key}>{headers[key].toUpperCase()}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody scrollIntoView={true}>
        {rows.map((row) => (
          <tr>
            {Object.keys(headers).map((header) => (
              <td>{row[header]}</td>
            ))}
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};

export default TabularlData;
