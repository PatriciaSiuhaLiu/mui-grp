#!/bin/bash
#default to mongo-container
dbHost=${1:-chatops-mongo-db}
dbPort=${2:-27017}

echo "Executing Healthcheck on $HOSTNAME"
#Localhost check
curl -k -s -f -I https://localhost:5678/ping > /dev/null
error=$?
echo "Executing Healthcheck curl -k -s -f -I https://localhost:5678 on $HOSTNAME: Status($error)"
if [ $error -ne 0 ]; then
    exit 1
fi

#Redis Check
echo "Executing node testConnection.js chatops-redis 6379 on"
node testConnection.js chatops-redis 6379
checRedis=$?
if [ $checRedis -ne 0 ]; then
	echo "Waiting for redis connection ..."
    exit 1
fi
echo "done Redis Check"

#Mongo DB Check
echo "Executing node testConnection.js chatops-mongo-db 27017 on $HOSTNAME"
node testConnection.js $dbHost $dbPort
checkMongo1=$?
node testConnection.js $3 $4
checkMongo2=$?
if [ $checkMongo1 -ne 0 ] && [ $checkMongo2 -ne 0 ]; then
    echo "Waiting for DB connection ..."
	exit 1
fi
echo "done Mongo Check"

#CS Check
curl -k -s -f $CHATOPS_STOREMSURL/ping
error=$?
echo "Executing Healthcheck curl -k -s -f $CHATOPS_STOREMSURL/ping on $HOSTNAME: Status($error)"
if [ $error -ne 0 ]; then
    exit 1
fi

echo "Finished Executing Healthcheck on $HOSTNAME"
exit 0