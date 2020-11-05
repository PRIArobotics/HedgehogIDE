#!/bin/bash

HOST=priaide@aitne.uberspace.de
PATH=/home/priaide/sites/hedgehog-ide
BUILD_DIR=build

rsync -avz "$BUILD_DIR/server/" "$HOST:$PATH/server/"
rsync -avz "$BUILD_DIR/public/" "$HOST:$PATH/ide.pria.at/"
ssh "$HOST" "supervisorctl restart hedgehog-ide"

