# [webpack-oss]
自动上传静态资源到阿里的oss

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
  deleteAll: false			// Optional, dafault
})
```

> Options

* prefix: The directory name which will accept uploaded files.
* exclude: Support RegExp syntax, matched files will not be upload to oss
* deleteAll: 
  - true: delete all old files
  - false: not delete
> security

