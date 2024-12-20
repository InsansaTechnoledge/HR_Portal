import requests
from bs4 import BeautifulSoup

def scrape_content_and_links(url):
    # Send an HTTP request to the URL
    response = requests.get(url)
    
    if response.status_code == 200:
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # List to hold the extracted content and links in the order they appear
        content_with_links = []

        # Extract the content and links in the order they appear in the page
        for element in soup.descendants:
            if isinstance(element, str):  # If it's a text node, add the text
                if element.strip():  # Avoid adding empty strings
                    content_with_links.append(element.strip())
            elif element.name == 'a' and element.has_attr('href'):  # If it's an anchor tag
                link = element['href']
                content_with_links.append(f"[Link: {link}]")  # Save link in the position it appears
        
        return content_with_links
    else:
        return f"Error: Unable to retrieve the content. Status code {response.status_code}"

def save_to_file(content, filename):
    # Open the file in write mode and save the content
    with open(filename, 'w', encoding='utf-8') as file:
        for item in content:
            file.write(item + "\n")
    print(f"Content and links saved to {filename}")

# Example usage
url = "https://upsc.gov.in/exams-related-info/exam-notification"
content = scrape_content_and_links(url)

# Save the content and links to a file
# if content.startswith("Error"):
#     print(content)
# else:
save_to_file(content, "raw_data.txt")
