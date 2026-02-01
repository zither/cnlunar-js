// tests/comprehensive_test.js
import { Lunar } from '../src/lunar.js';
import fs from 'fs';
import readline from 'readline';

const BENCHMARK_FILE = '../scripts/full_test.json';
const REPORT_FILE = './test_report.json';
const HTML_REPORT = './test_report.html';

// 辅助：深度比较两个对象/数组是否相等
function isEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

class ComprehensiveTester {
    constructor() {
        if (!fs.existsSync(BENCHMARK_FILE)) {
            console.error(`❌ 找不到基准文件: ${BENCHMARK_FILE}`);
            console.error("请先运行 python scripts/generate_full_test.py 生成数据");
            process.exit(1);
        }
        
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        
        // 字段检查映射表 (保持不变)
        this.checkers = {
            'lunar': this.checkLunarBasic.bind(this),
            'bazi': this.checkBazi.bind(this),
            'solar_terms': this.checkSolarTerms.bind(this),
            'deities': this.checkDeities.bind(this),
            'clash': this.checkClash.bind(this),
            'five_elements': this.checkFiveElements.bind(this),
            'peng_taboo': this.checkPengTaboo.bind(this),
            'two_hour': this.checkTwoHour.bind(this),
            'directions': this.checkDirections.bind(this),
            'fetal_god': this.checkFetalGod.bind(this),
            'yi_ji': this.checkYiJi.bind(this),
            'god_names': this.checkGodNames.bind(this),
            'level': this.checkLevel.bind(this),
            'holidays': this.checkHolidays.bind(this)
        };
    }

    async run() {
        console.log(`🚀 开始全量全功能对比测试 (Stream模式)...`);
        
        const startTime = Date.now();
        const fileStream = fs.createReadStream(BENCHMARK_FILE);
        
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        
        // 逐行处理
        for await (const line of rl) {
            if (!line.trim()) continue;
            
            try {
                const item = JSON.parse(line);
                this.testSingle(item);
                lineCount++;
                
                if (lineCount % 1000 === 0) {
                    process.stdout.write(`\r⏳ 已处理: ${lineCount} 条`);
                }
            } catch (e) {
                console.error(`解析错误 (行 ${lineCount}):`, e.message);
            }
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n\n⏱️  测试耗时: ${duration}秒`);
        this.generateReport();
    }

    testSingle(expected) {
        this.results.total++;
        const [y, m, d, h, min] = expected.input_date.match(/\d+/g).map(Number);
        const date = new Date(y, m - 1, d, h, min);
        
        try {
            const lunar = new Lunar(date, '8char');
            // 确保懒加载属性被计算
            lunar.get_AngelDemon(); 
            
            let passed = true;
            const itemErrors = [];
            
            // 执行所有字段检查
            for (const [key, checker] of Object.entries(this.checkers)) {
                try {
                    const result = checker(lunar, expected);
                    if (!result.success) {
                        passed = false;
                        itemErrors.push(...result.errors.map(e => `[${key}] ${e}`));
                    }
                } catch (e) {
                    passed = false;
                    itemErrors.push(`[${key}] 代码执行异常: ${e.message}`);
                }
            }
            
            if (passed) {
                this.results.passed++;
            } else {
                this.results.failed++;
                // 仅收集前200个错误，防止内存溢出
                if (this.results.errors.length < 200) {
                    this.results.errors.push({
                        date: expected.input_date,
                        errors: itemErrors
                    });
                }
            }
            
        } catch (e) {
            this.results.failed++;
            if (this.results.errors.length < 200) {
                this.results.errors.push({
                    date: expected.input_date,
                    fatal_error: `初始化异常: ${e.message}`
                });
            }
        }
    }

    // === 检查器实现 (保持不变，直接复制之前的逻辑) ===
    checkLunarBasic(lunar, exp) {
        const errors = [];
        const l = exp.lunar;
        if (lunar.lunarYear !== l.year) errors.push(`year: ${lunar.lunarYear} != ${l.year}`);
        if (lunar.lunarMonth !== l.month) errors.push(`month: ${lunar.lunarMonth} != ${l.month}`);
        if (lunar.lunarDay !== l.day) errors.push(`day: ${lunar.lunarDay} != ${l.day}`);
        if (lunar.isLunarLeapMonth !== l.is_leap) errors.push(`leap: ${lunar.isLunarLeapMonth} != ${l.is_leap}`);
        if (lunar.lunarYearCn !== l.year_cn) errors.push(`year_cn: ${lunar.lunarYearCn} != ${l.year_cn}`);
        if (lunar.lunarMonthCn !== l.month_cn) errors.push(`month_cn: ${lunar.lunarMonthCn} != ${l.month_cn}`);
        if (lunar.lunarDayCn !== l.day_cn) errors.push(`day_cn: ${lunar.lunarDayCn} != ${l.day_cn}`);
        if (lunar.weekDayCn !== l.week_day) errors.push(`week: ${lunar.weekDayCn} != ${l.week_day}`);
        if (lunar.lunarSeason !== l.season) errors.push(`season: ${lunar.lunarSeason} != ${l.season}`);
        if (lunar.chineseYearZodiac !== l.zodiac_year) errors.push(`zodiac: ${lunar.chineseYearZodiac} != ${l.zodiac_year}`);
        return { success: errors.length === 0, errors };
    }

    checkBazi(lunar, exp) {
        const errors = [];
        const b = exp.bazi;
        if (lunar.year8Char !== b.year) errors.push(`year: ${lunar.year8Char} != ${b.year}`);
        if (lunar.month8Char !== b.month) errors.push(`month: ${lunar.month8Char} != ${b.month}`);
        if (lunar.day8Char !== b.day) errors.push(`day: ${lunar.day8Char} != ${b.day}`);
        if (lunar.twohour8Char !== b.hour) errors.push(`hour: ${lunar.twohour8Char} != ${b.hour}`);
        if (lunar.yearEarthNum !== b.year_num) errors.push(`yNum: ${lunar.yearEarthNum} != ${b.year_num}`);
        if (lunar.monthEarthNum !== b.month_num) errors.push(`mNum: ${lunar.monthEarthNum} != ${b.month_num}`);
        if (lunar.dayEarthNum !== b.day_num) errors.push(`dNum: ${lunar.dayEarthNum} != ${b.day_num}`);
        return { success: errors.length === 0, errors };
    }

    checkSolarTerms(lunar, exp) {
        const errors = [];
        const s = exp.solar_terms;
        if (lunar.todaySolarTerms !== s.today) errors.push(`today: ${lunar.todaySolarTerms} != ${s.today}`);
        if (lunar.nextSolarTerm !== s.next_name) errors.push(`next: ${lunar.nextSolarTerm} != ${s.next_name}`);
        const nextDateStr = `${String(lunar.nextSolarTermDate[0]).padStart(2, '0')}-${String(lunar.nextSolarTermDate[1]).padStart(2, '0')}`;
        if (nextDateStr !== s.next_date) errors.push(`next_date: ${nextDateStr} != ${s.next_date}`);
        if (lunar.nextSolarTermYear !== s.next_year) errors.push(`next_year: ${lunar.nextSolarTermYear} != ${s.next_year}`);
        if (!isEqual(lunar.thisYearSolarTermsDic, s.this_year_table)) errors.push(`节气表不匹配`);
        return { success: errors.length === 0, errors };
    }

    checkDeities(lunar, exp) {
        const errors = [];
        const d = exp.deities;
        if (lunar.today12DayOfficer !== d.officer12) errors.push(`12officer: ${lunar.today12DayOfficer} != ${d.officer12}`);
        if (lunar.today12DayGod !== d.god12) errors.push(`12god: ${lunar.today12DayGod} != ${d.god12}`);
        if (lunar.dayName !== d.day_type) errors.push(`day_type: ${lunar.dayName} != ${d.day_type}`);
        if (lunar.today28Star !== d.star28) errors.push(`28star: ${lunar.today28Star} != ${d.star28}`);
        if (lunar.get_the9FlyStar() !== d.fly9) errors.push(`fly9: ${lunar.get_the9FlyStar()} != ${d.fly9}`);
        if (lunar.starZodiac !== d.star_zodiac) errors.push(`star_zodiac: ${lunar.starZodiac} != ${d.star_zodiac}`);
        if (lunar.todayEastZodiac !== d.east_zodiac) errors.push(`east_zodiac: ${lunar.todayEastZodiac} != ${d.east_zodiac}`);
        return { success: errors.length === 0, errors };
    }

    checkClash(lunar, exp) {
        const errors = [];
        const c = exp.clash;
        if (lunar.chineseZodiacClash !== c.desc) errors.push(`desc: ${lunar.chineseZodiacClash} != ${c.desc}`);
        if (!isEqual(lunar.zodiacMark3List, c.mark3)) errors.push(`mark3不匹配`);
        if (lunar.zodiacMark6 !== c.mark6) errors.push(`mark6: ${lunar.zodiacMark6} != ${c.mark6}`);
        return { success: errors.length === 0, errors };
    }

    checkFiveElements(lunar, exp) {
        const errors = [];
        const f = exp.five_elements;
        if (!isEqual(lunar.get_today5Elements(), f.full_desc)) errors.push(`full: 不匹配`);
        if (lunar.get_nayin() !== f.nayin) errors.push(`nayin: ${lunar.get_nayin()} != ${f.nayin}`);
        return { success: errors.length === 0, errors };
    }

    checkPengTaboo(lunar, exp) {
        const errors = [];
        const p = exp.peng_taboo;
        if (lunar.get_pengTaboo() !== p.full) errors.push(`full: 不匹配`);
        if (lunar.get_pengTaboo(4, '<br>') !== p.short) errors.push(`short: 不匹配`);
        return { success: errors.length === 0, errors };
    }

    checkTwoHour(lunar, exp) {
        const errors = [];
        const t = exp.two_hour;
        if (!isEqual(lunar.twohour8CharList, t.list)) errors.push(`list: 时辰干支表不匹配`);
        if (!isEqual(lunar.get_twohourLuckyList(), t.lucky)) errors.push(`lucky: 时辰凶吉不匹配`);
        if (lunar.meridians !== t.meridians) errors.push(`meridians: ${lunar.meridians} != ${t.meridians}`);
        return { success: errors.length === 0, errors };
    }

    checkDirections(lunar, exp) {
        const actual = JSON.stringify([...lunar.get_luckyGodsDirection()].sort());
        const expected = JSON.stringify([...exp.directions].sort());
        return { success: actual === expected, errors: actual !== expected ? ['方位不匹配'] : [] };
    }

    checkFetalGod(lunar, exp) {
        return { success: lunar.get_fetalGod() === exp.fetal_god, errors: lunar.get_fetalGod() !== exp.fetal_god ? [`${lunar.get_fetalGod()} != ${exp.fetal_god}`] : [] };
    }

    checkYiJi(lunar, exp) {
        const actualYi = JSON.stringify([...lunar.goodThing].sort());
        const expectedYi = JSON.stringify([...exp.yi].sort());
        const actualJi = JSON.stringify([...lunar.badThing].sort());
        const expectedJi = JSON.stringify([...exp.ji].sort());
        const errors = [];
        if (actualYi !== expectedYi) errors.push(`宜(Yi)不匹配`);
        if (actualJi !== expectedJi) errors.push(`忌(Ji)不匹配`);
        return { success: errors.length === 0, errors };
    }

    checkGodNames(lunar, exp) {
        const actualGood = JSON.stringify([...lunar.goodGodName].sort());
        const expectedGood = JSON.stringify([...exp.god_names.good].sort());
        const actualBad = JSON.stringify([...lunar.badGodName].sort());
        const expectedBad = JSON.stringify([...exp.god_names.bad].sort());
        const errors = [];
        if (actualGood !== expectedGood) errors.push(`吉神不匹配`);
        if (actualBad !== expectedBad) errors.push(`凶神不匹配`);
        return { success: errors.length === 0, errors };
    }

    checkLevel(lunar, exp) {
        const errors = [];
        if (lunar.todayLevel !== exp.thing_level) errors.push(`level: ${lunar.todayLevel} != ${exp.thing_level}`);
        if (lunar.todayLevelName !== exp.thing_level_name) errors.push(`name: ${lunar.todayLevelName} != ${exp.thing_level_name}`);
        return { success: errors.length === 0, errors };
    }

    checkHolidays(lunar, exp) {
        const errors = [];
        const h = exp.holidays;
        if (lunar.get_legalHolidays() !== h.legal) errors.push(`legal: ${lunar.get_legalHolidays()} != ${h.legal}`);
        if (lunar.get_otherHolidays() !== h.other) errors.push(`other: ${lunar.get_otherHolidays()} != ${h.other}`);
        if (lunar.get_otherLunarHolidays() !== h.lunar) errors.push(`lunar: ${lunar.get_otherLunarHolidays()} != ${h.lunar}`);
        return { success: errors.length === 0, errors };
    }

    generateReport() {
        const report = {
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                pass_rate: (this.results.passed / this.results.total * 100).toFixed(4) + '%'
            },
            timestamp: new Date().toISOString(),
            errors: this.results.errors
        };
        
        fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
        this.generateHTMLReport(report);
        
        console.log(`\n📊 测试结果统计:`);
        console.log(`   总计: ${report.summary.total}`);
        console.log(`   ✅ 通过: ${report.summary.passed}`);
        console.log(`   ❌ 失败: ${report.summary.failed}`);
        console.log(`   📈 通过率: ${report.summary.pass_rate}`);
        console.log(`\n📝 报告已生成: ${HTML_REPORT}`);
    }

    generateHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>cnlunar-js 全量测试报告</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background: #f0f2f5; color: #333; }
        .header { background: #1a73e8; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-box { background: white; padding: 20px; border-radius: 8px; flex: 1; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .pass { color: #2e7d32; }
        .fail { color: #c62828; }
        .error-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .error-item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .error-date { font-weight: bold; color: #d32f2f; font-family: monospace; font-size: 1.1em; }
        .error-detail { margin-top: 5px; color: #555; background: #fff3e0; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 cnlunar-js 全量全功能测试报告</h1>
        <p>生成时间: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <div class="stat-number">${report.summary.total}</div>
            <div>测试用例总数</div>
        </div>
        <div class="stat-box">
            <div class="stat-number pass">${report.summary.passed}</div>
            <div>通过数量</div>
        </div>
        <div class="stat-box">
            <div class="stat-number ${report.summary.failed > 0 ? 'fail' : 'pass'}">${report.summary.failed}</div>
            <div>失败数量</div>
        </div>
        <div class="stat-box">
            <div class="stat-number ${report.summary.pass_rate === '100.0000%' ? 'pass' : 'fail'}">${report.summary.pass_rate}</div>
            <div>通过率</div>
        </div>
    </div>
    
    <div class="error-list">
        <h2>❌ 错误详情 (前200条)</h2>
        ${report.summary.failed === 0 ? '<p style="color: green; text-align: center;">🎉 完美通过！没有发现任何不一致。</p>' : ''}
        ${report.errors.map(err => `
            <div class="error-item">
                <div class="error-date">${err.date}</div>
                <div class="error-detail">
                    ${err.fatal_error || err.errors.join('<br>')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
        
        fs.writeFileSync(HTML_REPORT, html);
    }
}

// 运行测试
const tester = new ComprehensiveTester();
tester.run();