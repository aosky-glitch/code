#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 src 下的样式 / 数据 / 逻辑内联打包成一个可直接打开的单文件成品。

默认输出 /workspace/math-app.html；也可传入路径参数指定输出位置：
    python3 src/build.py [输出文件路径]
不使用 index.html 作为交付文件名，避免被入口页机制覆盖。
"""
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else BASE.parent / 'math-app.html'

tpl = (BASE / 'template.html').read_text(encoding='utf-8')
css = (BASE / 'style.css').read_text(encoding='utf-8')
data = (BASE / 'data.js').read_text(encoding='utf-8')
extra = (BASE / 'bank-extra.js').read_text(encoding='utf-8')
app = (BASE / 'app.js').read_text(encoding='utf-8')

html = tpl.replace('/*__CSS__*/', css)
html = html.replace('/*__DATA__*/', data)
html = html.replace('/*__EXTRA__*/', extra)
html = html.replace('/*__APP__*/', app)

OUT.write_text(html, encoding='utf-8')
print('已生成:', OUT)
print('文件大小: %.1f KB' % (OUT.stat().st_size / 1024))
