# spa-update-notice

## Useage

```bash
yarn add spa-update-notice -S
```

```js
//vue.config.js
const SpaUpdate = require('spa-update-notice')
/*
  @options 可为空
  demo:
  options = {
    isNeedNotice: true,//提示用户更新，默认false
    versionFileName: 'test.txt' //生成的版本文件命名，默认update_popup_version.txt
  } 
*/
const config = {
  chainWebpack: config => {
    config.plugin('spa-update-notice').use(SpaUpdate, [options])
  }
}
```
