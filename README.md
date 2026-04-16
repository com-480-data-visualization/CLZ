# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Lei Chen | 339715 |
| Peiyu Liu | 405266 |
| Yixiao Zhang | 356302 |

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

We utilized several publicly available datasets from the official **QS World University Rankings** website, covering the period from **2023 to 2026**. Specifically, we integrated four separate annual datasets: the QS World University Rankings for 2023, 2024, 2025, and 2026. From these sources, we extracted the core attributes essential for our study, including **university name, country, academic year, global rank, and overall score**.

Overall, the data quality is sufficient for visual analysis. However, some preprocessing is required before performing formal analysis.

- **Standardizing names:**  
  The spelling of university names and country names does not always match perfectly across datasets, so we need to standardize naming conventions to avoid duplicates and inconsistencies.

- **Basic cleaning tasks:**  
  Additional preprocessing includes renaming columns, selecting the relevant fields, and checking for missing or inconsistent ranking values and scores.

Overall, the preprocessing effort is moderate. Although the data is already available in a structured format, careful harmonization is still necessary to make cross-year comparisons reliable.

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.
>
Our project explores the following question: **Where are the world’s top universities located?** By analyzing the **QS World University Rankings** from **2023 to 2026**, our goal is to map the geographic distribution of top universities and examine how this distribution has changed over time.

More specifically, we aim to identify:

- the countries with the highest concentration of top universities,
- the countries that have consistently maintained their influence over the years,
- and the countries whose presence has been growing in recent years.

This project is motivated by the **uneven distribution of high-quality higher education resources**. While some countries and cities are home to a large number of top universities, other parts of the world have only a limited number of such institutions. By combining spatial visualizations with temporal comparisons, we hope to illustrate both the global concentration of elite higher education resources and the way this pattern evolves over time.

Our target audience includes **students and parents** interested in international education, as well as the **general public, educators, and policymakers** who want to better understand how high-quality higher education resources are distributed across the world.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data
>

Based on the 2026 QS rankings dataset, this table summarizes the concentration of top-tier universities across different global regions, focusing specifically on the top 200 entries

| Region | count |
| -------------- | ------ |
| Europe | 81 |
| Americas | 54 |
| Asia | 49 |
| Oceania | 15 |
| Africa | 1 |

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

**What others have already done with the data?**

The QS World University Rankings dataset is frequently used in educational data analysis, but most existing work remains institutional or performance-centric. On platforms like Kaggle and Tableau Public, common visualizations include static "Top 10" bar charts, scatter plots correlating academic reputation with employer reputation, or simple choropleth maps showing university counts per country for a single year. These approaches typically treat the rankings as a competitive leaderboard rather than a dynamic geographic resource.

**Why is your approach original?**

Our approach shifts the focus from institutional competition to spatiotemporal resource distribution.We track the 2023–2026 period to capture the shifting landscape of global education instead of providing a static snapshot. To preserve data integrity, we utilize a modular structure rather than a single flattened table, ensuring that newer metrics like ‘Sustainability’ remain distinct and can be analyzed for their specific impact on regional trends. Our analysis treats top-tier universities as a collective geographic asset comparable to GDP or natural resources, emphasizing the growth of regional hubs over individual school rankings.


**What source of inspiration do you take?**

Our project is inspired by previous visualizations of the geographic distribution of Nobel Prize laureates. Those projects effectively demonstrated how intellectual prestige is not static; it clusters in specific global hubs and shifts over decades in response to economic and political changes.

We saw a clear parallel between the concentration of Nobel laureates and the density of top-tier universities. Just as Nobel Prize maps distinguish between "historical centers" (like Europe and North America) and "emerging nodes," we want to use the 2023–2026 QS data to identify similar patterns in higher education. By adapting the heatmaps and cluster visualizations used in those award-distribution studies, we aim to show whether the "center of gravity" for elite education is following a similar eastward shift or remaining anchored in traditional Western strongholds. This allows us to treat university rankings not just as a list of schools, but as a map of global intellectual capital.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

