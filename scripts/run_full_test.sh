#!/bin/bash
# run_full_test.sh

echo "🧪 开始 cnlunar-js 完整验证流程..."

# 1. 生成 Python 基准数据
echo "📊 生成 Python 基准数据..."
cd scripts

if [ ! -f "full_test.json" ]; then
    python generate_full_test.py
    if [ ! -f "full_test.json" ]; then
        echo "❌ 基准数据生成失败"
        exit 1
    fi
fi

cd ../tests
# 2. 运行全量对比测试
echo "🔍 运行全量对比测试..."
node ../tests/comprehensive_test.js

# 3. 检查结果
if [ $? -eq 0 ]; then
    echo "✅ 测试通过！生成可视化报告..."
    open test_report.html  # macOS，Linux 用 xdg-open，Windows 用 start
else
    echo "❌ 发现差异，请查看 test_report.html"
    exit 1
fi