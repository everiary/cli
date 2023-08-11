#!/usr/bin/env node
//模块引入
//先禁用与import相关的Warning
import { env } from 'node:process';
env.NODE_NO_WARNINGS=1

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
  .action(() => {
    if (isFileEmpty(`${runtimePath}config.json`)) {
      console.log("配置文件为空");
      return;
    }
    let CFG = JSON.parse(
      fs.readFileSync(`${runtimePath}config.json`).toString()
    );
    let url = CFG.apiurl;
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "输入要发送的标题:",
        },
        {
          type: "input",
          name: "content",
          message: "输入要发送的内容:",
        },
      ])
      .then(async (result) => {
        let sending = {};
        sending.title = result.title;
        sending.content = result.content;
        try {
          const response = await fetch(url+"/api/ever", {
            method: "post",
            body: JSON.stringify(sending),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          console.log(data);
        } catch (err) {
          console.log(err);
        }
      });
  });

program
  .command("get")
  .description("获取所有everiary")
  /*.option('-a, --all', '获取所有everiary')*/
  .action(async () => {
    if (isFileEmpty(`${runtimePath}config.json`)) {
      console.log("配置文件为空");
      return;
    }
    let CFG = JSON.parse(
      fs.readFileSync(`${runtimePath}config.json`).toString()
    );
    let url = CFG.apiurl;

    const response = await fetch(url+"/api/ever", {
      method: "get",
    });

    const data = await response.json();
    console.log(data);
  });

  program
  .command("random")
  .description("随机获取一条everiary")
  .action(async () => {
    if (isFileEmpty(`${runtimePath}config.json`)) {
      console.log("配置文件为空");
      return;
    }
    let CFG = JSON.parse(
      fs.readFileSync(`${runtimePath}config.json`).toString()
    );
    let url = CFG.apiurl;

    const response = await fetch(url+"/api/ever", {
      method: "put",
    });
    //后端因为未知原因配置路由会出错，所以暂时使用put方法

    const data = await response.json();
    console.log(data);
  });


program
  .command("delete")
  .description("删除一个everiary")
  .action(async () => {
    if (isFileEmpty(`${runtimePath}config.json`)) {
      console.log("配置文件为空");
      return;
    }
    let CFG = JSON.parse(
      fs.readFileSync(`${runtimePath}config.json`).toString()
    );
    let url = CFG.apiurl;
    inquirer
      .prompt([
        {
          type: "input",
          name: "_id",
          message: "输入要删除的everiary的_id:",
        },
        {
          type: 'confirm',
          name: 'check',
          message: '删除后不可恢复！确定要删除吗',
        },
      ]).then(async (result) => {
        if (result.check) {
          const response = await fetch(url+"/api/ever/"+result._id, {
            method: "delete",
          });
      
          const data = await response.json();
          console.log(data);
        }
        else console.log('已取消')
      })
  });

program.parse(process.argv);
