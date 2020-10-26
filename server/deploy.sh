#!/bin/bash

echo What should the version be?
read VERSION

docker build -t robihdy/interask:$VERSION .
echo Build success
docker push robihdy/interask:$VERSION
echo Push success
ssh root@161.35.104.248 "docker pull robihdy/interask:$VERSION && docker tag robihdy/interask:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"
echo deploy success