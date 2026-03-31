/**
 * dom.js — Minimal DOM helpers.
 */
export const $ = (sel, ctx = document) => ctx.querySelector(sel)
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag)
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') el.className = val
    else if (key === 'textContent') el.textContent = val
    else if (key === 'innerHTML') el.innerHTML = val
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val)
    else el.setAttribute(key, val)
  }
  children.forEach((c) => {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c))
    else el.appendChild(c)
  })
  return el
}
