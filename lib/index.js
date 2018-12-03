const OSS = require('ali-oss');
const _ = require('lodash');
const colors = require('ansi-colors');
const log = require('fancy-log');
const co = require('co')
const fs = require('fs-extra')
const path = require('path')

class WebpackAliOSSPlugin {

    constructor(options) {
        this.config = Object.assign({
            prefix: '',
            exclude: /.*/,
            removeMode: true,
            format: null,
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
        compiler.hooks.done.tapAsync('WebpackAliOSSPlugin', (compilation, callback) => {
            co(function* () {
                const outputPath = compiler.outputPath;
                this.files = [];
                this.getAssetsFiles(outputPath);
                if (this.config.prefix) {
                    this.deleteHasCache(outputPath);
                } else if (this.config.deleteAll) {
                    this.deleteNoCache(outputPath);
                } else {
                    this.uploadFiles(outputPath);
                }
                callback()
            }.bind(this)).catch(function (err) {
                throw err
                callback();
            });
        })
    }

    getAssetsFiles(dir) {
        const that = this;
        fs.readdirSync(dir)
            .forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    that.getAssetsFiles(filePath);
                } else if (!that.config.exclude || !that.config.exclude.test(file)) {
                    that.files.push(filePath);
                }
            });
    }

    deleteHasCache(dir) {
        const that = this;
        co(function* (dir) {
            let list = [];
            let dirList = yield that.client.list({
                prefix: that.config.prefix + '/',
                delimiter: '/'
            });
            dirList.prefixes.forEach(function (subDir) {
                list.push(+subDir.slice(that.config.prefix.length + 1, -1));
            });
            if (list.length > 1) {
                const max = Math.max.apply(null, list);
                let result = yield that.client.list({
                    prefix: that.config.prefix,
                    "max-keys": 1000
                });
                list = [];
                if (result.objects) {
                    result.objects.forEach(file => {
                        if (file.name && file.name.indexOf(max) === -1) {
                            list.push(file.name)
                        }
                    });
                }
                result = yield that.client.deleteMulti(list, {
                    quiet: true
                });
            }

            that.uploadFiles(dir);

        }).catch(err => {
            that.uploadFiles(dir);
        });
    }


    deleteNoCache(dir) {
        const that = this;
        co(function* (dir) {
            let result = yield that.client.list({
                prefix: that.config.prefix,
                "max-keys": 1000
            });
            if (result.objects) {
                result = result.objects.map(file => file.name);
            }
            result = yield that.client.deleteMulti(result, {
                quiet: true
            });
            that.uploadFiles(dir);
        }).catch(err => {
            that.uploadFiles(dir);
        });
    }

    uploadFiles(dir) {
        this.files.forEach((filePath) => {
            this.uploadFile(filePath, dir);
        })
    }

    uploadFile(filePath, dir) {
        const that = this;
        const fileName = filePath.slice(dir.length);
        return co(function* () {
            const prefix = that.config.format ? path.join(that.config.prefix || '', that.config.format) : that.config.prefix;
            const uploadName = path.join(prefix, fileName).replace(/\\/g, '/');
            const result = yield that.client.put(uploadName, filePath);
            if (result.res.statusCode == 200) {
                log(colors.green(`${fileName}上传成功!`))
            } else {
                log(colors.red(`${fileName}上传失败!`))
            }
        }).catch(function (err) {
            log(colors.red(`${fileName}上传出错!`))
        });
    }

}

module.exports = WebpackAliOSSPlugin;