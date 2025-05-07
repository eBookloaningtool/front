import csv
import json

# Open CSV file and read data
with open('API_Documentation/gutenberg_books.csv', 'r', encoding='utf-8') as csvfile:
    # Read and print header
    first_line = csvfile.readline().strip()
    print(f"CSV header: {first_line}")
    headers = first_line.split(',')
    print(f"Parsed header: {headers}")
    
    # Reset file pointer to beginning
    csvfile.seek(0)
    
    # Use csv module for reading
    reader = csv.reader(csvfile)
    next(reader)  # Skip header
    
    books = []
    for row in reader:
        if len(row) >= 8:  # Make sure row has enough columns
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
    
    # Write data to JSON file
    with open('books.json', 'w', encoding='utf-8') as jsonfile:
        json.dump(books, jsonfile, ensure_ascii=False, indent=2)
    
    print(f'CSV file has been successfully converted to JSON format and saved as books.json, {len(books)} records converted') 