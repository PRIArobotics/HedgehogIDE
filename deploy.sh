#!/bin/bash

HOST=priaide@aitne.uberspace.de
DEPLOY_DIR=/home/priaide/sites/hedgehog-ide
BUILD_DIR=build

rsync -avz "$BUILD_DIR/server/" "$HOST:$DEPLOY_DIR/server/"
rsync -avz "$BUILD_DIR/public/" "$HOST:$DEPLOY_DIR/ide.pria.at/"
ssh "$HOST" "supervisorctl restart hedgehog-ide"

