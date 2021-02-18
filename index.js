const fs = require("fs");
const { resolve } = require("path");
const { promisify } = require("util");
const { program } = require("commander");
const chalk = require("chalk");

const rename = promisify(fs.rename);

program
  .version("0.0.1")
  .requiredOption("-p, --path <path>", "目标文件夹路径")
  .option('--vr <RegExp>', '视频文件的匹配正则')
  .option('--sr <RegExp>', '字幕文件的匹配正则')
  .parse();

const options = program.opts();
async function main() {
  try {
    const files = fs
      .readdirSync(options.path)
      .filter((file) => /^.+\..+$/.test(file));
    const videoRegExp = options.vr ? new RegExp(options.vr) : /(mp4|mkv)$/;
    const subtitleRegExp = options.sr ? new RegExp(options.sr) : /(srt|ass)$/;
    const videos = files.filter((file) => videoRegExp.test(file));
    const subtitles = files.filter((file) => subtitleRegExp.test(file));

    if (videos.length === subtitles.length) {
      try {
        await Promise.all(
          subtitles.map((file, index) =>
            rename(
              resolve(options.path, file),
              resolve(
                options.path,
                `${videos[index].split(".")[0]}.${file.split(".").pop()}`
              )
            )
          )
        );
        console.log(chalk.greenBright("字幕重命名完成"));
      } catch (e) {
        console.error(chalk.redBright("ERROR: 重命名时出现错误"));
      }
    } else {
      console.log(chalk.yellowBright('视频数量与字幕数量不一致, 请使用--vr或--sr参数进行过滤'));
      return;
    }

  } catch (e) {
    console.error(chalk.redBright("ERROR: 无法打开文件夹，请检查路径"));
  }
}
main();
