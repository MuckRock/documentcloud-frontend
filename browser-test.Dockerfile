FROM mcr.microsoft.com/playwright:v1.27.0-focal

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD browser-test-package.json package.json
ADD ./tests tests
ADD ./browser-test-all.sh browser-test-all.sh
RUN npm install
