# cnlunar-js

`cnlunar-js` 是 Python 农历库 [cnlunar](https://github.com/OPN48/cnLunar) 的 JavaScript/Node.js 移植版本。

## 安装

```bash
npm install cnlunar-js
```

## 快速上手

```javascript
import { Lunar } from 'cnlunar-js';

// 初始化日期（如 2024年2月10日 春节）
const date = new Date(2024, 1, 10, 10, 30);
const lunar = new Lunar(date, '8char');

console.log(`农历: ${lunar.lunarYearCn}年 ${lunar.lunarMonthCn}${lunar.lunarDayCn}`);
console.log(`八字: ${lunar.year8Char} ${lunar.month8Char} ${lunar.day8Char} ${lunar.twohour8Char}`);
console.log(`今日宜: ${lunar.goodThing.join(', ')}`);
console.log(`今日忌: ${lunar.badThing.join(', ')}`);
```

## 功能涵盖

- **农历信息**：年、月、日、闰月判定、月相。
- **干支八字**：年柱、月柱、日柱、时柱（支持立春切换算法）。
- **节气信息**：24节气查询、全年节气表。
- **择日神煞**：十二神、廿八宿、九宫飞星、吉神/凶神方位、胎神。
- **生活百科**：彭祖百忌、生肖冲煞、五行纳音、时辰经络。

## 开发与测试

如果你需要运行完整的一致性验证流程：

1. 生成 Python 基准数据：`npm run test:gen`
2. 运行全量对比测试：`npm run full-check`

## 致谢

感谢原 Python 项目 [cnlunar](https://github.com/OPN48/cnLunar) 的作者 **OPN48** 提供的算法与数据支持。

## 许可证

[MIT License](./LICENSE)