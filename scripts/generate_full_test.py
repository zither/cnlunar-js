import datetime
import json
import cnlunar

START_YEAR = 1901
END_YEAR = 2099
OUTPUT_FILE = "full_test.json"

def serialize_lunar(lunar_obj, dt, yeargod):
    # (保留你之前完整的 serialize_lunar 代码，不要删减)
    # ...
    # 触发懒加载计算
    officer_data = lunar_obj.get_today12DayOfficer()
    
    return {
        "input_date": dt.strftime("%Y-%m-%d %H:%M"),
        "yeargod": yeargod,
        "lunar": {
            "year": lunar_obj.lunarYear,
            "month": lunar_obj.lunarMonth,
            "day": lunar_obj.lunarDay,
            "is_leap": lunar_obj.isLunarLeapMonth,
            "year_cn": lunar_obj.lunarYearCn,
            "month_cn": lunar_obj.lunarMonthCn,
            "day_cn": lunar_obj.lunarDayCn,
            "week_day": lunar_obj.weekDayCn,
            "season": lunar_obj.lunarSeason,
            "season_name": lunar_obj.lunarSeasonName,
            "month_type": lunar_obj.lunarMonthType,
            "zodiac_year": lunar_obj.chineseYearZodiac
        },
        "bazi": {
            "year": lunar_obj.year8Char,
            "month": lunar_obj.month8Char,
            "day": lunar_obj.day8Char,
            "hour": lunar_obj.twohour8Char,
            "year_num": lunar_obj.yearEarthNum,
            "month_num": lunar_obj.monthEarthNum,
            "day_num": lunar_obj.dayEarthNum
        },
        "solar_terms": {
            "today": lunar_obj.todaySolarTerms,
            "next_name": lunar_obj.nextSolarTerm,
            "next_date": f"{lunar_obj.nextSolarTermDate[0]:02d}-{lunar_obj.nextSolarTermDate[1]:02d}",
            "next_year": lunar_obj.nextSolarTermYear,
            "this_year_table": {k: list(v) for k, v in lunar_obj.thisYearSolarTermsDic.items()}
        },
        "deities": {
            "officer12": lunar_obj.today12DayOfficer,
            "god12": lunar_obj.today12DayGod,
            "day_type": officer_data[2] if isinstance(officer_data, tuple) else lunar_obj.dayName,
            "star28": lunar_obj.today28Star,
            "fly9": lunar_obj.get_the9FlyStar(),
            "star_zodiac": lunar_obj.starZodiac,
            "east_zodiac": lunar_obj.todayEastZodiac
        },
        "clash": {
            "desc": lunar_obj.chineseZodiacClash,
            "mark3": lunar_obj.zodiacMark3List,
            "mark6": lunar_obj.zodiacMark6
        },
        "five_elements": {
            "full_desc": lunar_obj.get_today5Elements(),
            "nayin": lunar_obj.get_nayin()
        },
        "peng_taboo": {
            "full": lunar_obj.get_pengTaboo(),
            "short": lunar_obj.get_pengTaboo(long=4, delimit='<br>')
        },
        "two_hour": {
            "list": lunar_obj.twohour8CharList,
            "lucky": lunar_obj.get_twohourLuckyList(),
            "meridians": lunar_obj.meridians
        },
        "directions": lunar_obj.get_luckyGodsDirection(),
        "fetal_god": lunar_obj.get_fetalGod(),
        "yi": sorted(lunar_obj.goodThing),
        "ji": sorted(lunar_obj.badThing),
        "god_names": {
            "good": sorted(lunar_obj.goodGodName),
            "bad": sorted(lunar_obj.badGodName)
        },
        "thing_level": lunar_obj.todayLevel,
        "thing_level_name": lunar_obj.todayLevelName,
        "holidays": {
            "legal": lunar_obj.get_legalHolidays(),
            "other": lunar_obj.get_otherHolidays(),
            "lunar": lunar_obj.get_otherLunarHolidays()
        }
    }

def generate():
    # 预估总数用于显示
    total_years = END_YEAR - START_YEAR + 1
    # 每年约 365.25 天 * 2 次采样
    estimated_total = total_years * 365 * 2 
    
    print(f"开始生成 {START_YEAR}-{END_YEAR} 年全量全功能数据 (JSONL格式)...")
    
    count = 0
    # 使用流式写入，避免内存积压
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for year in range(START_YEAR, END_YEAR + 1):
            if year % 10 == 0:
                print(f"处理年份: {year}")
            
            for month in range(1, 13):
                for day in range(1, 32):
                    try:
                        # 采样点 1
                        yeargod = 'noduty'
                        dt = datetime.datetime(year, month, day, 10, 30)
                        lunar = cnlunar.Lunar(dt, godType='8char', yeargod=yeargod)
                        data = serialize_lunar(lunar, dt, yeargod)
                        # 写入一行 JSON
                        f.write(json.dumps(data, ensure_ascii=False) + "\n")
                        count += 1

                        yeargod = 'duty'
                        dt = datetime.datetime(year, month, day, 10, 30)
                        lunar = cnlunar.Lunar(dt, godType='8char', yeargod=yeargod)
                        data = serialize_lunar(lunar, dt, yeargod)
                        # 写入一行 JSON
                        f.write(json.dumps(data, ensure_ascii=False) + "\n")
                        count += 1
                        
                        # 采样点 2
                        yeargod = 'duty'
                        dt2 = datetime.datetime(year, month, day, 23, 30)
                        lunar2 = cnlunar.Lunar(dt2, godType='8char', yeargod=yeargod)
                        data2 = serialize_lunar(lunar2, dt2, yeargod)
                        f.write(json.dumps(data2, ensure_ascii=False) + "\n")
                        count += 1

                        yeargod = 'noduty'
                        dt2 = datetime.datetime(year, month, day, 23, 30)
                        lunar2 = cnlunar.Lunar(dt2, godType='8char', yeargod=yeargod)
                        data2 = serialize_lunar(lunar2, dt2, yeargod)
                        f.write(json.dumps(data2, ensure_ascii=False) + "\n")
                        count += 1

                        
                    except ValueError:
                        continue
                    except Exception as e:
                        print(f"错误 {year}-{month}-{day}: {e}")
                        continue
    
    print(f"\n✅ 生成完成！")
    print(f"总记录数: {count}")
    print(f"文件位置: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate()