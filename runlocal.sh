#!/bin/bash
NODE_ENV=development   
MS_NAME=chatops-management-ui 
MS_ENCRYPTION_KEY=LnYV7W8fQOjcWQslJM0DcWV1wum9MI0e 
prg_admin_blue_grp=chatopsProgramAdminGroup 
team_it_chatops_group=teamITAdmin
client_id=22e0f1aa3d17537c8f45811bbb4b69c5:820cdc79778735824003ab6353d743bb5d211924300c3febcac2cc7beb153623
client_secret=2beb64d023bfb4fbfcdc620ddad17803:275a45a187a9ef2a7da6c0ef5263642f11beda1e3f37e05118a0bed98fe4f0b3
authorization_url=https://preprod.login.w3.ibm.com/v1.0/endpoint/default/authorize
token_url=https://preprod.login.w3.ibm.com/v1.0/endpoint/default/token
issuer_id=https://preprod.login.w3.ibm.com/oidc/endpoint/default
discoveryURL=https://preprod.login.w3.ibm.com/oidc/endpoint/default/.well-known/openid-configuration
SsoCallBackUrlNew=https://localhost:10443/mui/auth/sso/callback
SsoCallBackUrl=https://localhost:5678/auth/sso/callback
bluepageUrl="https://bluepages.ibm.com/tools/groups/groupsxml.wss?task=listMembers&" 
allBluegroupForUserUrl="https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail={{mailId}}).list/byjson?ibm-allgroups"  
chatops_redis=chatops-redis 
chatops_port=6379 
PROGRAM_ADMIN_GRP=chatopsProgramAdminGroup 
chatops_queues="ItsmSnowUpdTicketQueue,CKCreateIncQueue,CKUpdateIncQueue,CollabSlackQueue" 
INLINE_RUNTIME_CHUNK=false

cd ../
./buildLocal.sh
cd -
cd api/
nodemon app.js

