import React,{ useEffect, useState} from 'react';
import { useParams,withRouter  } from 'react-router-dom';
import WebhookLanding from './Webhooks';
import WebhookBreadCrump from './WebhookBreadCrump';
import { trackPromise } from "react-promise-tracker";

const WebhookMain = () => {
  const [webhookData, setWebhookData] = useState({});
  const { id } = useParams();
  useEffect (() => {
    trackPromise(
      fetch("/mui/getWebhook/"+id)
      .then((res) => {
          return res.json();
      })
      .then((webhookData) => {
        setWebhookData(webhookData.dbData);
      })
    );
  },[id]);
  return (
    <div className="divContainer">
        <WebhookBreadCrump data={webhookData} />
        <section className="sectionMargin mainMargin paddingCostom">
            <WebhookLanding data={webhookData} />
        </section>

    </div>
  );
}
export default withRouter(WebhookMain);