// import 'vercel-toast-fork/dist/vercel-toast.css'
// import { createToast } from 'vercel-toast-fork'

main()

function main() {
    if (process.env.NODE_ENV !== 'production') return

    // 当前应用版本
    const currentVersion = '{{currentVersion}}'

    //是否需要主动提醒用户
    //const isNeedNotice = '{{isNeedNotice}}'

    // 上次访问时间 ms
    let lastSeenMS = 0

    // 1s
    const OneSecondMS = 1000

    const { dispatch } = createInterval(fetchVersion)

    let popupFlag = false

    //开始检测
    checker()

    //窗口视图发生变化
    document.addEventListener('visibilitychange', checker)

    //检测dom变化
    let MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver
    let observerMutationSupport = !!MutationObserver
    if (observerMutationSupport) {
        let observer = new MutationObserver(function() {
            let nowUrlHref = window.location.href
            if (sessionStorage.getItem('nowUrlHref')) {
                //跳转页面
                if (sessionStorage.getItem('nowUrlHref') !== nowUrlHref) {
                    checker()
                    sessionStorage.setItem('nowUrlHref', nowUrlHref)
                }
            } else {
                //初始化页面
                checker()
                sessionStorage.setItem('nowUrlHref', nowUrlHref)
            }
        });
        const options = {
            "childList": true, //子节点的变动
            //"attributes": true, //属性的变动
            // "characterData": true, //节点内容或节点文本的变动
            "subtree": true //所有后代节点的变动
        };
        observer.observe(document.body, options);
    }

    //倒计时10s内自动刷新
    // let timeOutUpdate = 10
    // let timeOutFunc

    // // //倒计时10s-通知用户更新
    // function coutTime (index) {
    //   timeOutFunc = setTimeout(function () {
    //     if (index == 1) {
    //       //10s结束后的操作
    //       clearTimeout(timeOutFunc)
    //       window.location.reload()
    //     } else {
    //       coutTime(--index)
    //       document.querySelector('div.toast-inner .ok-button').innerHTML =
    //         '立即刷新(' + index + 's)'
    //     }
    //   }, 1000)
    // }

    //刷新页面
    function showRefreshPopup() {
        popupFlag = true
        dispatch('stopInterval')

        // 延后 1 秒显示以使得没有那么唐突
        setTimeout(() => {
            window.location.reload()
                // if (!isNeedNotice) { //静默刷新
                //   window.location.reload()
                // } else { //通知用户刷新
                //   createToast('hi，发现新版本可用。', {
                //     action: {
                //       text: '立即刷新',
                //       callback: () => {
                //         clearTimeout(timeOutFunc)
                //         window.location.reload()
                //       }
                //     },
                //     cancel: {
                //       text: '取消',
                //       callback: els => {
                //         clearTimeout(timeOutFunc)
                //         els.destory()
                //       }
                //     }
                //   })
                //   coutTime(timeOutUpdate)
                // }
        }, OneSecondMS)
    }

    function checker() {
        //console.log('check')
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

    //获取版本
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
        //console.log(newVersion, currentVersion)
        if (newVersion.includes('.') && currentVersion.includes('.')) {
            const n = newVersion.split('.')
            const c = currentVersion.split('.')

            //console.log(n, c)

            for (let i = 0; i <= n.length; i++) {
                if (Number(n[i]) > Number(c[i] || 0)) return true
            }
        } else {
            //console.log(newVersion, currentVersion)
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