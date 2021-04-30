/**
 * 剪切文字
 */

function clipboard(text) {
  let copyFrom = document.createElement('textarea')
  copyFrom.textContent = text
  copyFrom.textContent = text
  copyFrom.style.border = '0'
  copyFrom.style.padding = '0'
  copyFrom.style.margin = '0'
  copyFrom.style.position = 'absolute'
  let xPosition = '-9999px'
  let yPosition =
    (window.pageYOffset || document.documentElement.scrollTop) + 'px'
  copyFrom.style.left = xPosition
  copyFrom.style.top = yPosition
  document.body.appendChild(copyFrom)
  copyFrom.focus()
  document.execCommand('SelectAll')
  document.execCommand('Copy')
  document.body.removeChild(copyFrom)
}
