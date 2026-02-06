from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from selenium import webdriver
import selenium.common.exceptions

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # Suppresses TensorFlow messages


# Function to open ChatGPT and format raw data
def format_data_with_chatgpt(raw_data):
    # Manually specify the path to the downloaded ChromeDriver
    driver_service = Service('./chromedriver.exe')  # Replace with your downloaded path

    # Open ChatGPT in Chrome using Selenium
    options = webdriver.ChromeOptions()

    driver = webdriver.Chrome(service=driver_service,options=options)
    driver.get("https://chat.openai.com/")

    # Wait for the page to load and the user to log in
    print("Please log in to ChatGPT manually...")
    time.sleep(20)  # Adjust based on your login time

    # Wait for the input box to become visible (adjust XPath as necessary)
    try:
        input_box = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//*[@id="prompt-textarea"]/p'))
        )
    except:
        print("Error: Unable to find the input box.")
        driver.quit()
        return None

    # Prepare the prompt
    prompt = f"""
    I need the following raw data formatted into a structured JSON format. 
    The JSON should contain key-value pairs for each upcoming examination, where:
    - 'name' is the name of the examination
    - 'date_of_notification' is the date when the notification was released
    - 'commencement_date' is the date when the examination starts
    - 'last_date_for_receipt' is the last date for receipt of application
    - 'apply_links' is a list of URLs where candidates can apply
    - 'document_links' is a list of URLs for documents
    Only include data where examination dates and application dates or deadlines are mentioned.
    Generate only json in simple text. No code. Also Generate the json only, no other text.
    generate text message, no json file. The text message should contain json format response.
    No json, only text response in json format.

    Here's the raw data:
    {raw_data}
    """

    # Retry logic for sending the prompt if the element becomes stale
    retry_attempts = 3
    for attempt in range(retry_attempts):
        try:
            input_box.send_keys(prompt)
            input_box.send_keys(Keys.RETURN)
            break
        except selenium.common.exceptions.StaleElementReferenceException:
            print(f"Attempt {attempt + 1} failed: The input box is stale. Retrying...")
            # Re-find the element after waiting for a short time
            input_box = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.XPATH, '//*[@id="prompt-textarea"]/p'))
            )
            time.sleep(1)

    # Wait for the response to generate
    time.sleep(10)

    # Find the response (formatted data)
    try:
        response = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//*[@id="chat-messages"]/div[last()]'))
        )
        formatted_data = response.text.strip()

        # Ensure we only capture valid response
        if formatted_data:
            return formatted_data
        else:
            print("Error: The response does not contain valid data.")
            return None
    except Exception as e:
        print(f"Error: {e}")
        driver.quit()
        return None

    # Close the browser
    driver.quit()

# Function to save the formatted data into a text file
def save_to_text(formatted_data, output_file):
    try:
        # Save the formatted response as plain text
        with open(output_file, 'w', encoding='utf-8') as text_file:
            text_file.write(formatted_data)
        
        print(f"Formatted data has been saved to '{output_file}'")
    except Exception as e:
        print(f"Error: Unable to save data to text file. {e}")

# Function to read raw data from a file
def read_raw_data_from_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            raw_data = file.read()
        return raw_data
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None

# Example usage
input_file = 'raw_data.txt'  # Specify the file path for raw data here
output_file = 'exam_data.txt'  # Specify the output file for the formatted response

# Read the raw data from the file
raw_data = read_raw_data_from_file(input_file)

if raw_data:
    # Call ChatGPT to format the data by interacting with the browser
    formatted_data = format_data_with_chatgpt(raw_data)

    if formatted_data:
        # Save the formatted data to a text file
        save_to_text(formatted_data, output_file)
