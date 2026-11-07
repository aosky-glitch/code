#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把源码内联打包成单个可直接打开的 index.html"""
import os, sys, re

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(SRC, '..', 'index.html'))

def read(name):
    with open(os.path.join(SRC, name), 'r', encoding='utf-8') as f:
        return f.read()

parts = {
    '/*__CSS__*/':   read('style.css'),
    '/*__DATA_1__*/': read('data_knowledge.js'),
    '/*__DATA_2__*/': read('data_tables.js'),
    '/*__APP__*/':   read('app.js'),
}
html = read('template.html')
for k, v in parts.items():
    if k not in html:
        print('缺少占位符:', k); sys.exit(1)
    html = html.replace(k, v)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

# 简单统计
kp = len(re.findall(r"\{t:'", parts['/*__DATA_1__*/']))
print('输出:', OUT)
print('文件大小: %.1f KB' % (os.path.getsize(OUT) / 1024))
print('章节:', parts['/*__DATA_1__*/'].count("id:'c"))
print('元素:', parts['/*__DATA_2__*/'].count("sym:'"))
print('方程式:', parts['/*__DATA_2__*/'].count("{c:'"))
print('题目:', parts['/*__DATA_2__*/'].count("{ch:'"))
print('口诀:', parts['/*__DATA_1__*/'].count("{ t:'"))
