import csv
import json
import os
import codecs

# 创建输出目录（如果不存在）
os.makedirs('public', exist_ok=True)

# 显示当前工作目录，帮助调试
print(f"当前工作目录: {os.getcwd()}")

# 文件路径
books_file = '.vscode/APIdoc/new_300.csv'
categories_file = '.vscode/APIdoc/category (1).csv'
output_file = 'public/books.json'
categorized_output_file = 'public/categorized_books.json'

# 读取分类数据
categories = {}
with open(categories_file, 'r', encoding='utf-8-sig') as file:
    reader = csv.DictReader(file)
    for row in reader:
        categories[row['category_uuid']] = {
            'category_id': row['category_uuid'],
            'category_name': row['name'],
            'description': row['description'],
            'books': []
        }

# 读取书籍数据
books = []
book_map = {}
with open(books_file, 'r', encoding='utf-8-sig') as file:
    reader = csv.DictReader(file)
    for row in reader:
        book = {
            'bookId': row['bookId'],
            'title': row['title'],
            'author': row['author'],
            'category': row['category'],
            'description': row['description'],
            'coverUrl': row['coverUrl'],
            'contentURL': row['contentURL'],
            'txt': row['txt']
        }
        books.append(book)
        book_map[row['bookId']] = book

        # 特殊处理：将"Grimms' Fairy Tales"添加到"Children's"分类
        special_book_id = "c218aae0-32dd-47e3-bc7f-ee992e36efaf"
        if row['bookId'] == special_book_id:
            for cat_id, cat_data in categories.items():
                if cat_data['category_name'] == "Children's":
                    cat_data['books'].append(book)
                    print(f"已将特殊书籍 '{row['title']}' 添加到 'Children's' 分类")
                    break
        else:
            # 按照category添加到对应分类中
            for cat_id, cat_data in categories.items():
                if cat_data['category_name'] == row['category']:
                    cat_data['books'].append(book)
                    break

# 写入所有书籍JSON文件
with open(output_file, 'w', encoding='utf-8') as file:
    json.dump(books, file, ensure_ascii=False, indent=2)

# 转换为列表格式
categorized_books = list(categories.values())

# 写入分类书籍JSON文件
with open(categorized_output_file, 'w', encoding='utf-8') as file:
    json.dump(categorized_books, file, ensure_ascii=False, indent=2)

# 检查文件是否创建成功
if os.path.exists(output_file) and os.path.exists(categorized_output_file):
    print(f'成功: 书籍文件已保存到 {output_file}')
    print(f'成功: 分类书籍文件已保存到 {categorized_output_file}')
    print(f'books.json文件大小: {os.path.getsize(output_file) / 1024:.2f} KB')
    print(f'categorized_books.json文件大小: {os.path.getsize(categorized_output_file) / 1024:.2f} KB')
else:
    print(f'错误: 文件未能创建')

print(f'生成了 {len(categorized_books)} 个分类')
print(f'共处理了 {len(books)} 本书') 