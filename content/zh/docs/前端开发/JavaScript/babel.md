---
title: "Babel"
---

Babel 是一个广泛使用的 JavaScript 编译器，主要用于将现代的 JavaScript 代码转换为与旧浏览器兼容的版本。它支持最新的 JavaScript 语法和特性，通过编译使其可以在不支持这些新特性的环境中运行。

https://babel.dev

# 安装 Babel

要在项目中使用 Babel，你需要安装相关的 npm 包。以下是一个简单的步骤：

1. **初始化 npm 项目**
   如果你的项目还没有 `package.json` 文件，你可以通过以下命令初始化一个新项目：

   ```sh
   npm init -y
   ```

2. **安装 Babel 核心包及命令行工具**

   ```sh
   npm install --save-dev @babel/core @babel/cli
   ```

3. **安装预设（比如 `@babel/preset-env`）**
   `@babel/preset-env` 是一个智能预设，可以根据你所支持的环境自动确定要使用的 Babel 插件。

   ```sh
   npm install --save-dev @babel/preset-env
   ```

# 配置 Babel

在项目的根目录下创建一个 `.babelrc` 配置文件，或在 `package.json` 文件中添加 Babel 配置。

## 使用 `.babelrc` 文件

创建 `.babelrc` 文件并添加以下内容：

```json
{
  "presets": ["@babel/preset-env"]
}
```

## 使用 `package.json` 文件

在 `package.json` 文件中添加 Babel 配置：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "build": "babel src -d lib"
  },
  "devDependencies": {
    "@babel/core": "^7.14.6",
    "@babel/cli": "^7.14.5",
    "@babel/preset-env": "^7.14.7"
  },
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

# 使用 Babel 编译代码

假设你的源代码在 `src` 目录，编译后的代码应输出到 `lib` 目录。你可以通过以下命令编译代码：

```sh
npx babel src --out-dir lib
```

或者，如果你在 `package.json` 文件中定义了构建脚本，可以运行：

```sh
npm run build
```

# 示例项目结构

假设你的项目结构如下：

```
my-project/
├── src/
│   └── index.js
├── lib/
├── .babelrc
├── package.json
└── node_modules/
```

在 `src/index.js` 文件中写一些 ES6+ 的代码，比如：

```js
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

greet('World');
```

运行 `npm run build` 后，Babel 会将代码编译为兼容的版本并输出到 `lib/index.js` 文件中。

# 常见 Babel 插件

除了 `@babel/preset-env`，Babel 还有许多插件可以单独使用，下面是一些常见的插件：

- `@babel/plugin-transform-arrow-functions`：将箭头函数转换为普通函数。
- `@babel/plugin-transform-classes`：将类语法转换为 ES5 语法。

你可以通过安装并在 `.babelrc` 或 `package.json` 中配置这些插件。

## 安装和使用插件示例

安装插件：

```sh
npm install --save-dev @babel/plugin-transform-arrow-functions
```

在 `.babelrc` 文件中配置插件：

```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-arrow-functions"]
}
```

# 结论

通过 Babel，你可以使用最新的 JavaScript 特性，而不必担心代码在旧版本浏览器中的兼容性。配置 Babel 并不复杂，但它能显著提升你的开发体验和代码质量。





# ---

# 官方使用教程

https://babel.dev/docs/usage

