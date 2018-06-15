#!/bin/sh
NC='\033[0m'
GREEN='\033[0;32m'
RED='\033[0;31m'

echo "${GREEN}----==== Running RSpec ====----${NC}"
docker-compose run --rm ui rspec
RSPEC=$?

if [ $RSPEC -eq 0 ]; then
  echo "${GREEN}OK${NC}";
fi

echo "${GREEN}----==== Running Flow tests ====----${NC}"
docker-compose run --rm webpack yarn flow check
FLOW=$?

if [ $FLOW -eq 0 ]; then
  echo "${GREEN}OK${NC}";
fi

if [ $RSPEC -eq 0 ] && [ $FLOW -eq 0 ]; then
  echo "${GREEN}----==== Good to go! ====----${NC}"
else
  echo "${RED}----==== Oops! ====----${NC}"
  if [ $RSPEC -ne 0 ]; then
  echo "${RED}Mix tests failed${NC}";
  fi
  if [ $FLOW -ne 0 ]; then
    echo "${RED}Flow tests failed${NC}";
  fi
  echo "${RED}----==== Oops! ====----${NC}"
fi
