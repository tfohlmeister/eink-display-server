#!/bin/bash
WORKDIR=`pwd`
DEPLOY_REGISTRY=nas.fritz.box:5000
IMAGE=$DEPLOY_REGISTRY/e-ink-server
IMAGE_TAGGED=$IMAGE:latest

echo "Building..."
npm run build

echo "Building image, tagging and pushing to registry..."
docker build -t $IMAGE_TAGGED -f Dockerfile . && docker push $IMAGE_TAGGED