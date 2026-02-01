# cnlunar-js

`cnlunar-js` 是 Python 农历库 [cnlunar](https://github.com/OPN48/cnLunar) 的 JavaScript/Node.js 移植版本。

## 使用要求
- Node.js 14.0.0 或更高版本
- 需要在 ES Module 环境下使用（.mjs 文件或 package.json 中有 "type": "module"）

## 安装

```bash
npm install cnlunar-js
```

## 快速上手

```javascript
import { Lunar } from 'cnlunar-js';

// 初始化日期（如 2024年2月10日 10:30）
const date = new Date(2024, 1, 10, 10, 30);
const lunar = new Lunar(date, '8char');

console.log(`农历: ${lunar.lunarYearCn}年 ${lunar.lunarMonthCn}${lunar.lunarDayCn}`);
console.log(`八字: ${lunar.year8Char} ${lunar.month8Char} ${lunar.day8Char} ${lunar.twohour8Char}`);
console.log(`今日宜: ${lunar.goodThing.join(', ')}`);
console.log(`今日忌: ${lunar.badThing.join(', ')}`);
```

## 功能涵盖

农历、黄历、二十四节气、节假日、星次、每日凶煞、每日值神、农历建除十二神、农历每日宜忌、彭祖百忌、每日五行、二十八星宿、天干地支、农历生辰八字、时辰凶吉

## 开发与测试

如果你需要运行完整的一致性验证流程：

1. 生成 Python 基准数据：`npm run test:gen`
2. 运行全量对比测试：`npm run full-check`

## 致谢

感谢原 Python 项目 [cnlunar](https://github.com/OPN48/cnLunar) 的作者 **OPN48** 提供的算法与数据支持。

## 许可证

[MIT License](./LICENSE)