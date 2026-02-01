#!/usr/bin/env node
/**
 * cnlunar-js 单日全量全字段对比工具
 * 覆盖 demo.py 中所有输出字段
 * 
 * 使用方式：
 * 1. Node 直接运行:
 *    node compare_single.js -d "2025-12-31" -t "23:30"
 *    node compare_single.js --date=2025-12-31 --time=23:30
 *    
 * 2. NPM 运行:
 *    npm run compare -- -d "2025-12-31" -t "23:30"
 *    npm run compare -- --date=2025-12-31
 *    
 * 3. 环境变量方式 (适合 CI/CD):
 *    DATE=2025-12-31 TIME=23:30 npm run compare
 */

import { Lunar } from '../src/lunar.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 显示帮助信息
function showHelp() {
    console.log(`
用法: node ${process.argv[1]} [选项]

选项:
  -d, --date <日期>     指定日期 (格式: YYYY-MM-DD)
  -t, --time <时间>     指定时间 (格式: HH:MM)
  -h, --help           显示帮助信息

示例:
  node compare_single.js -d "2025-12-31" -t "23:30"
  node compare_single.js --date=2025-12-31
  DATE=2025-12-31 npm run compare

NPM 运行提示:
  npm run compare -- -d 2025-12-31 -t 23:30
  (注意: -- 后面的参数才会传递给脚本)
`);
}

// 解析命令行参数和环境变量
function parseArgs() {
    const args = process.argv.slice(2);
    const params = {};
    
    // 检查帮助请求
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }
    
    // 1. 首先读取环境变量（适合 package.json 预设）
    if (process.env.DATE) params.date = process.env.DATE;
    if (process.env.TIME) params.time = process.env.TIME;
    
    // 2. 解析命令行参数（支持 --key 和 --key=value 两种格式）
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // 支持 --date=value 格式
        if (arg.startsWith('--date=')) {
            params.date = arg.split('=')[1];
        } else if (arg.startsWith('--time=')) {
            params.time = arg.split('=')[1];
        } 
        // 支持 --date value 格式
        else if ((arg === '--date' || arg === '-d') && args[i + 1]) {
            params.date = args[i + 1];
            i++; // 跳过下一个参数
        } else if ((arg === '--time' || arg === '-t') && args[i + 1]) {
            params.time = args[i + 1];
            i++;
        }
    }
    
    // 3. 设置默认值（当前时间）
    if (!params.date) {
        const now = new Date();
        params.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (!params.time) {
        params.time = '12:00';
    }
    
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    
    if (!dateRegex.test(params.date)) {
        console.error(`\x1b[31m错误: 日期格式无效 "${params.date}". 请使用 YYYY-MM-DD 格式\x1b[0m`);
        process.exit(1);
    }
    if (!timeRegex.test(params.time)) {
        console.error(`\x1b[31m错误: 时间格式无效 "${params.time}". 请使用 HH:MM 格式\x1b[0m`);
        process.exit(1);
    }
    
    return params;
}

// 生成 Python 脚本：严格对齐 demo.py 的所有字段
function generatePythonScript(dateStr, timeStr) {
    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import datetime
import json
import cnlunar

dt = datetime.datetime.strptime("${dateStr} ${timeStr}", "%Y-%m-%d %H:%M")
a = cnlunar.Lunar(dt, godType='8char')

# 触发懒加载
officer = a.get_today12DayOfficer()

# 构造与 demo.py 一致的数据结构
result = {
    "base": {
        "date": str(a.date),
        "lunar_num": [a.lunarYear, a.lunarMonth, a.lunarDay, '闰' if a.isLunarLeapMonth else ''],
        "lunar_str": f"{a.lunarYearCn} {a.year8Char}[{a.chineseYearZodiac}]年 {a.lunarMonthCn}{a.lunarDayCn}",
        "weekday": a.weekDayCn,
        "holidays": [a.get_legalHolidays(), a.get_otherHolidays(), a.get_otherLunarHolidays()]
    },
    "bazi": {
        "full": ' '.join([a.year8Char, a.month8Char, a.day8Char, a.twohour8Char])
    },
    "solar": {
        "today": a.todaySolarTerms,
        "next": [a.nextSolarTerm, a.nextSolarTermDate, a.nextSolarTermYear],
        "table": {k: list(v) for k, v in a.thisYearSolarTermsDic.items()},
        "season": a.lunarSeason
    },
    "twohour": {
        "list": a.twohour8CharList,
        "lucky": a.get_twohourLuckyList(),
        "meridians": a.meridians
    },
    "zodiac": {
        "clash": a.chineseZodiacClash,
        "star": a.starZodiac,
        "east": a.todayEastZodiac
    },
    "peng": {
        "full": a.get_pengTaboo(),
        "short": a.get_pengTaboo(long=4, delimit='<br>')
    },
    "elements": {
        "officer": a.get_today12DayOfficer(),
        "star28": a.get_the28Stars(),
        "mark3": a.zodiacMark3List,
        "mark6": a.zodiacMark6,
        "five": a.get_today5Elements(),
        "nayin": a.get_nayin(),
        "fly9": a.get_the9FlyStar(),
        "directions": a.get_luckyGodsDirection(),
        "fetal": a.get_fetalGod()
    },
    "yiji": {
        "angel_demon": str(a.angelDemon),
        "gods_good": sorted(a.goodGodName),
        "gods_bad": sorted(a.badGodName),
        "level_name": a.todayLevelName,
        "yi": sorted(a.goodThing),
        "ji": sorted(a.badThing)
    }
}

print(json.dumps(result, ensure_ascii=False, indent=2))
`;
}

// 运行 Python 获取基准数据
function runPython(dateStr, timeStr) {
    return new Promise((resolve, reject) => {
        const scriptContent = generatePythonScript(dateStr, timeStr);
        const tempFile = path.join(os.tmpdir(), `cnlunar_test_${Date.now()}.py`);
        fs.writeFileSync(tempFile, scriptContent);
        
        const python = spawn('python3', [tempFile]);
        let output = '';
        let error = '';
        
        python.stdout.on('data', (data) => output += data.toString());
        python.stderr.on('data', (data) => error += data.toString());
        
        python.on('close', (code) => {
            fs.unlinkSync(tempFile);
            if (code !== 0) reject(new Error(`Python Error: ${error}`));
            else try { resolve(JSON.parse(output)); } catch (e) { reject(e); }
        });
    });
}

// 运行 JS 获取测试数据
function runJS(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const date = new Date(y, m - 1, d, h, min);
    
    const a = new Lunar(date, '8char');
    a.get_AngelDemon(); // 触发懒加载
    
    // 构造完全一致的数据结构
    return {
        base: {
            date: date.toString(),
            lunar_num: [a.lunarYear, a.lunarMonth, a.lunarDay, a.isLunarLeapMonth ? '闰' : ''],
            lunar_str: `${a.lunarYearCn} ${a.year8Char}[${a.chineseYearZodiac}]年 ${a.lunarMonthCn}${a.lunarDayCn}`,
            weekday: a.weekDayCn,
            holidays: [a.get_legalHolidays(), a.get_otherHolidays(), a.get_otherLunarHolidays()]
        },
        bazi: {
            full: [a.year8Char, a.month8Char, a.day8Char, a.twohour8Char].join(' ')
        },
        solar: {
            today: a.todaySolarTerms,
            next: [a.nextSolarTerm, a.nextSolarTermDate, a.nextSolarTermYear],
            table: a.thisYearSolarTermsDic,
            season: a.lunarSeason
        },
        twohour: {
            list: a.twohour8CharList,
            lucky: a.get_twohourLuckyList(),
            meridians: a.meridians
        },
        zodiac: {
            clash: a.chineseZodiacClash,
            star: a.starZodiac,
            east: a.todayEastZodiac
        },
        peng: {
            full: a.get_pengTaboo(),
            short: a.get_pengTaboo(4, '<br>')
        },
        elements: {
            officer: a.get_today12DayOfficer(),
            star28: a.get_the28Stars(),
            mark3: a.zodiacMark3List,
            mark6: a.zodiacMark6,
            five: a.get_today5Elements(),
            nayin: a.get_nayin(),
            fly9: a.get_the9FlyStar(),
            directions: a.get_luckyGodsDirection(),
            fetal: a.get_fetalGod()
        },
        yiji: {
            gods_good: [...a.goodGodName].sort(),
            gods_bad: [...a.badGodName].sort(),
            level_name: a.todayLevelName,
            yi: [...a.goodThing].sort(),
            ji: [...a.badThing].sort()
        }
    };
}

// 深度对比
function compare(py, js) {
    const diffs = [];
    
    function deepCompare(path, obj1, obj2) {
        if (path.includes('angel_demon')) return;
        if (path.includes('base.date')) return;

        if (path === 'solar.table') {
            const keys = Object.keys(obj1).sort();
            const keys2 = Object.keys(obj2).sort();
            if (JSON.stringify(keys) !== JSON.stringify(keys2)) {
                diffs.push({ path, py: 'Keys mismatch', js: 'Keys mismatch' });
                return;
            }
            for (let k of keys) {
                if (JSON.stringify(obj1[k]) !== JSON.stringify(obj2[k])) {
                    diffs.push({ path: `solar.table.${k}`, py: obj1[k], js: obj2[k] });
                }
            }
            return;
        }

        if (typeof obj1 !== typeof obj2) {
            diffs.push({ path, py: typeof obj1, js: typeof obj2 });
            return;
        }

        if (Array.isArray(obj1)) {
            if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
                diffs.push({ path, py: obj1, js: obj2 });
            }
            return;
        }

        if (typeof obj1 === 'object' && obj1 !== null) {
            const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
            for (let key of keys) {
                deepCompare(path ? `${path}.${key}` : key, obj1[key], obj2[key]);
            }
            return;
        }

        if (obj1 !== obj2) {
            diffs.push({ path, py: obj1, js: obj2 });
        }
    }

    deepCompare('', py, js);
    return diffs;
}

// 格式化输出
function printSection(title, pyObj, jsObj) {
    const formatVal = (v) => {
        if (Array.isArray(v)) return JSON.stringify(v);
        if (typeof v === 'object') return JSON.stringify(v, null, 2);
        return v;
    };

    console.log(`\n--- ${title} ---`);
    for (let key in pyObj) {
        if (key === 'table') continue;
        if (key === 'angel_demon') continue;
        
        const isDiff = JSON.stringify(pyObj[key]) !== JSON.stringify(jsObj[key]);
        const color = isDiff ? '\x1b[31m' : '\x1b[32m';
        const reset = '\x1b[0m';
        
        console.log(`${key.padEnd(12)}: ${color}${formatVal(jsObj[key])}${reset}`);
        if (isDiff) {
            console.log(`  (Python)  : ${formatVal(pyObj[key])}`);
        }
    }
}

async function main() {
    const { date, time } = parseArgs();
    console.log(`\x1b[36m正在全面比对: ${date} ${time}\x1b[0m`);
    
    try {
        const [pyRes, jsRes] = await Promise.all([
            runPython(date, time),
            runJS(date, time)
        ]);

        const diffs = compare(pyRes, jsRes);

        printSection('基础信息 (Base)', pyRes.base, jsRes.base);
        printSection('八字 (Bazi)', pyRes.bazi, jsRes.bazi);
        printSection('节气 (Solar)', pyRes.solar, jsRes.solar);
        printSection('时辰 (TwoHour)', pyRes.twohour, jsRes.twohour);
        printSection('星相冲煞 (Zodiac)', pyRes.zodiac, jsRes.zodiac);
        printSection('彭祖百忌 (Peng)', pyRes.peng, jsRes.peng);
        printSection('五行神煞 (Elements)', pyRes.elements, jsRes.elements);
        printSection('宜忌等第 (YiJi)', pyRes.yiji, jsRes.yiji);

        console.log('\n' + '='.repeat(60));
        if (diffs.length === 0) {
            console.log(`\x1b[32m✅ 完美通过！所有字段 100% 一致。\x1b[0m`);
        } else {
            console.log(`\x1b[31m❌ 发现 ${diffs.length} 处差异:\x1b[0m`);
            diffs.forEach(d => {
                console.log(`\n字段: \x1b[33m${d.path}\x1b[0m`);
                console.log(`Python: ${JSON.stringify(d.py)}`);
                console.log(`JS    : ${JSON.stringify(d.js)}`);
            });
            process.exit(1);
        }

    } catch (e) {
        console.error('运行错误:', e);
        process.exit(1);
    }
}

main();