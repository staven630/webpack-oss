const OSS = require('ali-oss');
const _ = require('lodash');
const colors = require('ansi-colors');
const log = require('fancy-log');
const co = require('co')
<<<<<<< HEAD

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
      this.config.deleteAll && this.deleteAll();
      this.uploadFiles();
    })
  }

  getAssetsFiles({assets}) {
    var items = _.map(assets, (value, name) => {
      if (!this.config.exclude.test(name)) {
        return {name, content: value.source()}
      }
=======


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
>>>>>>> 1923525a51d38c97f7fe51a6bd71e996a8b64af7
    })
    const newItems = []
    for (const item of items) {
      if (item && item.name) {
        newItems.push(item)
      }
    }
    return newItems
  }

<<<<<<< HEAD
  deleteAll() {
    const that = this;
    co(function* () {
      let result = yield that.client.list({
        prefix: that.config.prefix
      });
      if (result.objects) {
        result = result.objects.map(file => file.name);
      }
      yield that.client.deleteMulti(result, {
        quiet: true
      });
    })
  }

  uploadFiles() {
    this.files.map((file) => {
      return this.uploadFile(file)
        .then((result) => {
        })
        .catch(e => {

        })
    })
  }
=======
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
>>>>>>> 1923525a51d38c97f7fe51a6bd71e996a8b64af7

  uploadFile(file) {
    const that = this;
    return co(function* () {
      const uploadName = `${that.config.prefix}/${file.name}`
      const content = Buffer.isBuffer(file.content) ? file.content : new Buffer(file.content, 'utf-8')
      const result = yield that.client.put(uploadName, content);
      if (result.res.statusCode == 200) {
        log(colors.green(`${file.name}上传成功!`))
        Promise.resolve(result);
      } else {
        log(colors.red(`${file.name}上传失败!`))
        Promise.reject(null)
      }
    })
  }

}
