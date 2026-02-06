import requests
from bs4 import BeautifulSoup
import pandas as pd

# Example URL
url = "https://ongcindia.com/web/eng/career/recruitment-notice"  # Replace with the actual URL of the page

# Fetch the webpage
response = requests.get(url)
if response.status_code == 200:
    print("Successfully fetched the webpage.")
else:
    print(f"Failed to fetch webpage. Status code: {response.status_code}")
    exit()

# Parse the HTML content
soup = BeautifulSoup(response.text, 'html.parser')

# Locate the container for the list
container = soup.find('div', class_='accordion-content')

# Find all list items
list_items = container.find_all('li', class_='list-group-item')

# Extract data
data = []
for item in list_items:
    # Extract title and URL
    link_tag = item.find('a')
    if link_tag:
        # Check for 'span' first, fallback to direct text
        title_tag = link_tag.find('span', class_='list-group-title')
        if title_tag:
            title = title_tag.text.strip()
        else:
            title = link_tag.text.strip()

        href = link_tag['href']
        full_url = f"https://ongcindia.com{href}"  # Adjust base URL as necessary
    else:
        title = href = full_url = None

    # Extract date
    date_tag = item.find('p', class_='list-group-subtitle')
    date = date_tag.text.strip() if date_tag else None

    # Append to data
    data.append({'Title': title, 'Date': date, 'Link': full_url})


# Convert to DataFrame
df = pd.DataFrame(data)

# Save to Excel
excel_file = "Book1.xlsx"
df.to_excel(excel_file, index=False, engine='openpyxl')
print(f"Data successfully saved to {excel_file}.")
 