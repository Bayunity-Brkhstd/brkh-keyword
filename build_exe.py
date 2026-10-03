import PyInstaller.__main__
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

PyInstaller.__main__.run([
    os.path.join(base_dir, 'main.py'),
    '--name=StockMetaStudio',
    '--onefile',
    '--noconsole',
    '--icon=' + os.path.join(base_dir, 'public', 'icon.ico'),
    '--add-data=index.html;.',
    '--add-data=style.css;.',
    '--add-data=script.js;.',
    '--add-data=version.json;.',
    '--add-data=public;public',
    '--hidden-import=google.genai',
    '--hidden-import=google.generativeai',
    '--hidden-import=iptcinfo3',
    '--hidden-import=PIL',
    '--hidden-import=webview',
    '--hidden-import=httpx',
    '--hidden-import=packaging',
    '--hidden-import=packaging.version',
    '--clean'
])


