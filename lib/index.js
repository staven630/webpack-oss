const fs = require("fs");
const path = require("path");

const OSS = require("ali-oss");
const colors = require("ansi-colors");
const log = require("fancy-log");
const co = require("co");

class WebpackAliOSSPlugin {
  constructor(options) {
    this.config = Object.assign(
      {
        prefix: "",
        exclude: null,
        removeMode: true,
        format: null,
        deleteAll: false,
        local: false
      },
      options
    );
    this.client = new OSS({
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
      region: options.region
    });
    this.output = "";
  }

  apply(compiler) {
    const _ = this;
    if (_.config.accessKeyId && _.config.accessKeySecret) {
      this.output = compiler.outputPath;
      if (compiler.hooks) {
        compiler.hooks.done.tapAsync("WebpackAliOSSPlugin", _.init.bind(_));
      } else {
        compiler.plugin("done", _.init.bind(_));
      }
    } else {
      log(colors.red(`请填写正确的accessKeyId、accessKeySecret和bucket`));
    }
  }

  init(compilation, callback) {
    this.assets = compilation.compilation.assets;
    const { config } = this;
    if (config.format && !isNaN(Number(config.format))) {
      this.delCacheAssets();
    } else if (config.deleteAll) {
      this.delAllAssets();
    } else {
      this.uploadAssets();
    }
    if (typeof callback === "function") {
      callback();
    }
  }

  delFilterAssets(prefix, isLast) {
    const _ = this;
    const { client } = this;
    co(function*() {
      try {
        const list = [];
        list.push(prefix);
        let result = yield client.list({
          prefix,
          "max-keys": 1000
        });
        if (result.objects) {
          result.objects.forEach(file => {
            list.push(file.name);
          });
        }
        result = yield client.deleteMulti(list, {
          quiet: true
        });
        if (isLast) {
          _.uploadAssets();
        }
      } catch (error) {
        _.uploadAssets();
      }
    });
  }

  delCacheAssets() {
    const _ = this;
    const { prefix } = this.config;
    return co(function*() {
      const list = [];
      const dirList = yield _.client.list({
        prefix: `${prefix}/`,
        delimiter: "/"
      });

      if (dirList.prefixes) {
        dirList.prefixes.forEach(subDir => {
          list.push(+subDir.slice(prefix.length + 1, -1));
        });
      }

      if (list.length > 1) {
        const max = Math.max.apply(null, list);
        list.splice(list.indexOf(max), 1);
        list.forEach(async (item, index) => {
          await _.delFilterAssets(
            `${prefix}/${item}`,
            index === list.length - 1
          );
        });
      } else {
        _.uploadAssets();
      }
    });
  }

  delAllAssets() {
    const _ = this;
    const { prefix } = this.config;
    return co(function*() {
      let result = yield _.client.list({
        prefix,
        "max-keys": 1000
      });

      if (result.objects) {
        result = result.objects.map(file => file.name);
      }
      result = yield _.client.deleteMulti(result, { quiet: true });
      _.uploadAssets();
    });
  }

  uploadAssets() {
    if (this.config.local) {
      this.uploadLocale(this.output);
    } else {
      const { assets } = this;
      Object.keys(assets).forEach(async name => {
        if (this.filterFile(name)) {
          await this.update(name, Buffer.from(assets[name].source(), "utf8"));
        }
      });
    }
  }

  filterFile(name) {
    const { exclude } = this.config;
    return (
      !exclude ||
      ((Array.isArray(exclude) && !exclude.some(item => item.test(name))) ||
        (!Array.isArray(exclude) && !exclude.test(name)))
    );
  }

  getFileName(name) {
    const { config } = this;
    const prefix = config.format
      ? path.join(config.prefix, config.format.toString())
      : config.prefix;
    return path.join(prefix, name).replace(/\\/g, "/");
  }

  async update(name, content) {
    const _ = this;
    const fileName = this.getFileName(name);
    return co(function*() {
      try {
        const result = yield _.client.put(fileName, content);
        if (+result.res.statusCode === 200) {
          log(colors.green(`${fileName}上传成功!`));
        } else {
          log(colors.red(`${fileName}上传失败!`));
        }
      } catch (error) {
        log(colors.red(`${fileName}上传失败!`));
      }
    });
  }

  uploadLocale(dir) {
    const result = fs.readdirSync(dir);
    result.forEach(async file => {
      const filePath = path.join(dir, file);
      if (this.filterFile(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          await this.uploadLocale(filePath);
        } else {
          const fileName = filePath.slice(this.output.length);
          await this.update(fileName, filePath);
        }
      }
    });
  }
}

module.exports = WebpackAliOSSPlugin;
