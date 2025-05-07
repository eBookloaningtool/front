import json
import os

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Load book data
books_file_path = 'public/books.json'
categorized_file_path = 'public/categorized_books.json'

if not os.path.exists(books_file_path):
    print(f"Error: File {books_file_path} does not exist")
    exit(1)

if not os.path.exists(categorized_file_path):
    print(f"Error: File {categorized_file_path} does not exist")
    exit(1)

with open(books_file_path, 'r', encoding='utf-8') as f:
    books = json.load(f)

with open(categorized_file_path, 'r', encoding='utf-8') as f:
    categorized_books = json.load(f)

# Count books and categories
book_count = len(books)
category_count = len(categorized_books)
total_categorized_books = sum(len(cat['books']) for cat in categorized_books)

# Collect all book IDs
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

# Check if there are books not in any category
uncategorized_books = all_book_ids - categorized_book_ids

# Sort categories by book count
sorted_categories = sorted(
    category_book_counts.items(), 
    key=lambda x: x[1], 
    reverse=True
)

# Output results
print("\n===== Validation Results =====")
print(f"1. Total books: {book_count}")
print(f"2. Total categories: {category_count}")
print(f"3. Categories with books: {categories_with_books}")
print(f"4. Empty categories: {category_count - categories_with_books}")
print(f"5. Total books in categories: {total_categorized_books}")
print(f"6. Distinct books in categories: {len(categorized_book_ids)}")
print(f"7. Duplicate books: {len(duplicates)}")
print(f"8. Uncategorized books: {len(uncategorized_books)}")

if len(duplicates) > 0:
    print("\nDuplicate books:")
    for dup in duplicates[:10]:  # Only show first 10
        print(f"  - ID: {dup['id']}, Title: {dup['title']}, Category: {dup['category']}")
    if len(duplicates) > 10:
        print(f"  ... and {len(duplicates) - 10} more duplicate books")
else:
    print("\n✓ Validation passed: No duplicate books")

if len(uncategorized_books) > 0:
    print("\nUncategorized books:")
    uncategorized_list = list(uncategorized_books)
    for book_id in uncategorized_list[:10]:  # Only show first 10
        # Find corresponding book title
        title = next((book['title'] for book in books if book['bookId'] == book_id), "Unknown title")
        print(f"  - ID: {book_id}, Title: {title}")
    if len(uncategorized_list) > 10:
        print(f"  ... and {len(uncategorized_list) - 10} more uncategorized books")
else:
    print("\n✓ Validation passed: All books are categorized")

# Output the number of books for each category
print("\nBook count by category:")
for cat_name, book_count in sorted_categories:
    print(f"  - {cat_name}: {book_count} books")

# Output file information
books_file_size = os.path.getsize(books_file_path) / 1024  # KB
categorized_file_size = os.path.getsize(categorized_file_path) / 1024  # KB
print(f"\nFile information:")
print(f"  - books.json: {os.path.abspath(books_file_path)}, Size: {books_file_size:.2f} KB")
print(f"  - categorized_books.json: {os.path.abspath(categorized_file_path)}, Size: {categorized_file_size:.2f} KB") 