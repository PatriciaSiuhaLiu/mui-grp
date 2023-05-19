#!/bin/bash
source ../../microservices/setenv.sh
mkdir -p lib/ && cp ../../msutils/msutils-1.0.0.tgz lib/
cd api/
    echo "this script sets up a ms or node folder with certificates and util library"
    mkdir -p ssl/vault
    mkdir -p ssl/development 
    mkdir -p ssl/production 
	mkdir -p ssl/teams 
    cp ../../../ssl/development/*.pem ssl/development/ 
    cp ../../../ssl/production/*.pem ssl/production/ 
	cp ../../../ssl/environments/ibm-chatops-prod/external/*.pem ssl/teams/
    cp ../../../ssl/vault/*.crt ssl/vault/
    cp ../../../ssl/vault/*.key ssl/vault/ 
    # mkdir -p lib/ 
    # cp ../../../msutils/msutils-1.0.0.tgz lib/
    mkdir -p lib/ 
    cp ../../../msutils/msutils-1.0.0.tgz lib/
    cp ../passport-ci-oidc-2.0.4.tgz lib/
    npm install
    npm install ./lib/msutils-1.0.0.tgz
    npm install ./lib/passport-ci-oidc-2.0.4.tgz
cd ../
npm install
npm install ./lib/msutils-1.0.0.tgz
docker build -t chatops-${PWD##*/}:$version --progress=plain .
docker rm --force chatops-management-ui
# docker run -d --net-alias ${PWD##*/} -p 5678:5678 -e SsoCallBackUrlNew=$SsoCallBackUrlNew -e discoveryURL=$discoveryURL -e RELEASE_NUMBER=$version -e NODE_ENV=$NODE_ENV -e  MS_NAME="chatops-management-ui"  -e  MS_ENCRYPTION_KEY=$MS_ENCRYPTION_KEY -e SsoCallBackUrl=$SsoCallBackUrl -e chatops_redis=chatops-redis -e chatops_port=6379 -e chatops_port=6379 -e CHATOPS_STOREMSURL=https://chatops-store:3000/ -e prg_admin_blue_grp=$prg_admin_blue_grp -e client_id=$client_id -e client_secret=$client_secret -e authorization_url=$authorization_url -e token_url=$token_url -e issuer_id=$issuer_id -e bluepageUrl=$bluepageUrl -e allBluegroupForUserUrl=$allBluegroupForUserUrl -e chatops_queues="ItsmSnowUpdTicketQueue,CKCreateIncQueue,CKUpdateIncQueue,CollabSlackQueue" --net chatops --name chatops-${PWD##*/} chatops-${PWD##*/}:$version
docker run -d --net-alias ${PWD##*/} -p 5678:5678 -e INLINE_RUNTIME_CHUNK=$INLINE_RUNTIME_CHUNK -e SsoCallBackUrlNew=$SsoCallBackUrlNew -e discoveryURL=$discoveryURL -e RELEASE_NUMBER=$version -e NODE_ENV=$NODE_ENV  -e  MS_ENCRYPTION_KEY=$MS_ENCRYPTION_KEY -e SsoCallBackUrl=$SsoCallBackUrl -e chatops_redis=chatops-redis -e chatops_port=6379 -e chatops_port=6379 -e CHATOPS_STOREMSURL=https://chatops-store:3000/ -e prg_admin_blue_grp=$prg_admin_blue_grp -e super_admin_blue_grp=$super_admin_blue_grp -e team_it_chatops_group=$team_it_chatops_group -e client_id=$client_id -e client_secret=$client_secret -e authorization_url=$authorization_url -e token_url=$token_url -e issuer_id=$issuer_id -e discovery_url=$discovery_url -e bluepageUrl=$bluepageUrl -e MUI_URL=$MUI_URL -e allBluegroupForUserUrl=$allBluegroupForUserUrl -e chatops_queues="ItsmSnowUpdTicketQueue,CKCreateIncQueue,CKUpdateIncQueue,CollabSlackQueue" -e MUI_URL_EXT=$MUI_URL_EXT -e MS_NAME="chatops-management-ui" --net chatops --name chatops-${PWD##*/} chatops-${PWD##*/}:$version
