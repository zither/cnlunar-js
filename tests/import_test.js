import { Lunar } from '../src/index.js';

// 初始化日期（如 2024年2月10日 春节）
const date = new Date(2024, 1, 10, 10, 30);
const lunar = new Lunar(date, '8char');

console.log(`农历: ${lunar.lunarYearCn}年 ${lunar.lunarMonthCn}${lunar.lunarDayCn}`);
console.log(`八字: ${lunar.year8Char} ${lunar.month8Char} ${lunar.day8Char} ${lunar.twohour8Char}`);
console.log(`今日宜: ${lunar.goodThing.join(', ')}`);
console.log(`今日忌: ${lunar.badThing.join(', ')}`);