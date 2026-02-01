// debug_timezone.js
process.env.TZ = 'Asia/Shanghai'; // 强制指定为上海时区

const start = new Date(1942, 0, 16, 23, 30); // 1月16日 23:30
const end = new Date(1942, 1, 4);            // 2月4日 00:00 (立春)

console.log('--- 1. 打印本地时间字符串 ---');
console.log('开始时间:', start.toString());
console.log('结束时间:', end.toString());

console.log('\n--- 2. 计算物理时间差 ---');
const diffMs = end - start;
const diffDays = diffMs / (24 * 60 * 60 * 1000);

console.log('毫秒差值:', diffMs);
console.log('天数差值:', diffDays);
console.log('Math.floor结果:', Math.floor(diffDays));

console.log('\n--- 3. 为什么少了 1 小时？ ---');
// 理想日历差值：(31-16) + 4 = 19天。 19天 - 23.5小时 = 18.02天
console.log('理想日历计算应为: 18.020833... 天');
console.log('实际少了:', (18.02083333 - diffDays) * 24, '小时');