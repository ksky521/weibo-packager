#!/bin/bash

########定时(1分钟?)监控服务器进程,如果死了就重启################

#crontab -u root -e
#*/1 * * * * /bin/sh /data1/wwwroot/js.wcdn.cn/combine-2012-02-20/server/cron.sh > /dev/null 2>&1


count=`ps -wef|grep node |grep -v grep |wc -l`
if [ "$count" -eq 0 ]; then
	nohup node /data1/wwwroot/js.wcdn.cn/combine-2012-02-20/server/httpd.js &
fi