const fs = require("fs");
const path = require("path");

const OSS = require("ali-oss");
const colors = require("ansi-colors");
const log = require("fancy-log");

class WebpackAliOSSPlugin {
  constructor(options) {
    this.config = Object.assign(
      {
        prefix: "",
        exclude: null,
        removeMode: true,
        format: null,
        deleteAll: false,
        output: '',
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
    if (this.config.accessKeyId && this.config.accessKeySecret) {
      if (this.config.output) {
	      this.output = this.config.output
      } else {
	      this.output = compiler.outputPath || compiler.options.output.path;
      }
      if (compiler.hooks) {
        compiler.hooks.done.tapAsync("WebpackAliOSSPlugin", this.init.bind(this));
      } else {
        compiler.plugin("done", this.init.bind(this));
      }
    } else {
      log(colors.red(`请填写正确的accessKeyId、accessKeySecret和bucket`));
    }
  }

  init(compilation, callback) {
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

  async delFilterAssets(prefix) {
    try {
      const list = [];
      list.push(prefix);
      let result = await this.client.list({
        prefix,
        "max-keys": 1000
      });
      if (result.objects) {
        result.objects.forEach(file => {
          list.push(file.name);
        });
      }
      if (Array.isArray(list)) {
        result = await this.client.deleteMulti(list, {
          quiet: true
        });
      }
    } catch (error) {
      log(colors.red(`删除缓存文件失败!`));
    }
  }

  async delCacheAssets() {
    const prefix = this.config.prefix;
    const list = [];
    try {
      const dirList = await this.client.list({
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
        await this.asyncForEach(list, async (item, index) => {
          await this.delFilterAssets(
            `${prefix}/${item}`
          );
        })
      }

      this.uploadAssets();
    } catch (error) {
      this.uploadAssets();
    }
  }

  async asyncForEach(arr, cb) {
    for (let i = 0; i < arr.length; i++) {
      await cb(arr[i], i)
    }
  }


  async delAllAssets() {
    try {
      const { prefix } = this.config;
      let result = await this.client.list({
        prefix,
        "max-keys": 1000
      });
      if (result.objects) {
        result = result.objects.map(file => file.name);
      }
      if (Array.isArray(result)) {
        result = await this.client.deleteMulti(result, { quiet: true });
      }
      this.uploadAssets();
    } catch (error) {
      this.uploadAssets();
    }
  }


  async uploadAssets() {
    if (this.config.local) {
      await this.uploadLocale(this.output);
    } else {
      await this.asyncForEach(Object.keys(this.assets), async (name, index) => {
        if (this.filterFile(name)) {
          await this.update(name, Buffer.from(this.assets[name].source(), "utf8"));
        }
      })
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
    const fileName = this.getFileName(name);
    try {
      const result = await this.client.put(fileName, content);
      if (+result.res.statusCode === 200) {
        log(colors.green(`${fileName}上传成功!`));
      } else {
        log(colors.red(`${fileName}上传失败!`));
      }
    } catch (error) {
      log(colors.red(`${fileName}上传失败!`));
    }
  }

  async uploadLocale(dir) {
    const result = fs.readdirSync(dir);
    await this.asyncForEach(result, async file => {
      const filePath = path.join(dir, file);
      if (this.filterFile(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          await this.uploadLocale(filePath);
        } else {
          const fileName = filePath.slice(this.output.length);
          await this.update(fileName, filePath);
        }
      }
    })
  }
}

module.exports = WebpackAliOSSPlugin;
