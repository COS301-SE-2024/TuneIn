#!/bin/bash
eslint . --ext .ts
prettier --check "**/*.{js,ts,json,md}"