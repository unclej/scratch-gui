#!/usr/bin/env bash
export NODE_ENV=production &&
export PUBLIC_PATH=https://scratch3.ucodemy.com &&
export STATIC_PATH=https://scratch3.ucodemy.com/static &&
export BUILD_MODE=dist &&
export SENTRY_CONFIG=https://db27ae4ad5bc4bde90f03cd56521b330@sentry.io/1218798 &&
npm run build
