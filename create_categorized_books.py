import csv
import json
import os
import codecs

# Create output directory (if it doesn't exist)
os.makedirs('public', exist_ok=True)

# Display current working directory for debugging
print(f"Current working directory: {os.getcwd()}")

# File paths
books_file = '.vscode/APIdoc/new_300.csv'
categories_file = '.vscode/APIdoc/category (1).csv'
output_file = 'public/books.json'
categorized_output_file = 'public/categorized_books.json'

# Read category data
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

# Read book data
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

        # Special handling: Add "Grimms' Fairy Tales" to "Children's" category
        special_book_id = "c218aae0-32dd-47e3-bc7f-ee992e36efaf"
        if row['bookId'] == special_book_id:
            for cat_id, cat_data in categories.items():
                if cat_data['category_name'] == "Children's":
                    cat_data['books'].append(book)
                    print(f"Added special book '{row['title']}' to 'Children's' category")
                    break
        else:
            # Add to corresponding category according to the category field
            for cat_id, cat_data in categories.items():
                if cat_data['category_name'] == row['category']:
                    cat_data['books'].append(book)
                    break

# Write all books to JSON file
with open(output_file, 'w', encoding='utf-8') as file:
    json.dump(books, file, ensure_ascii=False, indent=2)

# Convert to list format
categorized_books = list(categories.values())

# Write categorized books to JSON file
with open(categorized_output_file, 'w', encoding='utf-8') as file:
    json.dump(categorized_books, file, ensure_ascii=False, indent=2)

# Check if files were created successfully
if os.path.exists(output_file) and os.path.exists(categorized_output_file):
    print(f'Success: Books file saved to {output_file}')
    print(f'Success: Categorized books file saved to {categorized_output_file}')
    print(f'books.json file size: {os.path.getsize(output_file) / 1024:.2f} KB')
    print(f'categorized_books.json file size: {os.path.getsize(categorized_output_file) / 1024:.2f} KB')
else:
    print(f'Error: Files could not be created')

print(f'Generated {len(categorized_books)} categories')
print(f'Processed {len(books)} books') 