#!/usr/bin/env node
/**
 * cnlunar-js 演示脚本
 * 对应 Python demo.py 的核心功能
 */

import { Lunar } from '../src/lunar.js'; // 根据实际路径调整

console.log('八字月柱与八字日柱算神煞版本\n');

// 测试用例 1：常规算法
console.log('1. 常规算法 demo 应输出 壬寅');
let a = new Lunar(new Date(2026, 0, 29, 1, 30), { godType: '8char' });
printLunarInfo(a);

// 测试用例 2：八字立春切换算法
//console.log('\n2. 八字立春切换算法 1986-11-1 07:00  demo 应输出 丙寅');
//a = new Lunar(new Date(1986, 10, 1, 7, 0), { godType: '8char', year8Char: 'beginningOfSpring' });
//printLunarInfo(a);

// 测试用例 3：八字立春切换算法
//console.log('\n3. 八字立春切换算法 2022-2-3 10:30  demo 应输出 辛丑');
//a = new Lunar(new Date(2022, 1, 3, 10, 30), { godType: '8char', year8Char: 'beginningOfSpring' });
//printLunarInfo(a);

// 测试用例 4：常规算法
//console.log('\n4. 常规算法 2024-2-4 10:30  demo 应输出 癸卯');
//a = new Lunar(new Date(2024, 1, 4, 10, 30), { godType: '8char' });
//printLunarInfo(a);

// 测试用例 5：八字立春切换算法
//console.log('\n5. 八字立春切换算法 2024-2-4 10:30  demo 应输出 甲辰');
//a = new Lunar(new Date(2024, 1, 4, 10, 30), { godType: '8char', year8Char: 'beginningOfSpring' });
//printLunarInfo(a);

/**
 * 打印农历信息（对应 Python demo 的输出格式）
 */
function printLunarInfo(lunar) {
    const dic = {
        '日期': lunar.date.toLocaleString(),
        '农历数字': `(${lunar.lunarYear}, ${lunar.lunarMonth}, ${lunar.lunarDay}, ${lunar.isLunarLeapMonth ? "'闰'" : ""})`,
        '农历': `${lunar.lunarYearCn} ${lunar.year8Char}[${lunar.chineseYearZodiac}]年 ${lunar.lunarMonthCn}${lunar.lunarDayCn}`,
        '星期': lunar.weekDayCn,
        '今日节日': `(${lunar.get_legalHolidays()}, ${lunar.get_otherHolidays()}, ${lunar.get_otherLunarHolidays()})`,
        '八字': `${lunar.year8Char} ${lunar.month8Char} ${lunar.day8Char} ${lunar.twohour8Char}`,
        '今日节气': lunar.todaySolarTerms,
        '下一节气': `(${lunar.nextSolarTerm}, ${lunar.nextSolarTermDate}, ${lunar.nextSolarTermYear})`,
        '今年节气表': lunar.thisYearSolarTermsDic,
        '季节': lunar.lunarSeason,
        '今日时辰': lunar.twohour8CharList,
        '时辰凶吉': lunar.get_twohourLuckyList(),
        '生肖冲煞': lunar.chineseZodiacClash,
        '星座': lunar.starZodiac,
        '星次': lunar.todayEastZodiac,
        '彭祖百忌': lunar.get_pengTaboo(),
        '彭祖百忌精简': lunar.get_pengTaboo(4, '<br>'),
        '十二神': lunar.get_today12DayOfficer(),
        '廿八宿': lunar.get_the28Stars(),
        '今日三合': lunar.zodiacMark3List,
        '今日六合': lunar.zodiacMark6,
        '今日五行': lunar.get_today5Elements(),
        '纳音': lunar.get_nayin(),
        '九宫飞星': lunar.get_the9FlyStar(),
        '吉神方位': lunar.get_luckyGodsDirection(),
        '今日胎神': lunar.get_fetalGod(),
        '神煞宜忌': lunar.angelDemon,
        '今日吉神': lunar.goodGodName,
        '今日凶煞': lunar.badGodName,
        '宜忌等第': lunar.todayLevelName,
        '宜': lunar.goodThing,
        '忌': lunar.badThing,
        '时辰经络': lunar.meridians
    };

    for (const [key, value] of Object.entries(dic)) {
        const tabsNeeded = Math.max(1, 3 - Math.ceil(key.length / 8));
        const midstr = '\t'.repeat(tabsNeeded) + ':' + '\t';
        console.log(key, midstr, value);
    }
}

console.log('\n' + '='.repeat(80));

// 可选：issues test 部分（取鱼测试）
//console.log('\n=== issues test（取鱼测试）===');
//let count = 0;
//let now = new Date(2022, 1, 4, 12, 30); // 2022-02-04 12:30
//
//for (let i = 1; i <= 1000; i++) {
//    const n = new Lunar(now, { godType: '8char' });
//    now.setDate(now.getDate() + 1); // 增加一天
//    
//    if (Array.isArray(n.goodThing) && n.goodThing.includes('取鱼')) {
//        count++;
//        console.log(`找到"取鱼"宜事: ${now.toLocaleDateString()}, 累计: ${count}`);
//    }
//}
//console.log(`测试完成，共找到 ${count} 次"取鱼"宜事`);
//
//console.log('\n' + '='.repeat(80));

// 农历月份与八字日柱算神煞版本（不推荐）
//console.log(`
//农历月份与八字日柱算神煞版本，月神随月建顺行者，
//算出来2019年2月4日是危日，虽然与书中卷九相符，
//但与市面上其他日历不符，不推荐此算法，
//推荐用默认月柱日柱算法`);
//
//const testDate = new Date(2019, 1, 4, 22, 30); // 2019-02-04 22:30
//const lunarCn = new Lunar(testDate, { godType: 'cnlunar' });
//console.log(`测试日期: ${testDate.toLocaleString()}`);
//console.log(`八字: ${lunarCn.year8Char} ${lunarCn.month8Char} ${lunarCn.day8Char} ${lunarCn.twohour8Char}`);
//console.log(`日柱: ${lunarCn.day8Char}`);
//console.log(`宜: ${lunarCn.goodThing}`);
//console.log(`忌: ${lunarCn.badThing}`);
//
//console.log('\n演示结束！');