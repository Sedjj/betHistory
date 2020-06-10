#!/bin/bash

TIME="10"
URL="https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage"
TEXT="Status: $1%0ABranch:+$CI_COMMIT_REF_SLUG%0AAuthor:+$GITLAB_USER_NAME"

curl --max-time $TIME -d "chat_id=$TELEGRAM_CHAT_ID&disable_web_page_preview=1&text=$TEXT&disable_notification=true" $URL > /dev/null