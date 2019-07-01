# [webpack-oss](https://github.com/staven630/webpack-oss)
> webpack静态资源一键上传阿里云OSS插件，兼容webpack3.x/4.x

# 安装

```
npm i webpack-oss --save-dev
```

# 参数
| 选项名 | 类型 | 是否必填 | 默认值 | 描述 |
| :---  | :--- | :--- | :--- | :--- |
| accessKeyId | String | √ |  | 阿里云accessKeyId  |
| accessKeySecret | String | √ |  | 阿里云accessKeySecret |
| region | String | √ |  | 阿里云region |
| bucket | String | √ |  | 阿里云bucket  |
| prefix | String | × | '' | 自定义路径前缀，通常使用项目目录名，文件将存放在alioss的bucket/prefix目录下  |
| format | Number | × | ''  | 可用时间戳来生成oss目录版本号，每次会保留最近的版本文件做零宕机发布，删除其他版本文件 |
| deleteAll | Boolean | × |  | 是否删除bucket/prefix中所有文件。优先匹配format配置 |
| local | Boolean | × | false | 默认每次上传webpack构建流中文件，设为true可上传打包后webpack output指向目录里的文件 |
| output | String | × | '' | 读取本地目录的路径，如果local为true，output为空，默认为读取webpack输出目录  |
| exclude | ExpReg/Array<ExpReg> | × | null | 可传入正则，或正则组成的数组，来排除上传的文件  |


# 实例

```
const WebpackAliOSSPlugin = require('webpack-oss')


new WebpackAliOSSPlugin({
  accessKeyId: '2****************9',
  accessKeySecret: 'z**************=',
  region: 'oss-cn-hangzhou',
  bucket: 'staven',
  prefix: 'nuxt-doc',   // "staven/nuxt-doc/icon_696aaa22.ttf"
  exclude: [/.*\.html$/], // 或者 /.*\.html$/,排除.html文件的上传  
  deleteAll: false,	  // 优先匹配format配置项
  format: Date.now()， // 备份最近版本的oss文件，删除其他版本文件
  local: true   // 上传打包输出目录里的文件
})
```
