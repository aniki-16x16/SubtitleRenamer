const fs = require("fs");
const { resolve } = require("path");
const { promisify } = require("util");
const { program } = require("commander");
const chalk = require("chalk");

const rename = promisify(fs.rename);

program
  .version("0.0.1")
  .requiredOption("-p, --path <path>", "目标文件夹路径")
  .parse();

const options = program.opts();
async function main() {
  try {
    const files = fs
      .readdirSync(options.path)
      .filter((file) => /^.+\..+$/.test(file));
    const videos = files.filter((file) => /(mp4|mkv)$/.test(file));
    const subtitles = files.filter((file) => /(srt|ass)$/.test(file));

    try {
      await Promise.all(
        subtitles.map((file, index) =>
          rename(
            resolve(options.path, file),
            resolve(
              options.path,
              `${videos[index].split(".")[0]}.${file.split(".")[1]}`
            )
          )
        )
      );
      console.log(chalk.greenBright("字幕重命名完成"));
    } catch (e) {
      console.error(chalk.redBright("ERROR: 重命名时出现错误"));
    }

  } catch (e) {
    console.error(chalk.redBright("ERROR: 无法打开文件夹，请检查路径"));
  }
}
main();
