---
title: "CSS"
---

# CSS 概述

cascading style sheet，层叠样式表，控制HTML的布局和样式。



## 使用方式

三种使用方式，优先级从高到低依次为：内联样式、页内样式、外部样式。

1. **内联样式**：内联样式是直接应用于HTML元素的样式，通过在元素的`style`属性中指定CSS样式。这种方式的优先级最高，因为它直接作用于元素本身，会覆盖其他方式定义的样式。

   例如：
   ```html
   <p style="color: red; font-size: 16px;">这是内联样式的段落。</p>
   ```

2. **页内样式**：页内样式是指将CSS样式直接写在HTML文件的`<style>`标签内，它作用于整个页面的特定部分。这种方式的优先级次于内联样式，但高于外部样式表。

   例如：
   ```html
   <head>
       <style>
           p {
               color: blue;
               font-size: 18px;
           }
       </style>
   </head>
   <body>
       <p>这是页内样式的段落。</p>
   </body>
   ```

3. **外部样式（常用）**：外部样式是将CSS样式定义在外部的CSS文件中，然后通过`<link>`标签将其链接到HTML文档中。这种方式的优先级是最低的，只有当其他方式未定义某些样式时才会生效。

   例如：
   ```html
   <head>
       <link rel="stylesheet" type="text/css" href="styles.css">
   </head>
   <body>
       <p>这是外部样式的段落。</p>
   </body>
   ```

在实际开发中，优先使用外部样式表，因为它有利于代码的组织和维护，同时也有利于提高页面加载速度和缓存利用率。



## 基本语法

- 

## ---

CSS的基本语法包括选择器、属性和值的组合。以下是一些基本的语法规则：

1. **选择器（Selector）**：用于选择要应用样式的HTML元素。选择器可以是元素的标签名、类名、ID等。常见的选择器有：
   - 标签选择器：如 `p`、`div`，选择所有该标签的元素。
   - 类选择器：如 `.class-name`，选择具有特定类名的元素。
   - ID选择器：如 `#id-name`，选择具有特定ID的元素。
   - 后代选择器：如 `parent child`，选择某个元素的后代元素。
   - 组合选择器：将多个选择器组合在一起使用，如 `selector1, selector2`。

2. **属性（Property）**：指定要应用的样式属性，如字体、颜色、边框等。常见的属性有：
   - `color`：文本颜色。
   - `font-size`：字体大小。
   - `background-color`：背景颜色。
   - `border`：边框样式。
   - `margin`、`padding`：外边距和内边距等。

3. **值（Value）**：属性所对应的具体样式值。例如，`color: red;`中的值是`red`。

基本的CSS语法结构如下：
```css
selector {
    property1: value1;
    property2: value2;
    /* 可以有更多的属性值对 */
}
```

例如：
```css
/* 标签选择器 */
p {
    color: blue;
    font-size: 16px;
}

/* 类选择器 */
.my-class {
    background-color: yellow;
}

/* ID选择器 */
#my-id {
    border: 1px solid black;
}

/* 后代选择器 */
.parent .child {
    font-weight: bold;
}
```

这些样式规则定义了不同元素的外观和布局。选择器确定了哪些元素将被样式化，属性确定了样式的具体细节，值则定义了属性的具体表现。



# 选择器

## 标签选择器

标签选择器是 CSS 中最简单和最常见的选择器之一，它允许你选择 HTML 文档中所有具有相同标签名称的元素，并为它们应用样式。标签选择器以标签的名称作为选择器。

标签选择器的优点是简单易用，适用于一次性应用到整个文档中的元素。然而，当你需要为特定的元素应用样式时，可能需要结合其他选择器来限制选择范围。

**语法：**`selector { property1: value1; ...; propertyN: valueN }`

- 如果将 `selector` 改为 `*`，将影响所有元素。

**示例1：**

例如，如果你想为所有段落元素 `<p>` 应用样式，你可以使用标签选择器 `p`：

```css
p {
    color: blue;
    font-size: 16px;
}
```

上面的 CSS 规则将使所有段落元素的文本颜色变为蓝色，并将字体大小设置为 16 像素。

**示例2：**

```css
/*将h1标签的内容设置为红色，并添加横线穿越*/
h1 {
     color:red;
     text-decoration: line-through;
 }
```



## id选择器

ID选择器用于选择具有特定ID属性的HTML元素，并为其应用样式。在HTML文档中，每个元素的ID属性应该是唯一的。

在CSS中，ID选择器以 `#` 符号开头，后跟元素的ID名称。例如，如果你想为ID为 `my-element` 的元素应用样式，你可以使用ID选择器 `#my-element`：

```css
#my-element {
    color: red;
    font-size: 18px;
}
```

上面的 CSS 规则将使具有ID为 `my-element` 的元素的文本颜色变为红色，并将字体大小设置为 18 像素。

ID选择器的特点是它只能选择页面中具有指定ID的唯一元素。因此，应该确保在HTML文档中每个ID都是唯一的，否则会导致选择器匹配多个元素，可能产生意外的样式效果。



## 类选择器

类选择器用于选择具有特定类名的HTML元素，并为其应用样式。在HTML文档中，一个元素可以有多个类名，同样的类名也可以用于多个元素。

在CSS中，类选择器以`.`（点号）开头，后跟类名。例如，如果你想为所有具有 `my-class` 类的元素应用样式，你可以使用类选择器 `.my-class`：

```css
.my-class {
    color: blue;
    font-size: 16px;
}
```

上面的 CSS 规则将使具有 `my-class` 类的元素的文本颜色变为蓝色，并将字体大小设置为 16 像素。

通过类选择器，你可以为多个元素定义相同的样式，这样可以更好地组织和管理你的样式表。在HTML中，将类名分配给元素的方法是通过在元素的class属性中添加类名，如下所示：

```html
<p class="my-class">这是一个具有my-class类的段落。</p>
```

一个元素可以有多个类名，它们之间用空格分隔，例如：

```html
<div class="class1 class2 class3">...</div>
```

这使得一个元素可以同时具有多个类所定义的样式。



## 选择器分组

在CSS中，你可以将多个选择器组合在一起，并为它们应用相同的样式，这被称为选择器分组。通过选择器分组，你可以同时为多个元素应用相同的样式，从而减少代码重复。

选择器分组使用逗号`,`来分隔不同的选择器，然后在同一组中为这些选择器定义相同的样式。例如，假设你想为 `<h1>`、`<h2>` 和 `<h3>` 标题元素应用相同的样式，你可以这样做：

```css
h1, h2, h3 {
    color: blue;
    font-size: 24px;
    font-weight: bold;
}
```

上面的 CSS 规则中的 `h1, h2, h3` 是一个选择器分组，它选择了所有的 `<h1>`、`<h2>` 和 `<h3>` 元素，并为它们设置了相同的文本颜色、字体大小和字体粗细。

通过选择器分组，你可以更简洁地定义样式，提高代码的可读性和维护性。



## 层次选择器

层次选择器是 CSS 中一种用于选择嵌套结构中元素的选择器。它可以选择文档中某个元素的子元素、后代元素或兄弟元素。

以下是一些常见的层次选择器：

1. **后代选择器**：后代选择器选择指定元素的所有后代元素，不仅仅是直接子元素。后代选择器使用空格来表示嵌套关系。例如，选择所有段落元素（`<p>`）中的 `<span>` 元素：

```css
p span {
    /* 样式规则 */
}
```

2. **子元素选择器**：子元素选择器选择指定元素的直接子元素。它使用 `>` 符号来表示直接子元素关系。例如，选择所有 `<div>` 元素的直接子元素 `<p>`：

```css
div > p {
    /* 样式规则 */
}
```

3. **相邻兄弟选择器**：相邻兄弟选择器选择指定元素之后紧跟的兄弟元素。它使用 `+` 符号来表示。例如，选择所有 `<h2>` 元素后紧跟的 `<p>` 元素：

```css
h2 + p {
    /* 样式规则 */
}
```

4. **通用兄弟选择器**：通用兄弟选择器选择指定元素之后的所有兄弟元素。它使用 `~` 符号来表示。例如，选择所有 `<h2>` 元素后的所有 `<p>` 元素：

```css
h2 ~ p {
    /* 样式规则 */
}
```

这些层次选择器可以结合使用，以选择文档中特定的元素或元素组合，并为它们应用相应的样式。使用层次选择器可以精确地控制样式的应用范围，使得样式表更加灵活和可维护。

### 后代选择器

以下是一个后代选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Descendant Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Descendant Selector Example</h2>
    <div class="container">
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
        <div>
            <p>Paragraph inside div</p>
        </div>
    </div>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 .container 元素内的所有 p 元素 */
.container p {
    color: blue;
}
```

在这个示例中，我们有一个包含了多个元素的容器 `<div>`，其中包括一个无序列表 `<ul>` 和一个 `<div>` 元素，后者包含了一个段落 `<p>`。我们使用了后代选择器 `.container p` 来选择容器 `.container` 内部的所有段落 `<p>` 元素，并为它们应用样式。

- 容器 `.container` 内部的所有段落文本将会被设置为蓝色。

这样，我们就可以根据元素的层次结构来选择并应用样式，使得页面设计更加灵活和可控。

### 子元素选择器

以下是一个子元素选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Child Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Child Selector Example</h2>
    <div class="container">
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <div>
            <p>Paragraph 3</p>
            <p>Paragraph 4</p>
        </div>
    </div>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 .container 元素下直接子元素 p 元素 */
.container > p {
    color: blue;
}
```

在这个示例中，我们有一个包含了多个元素的容器 `<div>`，其中包括两个直接子元素 `<p>` 和一个子元素为 `<div>` 的 `<div>` 元素，后者包含了两个 `<p>` 元素。我们使用了子元素选择器 `.container > p` 来选择容器 `.container` 下直接子元素为 `<p>` 的元素，并为它们应用样式。

- 容器 `.container` 下直接子元素为 `<p>` 的文本将会被设置为蓝色（Paragraph 1 和 Paragraph 2）。

这样，我们就可以只选择指定元素的直接子元素，而不会选择更深层次的后代元素，以实现更加精确和灵活的页面设计。

### 相邻兄弟选择器

以下是一个相邻兄弟选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adjacent Sibling Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Adjacent Sibling Selector Example</h2>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li class="highlight">Item 4</li>
        <li>Item 5</li>
    </ul>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择紧跟在 .highlight 元素后的 li 元素 */
.highlight + li {
    font-weight: bold;
}
```

在这个示例中，我们有一个无序列表 `<ul>`，其中有多个列表项 `<li>`。其中一个列表项具有类名为 `highlight`。我们使用了相邻兄弟选择器 `.highlight + li` 来选择紧跟在具有类名 `highlight` 的列表项后面的 `<li>` 元素，并为它们应用样式。

- 类名为 `highlight` 的列表项后紧跟的列表项文本将会被设置为粗体（Item 5）。

这样，我们就可以根据元素在文档中的位置关系来选择并应用样式，使得页面设计更加灵活和具有交互性。

### 通用兄弟选择器

以下是一个通用兄弟选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>General Sibling Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>General Sibling Selector Example</h2>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li class="highlight">Item 3</li>
        <li>Item 4</li>
        <li>Item 5</li>
    </ul>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择所有和 .highlight 元素在同一父级下的 li 元素 */
.highlight ~ li {
    color: blue;
}
```

在这个示例中，我们有一个无序列表 `<ul>`，其中有多个列表项 `<li>`。其中一个列表项具有类名为 `highlight`。我们使用了通用兄弟选择器 `.highlight ~ li` 来选择和具有类名 `highlight` 的列表项在同一父级下的其他 `<li>` 元素，并为它们应用样式。

- 和具有类名 `highlight` 的列表项在同一父级下的其他列表项文本将会被设置为蓝色。

这样，我们就可以根据元素在文档中的位置关系来选择并应用样式，使得页面设计更加灵活和具有交互性。



## 伪类 pseudo-classes

伪类能增加样式，类似于class

伪类（pseudo-classes）是 CSS 中用于选择元素的特殊状态或行为的一种机制。它们允许你根据用户行为或元素的状态来选择元素，并为其应用样式。

常见的伪类包括：

1. **链接伪类（Link Pseudo-classes）**：
   - `:link`：选择尚未被访问的链接。
   - `:visited`：选择已被访问过的链接。

2. **用户行为伪类（User Action Pseudo-classes）**：
   - `:hover`：当鼠标悬停在元素上时应用样式。
   - `:active`：当元素被激活（例如被点击）时应用样式。
   - `:focus`：当元素获得焦点时应用样式（例如输入框）。

3. **结构伪类（Structural Pseudo-classes）**：
   - `:first-child`：选择某个元素的第一个子元素。
   - `:last-child`：选择某个元素的最后一个子元素。
   - `:nth-child(n)`：选择某个元素的第 n 个子元素，其中 n 可以是一个具体的数字、关键字或公式。

4. **表单相关伪类（Form-related Pseudo-classes）**：
   - `:checked`：选择被选中的表单元素，如复选框或单选按钮。
   - `:disabled`：选择被禁用的表单元素。

5. **状态伪类（State Pseudo-classes）**：
   - `:valid`：选择符合指定条件的有效输入框。
   - `:invalid`：选择不符合指定条件的无效输入框。

这些伪类可以与元素的标签名、类名、ID等选择器结合使用，从而更精确地选择元素并为其应用样式。伪类的使用使得开发者能够更灵活地控制页面元素的外观和行为。

### 链接伪类

下面是一个链接伪类的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Pseudo-classes Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Link Pseudo-classes Example</h2>
    <p><a href="https://www.example.com" class="link">This is a link</a></p>
    <p><a href="https://www.example.com" class="visited">This is a visited link</a></p>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 未访问链接样式 */
.link:link {
    color: blue;
    text-decoration: underline;
}

/* 已访问链接样式 */
.visited:visited {
    color: gray;
    text-decoration: line-through;
}
```

在这个示例中，我们有两个链接元素，一个未被访问，另一个已经被访问。我们使用了 `:link` 伪类选择器和 `:visited` 伪类选择器来分别为这两种状态的链接定义不同的样式。

- 未被访问的链接（`.link:link`）将会是蓝色的，并带有下划线。
- 已被访问的链接（`.visited:visited`）将会是灰色的，并带有删除线。

这样，当链接被访问时，它的样式会发生变化，以提供用户有关其访问状态的视觉反馈。

### 用户行为伪类

下面是一个用户行为伪类的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Action Pseudo-classes Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>User Action Pseudo-classes Example</h2>
    <button class="btn">Hover over me</button>
    <button class="btn">Click me</button>
    <input type="text" class="input">
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 鼠标悬停时的样式 */
.btn:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}

/* 按钮点击时的样式 */
.btn:active {
    background-color: #ccc;
}

/* 输入框获取焦点时的样式 */
.input:focus {
    border-color: blue;
    box-shadow: 0 0 5px rgba(0, 0, 255, 0.5);
}
```

在这个示例中，我们有两个按钮和一个输入框。我们使用了用户行为伪类来定义它们在不同用户操作下的样式变化：

- 鼠标悬停时（`.btn:hover`）按钮的背景颜色将变为灰色，并且鼠标指针将变为手型。
- 按钮被点击时（`.btn:active`），按钮的背景颜色将变为浅灰色。
- 输入框获取焦点时（`.input:focus`），输入框的边框颜色将变为蓝色，并且会添加一个浅蓝色的阴影。

这样，当用户与页面上的元素交互时，它们的样式会根据用户的行为发生变化，提供一种更丰富的用户体验。

### 结构伪类

结构伪类（Structural Pseudo-classes）允许你选择 HTML 结构中的特定元素，如第一个子元素、最后一个子元素、甚至是特定位置的子元素。以下是一个结构伪类的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Structural Pseudo-classes Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Structural Pseudo-classes Example</h2>
    <ul class="list">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
        <li>Item 5</li>
    </ul>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择第一个子元素 */
.list li:first-child {
    color: blue;
}

/* 选择最后一个子元素 */
.list li:last-child {
    color: red;
}

/* 选择偶数位置的子元素 */
.list li:nth-child(even) {
    background-color: #f0f0f0;
}

/* 选择奇数位置的子元素 */
.list li:nth-child(odd) {
    background-color: #ccc;
}
```

在这个示例中，我们有一个无序列表（`<ul>`）和其中的一些列表项（`<li>`）。我们使用了结构伪类来定义这些列表项在不同位置时的样式：

- 第一个子元素（`.list li:first-child`）将会被设置为蓝色文本。
- 最后一个子元素（`.list li:last-child`）将会被设置为红色文本。
- 偶数位置的子元素（`.list li:nth-child(even)`）将会被设置为灰色背景。
- 奇数位置的子元素（`.list li:nth-child(odd)`）将会被设置为浅灰色背景。

这样，我们就可以根据元素在结构中的位置来为它们应用不同的样式，从而使页面看起来更加动态和有趣。

### 表单相关伪类

表单相关伪类（Form-related Pseudo-classes）允许你选择表单元素的特定状态，如选中状态、禁用状态等。以下是一个表单相关伪类的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form-related Pseudo-classes Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Form-related Pseudo-classes Example</h2>
    <form>
        <input type="text" placeholder="Username" class="input">
        <input type="password" placeholder="Password" class="input">
        <input type="checkbox" id="checkbox">
        <label for="checkbox">Remember me</label>
        <button type="submit" class="btn">Submit</button>
    </form>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择被选中的复选框 */
input[type="checkbox"]:checked + label {
    font-weight: bold;
}

/* 选择被禁用的输入框 */
.input:disabled {
    background-color: #f0f0f0;
    color: #999;
    cursor: not-allowed;
}

/* 选择表单提交按钮的悬停状态 */
.btn[type="submit"]:hover {
    background-color: #ccc;
    cursor: pointer;
}
```

在这个示例中，我们有一个简单的表单，包括一个文本输入框、一个密码输入框、一个复选框、一个标签和一个提交按钮。我们使用了表单相关伪类来定义这些表单元素的不同状态下的样式：

- 被选中的复选框（`input[type="checkbox"]:checked + label`）将会被设置为粗体。
- 被禁用的输入框（`.input:disabled`）将会被设置为灰色背景、灰色文本，并且鼠标指针将变为不可用状态。
- 提交按钮的悬停状态（`.btn[type="submit"]:hover`）将会被设置为浅灰色背景，并且鼠标指针将变为手型。

这样，我们就可以根据表单元素的不同状态为其应用不同的样式，使得用户在与表单交互时可以得到视觉上的反馈。

### 状态伪类

状态伪类（State Pseudo-classes）允许你选择表单元素的特定状态，如有效状态、无效状态等。以下是一个状态伪类的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Pseudo-classes Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>State Pseudo-classes Example</h2>
    <form>
        <input type="text" placeholder="Enter your email" class="input" required>
        <input type="password" placeholder="Enter your password" class="input" required>
        <button type="submit" class="btn">Submit</button>
    </form>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择有效的输入框 */
.input:valid {
    border-color: green;
}

/* 选择无效的输入框 */
.input:invalid {
    border-color: red;
}

/* 选择表单提交按钮的禁用状态 */
.btn:disabled {
    background-color: #f0f0f0;
    color: #999;
    cursor: not-allowed;
}
```

在这个示例中，我们有一个简单的表单，包括一个邮箱输入框、一个密码输入框和一个提交按钮。我们使用了状态伪类来定义这些表单元素的不同状态下的样式：

- 有效的输入框（`.input:valid`）将会被设置为绿色边框。
- 无效的输入框（`.input:invalid`）将会被设置为红色边框。
- 提交按钮的禁用状态（`.btn:disabled`）将会被设置为灰色背景、灰色文本，并且鼠标指针将变为不可用状态。

这样，当用户在填写表单时，输入框的有效性会得到即时反馈，而且如果表单不完整或不符合规定，提交按钮会自动禁用，以防止用户提交不完整或无效的数据。





## 伪元素 pseudo-element

伪元素（pseudo-elements）是 CSS 中用于选择元素的特定部分或生成内容的机制。它们允许你在元素的内容之前或之后插入特定样式或内容，并且不需要添加额外的HTML元素。常见的伪元素包括 `::before` 和 `::after`，它们分别允许你在元素的内容之前和之后插入内容。

以下是一个伪元素的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pseudo-elements Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Pseudo-elements Example</h2>
    <div class="box"></div>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 使用伪元素在元素的内容之前插入内容 */
.box::before {
    content: "Before";
    background-color: #ccc;
    padding: 5px;
}

/* 使用伪元素在元素的内容之后插入内容 */
.box::after {
    content: "After";
    background-color: #f0f0f0;
    padding: 5px;
}
```

在这个示例中，我们有一个空的 `<div>` 元素，通过 CSS 中的伪元素 `::before` 和 `::after`，我们在这个 `<div>` 元素的内容之前和之后分别插入了一些内容。

- `::before` 伪元素插入了文本 "Before"，并且设置了一些样式，如背景颜色和内边距。
- `::after` 伪元素插入了文本 "After"，并且设置了一些样式，如背景颜色和内边距。

这样，我们就可以在不添加额外HTML元素的情况下，在元素的特定部分插入内容或样式，从而实现更丰富和灵活的页面设计。



## 属性选择器

属性选择器（Attribute Selectors）允许你根据元素的属性值来选择元素，并为其应用样式。属性选择器通常用于选择具有特定属性的元素或具有特定属性值的元素。

常见的属性选择器有以下几种形式：

1. **存在选择器**：选择具有指定属性的元素，不考虑属性值是什么。语法为`[attribute]`。
   
   ```css
   [title] {
       /* 样式规则 */
   }
   ```
   
2. **等值选择器**：选择具有指定属性和特定值的元素。语法为`[attribute=value]`。
   
   ```css
   [title="example"] {
       /* 样式规则 */
   }
   ```
   
3. **包含选择器**：选择具有指定属性值的元素，而且属性值中包含指定的值。语法为`[attribute*=value]`。
   
   ```css
   [href*="example"] {
       /* 样式规则 */
   }
   ```
   
4. **开始选择器**：选择具有指定属性值的元素，而且属性值以指定的值开头。语法为`[attribute^=value]`。
   
   ```css
   [src^="https"] {
       /* 样式规则 */
   }
   ```
   
5. **结束选择器**：选择具有指定属性值的元素，而且属性值以指定的值结尾。语法为`[attribute$=value]`。
   
   ```css
   [href$=".pdf"] {
       /* 样式规则 */
   }
   ```
   
6. **子串选择器**：选择具有指定属性值的元素，而且属性值是以指定的值开头并用连字符连接其他值的情况。语法为`[attribute|=value]`。
   
   ```css
   [lang|="en"] {
       /* 样式规则 */
   }
   ```

这些属性选择器可以根据需要选择具有特定属性或属性值的元素，并为其应用相应的样式。这为 CSS 提供了更多的选择和控制元素的能力。

### 存在选择器

下面是一个存在选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Existence Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Existence Selector Example</h2>
    <p title="example">This paragraph has a title attribute.</p>
    <p>This paragraph doesn't have a title attribute.</p>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择具有 title 属性的段落 */
[title] {
    color: blue;
}
```

在这个示例中，我们有两个段落元素 `<p>`，其中一个具有 `title` 属性，而另一个没有。我们使用了存在选择器 `[title]` 来选择具有 `title` 属性的段落元素，并为它们应用样式。

- 具有 `title` 属性的段落文本将会被设置为蓝色。

这样，我们就可以根据元素是否具有特定属性来选择并应用样式，从而实现更灵活的页面设计。

### 等值选择器

下面是一个等值选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equality Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Equality Selector Example</h2>
    <p class="category">Category: Food</p>
    <p class="category">Category: Drinks</p>
    <p class="category">Category: Food</p>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择类名为 category 且属性值为 "Food" 的段落 */
p.category[class="Food"] {
    color: green;
}
```

在这个示例中，我们有三个段落元素 `<p>`，它们都具有相同的类名 `category`，但是其中两个的属性值为 "Food"，另一个的属性值为 "Drinks"。我们使用了等值选择器 `p.category[class="Food"]` 来选择类名为 `category` 且属性值为 "Food" 的段落元素，并为它们应用样式。

- 类名为 `category` 且属性值为 "Food" 的段落文本将会被设置为绿色。

这样，我们就可以根据元素的类名和属性值来选择并应用样式，以实现更加精确的页面设计。

### 包含选择器

以下是一个包含选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Containment Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Containment Selector Example</h2>
    <a href="https://example.com">Visit Example</a>
    <a href="https://another-example.com">Visit Another Example</a>
    <a href="https://test.com">Test Link</a>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 href 属性值包含 "example" 的链接 */
a[href*="example"] {
    color: blue;
}
```

在这个示例中，我们有三个链接 `<a>` 元素，它们的 `href` 属性值分别包含 "example" 和 "test"。我们使用了包含选择器 `a[href*="example"]` 来选择 `href` 属性值中包含 "example" 的链接，并为它们应用样式。

- `href` 属性值包含 "example" 的链接文本将会被设置为蓝色。

这样，我们可以根据元素的属性值是否包含特定字符串来选择并应用样式，从而实现更灵活的页面设计。

### 开始选择器

以下是一个开始选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Start Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Start Selector Example</h2>
    <img src="https://example.com/image1.jpg" alt="Image 1">
    <img src="https://example.com/image2.jpg" alt="Image 2">
    <img src="https://test.com/image3.jpg" alt="Image 3">
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 src 属性值以 "https://" 开头的图片 */
img[src^="https://"] {
    border: 2px solid green;
}
```

在这个示例中，我们有三个图片 `<img>` 元素，它们的 `src` 属性值分别以 "https://" 和 "http://" 开头。我们使用了开始选择器 `img[src^="https://"]` 来选择 `src` 属性值以 "https://" 开头的图片，并为它们应用样式。

- `src` 属性值以 "https://" 开头的图片将会被设置为绿色的边框。

这样，我们可以根据元素的属性值是否以特定字符串开头来选择并应用样式，从而实现更加灵活的页面设计。

### 结束选择器

以下是一个结束选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>End Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>End Selector Example</h2>
    <a href="https://example.com">Example Link</a>
    <a href="https://test.com">Test Link</a>
    <a href="https://anotherexample.com">Another Example Link</a>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 href 属性值以 ".com" 结尾的链接 */
a[href$=".com"] {
    color: blue;
}
```

在这个示例中，我们有三个链接 `<a>` 元素，它们的 `href` 属性值分别以 ".com" 和 ".org" 结尾。我们使用了结束选择器 `a[href$=".com"]` 来选择 `href` 属性值以 ".com" 结尾的链接，并为它们应用样式。

- `href` 属性值以 ".com" 结尾的链接文本将会被设置为蓝色。

这样，我们可以根据元素的属性值是否以特定字符串结尾来选择并应用样式，从而实现更加灵活的页面设计。

### 子串选择器

以下是一个子串选择器的示例，包括 HTML 和 CSS 代码：

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Substring Selector Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Substring Selector Example</h2>
    <span lang="en-us">English</span>
    <span lang="en-uk">British English</span>
    <span lang="fr-fr">French</span>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 选择 lang 属性值以 "en" 开头的元素 */
span[lang|="en"] {
    color: blue;
}
```

在这个示例中，我们有三个 `<span>` 元素，它们的 `lang` 属性值分别为 "en-us"、"en-uk" 和 "fr-fr"。我们使用了子串选择器 `span[lang|="en"]` 来选择 `lang` 属性值以 "en" 开头的元素，并为它们应用样式。

- `lang` 属性值以 "en" 开头的元素文本将会被设置为蓝色。

这样，我们可以根据元素的属性值是否以指定字符串开头并用连字符连接其他值的情况来选择并应用样式，从而实现更加灵活的页面设计。





# 颜色

```css
p { color: #ff0000; } /*大小写无所谓*/
p { color: #f00; } /*FF0000的缩写*/
p { color: rgb(255,0,0); } /*三原色表示，0~255*/
```



## ---

在CSS中，有几种常见的颜色表示方法，包括：

1. **关键字（Keyword）**：一些常用颜色可以用其对应的英文单词表示，如 `red`、`blue`、`green`、`black` 等。

2. **十六进制（Hexadecimal）**：使用六位十六进制数表示颜色，每两位表示红、绿、蓝色值的组合。例如，纯红色可以表示为 `#FF0000`，纯白色可以表示为 `#FFFFFF`，纯黑色可以表示为 `#000000`。

3. **RGB（Red Green Blue）**：使用 `rgb()` 函数表示颜色，其中包含红、绿、蓝三个颜色通道的数值，取值范围为 0 到 255。例如，纯红色可以表示为 `rgb(255, 0, 0)`，纯白色可以表示为 `rgb(255, 255, 255)`。

4. **RGBA（Red Green Blue Alpha）**：与 RGB 类似，但增加了一个表示透明度的数值，取值范围为 0（完全透明）到 1（完全不透明）。例如，半透明的红色可以表示为 `rgba(255, 0, 0, 0.5)`。

5. **HSL（Hue Saturation Lightness）**：使用 `hsl()` 函数表示颜色，其中包含色相、饱和度和亮度三个参数。色相表示颜色在色轮上的位置（0 到 360），饱和度表示颜色的纯度（0% 到 100%），亮度表示颜色的亮度（0% 到 100%）。例如，纯红色可以表示为 `hsl(0, 100%, 50%)`。

6. **HSLA（Hue Saturation Lightness Alpha）**：与 HSL 类似，但增加了一个表示透明度的数值，取值范围为 0（完全透明）到 1（完全不透明）。例如，半透明的红色可以表示为 `hsla(0, 100%, 50%, 0.5)`。

这些不同的表示方法可以根据需要选择合适的颜色形式。



# 字体

在 CSS 中，字体样式的设置可以通过多种属性实现，以控制文本的外观和可读性。以下是一些常用的字体相关属性及其示例：

## 常用字体属性
1. **font-family**: 设置字体系列。
2. **font-size**: 设置字体大小。
3. **font-weight**: 设置字体粗细。
4. **font-style**: 设置字体样式（如斜体）。
5. **line-height**: 设置行高。
6. **color**: 设置字体颜色。

## 示例

HTML 代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Font Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Font Example</h2>
    <p class="font-example">This is an example paragraph to demonstrate various font styles in CSS.</p>
</body>
</html>
```

CSS 代码（styles.css）：
```css
/* 设置字体系列 */
.font-example {
    font-family: 'Arial', sans-serif;
}

/* 设置字体大小 */
.font-example {
    font-size: 16px;
}

/* 设置字体粗细 */
.font-example {
    font-weight: bold;
}

/* 设置字体样式 */
.font-example {
    font-style: italic;
}

/* 设置行高 */
.font-example {
    line-height: 1.5;
}

/* 设置字体颜色 */
.font-example {
    color: #333;
}
```

### 详细说明

1. **font-family**
   ```css
   .font-example {
       font-family: 'Arial', sans-serif;
   }
   ```
   - `'Arial'` 是首选字体，`sans-serif` 是后备字体。如果用户系统没有安装首选字体，浏览器会使用后备字体。

2. **font-size**
   ```css
   .font-example {
       font-size: 16px;
   }
   ```
   - `16px` 指定了字体大小。你也可以使用 `em`, `rem`, `%`, 或 `vw` 等单位。

3. **font-weight**
   ```css
   .font-example {
       font-weight: bold;
   }
   ```
   - `bold` 设置字体为粗体。你也可以使用数值（如 `400`，`700` 等）来表示不同的粗细程度。

4. **font-style**
   ```css
   .font-example {
       font-style: italic;
   }
   ```
   - `italic` 设置字体为斜体。其他值包括 `normal` 和 `oblique`。

5. **line-height**
   ```css
   .font-example {
       line-height: 1.5;
   }
   ```
   - `1.5` 设置行高为字体大小的 1.5 倍。这有助于提高文本的可读性。

6. **color**
   ```css
   .font-example {
       color: #333;
   }
   ```
   - `#333` 设置文本颜色为深灰色。你可以使用颜色名称，十六进制值，`rgb()` 或 `rgba()`，`hsl()` 或 `hsla()` 等格式。

## 综合使用

你也可以综合使用这些属性来一次性设置字体样式：

```css
.font-example {
    font: italic bold 16px/1.5 'Arial', sans-serif;
    color: #333;
}
```

以上的 `font` 属性结合了 `font-style`，`font-weight`，`font-size`，`line-height` 和 `font-family` 的设置。

这样，通过设置这些字体属性，你可以精确控制文本的显示效果，使你的页面更加美观和易读。

