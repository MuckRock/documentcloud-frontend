#!/bin/bash

npm run build
netlify deploy -d public --prod
