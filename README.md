# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| | |
| | |
| | |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)).

We used several publicly available datasets from the **QS World University Rankings**, collected from Kaggle, covering the period from **2018 to 2025**. Specifically, we combined the dataset covering the years **2018 through 2022** ([QS World Ranked Universities 2018–2022](https://www.kaggle.com/datasets/aklimarimi/qs-world-ranked-universities-20182022)) with separate annual datasets for **2023** ([2023 University Ranking](https://www.kaggle.com/datasets/kathuman/2023-university-ranking)), **2024** ([QS World University Rankings 2024](https://www.kaggle.com/datasets/joebeachcapital/qs-world-university-rankings-2024)), and **2025** ([QS World University Rankings 2025](https://www.kaggle.com/datasets/melissamonfared/qs-world-university-rankings-2025)). From these datasets, we extracted the core attributes needed for our study: **university name, country, city, year, rank, and score**.

### Data quality and preprocessing

Overall, the data quality is sufficient for visual analysis. However, some preprocessing is required before performing formal analysis.

- **Merging datasets across years:**  
  The main challenge is to combine data from different sources and years into a single consistent table.

- **Standardizing names:**  
  The spelling of university names and country names does not always match perfectly across datasets, so we need to standardize naming conventions to avoid duplicates and inconsistencies.

- **Completing city information:**  
  City information is included in only one dataset, so we need to match universities across datasets and propagate this field to the other years.

- **Basic cleaning tasks:**  
  Additional preprocessing includes renaming columns, selecting the relevant fields, and checking for missing or inconsistent ranking values and scores.

Overall, the preprocessing effort is moderate. Although the data is already available in a structured format, careful harmonization is still necessary to make cross-year comparisons reliable.

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.
>
Our project explores the following question: **Where are the world’s top universities located?** By analyzing the **QS World University Rankings** from **2018 to 2025**, our goal is to map the geographic distribution of top universities and examine how this distribution has changed over time.

More specifically, we aim to identify:

- the countries with the highest concentration of top universities,
- the countries that have consistently maintained their influence over the years,
- and the countries whose presence has been growing in recent years.

This project is motivated by the **uneven distribution of high-quality higher education resources**. While some countries and cities are home to a large number of top universities, other parts of the world have only a limited number of such institutions. By combining spatial visualizations with temporal comparisons, we hope to illustrate both the global concentration of elite higher education resources and the way this pattern evolves over time.

Our target audience includes **students and parents** interested in international education, as well as the **general public, educators, and policymakers** who want to better understand how high-quality higher education resources are distributed across the world.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

