---
title: "Promise"
---

## Promise 概述

JavaScript 的 Promise 对象表示一个异步操作的最终完成（或失败）及其结果值。与传统的回调函数相比，Promise 提供了一种更简洁和更易于管理的方式来处理异步操作。

## 创建一个 Promise

你可以使用 `Promise` 构造函数来创建一个 Promise，它接受一个函数（执行器）作为参数。这个函数有两个参数：`resolve` 和 `reject`。

```javascript
const myPromise = new Promise((resolve, reject) => {
    // 异步操作
    let success = true; // 示例条件
    if (success) {
        resolve('操作成功');
    } else {
        reject('操作失败');
    }
});
```

## 处理 Promise

创建 Promise 之后，可以使用 `.then()` 和 `.catch()` 方法来处理其最终的成功或失败。

```javascript
myPromise
    .then((result) => {
        console.log(result); // '操作成功'
    })
    .catch((error) => {
        console.error(error); // '操作失败'
    });
```

## 链式 Promise

你可以在 `.then()` 回调中返回另一个 Promise，从而将多个异步操作串联在一起。

```javascript
myPromise
    .then((result) => {
        console.log(result);
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve('另一个操作成功'), 2000);
        });
    })
    .then((result) => {
        console.log(result); // '另一个操作成功'
    })
    .catch((error) => {
        console.error(error);
    });
```

## 使用 `Promise.all`

`Promise.all` 允许你等待多个 Promise 完成。它接受一个 Promise 数组，并返回一个新的 Promise，当所有输入的 Promise 都已解决时，它将解决，或如果其中任何一个 Promise 被拒绝，它将拒绝。

```javascript
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
    setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then((values) => {
    console.log(values); // [3, 42, 'foo']
});
```

## 使用 `Promise.race`

`Promise.race` 返回一个 Promise，当数组中的任何一个 Promise 首先解决或拒绝时，它就会解决或拒绝。

```javascript
const promise1 = new Promise((resolve, reject) => {
    setTimeout(resolve, 500, 'one');
});

const promise2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 100, 'two');
});

Promise.race([promise1, promise2]).then((value) => {
    console.log(value); // 'two'
});
```

## 使用 `async` 和 `await`

`async` 和 `await` 是建立在 Promise 之上的语法糖，使异步代码看起来更像同步代码。

```javascript
async function example() {
    try {
        const result1 = await myPromise;
        console.log(result1); // '操作成功'

        const result2 = await new Promise((resolve, reject) => {
            setTimeout(() => resolve('另一个操作成功'), 2000);
        });
        console.log(result2); // '另一个操作成功'
    } catch (error) {
        console.error(error); // '操作失败'
    }
}

example();
```

## 总结

- **创建 Promise：** 使用 `Promise` 构造函数和 `resolve` 与 `reject` 回调。
- **处理 Promise：** 使用 `.then()` 处理成功，使用 `.catch()` 处理错误。
- **链式 Promise：** 在 `.then()` 中返回另一个 Promise 来链式调用异步操作。
- **Promise.all：** 等待多个 Promise 完成。
- **Promise.race：** 当其中一个 Promise 完成时立即响应。
- **Async/Await：** 简化处理 Promise，使异步代码看起来像同步代码。

Promise 帮助编写更简洁和可维护的异步代码，减少了深度嵌套的回调，也就是所谓的“回调地狱”。



## setInterval

`setInterval` 是 JavaScript 中用于创建定时器的一种方法，可以按指定的时间间隔（以毫秒为单位）重复执行一个函数或代码片段。

## 基本用法

```javascript
setInterval(function, delay, arg1, arg2, ...);
```

- `function`：要执行的函数。
- `delay`：每次调用函数之间的时间间隔，以毫秒为单位。
- `arg1, arg2, ...`（可选）：传递给函数的参数。

## 示例

### 简单示例

下面的示例每秒（1000 毫秒）输出一次 "Hello, World!"。

```javascript
function sayHello() {
    console.log("Hello, World!");
}

setInterval(sayHello, 1000);
```

### 使用匿名函数

你也可以使用匿名函数直接在 `setInterval` 中定义要执行的代码。

```javascript
setInterval(() => {
    console.log("Hello, World!");
}, 1000);
```

### 传递参数

如果需要给回调函数传递参数，可以将这些参数放在 `setInterval` 调用中。

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}

setInterval(greet, 1000, 'Alice');
```

## 停止定时器

`setInterval` 返回一个定时器 ID，可以使用 `clearInterval` 方法来停止定时器。

```javascript
const intervalId = setInterval(() => {
    console.log("This will run every second");
}, 1000);

setTimeout(() => {
    clearInterval(intervalId);
    console.log("Interval cleared");
}, 5000);
```

在这个示例中，定时器每秒运行一次，但在 5 秒后被停止。

## 注意事项

- **精度问题**：`setInterval` 的实际执行间隔可能比预期的要长，因为 JavaScript 是单线程的，其他代码的执行可能会影响定时器的精度。
- **递归调用**：如果需要更精确的间隔，可以考虑使用递归调用 `setTimeout` 来代替 `setInterval`。

```javascript
function recursiveTimeout() {
    console.log("Hello, World!");
    setTimeout(recursiveTimeout, 1000);
}

recursiveTimeout();
```

使用 `setTimeout` 可以确保在前一个操作完成后再开始下一个操作，这样可以减少由于代码执行时间造成的时间漂移。

## 总结

- **创建定时器**：使用 `setInterval` 按固定间隔重复执行函数。
- **停止定时器**：使用 `clearInterval` 并传入定时器 ID。
- **参数传递**：可以在 `setInterval` 中传递参数给回调函数。
- **替代方案**：为了更精确的定时，可以使用递归 `setTimeout`。

## setInterval + Promise

结合 `setInterval` 和 `Promise` 可以实现一些复杂的异步操作，比如在固定时间间隔内重复执行一个异步任务，直到满足某个条件。这里有几个示例来说明如何将两者结合使用。

### 示例 1: 使用 `setInterval` 创建一个基于时间间隔的轮询机制

假设我们需要每秒检查一次某个条件，当条件满足时停止检查并返回结果。我们可以使用 `Promise` 和 `setInterval` 来实现这个功能。

```javascript
function pollUntil(conditionFn, interval, timeout) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const intervalId = setInterval(() => {
            if (conditionFn()) {
                clearInterval(intervalId);
                resolve('Condition met');
            } else if (Date.now() - startTime > timeout) {
                clearInterval(intervalId);
                reject(new Error('Polling timed out'));
            }
        }, interval);
    });
}

// 示例使用
let conditionMet = false;

// 模拟条件在5秒后满足
setTimeout(() => {
    conditionMet = true;
}, 5000);

pollUntil(() => conditionMet, 1000, 10000)
    .then(result => {
        console.log(result); // 'Condition met'
    })
    .catch(error => {
        console.error(error); // 'Polling timed out' if condition not met within 10 seconds
    });
```

### 示例 2: 使用 `setInterval` 处理重复的异步操作

有时候我们需要在固定时间间隔内重复执行一个异步操作，比如每隔一段时间从服务器获取数据。我们可以使用 `Promise` 和 `setInterval` 来处理这种情况。

```javascript
function fetchData() {
    // 模拟一个异步操作，例如从服务器获取数据
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Fetched data');
        }, 500); // 模拟网络延迟
    });
}

function fetchDataAtInterval(interval, times) {
    return new Promise((resolve, reject) => {
        let count = 0;
        const intervalId = setInterval(() => {
            fetchData().then(result => {
                console.log(result);
                count++;
                if (count >= times) {
                    clearInterval(intervalId);
                    resolve('All data fetched');
                }
            }).catch(error => {
                clearInterval(intervalId);
                reject(error);
            });
        }, interval);
    });
}

// 示例使用
fetchDataAtInterval(1000, 5)
    .then(result => {
        console.log(result); // 'All data fetched' after fetching 5 times
    })
    .catch(error => {
        console.error(error); // Handle any error that occurs during fetching
    });
```

### 注意事项

- **处理错误**：在 `setInterval` 回调中执行的异步操作可能会失败，因此需要在 `Promise` 中适当处理错误，以确保 `clearInterval` 在出现错误时被调用。
- **确保定时器停止**：在满足条件或发生错误时，及时调用 `clearInterval` 停止定时器，以避免不必要的资源消耗。

通过结合 `setInterval` 和 `Promise`，可以有效地管理和控制异步任务的执行，并根据需要在特定的时间间隔内重复执行操作或检查条件。这种方法在实现轮询、定时任务等场景中非常有用。



## setTimeout

`setTimeout` 是 JavaScript 中用于设置一个定时器，以便在指定的时间延迟（以毫秒为单位）之后执行一个函数或代码片段的方法。与 `setInterval` 不同，`setTimeout` 只执行一次。

## 基本用法

```javascript
setTimeout(function, delay, arg1, arg2, ...);
```

- `function`：要执行的函数。
- `delay`：延迟时间，以毫秒为单位。
- `arg1, arg2, ...`（可选）：传递给函数的参数。

## 示例

### 简单示例

下面的示例在 3 秒（3000 毫秒）后输出 "Hello, World!"。

```javascript
function sayHello() {
    console.log("Hello, World!");
}

setTimeout(sayHello, 3000);
```

### 使用匿名函数

你也可以使用匿名函数直接在 `setTimeout` 中定义要执行的代码。

```javascript
setTimeout(() => {
    console.log("Hello, World!");
}, 3000);
```

### 传递参数

如果需要给回调函数传递参数，可以将这些参数放在 `setTimeout` 调用中。

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}

setTimeout(greet, 3000, 'Alice');
```

## 清除定时器

`setTimeout` 返回一个定时器 ID，可以使用 `clearTimeout` 方法来取消定时器。

```javascript
const timeoutId = setTimeout(() => {
    console.log("This will not be shown");
}, 3000);

clearTimeout(timeoutId);
```

在这个示例中，定时器在延迟时间到达之前被取消，所以回调函数不会执行。

## 使用 `setTimeout` 实现递归调用

`setTimeout` 可以用于创建一个递归调用，以便在前一个操作完成后再开始下一个操作，这样可以更精确地控制时间间隔。

```javascript
function recursiveTimeout() {
    console.log("Hello, World!");
    setTimeout(recursiveTimeout, 1000);
}

recursiveTimeout();
```

这种方式可以减少由于代码执行时间造成的时间漂移，比 `setInterval` 更精确。

## 注意事项

- **延迟时间**：`setTimeout` 的延迟时间并不保证精确，JavaScript 的单线程模型和其他代码的执行可能会影响定时器的精度。
- **嵌套超时**：递归调用 `setTimeout` 可以确保在前一个操作完成后再开始下一个操作，这对于需要精确间隔的操作是一个不错的选择。

## 总结

- **创建定时器**：使用 `setTimeout` 在指定延迟后执行函数。
- **清除定时器**：使用 `clearTimeout` 并传入定时器 ID。
- **参数传递**：可以在 `setTimeout` 中传递参数给回调函数。
- **递归调用**：为了更精确的间隔，可以使用递归 `setTimeout`。

`setTimeout` 提供了一种简单的方法来执行延迟操作，在处理异步任务时非常有用。

## setTimeout + Promise

结合 `setTimeout` 和 `Promise` 可以实现一些异步操作，比如在一定时间后执行某个任务，并使用 `Promise` 来处理任务完成后的结果。下面是一些示例，展示如何将 `setTimeout` 和 `Promise` 结合使用。

### 示例 1: 创建一个延迟函数

可以创建一个返回 `Promise` 的延迟函数，在指定的时间后解决（resolve）Promise。

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 示例使用
delay(2000).then(() => {
    console.log('2 seconds have passed');
});
```

### 示例 2: 使用 `setTimeout` 模拟异步操作

假设我们有一个模拟的异步操作，比如从服务器获取数据，可以使用 `setTimeout` 和 `Promise` 来模拟这种操作。

```javascript
function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = true; // 模拟操作成功
            if (success) {
                resolve('Data fetched successfully');
            } else {
                reject('Failed to fetch data');
            }
        }, 2000);
    });
}

// 示例使用
fetchData().then(data => {
    console.log(data); // 'Data fetched successfully'
}).catch(error => {
    console.error(error); // 'Failed to fetch data'
});
```

### 示例 3: 使用 `Promise` 和 `setTimeout` 实现递归调用

使用 `Promise` 和递归的 `setTimeout` 可以实现类似 `setInterval` 的功能，但可以在每次调用之间进行更精确的控制。

```javascript
function repeatAsyncOperation(operation, interval, times) {
    return new Promise((resolve, reject) => {
        let count = 0;

        function executeOperation() {
            if (count >= times) {
                resolve('Operation completed');
                return;
            }

            operation().then(result => {
                console.log(result);
                count++;
                setTimeout(executeOperation, interval);
            }).catch(error => {
                reject(error);
            });
        }

        executeOperation();
    });
}

// 示例使用
function asyncOperation() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('Async operation completed');
        }, 500); // 模拟异步操作延迟
    });
}

repeatAsyncOperation(asyncOperation, 1000, 5)
    .then(message => {
        console.log(message); // 'Operation completed' after 5 executions
    })
    .catch(error => {
        console.error(error);
    });
```

### 示例 4: 在 `setTimeout` 中传递参数

可以在 `setTimeout` 中传递参数给回调函数，并在 `Promise` 中使用这些参数。

```javascript
function delayedGreeting(name, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Hello, ${name}!`);
        }, delay);
    });
}

// 示例使用
delayedGreeting('Alice', 3000).then(greeting => {
    console.log(greeting); // 'Hello, Alice!' after 3 seconds
});
```

### 注意事项

- **处理错误**：在使用 `Promise` 时需要注意错误处理，特别是在异步操作中可能出现的错误。使用 `catch` 方法来捕获和处理这些错误。
- **控制调用次数**：在递归调用中，确保有终止条件，以避免无限递归导致的栈溢出或其他性能问题。

通过结合 `setTimeout` 和 `Promise`，可以实现各种延迟和异步操作，从而更好地控制代码执行的时序和行为。这些方法在处理异步任务、模拟延迟操作以及实现递归调用等场景中非常有用。



## Promise.then

`Promise.then()` 方法是 JavaScript 中处理异步操作的核心工具之一。它用于在一个 Promise 对象的异步操作完成（resolve）后，执行某个回调函数，并返回一个新的 Promise。`then` 方法允许我们通过链式调用来顺序处理异步任务。

## 基本用法

```javascript
promise.then(onFulfilled, onRejected);
```

- `onFulfilled`：当 Promise 成功解决时执行的回调函数。它接收 Promise 的结果作为参数。
- `onRejected`：当 Promise 被拒绝时执行的回调函数。它接收拒绝原因作为参数。这是可选的，如果不提供，可以用 `catch` 方法处理错误。

## 示例

### 简单示例

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Success!");
    }, 1000);
});

promise.then((result) => {
    console.log(result); // "Success!" after 1 second
});
```

### 处理错误

你可以通过 `then` 方法的第二个参数处理错误，也可以使用 `catch` 方法。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject("Error!");
    }, 1000);
});

promise.then(
    (result) => {
        console.log(result);
    },
    (error) => {
        console.error(error); // "Error!" after 1 second
    }
);

// 或者使用 catch 方法
promise.then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error); // "Error!" after 1 second
});
```

## 链式调用

`then` 方法返回一个新的 Promise，这使得我们可以通过链式调用来顺序处理多个异步操作。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Step 1");
    }, 1000);
});

promise.then((result) => {
    console.log(result); // "Step 1"
    return "Step 2";
}).then((result) => {
    console.log(result); // "Step 2"
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Step 3");
        }, 1000);
    });
}).then((result) => {
    console.log(result); // "Step 3" after another 1 second
});
```

## 示例：顺序执行异步操作

假设我们有三个异步操作需要依次执行，可以通过链式调用 `then` 方法来实现。

```javascript
function asyncOperation1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Operation 1 completed");
            resolve("Result 1");
        }, 1000);
    });
}

function asyncOperation2() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Operation 2 completed");
            resolve("Result 2");
        }, 1000);
    });
}

function asyncOperation3() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Operation 3 completed");
            resolve("Result 3");
        }, 1000);
    });
}

asyncOperation1()
    .then((result) => {
        console.log(result); // "Result 1"
        return asyncOperation2();
    })
    .then((result) => {
        console.log(result); // "Result 2"
        return asyncOperation3();
    })
    .then((result) => {
        console.log(result); // "Result 3"
    });
```

## 处理错误

通过在链式调用的最后添加 `catch` 方法，可以捕获链中任何一个 Promise 被拒绝时的错误。

```javascript
asyncOperation1()
    .then((result) => {
        console.log(result);
        return asyncOperation2();
    })
    .then((result) => {
        console.log(result);
        // 模拟一个错误
        throw new Error("Something went wrong");
        return asyncOperation3();
    })
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error.message); // "Something went wrong"
    });
```

## 总结

- **基本用法**：`then` 方法用于在 Promise 成功解决后执行回调，并返回一个新的 Promise。
- **错误处理**：可以通过 `then` 方法的第二个参数或 `catch` 方法来处理错误。
- **链式调用**：`then` 方法返回一个新的 Promise，允许顺序处理多个异步操作。
- **错误捕获**：在链式调用的最后添加 `catch` 方法，捕获链中任何一个 Promise 被拒绝时的错误。

通过合理使用 `then` 方法，能够更清晰、更顺序地管理异步操作，编写出更易于理解和维护的代码。

## Promise.catch

`Promise.catch()` 方法是 JavaScript Promise 对象的一部分，用于处理 Promise 在被拒绝（rejected）时的情况。它的功能类似于 `then` 方法的第二个参数，但 `catch` 方法专门用于捕获和处理错误，通常放在 Promise 链的末尾。

## 基本用法

```javascript
promise.catch(onRejected);
```

- `onRejected`：一个函数，当 Promise 被拒绝时执行，它接收拒绝的原因作为参数。

## 示例

### 捕获错误

创建一个 Promise，如果它被拒绝，就使用 `catch` 方法捕获错误。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('Something went wrong!');
    }, 1000);
});

promise.catch((error) => {
    console.error(error); // "Something went wrong!" after 1 second
});
```

### 与 `then` 一起使用

你可以在 `then` 方法之后使用 `catch` 方法来处理任何可能的错误。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Success!');
    }, 1000);
});

promise
    .then((result) => {
        console.log(result); // "Success!" after 1 second
        throw new Error('Error after success'); // 模拟一个错误
    })
    .catch((error) => {
        console.error(error.message); // "Error after success"
    });
```

### 捕获链中的错误

`catch` 方法不仅捕获它前面直接的 Promise 的错误，也捕获链中任何 Promise 的错误。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Step 1');
    }, 1000);
});

promise
    .then((result) => {
        console.log(result); // "Step 1"
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('Error in step 2');
            }, 1000);
        });
    })
    .then((result) => {
        console.log(result); // 这个不会被执行
    })
    .catch((error) => {
        console.error(error); // "Error in step 2"
    });
```

## 示例：处理异步操作中的错误

假设我们有一系列异步操作，并希望捕获这些操作中的任何错误。

```javascript
function asyncOperation1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Operation 1 completed");
            resolve("Result 1");
        }, 1000);
    });
}

function asyncOperation2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Operation 2 completed");
            resolve("Result 2");
        }, 1000);
    });
}

function asyncOperation3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Operation 3 failed");
        }, 1000);
    });
}

asyncOperation1()
    .then((result) => {
        console.log(result); // "Result 1"
        return asyncOperation2();
    })
    .then((result) => {
        console.log(result); // "Result 2"
        return asyncOperation3();
    })
    .then((result) => {
        console.log(result); // 不会被执行
    })
    .catch((error) => {
        console.error(error); // "Operation 3 failed"
    });
```

## 总结

- **基本用法**：`catch` 方法用于捕获 Promise 被拒绝时的错误。
- **与 `then` 配合使用**：`catch` 方法通常放在 `then` 方法之后，用于处理链中的任何错误。
- **捕获链中的错误**：`catch` 方法会捕获链中任何一个 Promise 被拒绝时的错误。
- **提高代码可读性**：使用 `catch` 方法可以使代码中的错误处理更为清晰和一致。

通过使用 `catch` 方法，可以更有效地管理和处理 Promise 链中的错误，使代码更加健壮和可靠。



## Promise.resolve

`Promise.resolve()` 方法返回一个以给定值解析后的 Promise 对象。该方法对于将现有值包装成 Promise 对象，或者快速创建一个已经解析的 Promise 非常有用。

## 基本用法

```javascript
Promise.resolve(value);
```

- `value`：将作为这个 Promise 的解析结果。如果该值本身是一个 Promise，那么返回这个 Promise；如果该值是一个 thenable（即带有 `then` 方法的对象），返回的 Promise 会跟随这个 thenable 最终被解析或拒绝；否则返回的 Promise 将以该值解析。

## 示例

### 创建一个已解析的 Promise

```javascript
let resolvedPromise = Promise.resolve("Success!");
resolvedPromise.then((value) => {
    console.log(value); // "Success!"
});
```

### 将现有的 Promise 包装成新的 Promise

如果传入的值已经是一个 Promise 对象，那么 `Promise.resolve` 会直接返回这个 Promise。

```javascript
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Resolved!");
    }, 1000);
});

let wrappedPromise = Promise.resolve(promise);
wrappedPromise.then((value) => {
    console.log(value); // "Resolved!" after 1 second
});
```

### 处理 thenable 对象

`Promise.resolve` 也可以处理 thenable 对象（带有 `then` 方法的对象），并将其转换为 Promise 对象。

```javascript
let thenable = {
    then: function(resolve, reject) {
        setTimeout(() => {
            resolve("Thenable resolved!");
        }, 1000);
    }
};

let promise = Promise.resolve(thenable);
promise.then((value) => {
    console.log(value); // "Thenable resolved!" after 1 second
});
```

## 使用场景

### 确保函数返回 Promise

有时我们希望确保一个函数始终返回一个 Promise，可以使用 `Promise.resolve` 来包裹可能是同步或异步的返回值。

```javascript
function maybeAsync(value) {
    if (value instanceof Promise) {
        return value;
    } else {
        return Promise.resolve(value);
    }
}

// 示例使用
maybeAsync("Hello").then((value) => {
    console.log(value); // "Hello"
});

maybeAsync(Promise.resolve("World")).then((value) => {
    console.log(value); // "World"
});
```

### 链接到现有的 Promise 链中

在 Promise 链中，你可能需要将现有的值包装成一个 Promise，以便将其链接到链中。

```javascript
Promise.resolve("Initial value")
    .then((value) => {
        console.log(value); // "Initial value"
        return "Next value";
    })
    .then((value) => {
        console.log(value); // "Next value"
        return Promise.resolve("Final value");
    })
    .then((value) => {
        console.log(value); // "Final value"
    });
```

## 总结

- **创建已解析的 Promise**：使用 `Promise.resolve` 可以快速创建一个已解析的 Promise。
- **包装现有的 Promise 或 thenable**：`Promise.resolve` 可以将现有的 Promise 或 thenable 对象包装成一个新的 Promise。
- **确保函数返回 Promise**：使用 `Promise.resolve` 确保函数始终返回一个 Promise 对象。
- **链接 Promise 链**：在 Promise 链中使用 `Promise.resolve` 将值转换为 Promise，以便继续链式调用。

`Promise.resolve` 是一个非常实用的方法，可以帮助我们简化异步操作，使代码更加一致和易于维护。

## Promise.reject

`Promise.reject()` 方法返回一个带有拒绝原因的 Promise 对象。这个方法主要用于快速创建一个已拒绝的 Promise，便于在代码中处理错误情况。

## 基本用法

```javascript
Promise.reject(reason);
```

- `reason`：Promise 被拒绝的原因，通常是一个错误对象或描述错误的字符串。

## 示例

### 创建一个已拒绝的 Promise

```javascript
let rejectedPromise = Promise.reject("Something went wrong!");
rejectedPromise.catch((error) => {
    console.error(error); // "Something went wrong!"
});
```

### 使用 `Promise.reject` 处理错误

可以使用 `Promise.reject` 来模拟一个异步操作中的错误情况。

```javascript
function asyncOperation() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Operation failed!");
        }, 1000);
    });
}

asyncOperation().catch((error) => {
    console.error(error); // "Operation failed!" after 1 second
});
```

### 链接到现有的 Promise 链中

`Promise.reject` 也可以在 Promise 链中使用，以便在特定条件下拒绝 Promise。

```javascript
Promise.resolve("Initial value")
    .then((value) => {
        console.log(value); // "Initial value"
        // 模拟一个错误条件
        if (true) {
            return Promise.reject("Error in chain!");
        }
        return "Next value";
    })
    .then((value) => {
        // 这个不会被执行
        console.log(value);
    })
    .catch((error) => {
        console.error(error); // "Error in chain!"
    });
```

## 使用场景

### 标准化错误处理

在处理异步操作时，可以使用 `Promise.reject` 来标准化错误处理逻辑。

```javascript
function fetchData(url) {
    if (!url) {
        return Promise.reject(new Error("Invalid URL"));
    }
    return new Promise((resolve, reject) => {
        // 模拟异步操作
        setTimeout(() => {
            if (url === "http://example.com") {
                resolve("Data from example.com");
            } else {
                reject("Failed to fetch data");
            }
        }, 1000);
    });
}

fetchData("http://example.com")
    .then((data) => {
        console.log(data); // "Data from example.com"
    })
    .catch((error) => {
        console.error(error);
    });

fetchData("")
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error(error.message); // "Invalid URL"
    });
```

### 在测试中使用

在单元测试中，可以使用 `Promise.reject` 来模拟函数的错误输出，便于测试错误处理逻辑。

```javascript
function getUserData(userId) {
    if (!userId) {
        return Promise.reject("Invalid user ID");
    }
    return new Promise((resolve, reject) => {
        // 模拟获取用户数据的异步操作
        setTimeout(() => {
            resolve({ id: userId, name: "Alice" });
        }, 1000);
    });
}

// 测试错误处理
getUserData(null).catch((error) => {
    console.error(error); // "Invalid user ID"
});
```

## 总结

- **创建已拒绝的 Promise**：使用 `Promise.reject` 可以快速创建一个已拒绝的 Promise。
- **模拟错误情况**：在异步操作中使用 `Promise.reject` 来模拟错误情况。
- **标准化错误处理**：在异步函数中使用 `Promise.reject` 标准化错误处理逻辑。
- **测试**：在单元测试中使用 `Promise.reject` 模拟函数的错误输出，测试错误处理逻辑。

`Promise.reject` 是一个非常有用的方法，可以帮助我们在处理异步操作时，快速创建和处理拒绝的 Promise，使代码更具可读性和维护性。

## ---

## Promise 简单示例

```js
let p1 = new Promise( // 成功有成功的结果，失败有失败的理由
    (resolve, reject) => {
        /** 参数说明
         * resolve, reject 这是形参，代表未来由js引擎提供注入2个实参给你，两个对应的函数
         * resolve, reject 都是单参函数
         * resolve, reject 互斥，用了其中一个，另一个就没用了
         * 
         * executor 是一个程序员写好的函数，内部写教给Promise做的事情；
         * 最后一定要选择resolve或reject中的一个调用一下，调用时它们都是单参函数；
         * resolve(value)调用返回fulfilled状态表示成功；
         * reject(reason)调用返回rejected表示失败；
         * <pending> 准备报告结果，正在执行中;
         * 创建Promise会立刻执行executor。
         */
        try {
            console.log('executor 执行了')
            resolve('成功了')
        }
        catch {
            reject('失败了')
        }
        console.log('executor bye ~~~')
    }
)
/*
executor 执行了
executor bye ~~~
 */

console.log(p1) // Promise { '成功了' }
```



## Promise + setInterval + setTimeout