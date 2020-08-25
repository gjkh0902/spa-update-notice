import 'vercel-toast-fork/dist/vercel-toast.css'
import { createToast } from 'vercel-toast-fork'

main()

function main() {
    if (process.env.NODE_ENV !== 'production') return

    // 当前应用版本
    const currentVersion = '{{currentVersion}}'

    // 上次访问时间 ms
    let lastSeenMS = 0

    // 1s
    const OneSecondMS = 1000

    const { dispatch } = createInterval(fetchVersion)

    let popupFlag = false

    checker()

    //窗口视图发生变化
    document.addEventListener('visibilitychange', checker)

    //url地址发生变化
    window.onhashchange = function() {
        console.log('URL发生变化了')
        checker()
    }

    //检测dom变化
    // let MutationObserver = window.MutationObserver ||
    //     window.WebKitMutationObserver ||
    //     window.MozMutationObserver
    // let observerMutationSupport = !!MutationObserver
    // let observer
    // if (observerMutationSupport) {
    //     observer = new MutationObserver(() => {
    //         console.log(1)
    //         checker()
    //     });
    //     const options = {
    //         "childList": true, //子节点的变动
    //         //"attributes": true, //属性的变动
    //         // "characterData": true, //节点内容或节点文本的变动
    //         "subtree": true //所有后代节点的变动
    //     };
    //     observer.observe(document, options);
    // }

    //倒计时10s内自动刷新
    let timeOutUpdate = 10
    let timeOutFunc

    // //倒计时10s
    function coutTime(index) {
        timeOutFunc = setTimeout(function() {
            if (index == 1) {
                //10s结束后的操作
                console.log(1)
                clearTimeout(timeOutFunc)
                window.location.reload()
            } else {
                console.log(2)
                coutTime(--index)
                document.querySelector('div.toast-inner .ok-button').innerHTML =
                    '立即刷新(' + index + 's)'
            }
        }, 1000)
    }

    //刷新页面
    function showRefreshPopup() {
        popupFlag = true
        dispatch('stopInterval')

        // 延后 1 秒显示以使得没有那么唐突
        setTimeout(() => {
            //console.log('load')
            //observer.disconnect();
            window.location.reload()
            createToast('hi，发现新版本可用。', {
                action: {
                    text: '立即刷新',
                    callback: () => {
                        clearTimeout(timeOutFunc)
                        window.location.reload()
                    }
                },
                cancel: {
                    text: '取消',
                    callback: els => {
                        clearTimeout(timeOutFunc)
                        els.destory()
                    }
                }
            })
            coutTime(timeOutUpdate)
        }, OneSecondMS)
    }

    function checker() {
        console.log('check')
        if (popupFlag) return

        if (document.hidden) {
            // 离开时
            lastSeenMS = Date.now()
            dispatch('stopInterval')
        } else {
            const currentMS = Date.now()

            // 防止10秒之内频繁切换
            if (currentMS - lastSeenMS > OneSecondMS * 10) {
                dispatch('immediate')
                dispatch('startInterval', { interval: OneSecondMS * 60 * 60 })
            }
        }
    }

    function fetchVersion() {
        fetch('{{VERSION_FILE_PATH}}' + '?_=' + Date.now())
            .then(res => res.text())
            .then(version => {
                if (compareVersion((version || '').trim(), currentVersion)) {
                    if (popupFlag) return
                    showRefreshPopup()
                }
            })
    }
}

/** @type {(newVersion: string, currentVersion: string) => boolean}*/
export function compareVersion(newVersion, currentVersion) {
    if (newVersion && currentVersion) {
        if (newVersion.includes('.') && currentVersion.includes('.')) {
            const n = newVersion.split('.')
            const c = currentVersion.split('.')

            console.log(n, c)

            for (let i = 0; i <= n.length; i++) {
                if (Number(n[i]) > Number(c[i] || 0)) return true
            }
        } else {
            console.log(newVersion, currentVersion)
            if (newVersion !== currentVersion) return true
        }
    }

    return false
}

function createInterval(callback) {
    let interval

    const startInterval = data => {
        interval = setInterval(callback, data.interval)
    }
    const stopInterval = () => clearInterval(interval)

    const cmd = {
        immediate: callback,
        startInterval,
        stopInterval
    }

    const dispatch = (command, data = {}) => {
        const fn = cmd[command] || (() => {})
        fn(data)
    }

    return { interval, dispatch }
}