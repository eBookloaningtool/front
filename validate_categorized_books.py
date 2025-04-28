import json
import os

# 打印当前工作目录
print(f"当前工作目录: {os.getcwd()}")

# 加载书籍数据
books_file_path = 'public/books.json'
categorized_file_path = 'public/categorized_books.json'

if not os.path.exists(books_file_path):
    print(f"错误: 文件 {books_file_path} 不存在")
    exit(1)

if not os.path.exists(categorized_file_path):
    print(f"错误: 文件 {categorized_file_path} 不存在")
    exit(1)

with open(books_file_path, 'r', encoding='utf-8') as f:
    books = json.load(f)

with open(categorized_file_path, 'r', encoding='utf-8') as f:
    categorized_books = json.load(f)

# 统计书籍数量和分类数量
book_count = len(books)
category_count = len(categorized_books)
total_categorized_books = sum(len(cat['books']) for cat in categorized_books)

# 收集所有书籍ID
all_book_ids = set(book['bookId'] for book in books)
categorized_book_ids = set()
duplicates = []
categories_with_books = 0
category_book_counts = {}

for category in categorized_books:
    category_id = category['category_id']
    category_name = category['category_name']
    book_count = len(category['books'])
    category_book_counts[category_name] = book_count
    
    if book_count > 0:
        categories_with_books += 1
        
    for book in category['books']:
        if book['bookId'] in categorized_book_ids:
            duplicates.append({
                'id': book['bookId'],
                'title': book['title'],
                'category': category_name
            })
        else:
            categorized_book_ids.add(book['bookId'])

# 检查是否有书籍不在任何分类中
uncategorized_books = all_book_ids - categorized_book_ids

# 按书籍数量排序分类
sorted_categories = sorted(
    category_book_counts.items(), 
    key=lambda x: x[1], 
    reverse=True
)

# 输出结果
print("\n===== 验证结果 =====")
print(f"1. 总书籍数: {book_count}")
print(f"2. 分类总数: {category_count}")
print(f"3. 有书籍的分类数: {categories_with_books}")
print(f"4. 空分类数: {category_count - categories_with_books}")
print(f"5. 分类中的书籍总数: {total_categorized_books}")
print(f"6. 分类中不同的书籍数: {len(categorized_book_ids)}")
print(f"7. 重复书籍数: {len(duplicates)}")
print(f"8. 未分类书籍数: {len(uncategorized_books)}")

if len(duplicates) > 0:
    print("\n重复的书籍:")
    for dup in duplicates[:10]:  # 只显示前10个
        print(f"  - ID: {dup['id']}, 标题: {dup['title']}, 分类: {dup['category']}")
    if len(duplicates) > 10:
        print(f"  ... 还有 {len(duplicates) - 10} 个重复书籍")
else:
    print("\n✓ 验证通过: 没有重复的书籍")

if len(uncategorized_books) > 0:
    print("\n未分类的书籍:")
    uncategorized_list = list(uncategorized_books)
    for book_id in uncategorized_list[:10]:  # 只显示前10个
        # 找到对应的书籍标题
        title = next((book['title'] for book in books if book['bookId'] == book_id), "未知标题")
        print(f"  - ID: {book_id}, 标题: {title}")
    if len(uncategorized_list) > 10:
        print(f"  ... 还有 {len(uncategorized_list) - 10} 本未分类书籍")
else:
    print("\n✓ 验证通过: 所有书籍都已分类")

# 输出每个分类的书籍数量
print("\n各分类书籍数量:")
for cat_name, book_count in sorted_categories:
    print(f"  - {cat_name}: {book_count} 本")

# 输出文件信息
books_file_size = os.path.getsize(books_file_path) / 1024  # KB
categorized_file_size = os.path.getsize(categorized_file_path) / 1024  # KB
print(f"\n文件信息:")
print(f"  - books.json: {os.path.abspath(books_file_path)}, 大小: {books_file_size:.2f} KB")
print(f"  - categorized_books.json: {os.path.abspath(categorized_file_path)}, 大小: {categorized_file_size:.2f} KB") 