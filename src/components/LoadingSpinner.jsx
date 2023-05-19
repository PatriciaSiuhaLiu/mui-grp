import { Loading } from "carbon-components-react";
import React from "react";
// import { Loading } from "carbon-components-react";
import { usePromiseTracker } from "react-promise-tracker";

export default function LoadingSpinner() {
  const { promiseInProgress } = usePromiseTracker();
  return (
    promiseInProgress && <Loading withOverlay={true} description="loading..." />
  );
}
