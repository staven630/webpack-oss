# [webpack-oss]
自动上传静态资源到阿里的oss
本插件基于<a href="https://www.npmjs.com/package/webpack-oss-plugin">webpack-oss-plugin</a>, 添加了删除子目录文件的功能

> Install

```
npm i webpack-oss --save-dev
```

> Example

```
const AliossPlugin = require('webpack-oss')
new AliossPlugin({
  accessKeyId: 'your-key-id',
  accessKeySecret: 'your-key-secret',
  region: 'your-region', // eg: oss-cn-hangzhou
  bucket: 'your-bucket',
  prefix: '/', 			  // default: '/', eg: bucket="staven", prefix="demo" => "staven/demo/icon_696aaa22.ttf"
  exclude: /.*\.html$/,   // Optional, default: /.*/
  enableLog: true,        // Optional, default: true
  ignoreError: false,     // Optional, default: false
  deleteMode: true        // OptionalOptional, default: true
  deleteAll: false			// Optional, dafault
})
```

> Options

* prefix: The directory name which will accept uploaded files.
* exclude: Support RegExp syntax, matched files will not be upload to oss
* enableLog: Whether or not show detail infos for you, just should be enable in development mode.
* ignoreError:  Whether or not stop build if upload error.
  - true: will be stop
  - false: will be not stop
* deleteMode: Whether or not delete file after the file uploaded succesfully.
  - true: delete
  - false: not delete
* deleteAll: 
  - true: delete all old files
    - false: not delete
> security

