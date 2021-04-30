# crawler
谷歌插件Demo

# 15分钟撸一个谷歌插件采集器
### 背景
- 前段时间由于公司业务需要，需要爬取国外很多服装网站数据，刚刚开始用node <font color=#666 size=6 >**superagent**</font>模块爬取一些比较传统没啥反爬的网站还是挺舒服，喝杯茶时间可能就爬完一个网站所有数据了
- 好景不长，由于需要爬取的网站比较多，对一些稍微有校验的网站，superagent很快就GG了，于是还是回归老实用无头浏览器的方式**puppeteer**去爬数据,它还是比较给力,可以轻松屏蔽webdriver、设置ip，甚至滑块验证码等登录校验，基本能解决95%以上的网站了。
- 直到有一天公司要采集1688商品详情,发现它有很强的反爬机制，不仅有滑块验证（很难去模拟拖动通过它），最开始前端同事分析了一下cookie,发现可以登录后直接写死cookie去抓取，不过这得需要每次更新cookie，比较繁琐。
- 公司需求不是针对全站商品，是她们针对指定的商品链接采集,换句话说，就是她们已经进入到商品详情页给到你URL，你去采集对应URL的信息到自己公司系统
- 针对这种页面，**谷歌插件**可以说是真香了，不用考虑登录之类的操作，直接采集就完事了。
### 前言
- 只要有HTML,CSS,JS基础，再阅读下文档,分分钟就能写一个谷歌插件,本文用最简单的方式写一个获取页面HTML,获取页面Cookie,获取页面标题的效果,其实只要获取到HTML,爬虫还不简单吗哈哈~
### 效果

![title.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87ed34bbe3574aa0b3d6908cc11dd68f~tplv-k3u1fbpfcp-watermark.image)

![cookie.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff5adc6934dd4395968df88e63b7e85d~tplv-k3u1fbpfcp-watermark.image)
### 开始
- 目录分析

![1619755536(1).png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ae993f2d646467aa5bc1311e8383bc8~tplv-k3u1fbpfcp-watermark.image)

   - css: ***放一些公共的css***
     - reset.css
     - popup.css
   - imgs：***存放img***
   - js: ***业务逻辑的js***
     - clipboard.js ***复制文本js***
     - popup.js ***插件页面popupjs***
     - content_script.js ***你当前打开的那个页面会执行你这个js***
     - background.js ***接口实现放这里***
   - plugins
     - axios-0.21.1 ***引入axios,用来请求***
   - background.html ***后台页面,可以理解就是你谷歌插件的一个后台管理(非必须)***
   - manifest.json ***配置文件，就类似uni-app那种配置的东西***
   - popup.html ***谷歌插件的页面文件***
   
  ##### 分析一下
1.   css和img用来放一些样式文件，没什么讲的
2.   js里面主要是content_script.js
3.   plugins是引入axios库而已
4.   popup.html比较重要,它是页面展示文件

 ##### step1: 新建目录
 也就那么几个文件,暂且理解为类似vue,和react那样固定命名，如App.vue那样的入口文件
 ##### step2: 修改manifest.json
 
```json
{
  "name": "crawler",
  "manifest_version": 2,
  "version": "1.0.0",
  "author": "duqingyu",
  "description": "crawler-demo",
  "browser_action": {
    "default_title": "我的谷歌插件",//鼠标移上去谷歌插件时候的提示标题
    "default_popup": "popup.html" //这个配置就是popup.html,鼠标移上去谷歌插件就会显示这个html
  },
  "icons": {
    "16": "imgs/logo.png", // 找个logo放在imgs目录下就好了,我的logo就是我上图的那个红牛
    "24": "imgs/logo.png",
    "48": "imgs/logo.png"
  },
  "background": {
    "page": "background.html" //写死就行,其实这里本文并没涉及,可以忽略
  },
  "permissions": [ //一些权限配置,本文涉及到的就是这么几个
    "tabs", //tabs获取当前页
    "notifications", //桌面弹框提示
    "cookies", //获取cookie
    "http://*/*",
    "https://*/*",
    "declarativeContent"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://*/*", //配置content_scirpt.js注入到哪些页面,我们这里是任何页面都允许
        "http://*/*"
      ],
      "js": [
        "js/clipboard.js", //注入clipboard.js用来复制文本
        "js/content_script.js" //注入content_scirpt.js
      ],
      "run_at": "document_start"
    }
  ]
}
```
##### step3: 修改popup.html

```hmtl
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>我的采集器</title>
  <link rel="stylesheet" href="css/reset.css" />
  <link rel="stylesheet" href="css/popup.css" />
</head>
<script src="js/popup.js" type="module"></script>

<body>
  <div class="popup-wrapper">
    <div class="title">采集界面</div>
    <ul class="content-box">
      <li id="crawlerPageHtml" class="item">
        <img class="icon" src="./imgs/html.png" />
        <span class="text">获取页面HTML</span>
      </li>
      <li class="item">
        <img class="icon" src="./imgs/cookie.png" />
        <input class="input" id="cookieKey" type="text" placeholder="请输入key值">
        <button class="btn" id="crawlerPageCookie">获取Cookie</button>
      </li>
      <li id="crawlerPageTitle" class="item">
        <img class="icon" src="./imgs/title.png" />
        <span class="text">获取页面标题</span>
      </li>
      </li>
    </ul>
  </div>
</body>

</html>
```
- 此时鼠标移动上去已经可以看到效果了,只是没有加任何js脚本而已

##### step4: 修改popup.js,为popup添加事件

```js
// 获取当前tabId
function getCurrentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0])
    })
  })
}

// 桌面通知
function notification({ iconUrl, title, content }) {
  chrome.notifications.create(null, {
    type: 'basic',
    title,
    iconUrl: iconUrl || 'imgs/tip.png',
    // imageUrl: imgUrl,
    message: content,
    contextMessage: '谷歌采集'
  })
}

// 初始化
function init() {
  const crawlerPageHtml = document.getElementById('crawlerPageHtml')
  crawlerPageHtml.onclick = crawlerHtml
  const crawlerPageCookie = document.getElementById('crawlerPageCookie')
  crawlerPageCookie.onclick = crawlerCookie
  const crawlerPageTitle = document.getElementById('crawlerPageTitle')
  crawlerPageTitle.onclick = crawlerTitle
}

// 获取页面HTML
async function crawlerHtml() {
  const tab = await getCurrentTab()
  tab && getHtml(tab)
}
// 获取页面Cookie
async function crawlerCookie() {
  const tab = await getCurrentTab()
  tab && getCookie(tab)
}
// 获取页面标题
async function crawlerTitle() {
  const tab = await getCurrentTab()
  tab && getTitle(tab)
}

function getHtml(tab) {
  chrome.tabs.sendMessage(tab.id, { type: 'html' }, async data => {
    alert(data)
    notification({
      title: '获取HTML采集结果提示',
      content: '采集成功'
    })
    // 接下来可以愉快地去做一些ajax请求去发送到服务器了..
    // const bgTab = chrome.extension.getBackgroundPage()
    // const res = await bgTab.sendData(data)
    // notification({
    //   title: '采集结果提示',
    //   content: res.code === 1 ? '采集成功' : res.msg || '采集失败'
    // })

  })
}

function getCookie(tab) {
  const name = document.getElementById('cookieKey').value
  if (!name) {
    return notification({
      title: '获取Cookie结果提示',
      content: '请输入Cookie对应的key值'
    })
  }
  chrome.cookies.get({ url: tab.url, name }, cookie => {
    if (!cookie) {
      return notification({
        title: '获取Cookie结果提示',
        content: '没有找到响应的cookie,请清除缓存刷新重试'
      })
    }
    console.log(23, cookie);
    const cookieText = `${cookie.name}=${cookie.value}`
    copyCookie(tab, cookieText)
  })
}
function copyCookie(tab, cookie) {
  chrome.tabs.sendMessage(tab.id, { type: 'clipboard', text: cookie }, () => {
    notification({
      title: '获取Cookie结果提示',
      content: 'Cookie已经复制到剪切板'
    })
  })
}

function getTitle(tab) {
  return notification({
    title: '获取页面标题提示',
    content: tab.title
  })
}

init()

```
 - chrome.tabs和chrome.notifications是谷歌内置的变量,可以用来获取当前页签和弹框等(上面配置了权限的)
 - 这里的代码就是初始化了一下绑定监听事件
 - **注意js不要写内联,谷歌插件不支持**
  ##### step5: 修改content_scirpt,让popup能和当前页面与通信
  
```js
// 监听
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === 'html') {
    const node = document.querySelector('html')
    sendResponse(node.innerHTML)
  } else if (msg.type === 'clipboard') {
    // 复制到剪切板
    await clipboard(msg.text)
    sendResponse()
  }
  // 继续添加事件
  // code...
})

```
- content_scirpt.js当你打开新页面的时候会注入到你当前页面,它能执行dom相关Api
- 所以在这里可以直接document.querySelector('html')获取html,再返回给popup
- clipboard方法也是之前配置manifest的时候指明了的
- 当到这一步的时候其实功能基本都实现了,可以愉快的将数据处理一下发到服务器了~

##### step6 发送ajax（本文不涉及,稍微讲一下）
- 在plugins目录下有下载好的axios.js
- 在background.js引入,所有接口Api相关操作对于简单的插件可以直接放到background,简单粗暴。
```html
=======background.html=======
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>后台控制页面</title>
</head>

<body>
  这是后台控制页面
</body>
<script src="plugins/axios-0.21.1.js"></script>
<script src="js/background.js"></script>

</html>

```
```js
=======background.js=======
/**
 * 数据传输
 * @param {String} username 用户名
 * @param {String} data 数据
 */
async function sendData({
  username,
  data
} = {}) {
  return axios.post('/api/...', {
    username,
    data
  })
}

```
##### 安装

![build.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d84266bab15405eb74860eba1c84ca3~tplv-k3u1fbpfcp-watermark.image)
- 进入谷歌扩展管理页,直接加载我们新建的那个文件夹就可以了
- 想法给其他人打包一下发个crx文件直接点一下打包选一下目录就完事了
##### 总结一下
1. popup写好插件页面
2. popup.js绑定事件,当需要获取dom之类的时候,通过chrome.tabs.sendMessage事件机制与conent_scirpt通信获取页面节点等数据获取其他操作
3. 获取到数据再通过axios去和服务器交互
4. 对于一些需求,用谷歌插件还是很吃香的

##### 附上
1. [完整源码github,求star](https://github.com/duqingyu/chrome-demo)
2. [个人博客](https://www.duqingyu.top/)

###### 欢迎各位巨佬交流其他前端/后端技术
 