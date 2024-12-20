<h1> Readme for Web Scraping</h1>

<h2>Automated Formatting Folder</h2>

<h4>Webscraping.py</h4>
<p>
  Webscraping.py scrapes the provided URL and stores the whole text content of that page and stores it in raw_data.txt.
</p>

<h4>formatter.py</h4>

<p>
  This file opens chat GPT automatically and send input as the prompt hardcoded in the code. Along with the prompt it reads raw_data and provides that data too. If we manually open the chatGPT and supply the same prompt as in the code along with the raw data. It works perfectly fine but thros stackMessage when running through the code.
</p>


<h4>Requirements.txt</h4>

<p>
  > pip install -r requirements.txt
</p>
<p>
  Run the above command in the terminal to install all libraries imported in the files.
</p>
