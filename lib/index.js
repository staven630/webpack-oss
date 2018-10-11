const OSS = require('ali-oss');
const _ = require('lodash');
const colors = require('ansi-colors');
const log = require('fancy-log');
const co = require('co')


module.exports = class WebpackAliOSSPlugin {

  constructor(options) {
    this.config = Object.assign({
      prefix: '',
      exclude: /.*/,
      removeMode: true,
      deleteAll: false
    }, options);
    this.client = new OSS({
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
      region: options.region
    });
    this.files = [];
  }

  apply(compiler) {
    compiler.plugin('emit', (compiler, cb) => {
      this.files = this.getAssetsFiles(compiler);
      cb();
    });

    compiler.plugin('done', () => {
      this.uploadFiles();
    })
  }

  getAssetsFiles({assets}) {
    var items = _.map(assets, (value, name) => {
      if (!this.config.exclude.test(name)) {
        return {name, content: value.source()}
      }
    })
    const newItems = []
    for (const item of items) {
      if (item && item.name) {
        newItems.push(item)
      }
    }
    return newItems
  }

  uploadFiles() {
    return Promise.all(this.files.map((file, index, arr) => {
      return this.uploadFile(file)
        .then((result) => {
        }, (e) => {
          return Promise.reject(e)
        })
    }))
  }

  uploadFile(file) {
    const that = this;
    return co(function *() {
      const uploadName = `${that.config.prefix}/${file.name}`
      return yield that.client.put(uploadName, Buffer.from(file.content))
    })
  }

}


