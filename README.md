# Digital Humanities 140: Coding for the Humanities
DH 140 Final Project

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jesstsomethoughts/dh140/HEAD)

Blog Pages:
[Main Blog Page](https://jesstsomethoughts.github.io/dh140blog/posts/DH140_FinalBlog.html)
[Overall SVI Map](https://jesstsomethoughts.github.io/dh140_mapblog/posts/map1.html)

-----

My project aims to analyze how effective the CDC's Social Vulnerability Index (SVI) is in
representing Native Hawaiian or Pacific Islander (NHPI) populations, which have been historically
underrepresented in data. Currently, the SVI computes a combination of Census variables into one index that helps inform government officials about communities in need before, during, or after disasters. I will be comparing the SVI values for various geographical areas, specifically California counties and Census tracts, with the relative population of NHPIs in that given area. Although I hope to expand my research to the US as a whole, I decided to zoom in on California for now due to Jupyter memory and time constraints. Outside of Hawaii, California is the state with the highest NHPI population in the US.

I was motivated to further research this topic from working in the NHPI Data Policy Lab and from community feedback. Ultimately, my goals are to: 
1. Research how the SVI is computed (Census variables and how they are calculated into an index score)
2. Assess how accurately the SVI represents NHPIs
3. Disaggregate the data to create a more equitable index specifically for NHPI populations

Some questions I want to answer are: 
- How is race/ethnicity, specifically NHPI populations, calculated and factored in the SVI?
- Are NHPI populations underrepresented or overrepresented in the SVI, and to what extent? What about other racial/ethnic minorities? 
- What geographical trends appear with respect to SVI scores and their over or underrepresentation of NHPI populations? 
- Where do the largest disparities exist? Are there other factors that might cause this? 

And ultimately: 

**How can the SVI be improved or complemented in order to most accurately represent the needs of NHPI communities?**

I obtined my data from the [CDC SVI website](https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html) and the [Census Reporter](https://censusreporter.org/), which takes data from the [official Census website](https://data.census.gov/).

-----

I started out by brainstorming potential ideas for my final project, as well as gathering data visualizations and articles that I can take inspiration from. 

Some data visualizations of interest below:

1. Link to original article: https://projects.propublica.org/hawaii-beach-loss/ 
   This article uses data science to analyze how Hawaii's beaches are disappearing over time and why that might be the case. I work closely with the Native Hawaiian and Pacific Islander (NHPI) community through the NHPI Data Policy Lab, and the way this article displays and explains Hawaii's beach losses provide inspiration on what I would want to do in my own work. 
   
2. Data visualization below: Religious demographics of South Africa, 2016
![Religious demographics of South Africa, 2016](https://preview.redd.it/untu1i5j1lba1.png?width=1618&format=png&auto=webp&v=enabled&s=198bd92240071d7ffeb893e3cb51afc2cb13c447)
I would love to know how to make a visualization like this in Python since I'm interested in map visualizations looking at demographic variables such as religion, health status, and income. I've made a few in the past in Tableau but would like to explore how it works in Python as well. 

-----

From there, I brainstormed some general topic ideas to investigate as well. I listed them below, adding in lesson plans that I thought would be useful for getting there. 

1. Humanities topics that interest me: 
    * Social determinants of health (race, income, etc.)
    * Politics and demographics
    * Diversity of religion and income/economy
 
2. Getting Data: Web Scraping and APIs in Week 5 appeals to me the most because that is something I've been actively working on learning more about, especially with side projects outside of class. I am interested in using APIs to better streamline data storage (and not have to download millions of rows of data to my local computer), and I've been working with Census data and want to learn more about mastering Census APIs.

3. * Census Infographics and Visualzations: https://www.census.gov/library/visualizations.html
   * Census Bureau data: https://data.census.gov/
   * Census APIs: https://www.census.gov/data/developers/data-sets.html
   * Social Vulnerability Index (based off Census data): https://www.atsdr.cdc.gov/placeandhealth/svi/interactive_map.html
   * Healthy Places Index (looks at social determinants of health): https://www.healthyplacesindex.org/
   
-----
   
I also looked for idea inspiration from curated datasets & project lists provided in class. They are also listed below and will hopefully help me to narrow down my own scope of research in my final project. 


| Name of Dataset                            | Description           | Link  |
| ---------------                            |:-------------:        | -----:|
| COVID data, geographically segmented       | COVID-19 cases, mortality rates, etc. data based on geography; can help with determining trends based on geography/what extra factors may affect COVID-19 spread and mortality      | https://delphi.cmu.edu/covidcast/export/                |
| Datasets on police interactions, by city   | Census about police interactions with citizens in the U.S. - can analyze demographic trends of interactions (violence, frequency, etc.) in a project                         |  https://codeforamerica.github.io/PoliceOpenDataCensus/ |
| Deaths in US jails                         | Data about jail deaths in America; can analyze jails with higher fatality rates and its corresponding factors/demographics                                                   | https://www.reuters.com/investigates/special-report/usa-jails-graphic/ |