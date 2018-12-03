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
  deleteAll: false,			// Optional, dafault
  format: 20181203 // 可不填， time尽量为数字。format代表缓存文件夹版本号
})
```

> Options

* prefix: 路径前缀。如prefix="demo" => "staven/demo/icon_696aaa22.ttf"
* exclude: 排除不上传的元素
* deleteAll: 
  - true: 是否删除所有缓存文件
  - false: not delete、
* format: 可不填，格式为数值型，表示缓存的版本号，保存最近的一个版本


