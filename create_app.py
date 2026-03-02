# -*- coding: utf-8 -*-  
code = open('create_app.py.code', 'r', encoding='utf-8').read()  
open('src/App.js', 'w', encoding='utf-8').write(code)  
print('App.js created') 
