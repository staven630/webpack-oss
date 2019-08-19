const colors = require("ansi-colors");
const log = require("fancy-log");
const AliOSS = require('./oss')


class WebpackAliOSSPlugin extends AliOSS {
  constructor(options) {
    super(options)
  }

  apply(compiler) {
    if (this.config.accessKeyId && this.config.accessKeySecret) {
      if (this.config.output) {
        this.output = this.config.output
      } else {
        this.output = compiler.outputPath || compiler.options.output.path;
      }
      if (compiler.hooks) {
        compiler.hooks.done.tapAsync("WebpackAliOSSPlugin", this.upload.bind(this));
      } else {
        compiler.plugin("done", this.upload.bind(this));
      }
    } else {
      log(colors.red(`请填写正确的accessKeyId、accessKeySecret和bucket`));
    }
  }

  upload(compilation, callback) {
    this.assets = compilation.compilation.assets;
    if (this.config.format && !isNaN(Number(this.config.format))) {
      this.delCacheAssets();
    } else if (this.config.deleteAll) {
      this.delAllAssets();
    } else {
      this.uploadAssets();
    }
    if (typeof callback === "function") {
      callback();
    }
  }
}

module.exports = WebpackAliOSSPlugin;
