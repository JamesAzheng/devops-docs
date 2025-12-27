---
title: "HTML"
---

# HTML 概述

HTML (Hypertext Markup Language) 是一种用于创建网页的标记语言。它由一系列的元素（elements）组成，这些元素用标记来描述网页的结构。每个元素都由一对尖括号 `< >` 来标记，并且通常包含一个标签名和一些属性。HTML 元素通常是成对出现的，包括开始标签和结束标签，也有一些是自闭合的。

让我们看一个简单的 HTML 示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>我的网页</title>
</head>
<body>
    <h1>欢迎来到我的网页！</h1>
    <p>这是一个简单的 HTML 示例。</p>
</body>
</html>
```

这个示例中包含了 HTML 文档的基本结构：

- `<!DOCTYPE html>`: 声明 HTML 版本和文档类型。
- `<html>`: HTML 文档的根元素，包含了整个 HTML 页面的内容。
- `<head>`: 包含了文档的元信息，比如字符编码和标题等。
  - `<meta charset="UTF-8">`: 指定了文档使用的字符编码。
  - `<title>`: 指定了文档的标题，会显示在浏览器的标题栏中。

- `<body>`: 包含了页面的主要内容。
- `<h1>`: 标题元素，用于显示主要的标题。
- `<p>`: 段落元素，用于显示文本段落。

HTML 还可以包含各种各样的元素，比如链接、图像、表格、列表等，以及可以用来控制页面布局和样式的元素。CSS 和 JavaScript 可以用来控制 HTML 元素的样式和行为。



## HTML 文档结构

HTML 文档的结构通常包括以下几个主要部分：

1. `<!DOCTYPE>` 声明：声明 HTML 文档的类型和版本。
   
   ```html
   <!DOCTYPE html>
   ```

2. `<html>` 元素：HTML 文档的根元素，包含了整个 HTML 页面的内容。

   ```html
   <html lang="en">
       <!-- HTML 文档内容 -->
   </html>
   ```

   - `lang` 属性用于指定文档的语言。

3. `<head>` 元素：包含了文档的元信息，比如字符编码、标题、引用的外部资源等。

   ```html
   <head>
       <meta charset="UTF-8">
       <title>页面标题</title>
       <!-- 其他元信息 -->
   </head>
   ```

4. `<meta>` 元素：定义文档的元信息，比如字符编码、作者、描述等。

   ```html
   <meta charset="UTF-8">
   ```

5. `<title>` 元素：定义文档的标题，会显示在浏览器的标题栏中。

   ```html
   <title>页面标题</title>
   ```

6. `<body>` 元素：包含页面的主要内容，比如文本、图像、链接等。

   ```html
   <body>
       <!-- 页面内容 -->
   </body>
   ```

7. 其他 HTML 元素：在 `<body>` 元素中包含了页面的实际内容，包括各种元素，比如标题、段落、图片、链接等。

这些部分组合在一起构成了一个完整的 HTML 文档，其中 `<head>` 元素用于包含文档的元信息，而 `<body>` 元素用于包含实际显示在浏览器中的内容。





## 标签 tag

HTML 中的标签（tag）是用来标记文档内容结构的元素。每个标签通常由一对尖括号 `< >` 包围，其中包括标签名和可能的属性。HTML 标签可以用于创建文本、图像、链接、表格等各种元素，从而构建网页的结构。

以下是一些常用的 HTML 标签及其功能：

1. `<html>`: 定义 HTML 文档的根元素。
2. `<head>`: 包含文档的元信息，比如字符编码、标题等。
3. `<title>`: 定义文档的标题，显示在浏览器的标题栏中。
4. `<body>`: 包含页面的主要内容。
5. `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`: 标题元素，定义不同级别的标题。
6. `<p>`: 段落元素，用于定义文本段落。
7. `<a>`: 定义超链接，用于创建链接到其他网页或文档的链接。
8. `<img>`: 定义图像，用于在网页中插入图像。
9. `<div>`: 定义文档中的一个区域，通常用于组织和布局网页内容。
10. `<span>`: 定义文档中的行内区域，通常用于对文本进行样式化或操作。
11. `<ul>`, `<ol>`, `<li>`: 分别定义无序列表和有序列表，以及列表项。
12. `<table>`, `<tr>`, `<td>`, `<th>`: 分别定义表格、表格行、表格数据、表头。
13. `<form>`, `<input>`, `<button>`, `<select>`, `<textarea>`: 定义表单及其各种控件。

这些只是 HTML 中的一部分标签，HTML 还包含许多其他标签，每个都有不同的用途和功能。通过组合和嵌套这些标签，可以创建出丰富多彩的网页内容。

**容器标签和单标签：**

在 HTML 中，标签可以分为两种主要类型：容器标签和单标签。

1. **容器标签（Container Tags）**：
   
   - 容器标签用于包含其他 HTML 元素，并且通常有开始标签和结束标签，它们之间包含了一些内容。
   - 示例：`<div>`, `<span>`, `<p>`, `<h1>`, `<ul>`, `<ol>`, `<table>`, `<form>` 等。
   - 例子：
     ```html
     <div>
         <p>这是一个段落。</p>
         <p>这是另一个段落。</p>
     </div>
     ```
   
2. **单标签（Self-closing Tags）**：
   
   - 单标签用于表示没有内容或者内容自我封闭的元素，通常只有一个标签，没有结束标签。
   - 示例：`<img>`, `<br>`, `<input>`, `<hr>` 等。
   - 例子：
     ```html
     <img src="example.jpg" alt="示例图片">
     <br>
     <input type="text" placeholder="请输入文本">
     <hr>
     ```

容器标签可以包含其他标签，形成更复杂的结构，而单标签通常用于插入一些特定的元素或者创建一些简单的效果，比如换行、插入图像等。

使用容器标签和单标签的选择取决于要表示的内容和所需的效果。容器标签用于组织和结构化页面内容，而单标签则用于插入特定的元素或者创建页面布局中的一些空白或分隔线。



# \<title> 网页标题

`<title>` 标签是 HTML 中用来定义文档标题的元素，它必须位于 `<head>` 元素内部。文档标题通常显示在浏览器的标题栏或者标签页上，并且还可能在书签中使用。

以下是一个示例，演示了如何使用 `<title>` 标签：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!-- 定义文档标题 -->
    <title>这是我的网页标题</title>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

在这个示例中，`<title>` 标签定义了文档的标题为 "这是我的网页标题"。这个标题会显示在浏览器的标题栏中，方便用户在多个标签页中区分不同的网页。

正确设置文档标题对于搜索引擎优化（SEO）和用户体验都非常重要。一个简洁而准确的标题能够吸引用户点击，并且有助于搜索引擎理解页面的内容。



# \<link>

`<link>` 标签是 HTML 中用来引入外部资源的标签，通常用于引入样式表（CSS 文件），图标文件（favicon），以及其他外部资源。它通常是位于文档头部（`<head>`）中的一个元素。

下面是一个简单的 `<link>` 标签的示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
    <!-- 引入外部样式表 -->
    <link rel="stylesheet" href="styles.css">
    <!-- 引入网站图标 -->
    <link rel="icon" href="favicon.ico">
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

在这个示例中，有两个 `<link>` 标签：

1. 第一个 `<link>` 标签用于引入外部样式表（styles.css），它的 `rel` 属性指定了链接的关系类型（stylesheet 表示样式表），`href` 属性指定了外部样式表文件的 URL。
2. 第二个 `<link>` 标签用于引入网站的图标（favicon.ico），它的 `rel` 属性指定了链接的关系类型（icon 表示图标），`href` 属性指定了图标文件的 URL。

`<link>` 标签可以用来引入其他类型的外部资源，比如字体文件、JavaScript 文件等。它是一种非常常用的 HTML 元素，用于向 HTML 文档中添加外部资源以及与之相关的关系。



# \<style>

`<style>` 标签用于在 HTML 文档中嵌入样式信息，可以用来定义文档的外观和布局。通常，`<style>` 标签位于文档的 `<head>` 部分中，用于将样式应用于整个文档，但也可以在文档的其他位置使用。

以下是一个简单的示例，演示了如何使用 `<style>` 标签：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
    <!-- 在头部部分定义样式 -->
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        h1 {
            color: blue;
        }
        p {
            font-size: 16px;
        }
    </style>
</head>
<body>
    <h1>这是标题</h1>
    <p>这是段落文本。</p>
</body>
</html>
```

在这个示例中，`<style>` 标签包含了一些 CSS 规则，用于定义页面的样式：

- `body` 元素应用了 Arial 字体和一个灰色的背景色。
- `h1` 元素的文字颜色被设置为蓝色。
- `p` 元素的字体大小被设置为 16 像素。

通过使用 `<style>` 标签，你可以在 HTML 文档中直接定义样式，而无需将样式信息放在外部的样式表文件中。这在一些小型项目或者需要简单样式的页面中非常方便。



# \<a> 创建超链接

`<a>` 标签用于创建超链接（链接到其他页面、文档、位置或资源），是 HTML 中非常重要和常用的元素之一。

下面是一个示例，演示了如何使用 `<a>` 标签创建一个超链接：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>超链接示例</title>
</head>
<body>
    <h1>欢迎来到我的网页！</h1>
    <!-- 创建一个超链接 -->
    <a href="https://www.example.com">访问示例网站</a>
</body>
</html>
```

在这个示例中，`<a>` 标签创建了一个超链接，其中 `href` 属性指定了链接目标的 URL，即指向 "https://www.example.com" 的链接文本为 "访问示例网站"。用户点击这个链接后，浏览器将会跳转到指定的 URL。

除了跳转到外部 URL，`<a>` 标签还可以用于创建内部链接（链接到同一页面内的不同部分）、下载链接（链接到文件）、电子邮件链接（链接到邮件地址）等。

### href

```html
<a href="https://www.baidu.com">访问示例网站</a>  <!-- 跳转到指定网站 -->

<a href="ftp://www.example.com">访问ftp服务器</a>

<a href="file.txt">下载文件</a> <!-- 引用本地文件，相对于当前路径 -->

<a href="/xyz/abc">站点根</a> <!-- 开头使用/，表示站点根 -->

<a href="#section2">跳转到第二部分</a> <!-- 引用锚点，跳转到网页的指定位置 -->
```

### target

`target="_blank"` 将链接指定为在新的浏览器标签页中打开，而不是当前页中打开。

- `target="_self"` 在当前页跳转，同时也是默认值。

```html
<a href="https://www.example.com" target="_blank">在新标签页中打开示例网站</a>
```

### onclick

`onclick` 属性是 HTML 元素中的一个事件属性，它用于指定当用户单击（点击）元素时触发的 JavaScript 代码。当用户点击具有 `onclick` 属性的元素时，其中指定的 JavaScript 代码将会执行。

以下是一个简单的示例，演示了如何在元素上使用 `onclick` 属性：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>点击事件示例</title>
</head>
<body>
    <!-- 在按钮上定义点击事件 -->
    <button onclick="alert('Hello!')">点击我</button>
</body>
</html>
```

在这个示例中，`<button>` 元素上使用了 `onclick` 属性，当用户点击按钮时，`alert('Hello!')` 这段 JavaScript 代码将会执行，弹出一个提示框显示 "Hello!"。

`onclick` 属性可以用于各种 HTML 元素，比如按钮、链接、图像等，以及任何需要触发 JavaScript 事件的地方。通过 `onclick` 属性，可以实现诸如响应用户交互、执行特定功能、改变页面内容等动态效果。



```html
<a href="javascript:void(0);" onclick="alert('Hello!')">点击弹出提示框</a>  <!-- 执行 JavaScript -->
```



# \<p> 定义文本段落

`<p>` 标签是 HTML 中用来定义段落的元素，它表示一个文本段落，通常包含一段文字或者其他内容。

以下是一个简单的示例，演示了如何使用 `<p>` 标签创建段落：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>段落示例</title>
</head>
<body>
    <p>这是第一个段落。</p>
    <p>这是第二个段落。</p>
</body>
</html>
```

在这个示例中，有两个 `<p>` 标签，每个 `<p>` 标签定义了一个段落。段落内的文本会被显示为一个段落，浏览器通常会在段落之间添加一些空白间距来使其清晰可辨。

`<p>` 标签是 HTML 中最常用的元素之一，用于创建网页中的段落和文本块。它使得文档结构更清晰，提高了可读性。



# \<script>

`<script>` 标签用于在 HTML 文档中嵌入 JavaScript 代码，它可以放置在文档的 `<head>` 或 `<body>` 部分中，并且可以包含内联脚本或引用外部 JavaScript 文件。

1. **内联脚本（Inline Scripts）**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript 示例</title>
    <!-- 内联脚本 -->
    <script>
        alert('Hello, world!');
    </script>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

在这个示例中，`<script>` 标签内部包含了 JavaScript 代码，用于弹出一个警告框显示 "Hello, world!"。

2. **引用外部 JavaScript 文件**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript 示例</title>
    <!-- 引用外部 JavaScript 文件 -->
    <script src="script.js"></script>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

在这个示例中，`<script>` 标签使用 `src` 属性引用了外部的 JavaScript 文件 "script.js"，浏览器将会加载并执行这个文件中的 JavaScript 代码。

`<script>` 标签是 HTML 中用于引入和执行 JavaScript 代码的主要方式之一，它使得在 HTML 页面中实现动态效果和交互功能变得非常简单。



# \<h1> - \<h6>

`<h1>` 到 `<h6>` 标签是 HTML 中用于定义标题的元素，其作用是显示文档中的标题或者子标题，并且标题的重要性依次递减。

这些标题元素的使用方式类似，只是它们的级别不同，对应着标题的重要性或者层次。

下面是每个标题元素的一些特点：

- `<h1>`：最高级别的标题，通常用于文档的主标题或者页面的主要内容标题。
- `<h2>`：次级标题，用于表示较重要的标题，可以用于分隔文档的不同部分或者章节。
- `<h3>` 到 `<h6>`：依次类推，表示的标题级别逐渐降低，一般用于表示次要的或者子标题。

以下是一个示例，演示了如何在 HTML 中使用这些标题元素：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>标题示例</title>
</head>
<body>
    <h1>这是主标题</h1>
    <h2>这是次级标题</h2>
    <h3>这是第三级标题</h3>
    <h4>这是第四级标题</h4>
    <h5>这是第五级标题</h5>
    <h6>这是第六级标题</h6>
</body>
</html>
```

在这个示例中，我们展示了 `<h1>` 到 `<h6>` 标签的使用，每个标签对应着不同级别的标题。这些标题元素的样式通常由浏览器或者网页的 CSS 样式表来控制，但可以通过 CSS 来自定义它们的样式。



# \<span>组织行内元素

`<span>` 标签是 HTML 中的内联元素，用于在文档中组织行内的元素，并且通常用于对文本的部分进行样式化或者分组。

`<span>` 标签本身没有特定的语义，它通常用于在行内文本中标记一个区域，以便于对这个区域应用样式或者操作。与之相对的是 `<div>` 标签，`<div>` 用于组织块级元素，而 `<span>` 则用于组织行内元素。

以下是一个示例，演示了如何在 HTML 中使用 `<span>` 标签：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>span 标签示例</title>
    <style>
        /* 使用 span 标签对文本进行样式化 */
        .highlight {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <p>这是一段普通的文本，<span class="highlight">这里是高亮显示的文本</span>。</p>
</body>
</html>
```

在这个示例中，`<span>` 标签用于包裹了一段文本，同时应用了一个 `highlight` 类，以便于通过 CSS 对这段文本进行高亮显示。`<span>` 标签的使用使得我们可以对文本中的一部分进行特定样式或者操作，而不影响其他文本。



# \<div>组织块级元素

`<div>` 标签是 HTML 中用于创建一个块级的容器元素，它可以将文档中的一组元素组织在一起，并且通常用于布局和样式化目的。`<div>` 标签本身不具有特定的语义，而是用作一个通用的容器，可以用 CSS 或 JavaScript 来控制其外观和行为。

以下是一个示例，演示了如何在 HTML 中使用 `<div>` 标签创建一个容器：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>容器示例</title>
    <style>
        /* CSS 样式 */
        .container {
            width: 300px;
            height: 200px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 20px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <!-- 创建一个容器 -->
    <div class="container">
        <h2>这是一个容器</h2>
        <p>这里可以放置一些内容。</p>
    </div>
</body>
</html>
```

在这个示例中，`<div>` 标签被赋予了一个类名为 "container"，并且通过 CSS 来定义了该容器的样式。容器内部包含了一些文本内容和其他 HTML 元素。

`<div>` 标签是 HTML 中最常用的块级容器之一，它可以与 CSS 一起使用来创建灵活的布局和设计。通过给 `<div>` 添加类名或者 ID，可以针对不同的容器应用不同的样式或者绑定不同的 JavaScript 功能。

### id

`id` 属性是 HTML 元素中的一个全局属性，用于为元素指定唯一的标识符（ID）。每个页面中的元素都应该具有唯一的 ID，这样可以通过 JavaScript 或者 CSS 样式表来引用和操作这些元素。

以下是一个示例，演示了如何在 HTML 元素中使用 `id` 属性：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>id 属性示例</title>
    <style>
        /* 通过 ID 选择器应用样式 */
        #myDiv {
            color: red;
        }
    </style>
</head>
<body>
    <!-- 使用 id 属性为元素指定唯一标识符 -->
    <div id="myDiv">
        这是一个具有唯一标识符的 div 元素。
    </div>
</body>
</html>
```

在这个示例中，`<div>` 元素被赋予了一个 `id` 属性值为 "myDiv"，这个值是唯一的。然后，通过 CSS 中的 `#myDiv` 选择器，可以针对这个具有指定 ID 的元素应用样式。

除了 CSS，`id` 属性还可以用于 JavaScript 中，通过 `document.getElementById()` 方法来获取对具有指定 ID 的元素的引用，从而对其进行操作。例如：

```javascript
// 获取具有指定 ID 的元素
var element = document.getElementById("myDiv");
// 对元素进行操作
element.innerHTML = "这是通过 JavaScript 修改的内容。";
```

总之，`id` 属性是 HTML 元素中用于指定唯一标识符的属性，它在 JavaScript 和 CSS 中都非常有用，可以用于引用和操作特定的元素。

### class

`class` 属性是 HTML 元素中的一个常用属性，用于为元素指定一个或多个样式类。样式类是一组由空格分隔的名称，可以在 CSS 中定义样式，并应用到具有相同类名的所有元素上。

以下是一个示例，演示了如何在 HTML 元素中使用 `class` 属性：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>class 属性示例</title>
    <style>
        /* 定义样式类 */
        .red-text {
            color: red;
        }
        .big-font {
            font-size: 24px;
        }
    </style>
</head>
<body>
    <!-- 使用 class 属性为元素指定样式类 -->
    <p class="red-text big-font">这是一个具有样式类的段落。</p>
</body>
</html>
```

在这个示例中，`<p>` 元素的 `class` 属性被设置为 "red-text big-font"，它指定了两个样式类，分别是 "red-text" 和 "big-font"。然后，通过 CSS 中的 `.red-text` 和 `.big-font` 选择器，可以分别为具有这两个类的元素应用样式。

通过为元素指定类名，可以实现样式的复用和统一管理，使得页面的样式更加清晰和易于维护。同时，一个元素可以拥有多个类，这样就可以灵活地组合和应用不同的样式。



# \<ul> 无序列表

`<ul>` 标签是 HTML 中用于创建无序列表（unordered list）的元素，通常用于显示项目之间没有特定顺序或者层次关系的列表。无序列表中的每个项目通常由一个带有圆点或其他符号的项目符号表示。

以下是一个示例，演示了如何在 HTML 中使用 `<ul>` 标签创建无序列表：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>无序列表示例</title>
</head>
<body>
    <!-- 创建一个无序列表 -->
    <ul>
        <li>苹果</li>
        <li>香蕉</li>
        <li>橙子</li>
    </ul>
</body>
</html>
```

在这个示例中，`<ul>` 标签包含了三个 `<li>`（列表项）元素，每个 `<li>` 元素表示列表中的一个项目。在浏览器中显示时，这些项目将以无序列表的形式显示，每个项目之间通常用一个项目符号（如圆点）来标记。

`<ul>` 标签常与 `<li>` 标签一起使用，用于创建无序列表。除了默认的圆点符号，可以通过 CSS 来自定义列表项的样式，比如改变项目符号的类型、大小、颜色等。



# \<ol> 有序列表

`<ol>` 标签是 HTML 中用于创建有序列表（ordered list）的元素，它表示列表中的项目具有特定的顺序或者层次关系。有序列表中的每个项目通常由一个数字、字母或者其他序号表示。

以下是一个示例，演示了如何在 HTML 中使用 `<ol>` 标签创建有序列表：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>有序列表示例</title>
</head>
<body>
    <!-- 创建一个有序列表 -->
    <ol>
        <li>第一步：打开冰箱</li>
        <li>第二步：拿出牛奶</li>
        <li>第三步：倒入玻璃杯</li>
        <li>第四步：喝光牛奶</li>
    </ol>
</body>
</html>
```

在这个示例中，`<ol>` 标签包含了四个 `<li>`（列表项）元素，每个 `<li>` 元素表示列表中的一个项目。在浏览器中显示时，这些项目将以有序列表的形式显示，每个项目前面会有一个序号来表示其顺序。

与 `<ul>` 标签类似，`<ol>` 标签也常与 `<li>` 标签一起使用，用于创建有序列表。可以通过 CSS 来自定义有序列表中的项目符号的样式，比如改变数字、字母、序号的类型、大小、颜色等。



# \<table> 定义表格

`<table>` 标签是 HTML 中用于创建表格的元素，它允许将数据组织成行和列的形式，并且提供了丰富的功能来定义表格的结构和样式。

以下是一个示例，演示了如何在 HTML 中使用 `<table>` 标签创建表格：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表格示例</title>
    <style>
        /* 设置表格的样式 */
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <!-- 创建一个表格 -->
    <table>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>城市</th>
        </tr>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
        </tr>
    </table>
</body>
</html>
```

在这个示例中，`<table>` 标签用于创建一个表格，其中包含了三行（`<tr>`）和三列（`<th>` 或 `<td>`）。`<th>` 标签用于定义表头单元格（表头），而 `<td>` 标签用于定义数据单元格（表格数据）。通过 CSS 来设置表格的样式，包括边框、内边距、对齐等。

表格是 HTML 中用于展示和组织数据的重要元素，可以用于展示各种类型的数据，如产品列表、排行榜、日程安排等。

## \<tr> 定义表格的行

`<tr>` 标签是 HTML 中用于定义表格中的行的元素，它用于包裹表格中的单元格元素（`<td>` 或 `<th>`），表示表格中的一行数据。

以下是一个简单的示例，演示了如何在 HTML 中使用 `<tr>` 标签创建表格中的行：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表格行示例</title>
</head>
<body>
    <!-- 创建一个表格 -->
    <table border="1">
        <!-- 第一行 -->
        <tr>
            <td>数据1</td>
            <td>数据2</td>
            <td>数据3</td>
        </tr>
        <!-- 第二行 -->
        <tr>
            <td>数据4</td>
            <td>数据5</td>
            <td>数据6</td>
        </tr>
    </table>
</body>
</html>
```

在这个示例中，`<tr>` 标签用于定义了两行数据。每行数据中包含了三个单元格（`<td>` 元素），分别包含了数据1、数据2、数据3 和 数据4、数据5、数据6。

`<tr>` 标签通常与 `<td>` 或 `<th>` 标签一起使用，用于定义表格中的行。每个 `<tr>` 元素表示表格中的一行数据，其内部包含的单元格元素表示该行的各个数据项。

## \<th> 定义表格的标题列

文字加粗，不过现在\<th>用的少了，表格表头是否加粗，都用css控制。所以表中有tr表示行，td表示格子。

`<th>` 标签是 HTML 中用于定义表格中的表头单元格的元素，它通常用于表示表格中每列的标题或者标签。

与 `<td>`（表格数据单元格）元素类似，`<th>` 元素用于包含表头数据，但它有一些额外的语义意义，用于标识表格的标题行。通常，浏览器会为 `<th>` 元素默认应用粗体和居中对齐的样式，以使其在表格中更容易区分。

以下是一个示例，演示了如何在 HTML 中使用 `<th>` 标签创建表格中的表头：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表头示例</title>
    <style>
        th {
            background-color: lightgray;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- 创建一个带有表头的表格 -->
    <table border="1">
        <!-- 表头行 -->
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>城市</th>
        </tr>
        <!-- 数据行 -->
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
        </tr>
    </table>
</body>
</html>
```

在这个示例中，`<th>` 标签用于定义了表格的三列表头，分别为 "姓名"、"年龄" 和 "城市"。这些表头单元格会在表格中呈现为粗体和居中对齐，并且通过 CSS 设置了背景色。

## \<td> 定义表格的列

`<td>` 标签是 HTML 中用于定义表格中的数据单元格的元素，它通常用于表示表格中的每个数据项。

以下是一个示例，演示了如何在 HTML 中使用 `<td>` 标签创建表格中的数据单元格：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>数据单元格示例</title>
</head>
<body>
    <!-- 创建一个表格 -->
    <table border="1">
        <tr>
            <!-- 第一行的数据单元格 -->
            <td>数据1</td>
            <td>数据2</td>
            <td>数据3</td>
        </tr>
        <tr>
            <!-- 第二行的数据单元格 -->
            <td>数据4</td>
            <td>数据5</td>
            <td>数据6</td>
        </tr>
    </table>
</body>
</html>
```

在这个示例中，`<td>` 标签用于定义了两行数据。每行数据中包含了三个数据单元格（`<td>` 元素），分别包含了数据1、数据2、数据3 和 数据4、数据5、数据6。

`<td>` 标签通常与 `<tr>`（表格行）标签一起使用，用于定义表格中的数据单元格。每个 `<td>` 元素表示表格中的一个数据项，通常会包含文本或者其他内容。

# \<form> 定义表单

`<form>` 标签是 HTML 中用于创建表单的元素，它用于在网页中收集用户输入的数据，并将数据发送到服务器进行处理。表单通常包含各种类型的输入元素，比如文本框、单选框、复选框、下拉框等，以及提交按钮用于提交表单数据。

以下是一个简单的示例，演示了如何在 HTML 中使用 `<form>` 标签创建一个表单：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>表单示例</title>
</head>
<body>
    <!-- 创建一个表单 -->
    <form action="/submit_form" method="post">
        <label for="username">用户名：</label>
        <input type="text" id="username" name="username"><br>
        
        <label for="password">密码：</label>
        <input type="password" id="password" name="password"><br>
        
        <input type="submit" value="提交">
    </form>
</body>
</html>
```

在这个示例中，`<form>` 标签用于创建了一个包含用户名和密码输入框以及提交按钮的表单。`action` 属性指定了表单提交的目标 URL，而 `method` 属性指定了使用 POST 方法提交表单数据。表单内部包含了 `<input>` 元素，用于接收用户输入的数据。

`<form>` 标签是 HTML 中用于创建表单的关键元素之一，它提供了一种方便的方式来收集用户输入的数据，并将数据发送到服务器进行处理。

注意：有`name`才会提交数据



# \<br> 插入换行符

`<br>` 标签是 HTML 中的一个单标签，用于在文档中插入换行符。它不包含任何内容，只是在当前位置创建一个换行。

`<br>` 标签没有结束标签，因为它是一个自闭合标签。你可以在文档中的任何位置使用它，以在文本中创建换行效果。

以下是一个示例，演示了如何在文档中使用 `<br>` 标签：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>换行示例</title>
</head>
<body>
    <h1>这是标题</h1>
    <p>这是一个段落。<br>这是另一行。</p>
    <p>这是另一个段落。<br>这是另一行。</p>
</body>
</html>
```

在这个示例中，`<br>` 标签用于在段落中创建换行，使得文本在浏览器中显示为两行。`<br>` 标签通常用于在文本中的特定位置插入换行，比如在地址或诗歌中。

# \<hr> 创建水平分隔线

`<hr>` 标签是 HTML 中用于创建水平分隔线的元素，它表示文档中的内容分隔或者主题之间的分隔。`<hr>` 标签是一个单标签，不需要结束标签，通常在文档中直接插入即可。

以下是一个示例，演示了如何在 HTML 中使用 `<hr>` 标签创建水平分隔线：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>水平分隔线示例</title>
</head>
<body>
    <h1>这是一个标题</h1>
    <p>这是一些文本内容。</p>
    <!-- 创建水平分隔线 -->
    <hr>
    <p>这是另一段文本内容。</p>
</body>
</html>
```

在这个示例中，`<hr>` 标签创建了一个水平分隔线，它可以用来分隔不同段落、主题或者内容区域，增强页面的可读性和可视化效果。分隔线的样式通常由浏览器或者网页的 CSS 样式表来控制，但也可以通过 CSS 来自定义其外观。



# \<img> 插入图像

`<img>` 标签是 HTML 中用于插入图像的元素，它允许在网页中显示图像内容。`<img>` 标签是一个单标签，不需要结束标签，而是使用 `src` 属性来指定要显示的图像文件的 URL。

以下是一个示例，演示了如何在 HTML 中使用 `<img>` 标签插入图像：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>图像示例</title>
</head>
<body>
    <h1>我的猫咪</h1>
    <!-- 插入图像 -->
    <img src="cat.jpg" alt="我的猫咪">
</body>
</html>
```

在这个示例中，`<img>` 标签使用了 `src` 属性来指定图像文件 "cat.jpg" 的 URL，而 `alt` 属性用于提供图像的替代文本，用于在图像无法显示时提供描述性信息或者辅助辅助性技术使用。

除了 `src` 和 `alt` 属性外，`<img>` 标签还可以包含其他属性，比如 `width` 和 `height` 用于设置图像的宽度和高度，`title` 用于提供鼠标悬停时的提示信息等。



# ---

# 综合示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HTML 示例</title>
</head>
<body>
    <!-- 创建一个标题 -->
    <h1>HTML 示例页面</h1>
    
    <!-- 创建一个段落 -->
    <p>这是一个包含了各种 HTML 标签的示例页面。</p>
    
    <!-- 创建一个无序列表 -->
    <ul>
        <li>苹果</li>
        <li>香蕉</li>
        <li>橙子</li>
    </ul>
    
    <!-- 创建一个有序列表 -->
    <ol>
        <li>第一步：打开冰箱</li>
        <li>第二步：拿出牛奶</li>
        <li>第三步：倒入玻璃杯</li>
        <li>第四步：喝光牛奶</li>
    </ol>
    
    <!-- 创建一个表格 -->
    <table border="1">
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>城市</th>
        </tr>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
        </tr>
    </table>
    
    <!-- 创建一个表单 -->
    <form action="/submit_form" method="post">
        <label for="username">用户名：</label>
        <input type="text" id="username" name="username"><br>
        
        <label for="password">密码：</label>
        <input type="password" id="password" name="password"><br>
        
        <input type="submit" value="提交">
    </form>
    
    <!-- 创建一个带有 span 标签的文本 -->
    <p>这是一段普通的文本，<span>这里是带有 span 标签的文本</span>。</p>
</body>
</html>
```

这个页面包含了 `<h1>`、`<p>`、`<ul>`、`<ol>`、`<table>`、`<form>` 和 `<span>` 等标签，以展示各种类型的 HTML 元素。



# 解决无法转发实际端口

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>source</title>
  <script type="text/javascript">
    window.g = {
      baseURL: document.domain + ':' + window.location.port + '/blockchain/',
    };
  </script>
  <link href="./static/css/app.010319de397898768bcc286eb375f52f.css" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  <script type="text/javascript" src="./static/js/manifest.83a281a6b74de51568b8.js"></script>
  <script type="text/javascript" src="./static/js/vendor.54a0ec0ed0cde02e510f.js"></script>
  <script type="text/javascript" src="./static/js/app.c2d95d92d873dc783b97.js"></script>
</body>
</html>
```



# 算命

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>超链接示例</title>
</head>
<body>
    <h1>xxx上辈子是什么？</h1>
    <!-- 创建一个超链接 -->
    <a href="https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2023%2F1007%2Fa0280149j00s255r000fvd000k700ddp.jpg&thumbnail=660x2147483647&quality=80&type=jpg"  target="_blank">点击此处查看答案</a>
</body>
</html>
```

