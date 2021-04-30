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
