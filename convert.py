import csv
import json

# 打开CSV文件并读取数据
with open('API文档/gutenberg_books.csv', 'r', encoding='utf-8') as csvfile:
    # 读取并打印头部
    first_line = csvfile.readline().strip()
    print(f"CSV头部: {first_line}")
    headers = first_line.split(',')
    print(f"解析的头部: {headers}")
    
    # 重置文件指针到开始
    csvfile.seek(0)
    
    # 使用csv模块读取
    reader = csv.reader(csvfile)
    next(reader)  # 跳过头部
    
    books = []
    for row in reader:
        if len(row) >= 8:  # 确保行有足够的列
            book = {
                'id': row[0],
                'title': row[1],
                'author': row[2],
                'category': row[3],
                'description': row[4],
                'cover': row[5],
                'txt_link': row[6],
                'html_link': row[7]
            }
            books.append(book)
    
    # 将数据写入JSON文件
    with open('books.json', 'w', encoding='utf-8') as jsonfile:
        json.dump(books, jsonfile, ensure_ascii=False, indent=2)
    
    print(f'CSV文件已成功转换为JSON格式并保存为books.json，共转换{len(books)}条记录') 