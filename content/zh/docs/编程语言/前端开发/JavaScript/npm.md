---
title: "NPM 概述"
---

NPM（Node Package Manager）是JavaScript的包管理器，也是Node.js的默认包管理器。它可以让开发者分享和重用代码，并管理项目的依赖关系。以下是使用NPM的一些基本操作简介：

# 安装 Node.js 和 NPM
要使用NPM，首先需要安装Node.js，它包含了NPM。你可以从[Node.js官方网站](https://nodejs.org/)下载安装程序。

# 基本NPM命令

1. **初始化新项目**
   ```sh
   npm init
   ```
   这个命令会提示你填写一个`package.json`文件，它描述了你的项目及其依赖关系。你可以使用`npm init -y`生成一个带有默认值的`package.json`文件。

2. **安装包**
   
   ```sh
   npm install <包名>
   ```
   这个命令会安装一个包并将其添加到`node_modules`目录。要将包保存为项目的依赖项，请使用：
   ```sh
   npm install <包名> --save
   ```
   对于开发依赖（仅在开发过程中需要）：
   ```sh
   npm install <包名> --save-dev
   ```
   
3. **安装所有依赖项**
   如果你有一个包含依赖项列表的`package.json`文件，可以一次性安装所有依赖项：
   ```sh
   npm install
   ```

4. **更新包**
   要将包更新到最新版本：
   ```sh
   npm update <包名>
   ```

5. **卸载包**
   ```sh
   npm uninstall <包名>
   ```
   要同时从`package.json`中移除：
   ```sh
   npm uninstall <包名> --save
   ```
   对于开发依赖：
   ```sh
   npm uninstall <包名> --save-dev
   ```

6. **运行脚本**
   你可以在`package.json`文件的"scripts"部分定义自定义脚本。要运行一个脚本：
   ```sh
   npm run <脚本名>
   ```
   例如，如果你有一个名为"start"的脚本：
   ```sh
   npm run start
   ```

# 示例 package.json
以下是一个`package.json`文件的简单示例：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "一个简单的项目",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "你的名字",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.7"
  }
}
```

# 有用的NPM命令
- **列出已安装的包:** `npm list`
- **检查过时的包:** `npm outdated`
- **审计漏洞:** `npm audit`
- **修复漏洞:** `npm audit fix`

# 总结
NPM是一个强大的工具，可以简化JavaScript项目及其依赖关系的管理。通过掌握NPM，你可以优化开发过程，确保项目的可维护性和及时更新。



# 使用国内 npm 源

为了加快在国内使用NPM时的下载速度，可以指定使用国内的NPM源。常用的国内NPM源有淘宝镜像。下面是一些配置方法：

## 一次性临时使用国内源

如果你只想临时使用一次国内源进行安装，可以在命令前加上`--registry`选项，例如：

```sh
npm install <包名> --registry=https://registry.npm.taobao.org
```

## 全局配置国内源

如果你想要全局配置，以后每次都使用国内源，可以使用以下命令进行设置：

```sh
npm config set registry https://registry.npm.taobao.org
```

你可以验证是否配置成功，使用以下命令查看当前的NPM源：

```sh
npm config get registry
```

输出应为：

```sh
https://registry.npm.taobao.org/
```

## 使用nrm工具进行源管理

`nrm`（NPM Registry Manager）是一个方便的工具，用于快速切换不同的NPM源。以下是安装和使用`nrm`的方法：

1. **安装nrm**

   ```sh
   npm install -g nrm
   ```

2. **查看可用源**

   ```sh
   nrm ls
   ```

3. **切换到淘宝源**

   ```sh
   nrm use taobao
   ```

4. **验证切换结果**

   ```sh
   npm config get registry
   ```

## 例子

以下是一个实际操作的示例：

1. **全局设置淘宝源**

   ```sh
   npm config set registry https://registry.npm.taobao.org
   ```

2. **安装express包**

   ```sh
   npm install express
   ```

这样，你就可以使用国内的NPM源来加速包的下载和安装过程。

## 注意事项

尽管使用国内镜像可以加快下载速度，但有时镜像与官方源可能会有些许延迟更新。如果遇到包版本不一致的问题，可以临时切换回官方源进行安装：

```sh
npm config set registry https://registry.npmjs.org
```



## 在 `.npmrc` 文件中设置国内源

#### 全局 `.npmrc` 文件

在你的用户主目录（例如 `~/.npmrc` 或者 `C:\Users\你的用户名\.npmrc`）中，可以添加以下内容来全局配置淘宝镜像作为NPM源：

```sh
registry=https://registry.npm.taobao.org
```

#### 项目级 `.npmrc` 文件

在你的项目根目录下创建一个 `.npmrc` 文件（与 `package.json` 文件同级），添加以下内容来为该项目单独设置淘宝镜像作为NPM源：

```sh
registry=https://registry.npm.taobao.org
```



# ---



# 一次性临时使用国内源

如果你只想临时使用一次国内源进行安装，可以在命令前加上`--registry`选项，例如：

```sh
npm install <包名> --registry=http://registry.npmmirror.com
```



# 在 `.npmrc` 文件中设置国内源

**全局 `.npmrc` 文件：**

- 在你的用户主目录（例如 `~/.npmrc` 或者 `C:\Users\你的用户名\.npmrc`）中，可以添加以下内容来全局配置淘宝镜像作为NPM源：


**项目级 `.npmrc` 文件：**

- 在你的项目根目录下创建一个 `.npmrc` 文件（与 `package.json` 文件同级），添加以下内容来为该项目单独设置淘宝镜像作为NPM源：


```sh
registry=http://registry.npmmirror.com
```

