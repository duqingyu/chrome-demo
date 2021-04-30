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
