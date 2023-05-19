#!/bin/bash
rm -rf api/build
cp -r build/ api/build/
cd api/
npm start
cd -
# docker build -t gcm-reporter:latest .
# cd ..

