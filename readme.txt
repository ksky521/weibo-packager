通过npm安装:
	npm install weibo-packager 

svn仓库地址:
https://svn1.intra.sina.com.cn/weibo/ria/tools/combine-npm/

git:
https://github.com/dongyuwei/weibo-packager.git

一,处理步骤(部分特殊处理未罗列,具体可参见源码):
1 对js工程(如t4/home等):
  1)遍历所有目录,收集到所有js和非js文件;
  2)配置输出目录,使其内部保持和输入文件夹内部相同的目录结构;
  3)批量压缩(格式化)所有js;
  4)批量合并所有js($import的js);并且排除重复$import.
  5)合并后的js写入到目标目录下;写的同时计算其md5 hash值,并且生成一个新文件(路径中包含md5值).
  6)最后copy所有非js文件.copy的同时计算其md5 hash值,并且生成一个新文件(路径中包含md5值).
  7)中间会通过遍历AST语法树查找require(require.register or rm.register),最终生成的映射文件插入base.js的尾部,异步请求该文件时会动态替换.
  8)md5_mapping.json为所有文件的路径与其md5 hash值的映射;该文件输出到目标根目录下.
  
2 对css工程(如t4/style或者t4/skin等):
  1)遍历所有目录,收集到所有css和非css文件;
  2)配置输出目录,使其内部保持和输入文件夹内部相同的目录结构;
  3)copy所有非css文件(图片等)并且计算其md5 hash值;
  4)读取所有css文件内容
  5)批量压缩(格式化)所有css;
  6)批量合并所有css(@import的css),并且排除重复@import,保留最后一个@import;
  7)合并后的css写入到目标目录下;写的同时计算其md5 hash值,并且生成一个新文件(路径中包含md5值).
  8)md5_mapping.json为所有文件的路径与其md5 hash值的映射;该文件输出到目标根目录下.


二,工具列表:

1 lib/js/main.js  压缩合并js工程,如home工程
	Usage: Usage: node lib/js/main.js fromDir toDir projectPath [-verbose] [-onlyConf] [-confSpecial][-mangle][-squeeze][-noMD5]
	projectPath 参数形如't4/home , t4/webim , t4/apps/data 等'
	
	兼容目前的使用方式时应该使用 -onlyConf -confSpecial这两个选项
	如 node js/main.js input/home/ output/home t4 -onlyConf -confSpecial
	压缩优化的主要选项是-mangle和-squeeze
	
	可选参数列表:
	-verbose or -v 显示详细log日志.为加快速度,默认不输出详细日志,只显示警告和严重错误信息.
	-onlyConf 只合并'/conf/'目录下js文件.默认合并所有文件.
	-confSpecial 把'/conf/'目录下文件提前输出到到'/conf/'的父目录. 如home/conf/base.js 合并后输出为home/base.js
	-mangle 混淆变量
	-squeeze 进一步压缩js.
	-beautify 格式化代码(可用于排错)
	-noMD5 不做MD5处理
	
2 lib/css/main.js 压缩合并css工程,如style工程
	Usage: node lib/css/main.js fromDir toDir projectPath [-verbose][-noMD5]
	projectPath 参数形如't4/style , t4/skin , t4/appstyle/webim 等'
	参数列表:
	-verbose or -v 显示详细log日志.为加快速度,默认不输出详细日志,只显示警告和严重错误信息.
	-noMD5 关闭md5处理. 默认进行css和图片等资源的md5计算及路径替换.
	
3 lib/js/combineOne.js 合并单个js文件
	
4 lib/css/combineOne.js 合并单个css文件

5 lib/server/httpd.js 一个nodejs服务器,可以替代apache+php做开发环境支持(支持开发测试,仿真测试,能从线上环境自动加载不存在的工程/文件)
	httpd.js很智能,目标工程文件存在时,会自动判断是开发模式还是仿真模式;目标文件不存在时,会自动从线上环境(代理)请求.
	几点约定:   
	0)根据工程根目录下是否存在名为 .packaged.txt 的文件来判断工程是否是压缩合并过的.
	1)如果是压缩合并过的工程(根目录下存在名为 .packaged.txt 的文件),则走仿真模式(直接读取打包合并后的静态资源);
	2)否则为开发模式(按需合并单个js/css文件);
	3)工程文件根本不存在时自动反向代理到线上资源.

6 lib/server/config.js 服务器配置选项,请察看源码中文档注释.
	documentRoot,默认指向/data1/wwwroot/js.wcdn.cn
	workerNum,默认为10,即启动10个worker子进程作为服务器子进程
	autoProxy,默认true,即自动代理请求未部署的工程.

三,用例(参数可用于线上生产环境):
1 打包压缩合并t4/home 工程:
  node lib/js/main.js input/home/ output/home/ t4 -onlyConf -confSpecial -mangle -squeeze 

2 打包压缩合并t4/style 工程:
  node lib/css/main.js input/style/ output/style/ t4 

3 打包压缩合并t4/skin 工程:
  node lib/css/main.js input/skin/ output/skin/ t4 

4 启动httpd服务器(部署于虚拟机或者本机,支持微博前端js||css开发):
  nohup node lib/server/httpd.js &

四,其他说明
1 本系统在mac和centos上测试通过: mac node 版本为v0.6.9; CentOS 5.4 上 node 版本为 v0.6.10
2 系统内置uglify-js版本已经升级到1.2.6
3 由于历史原因(兼容微博目前的前端架构),对js工程下/conf/目录读写需要特殊处理,阅读源码时请注意.
4 2011-5-11 增加动态合并文件(css,js)服务 , 用法和文档参考 http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=7147981 