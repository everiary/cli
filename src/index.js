#!/usr/bin/env node
//模块引入
process.env.NODE_NO_WARNINGS = 1;
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import fetch from "node-fetch";
//获取package.json内的数据并保存在PKG.default中
import { fileURLToPath } from "node:url";
const jsPath = fileURLToPath(import.meta.url).split("src");
const runtimePath = jsPath[0];
const PKG = await import(`${runtimePath}package.json`, {
  assert: { type: "json" },
});
//一个用于检验URL的函数
const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};
//一个用于检验文件是否为空的函数
const isFileEmpty = (path) => {
  const data = fs.readFileSync(path).toString();
  const result = !data;
  return result;
};

program
  .name("eve-cli")
  .usage(`<command> [option]`)
  .version(`eve-cli ${PKG.default.version}`, "-v, --version");

program
  .command("setup")
  .description("基本设定")
  .action(() => {
    let config = {};
    /*const isApiOpen = await inquirer.prompt([{
          type: "list",
          name: "api方式",
          choices: ['开放'],
          default: "开放"
      }])*/
    inquirer
      .prompt([
        {
          type: "input",
          name: "apiurl",
          message: "输入api的url:",
          validate: (answer) => {
            return isValidUrl(answer);
          },
        },
      ])
      .then((result) => {
        config.apiurl = result.apiurl;
        fs.writeFileSync(
          runtimePath + "config.json",
          JSON.stringify(config),
          (err) => {
            if (err) {
              console.log("写入失败");
              console.log(err);
            }
          }
        );
        console.log(config);
      });

    /*const apiKey = await inquirer.prompt([{
          type: "input",
          name: "api密钥",
          message: "输入api的key"
      }]).then(result=>{
          config.apikey = result
      })*/
  });

program
  .command("new")
  .description("新增everiary")
  .action(async () => {
    if (isFileEmpty(`${runtimePath}config.json`)) {console.log("配置文件为空");return}
    /* 这里需要读取../config.json中的配置来获取url */
    let CFG = JSON.parse(fs.readFileSync(`${runtimePath}config.json`).toString())
    let url = CFG.apiurl;
    /**
     * 这里需要包装body对象
     * 参考：
     *     const { url } = await inquirer.prompt({
      type: "input",
      message: "请输入ws | wss 协议地址",
      name: "url"
  })
     */
    let body = {
      title: "测试",
      content: "使用node-fetch发出请求",
    };
    try{
    const response = await fetch(url, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log(data);}
    catch(err){
      console.log(err)
    }
  });

program
  .command("get")
  .description("获取所有everiary")
  .action(async () => {
    if (isFileEmpty(`${runtimePath}config.json`)) {console.log("配置文件为空");return}
    /* 这里需要读取../config.json中的配置来获取url */
    let CFG = JSON.parse(fs.readFileSync(`${runtimePath}config.json`).toString())
    let url = CFG.apiurl;
    console.log(url)

    const response = await fetch(url, {
      method: "get"
    });

    const data = await response.json();
    console.log(data);
  });

program.parse(process.argv);
