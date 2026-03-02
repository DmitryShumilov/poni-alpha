# -*- coding: utf-8 -*-  
code = open('App.js.template', 'r', encoding='utf-8').read()  
open('src/App.js', 'w', encoding='utf-8').write(code)  
print('Done') 
