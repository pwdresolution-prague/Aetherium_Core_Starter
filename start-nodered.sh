#!/usr/bin/env bash
set -a
source "$(dirname "$0")/.nodered.env"
set +a
node-red
